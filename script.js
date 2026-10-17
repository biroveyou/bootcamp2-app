const API_BASE = "https://swapi.dev/api/people/";

const searchBar = document.getElementById("search-bar");
const searchBtn = document.getElementById("search-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const historyList = document.getElementById("history-list");
const statsEl = document.getElementById("stats");
const favoritesList = document.getElementById("favorites-list");

// Conexão com o Supabase (usa config.js). Se a biblioteca não carregar,
// a busca da SWAPI continua funcionando e só a persistência fica de fora.
const db =
  typeof supabase !== "undefined"
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// name (lowercase) -> id
let characterIndex = {};
let isIndexLoading = true;

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function extractIdFromUrl(url) {
  // SWAPI urls look like https://swapi.dev/api/people/1/
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

// Os dados do banco são públicos (qualquer um pode inserir), então nunca
// colocamos texto vindo de lá no HTML sem escapar.
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------------ */
/* SWAPI                                                               */
/* ------------------------------------------------------------------ */

async function loadAllCharacters() {
  statusEl.textContent = "Loading character list...";
  let nextUrl = API_BASE;

  try {
    while (nextUrl) {
      const response = await fetch(nextUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load character list");
      const data = await response.json();

      data.results.forEach((person) => {
        const id = extractIdFromUrl(person.url);
        characterIndex[person.name.toLowerCase()] = id;
      });

      nextUrl = data.next;
    }
    console.log(`Loaded ${Object.keys(characterIndex).length} characters`);
    statusEl.textContent = "";
  } catch (error) {
    statusEl.textContent = "Could not load character list. Try again later.";
    console.error(error);
  } finally {
    isIndexLoading = false;
  }
}

function findIdByName(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  // exact match first, then a loose "starts with" fallback
  if (characterIndex[normalized]) return characterIndex[normalized];

  const partial = Object.keys(characterIndex).find((name) =>
    name.startsWith(normalized)
  );
  return partial ? characterIndex[partial] : null;
}

async function fetchCharacter(id) {
  const response = await fetch(`${API_BASE}${id}/`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load character details");
  return response.json();
}

function renderCharacter(person) {
  resultEl.classList.remove("hidden");
  resultEl.innerHTML = `
    <h2>${person.name}</h2>
    <dl>
      <dt>Height</dt><dd>${person.height} cm</dd>
      <dt>Mass</dt><dd>${person.mass} kg</dd>
      <dt>Birth year</dt><dd>${person.birth_year}</dd>
      <dt>Gender</dt><dd>${person.gender}</dd>
      <dt>Hair color</dt><dd>${person.hair_color}</dd>
      <dt>Eye color</dt><dd>${person.eye_color}</dd>
      <dt>Films</dt><dd>${person.films.length}</dd>
    </dl>
    <button type="button" class="btn-favorite">&#9733; Save to favorites</button>
  `;

  resultEl
    .querySelector(".btn-favorite")
    .addEventListener("click", (event) => saveFavorite(person, event.currentTarget));
}

/* ------------------------------------------------------------------ */
/* Favoritos (CREATE / READ / DELETE)                                  */
/* ------------------------------------------------------------------ */

async function saveFavorite(person, button) {
  if (!db) {
    statusEl.textContent = "Database unavailable right now.";
    return;
  }

  button.disabled = true;
  const { error } = await db.from("favoritos").insert({
    personagem_id: Number(extractIdFromUrl(person.url)),
    nome: person.name,
    ano_nascimento: person.birth_year,
    genero: person.gender,
  });
  button.disabled = false;

  if (error) {
    // 23505 = violação de UNIQUE: o personagem já é favorito
    statusEl.textContent =
      error.code === "23505"
        ? `${person.name} is already in your favorites!`
        : "Could not save right now. Try again.";
    console.error(error);
    return;
  }

  statusEl.textContent = `${person.name} saved to favorites.`;
  loadFavorites(); // atualiza lista e estatísticas
}

async function loadFavorites() {
  if (!db) {
    favoritesList.innerHTML = '<p class="muted">Database unavailable.</p>';
    statsEl.innerHTML = "";
    return;
  }

  const { data, error } = await db
    .from("favoritos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    favoritesList.innerHTML =
      '<p class="muted">Could not load favorites.</p>';
    statsEl.innerHTML = '<p class="muted">Stats unavailable.</p>';
    console.error(error);
    return;
  }

  renderFavorites(data);
  renderStats(data);
}

function renderFavorites(favorites) {
  if (favorites.length === 0) {
    favoritesList.innerHTML =
      '<p class="muted">No favorites yet. Search a character and save it!</p>';
    return;
  }

  favoritesList.innerHTML = favorites
    .map(
      (f) => `
      <div class="fav-item">
        <span class="fav-name">${escapeHtml(f.nome)}</span>
        <span class="fav-meta">${escapeHtml(f.ano_nascimento)}</span>
        <button type="button" data-id="${escapeHtml(f.personagem_id)}"
                aria-label="Remove ${escapeHtml(f.nome)} from favorites">&#10006;</button>
      </div>`
    )
    .join("");
}

async function removeFavorite(personagemId) {
  const { error } = await db
    .from("favoritos")
    .delete()
    .eq("personagem_id", personagemId);

  if (error) {
    statusEl.textContent = "Could not remove right now.";
    console.error(error);
    return;
  }
  loadFavorites();
}

favoritesList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (button && db) removeFavorite(Number(button.dataset.id));
});

/* ------------------------------------------------------------------ */
/* Sidequest C — estatísticas calculadas a partir dos dados do banco   */
/* ------------------------------------------------------------------ */

function renderStats(favorites) {
  const total = favorites.length;

  // a lista já vem ordenada por criado_em desc, então o 1º é o mais recente
  const latest = total > 0 ? favorites[0].nome : "—";

  const counts = {};
  favorites.forEach((f) => {
    const gender = f.genero || "unknown";
    counts[gender] = (counts[gender] || 0) + 1;
  });
  const topGender =
    total > 0
      ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      : "—";

  statsEl.innerHTML = `
    <div class="stat"><span class="stat-value">${total}</span><span class="stat-label">Total</span></div>
    <div class="stat"><span class="stat-value">${escapeHtml(latest)}</span><span class="stat-label">Most recent</span></div>
    <div class="stat"><span class="stat-value">${escapeHtml(topGender)}</span><span class="stat-label">Top gender</span></div>
  `;
}

/* ------------------------------------------------------------------ */
/* Sidequest A — histórico de buscas                                   */
/* ------------------------------------------------------------------ */

// Grava em segundo plano: não usa await, então a interface não trava
// e uma falha do banco nunca atrapalha a busca.
function logSearch(term, found) {
  if (!db) return;
  db.from("historico")
    .insert({ termo: term, encontrado: found })
    .then(({ error }) => {
      if (error) console.error(error);
      else loadHistory();
    });
}

async function loadHistory() {
  if (!db) {
    historyList.innerHTML = '<p class="muted">Database unavailable.</p>';
    return;
  }

  const { data, error } = await db
    .from("historico")
    .select("termo, encontrado")
    .order("criado_em", { ascending: false })
    .limit(5);

  if (error) {
    historyList.innerHTML = '<p class="muted">Could not load history.</p>';
    console.error(error);
    return;
  }

  if (data.length === 0) {
    historyList.innerHTML = '<p class="muted">No searches yet.</p>';
    return;
  }

  historyList.innerHTML = data
    .map(
      (h) => `
      <button type="button" class="history-item ${h.encontrado ? "" : "not-found"}"
              data-term="${escapeHtml(h.termo)}"
              title="${h.encontrado ? "Search again" : "Not found last time — search again"}">
        ${escapeHtml(h.termo)}
      </button>`
    )
    .join("");
}

// clicar num item refaz a busca
historyList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-term]");
  if (!button) return;
  searchBar.value = button.dataset.term;
  handleSearch();
});

/* ------------------------------------------------------------------ */
/* Busca                                                               */
/* ------------------------------------------------------------------ */

async function handleSearch() {
  if (searchBtn.disabled) return; // já tem uma busca em andamento

  const query = searchBar.value.trim();

  if (isIndexLoading) {
    statusEl.textContent = "Still loading character list, please wait...";
    return;
  }

  if (!query) {
    statusEl.textContent = "Type a character name first.";
    return;
  }

  const id = findIdByName(query);
  logSearch(query, Boolean(id)); // registra toda busca, inclusive as sem resultado

  if (!id) {
    resultEl.classList.add("hidden");
    statusEl.textContent = `No character found matching "${query}".`;
    return;
  }

  searchBtn.disabled = true;
  statusEl.textContent = "Fetching character...";
  try {
    const person = await fetchCharacter(id);
    statusEl.textContent = "";
    renderCharacter(person);
  } catch (error) {
    statusEl.textContent = "Something went wrong fetching that character.";
    console.error(error);
  } finally {
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", handleSearch);
searchBar.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch();
});

loadAllCharacters();
loadFavorites();
loadHistory();
