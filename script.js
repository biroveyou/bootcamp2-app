const API_BASE = "https://swapi.dev/api/people/";

const searchBar = document.getElementById("search-bar");
const searchBtn = document.getElementById("search-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

// name (lowercase) -> id
let characterIndex = {};

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
  }
}

searchBtn.addEventListener("click", handleSearch);
searchBar.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSearch();
});

loadAllCharacters();