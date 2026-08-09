/* TravelAI — worldwide destination search.
   Falls back to live Wikipedia + OpenStreetMap (Nominatim) lookups for any
   place not in the curated DESTINATIONS list, so a search works for any real
   location on Earth. Both APIs are free, keyless, and support browser CORS.
   Quality is necessarily lower than the hand-curated destinations: no vetted
   safety tips, no destination-specific cost multiplier, and categories/tags
   are guessed from the place name rather than verified. */

const WIKI_API = "https://en.wikipedia.org/w/api.php";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error " + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error.info || "API error: " + data.error.code);
  return data;
}

async function resolveDestination(query) {
  const url =
    `${WIKI_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrlimit=1&gsrnamespace=0&prop=coordinates|pageimages|extracts` +
    `&exintro=1&explaintext=1&exchars=400&pithumbsize=1400&format=json&origin=*`;
  const data = await fetchJSON(url);
  const pages = data.query && data.query.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (!page || !page.coordinates) return null;
  return {
    title: page.title,
    lat: page.coordinates[0].lat,
    lon: page.coordinates[0].lon,
    extract: page.extract || "",
    image: page.thumbnail ? page.thumbnail.source : null,
  };
}

async function geosearchNearby(lat, lon, excludeTitle) {
  const url =
    `${WIKI_API}?action=query&generator=geosearch&ggscoord=${lat}|${lon}&ggsradius=10000&ggslimit=30` +
    `&prop=coordinates|pageimages|extracts&exintro=1&explaintext=1&exchars=220&pithumbsize=700&format=json&origin=*`;
  const data = await fetchJSON(url);
  const pages = data.query && data.query.pages;
  if (!pages) return [];
  return Object.values(pages)
    .filter((p) => p.title !== excludeTitle && p.extract)
    .map((p) => ({
      title: p.title,
      extract: p.extract,
      image: p.thumbnail ? p.thumbnail.source : null,
    }));
}

async function reverseGeocodeCountry(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=3&accept-language=en`;
    const data = await fetchJSON(url);
    return (data.address && data.address.country) || "";
  } catch (e) {
    return "";
  }
}

/* Best-effort category/tag/indoor guess from a place's title — no verified
   source for this, just keyword heuristics, disclosed to the user as such. */
const CATEGORY_RULES = [
  [/museum|gallery/i, { category: "culture", tags: ["culture", "history"], indoor: true }],
  [/cathedral|church|basilica|temple|mosque|synagogue|shrine|abbey|monastery/i, { category: "history", tags: ["history", "culture"], indoor: true }],
  [/castle|palace|fort|fortress|citadel/i, { category: "history", tags: ["history", "culture", "photography"], indoor: false }],
  [/market|bazaar/i, { category: "food", tags: ["food", "shopping"], indoor: false }],
  [/beach|bay|cove|lagoon/i, { category: "beach", tags: ["beaches", "relaxation", "photography"], indoor: false }],
  [/national park|forest|reserve|wilderness/i, { category: "nature", tags: ["nature", "adventure"], indoor: false }],
  [/mountain|peak|volcano|summit/i, { category: "nature", tags: ["nature", "mountains", "adventure", "photography"], indoor: false }],
  [/lake|river|falls|waterfall|canyon|gorge/i, { category: "nature", tags: ["nature", "photography"], indoor: false }],
  [/park|garden|botanical/i, { category: "nature", tags: ["nature", "relaxation"], indoor: false }],
  [/theatre|theater|opera|stadium|arena/i, { category: "culture", tags: ["culture", "nightlife"], indoor: true }],
  [/zoo|aquarium/i, { category: "experience", tags: ["family"], indoor: true }],
  [/bridge|tower|monument|square|plaza|statue|arch/i, { category: "landmark", tags: ["photography", "culture"], indoor: false }],
];
const DEFAULT_CATEGORY = { category: "landmark", tags: ["culture", "photography"], indoor: false };

function categorize(title) {
  for (let i = 0; i < CATEGORY_RULES.length; i++) {
    if (CATEGORY_RULES[i][0].test(title)) return CATEGORY_RULES[i][1];
  }
  return DEFAULT_CATEGORY;
}

/* Wikipedia geosearch returns ANY nearby article with coordinates — government
   ministries, sports federations, courts, embassies, corporate HQs — not just
   things worth visiting. Filter those out before ranking, since nothing downstream
   can otherwise tell "Public Prosecution Service" apart from an actual landmark. */
const NON_TOURISTIC_RE = /\b(federation|ministry|minist[ée]rio|embassy|consulate|tribunal|court(house)?|parliament|legislative assembly|prosecution|customs authority|tax authority|stock exchange|chamber of commerce|trade union|political party|corporate headquarters|regulatory authority|governing body|government agency|state agency|public administration|city council|municipal council|police headquarters|central bank|authority|institute|directorate|inspectorate|regulator|criminal investigation|\bpolice\b)\b/i;

function buildDynamicDestination(resolved, rawAttractions, country) {
  const slots = ["morning", "afternoon", "evening"];
  const touristic = rawAttractions.filter((a) => !NON_TOURISTIC_RE.test(a.title + " " + a.extract));
  const pool = touristic.length >= 5 ? touristic : rawAttractions; // don't over-filter tiny result sets
  const ranked = pool
    .slice()
    .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0) || b.extract.length - a.extract.length)
    .slice(0, 12);

  const attractions = ranked.map((a, i) => {
    const meta = categorize(a.title);
    return {
      name: a.title,
      area: resolved.title,
      category: meta.category,
      tags: meta.tags,
      indoor: meta.indoor,
      hiddenGem: i > 6,
      slot: slots[i % 3],
      image: a.image,
      blurb: a.extract.length > 180 ? a.extract.slice(0, 177) + "…" : a.extract,
    };
  });

  const firstSentence = resolved.extract
    ? resolved.extract.split(". ")[0].replace(/\.?$/, ".")
    : `Explore ${resolved.title}.`;

  return {
    id: "custom-" + resolved.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: resolved.title,
    country: country || "",
    tagline: firstSentence,
    theme: "custom",
    heroImage: resolved.image,
    costMultiplier: 1.0,
    currency: "—",
    bestMonths: "Varies — check the local season",
    isCustom: true,
    safetyTips: [
      "This destination was generated live from Wikipedia — TravelAI doesn't have curated, verified safety data for it yet.",
      "Always check your government's official travel advisory before you go.",
      `Search "${resolved.title} emergency number" to find local emergency contacts.`,
    ],
    attractions: attractions,
    experiences: [],
    food: [
      `Search "best local food in ${resolved.title}" before you go — this destination doesn't have curated food picks yet.`,
      `Ask locally for the signature dish of ${resolved.title} — it's usually better than any list.`,
    ],
  };
}

/* Orchestrates the full lookup. Returns a destination object, or throws
   an Error with a user-facing message. */
async function fetchGlobalDestination(query) {
  const resolved = await resolveDestination(query);
  if (!resolved) {
    throw new Error(`Couldn't find "${query}" — try a different spelling, or search a nearby major city or landmark instead.`);
  }
  const [rawAttractions, country] = await Promise.all([
    geosearchNearby(resolved.lat, resolved.lon, resolved.title),
    reverseGeocodeCountry(resolved.lat, resolved.lon),
  ]);
  if (rawAttractions.length < 3) {
    throw new Error(`Found "${resolved.title}", but not enough nearby points of interest to build a full trip yet. Try a bigger nearby city.`);
  }
  return buildDynamicDestination(resolved, rawAttractions, country);
}
