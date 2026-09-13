const API_BASE = "https://swapi.dev/api/people/";

const searchBar = document.getElementById("search-bar");
const searchBtn = document.getElementById("search-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

// name (lowercase) -> id
let characterIndex = {};
let isIndexLoading = true;

function extractIdFromUrl(url) {
  // SWAPI urls look like https://swapi.dev/api/people/1/
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

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
  `;
}

async function handleSearch() {
  const query = searchBar.value;

  if (isIndexLoading) {
    statusEl.textContent = "Still loading character list, please wait...";
    return;
  }

  const id = findIdByName(query);

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