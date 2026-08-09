/* TravelAI prototype — vanilla JS app logic (no build step required) */

const state = {
  destination: null,
  settings: {
    days: 4,
    group: 2,
    intensity: "balanced",
    budgetTier: "standard",
    interests: [],
    weather: "sunny",
  },
  itinerary: null,
  currentDay: 1,
};

/* ---------------- Screen navigation ---------------- */
function goTo(screenName) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.querySelector(`[data-screen="${screenName}"]`).classList.add("active");
  document.getElementById("app").scrollTo?.({ top: 0 });
  window.scrollTo({ top: 0 });
}

/* ---------------- Background carousel (home) ---------------- */
let bgIndex = 1;
let bgFront = "A";
function initBgCarousel() {
  const layerA = document.getElementById("bgLayerA");
  layerA.style.backgroundImage = `url('${BACKGROUND_SCENES[0].image}')`;
  setInterval(cycleBg, 6500);
}
function cycleBg() {
  const next = BACKGROUND_SCENES[bgIndex % BACKGROUND_SCENES.length];
  bgIndex++;
  const showId = bgFront === "A" ? "bgLayerB" : "bgLayerA";
  const hideId = bgFront === "A" ? "bgLayerA" : "bgLayerB";
  const showEl = document.getElementById(showId);
  const hideEl = document.getElementById(hideId);
  showEl.style.backgroundImage = `url('${next.image}')`;
  showEl.style.animation = "none";
  void showEl.offsetWidth;
  showEl.style.animation = "";
  showEl.classList.add("active");
  hideEl.classList.remove("active");
  bgFront = bgFront === "A" ? "B" : "A";
}

/* ---------------- Home: search + chips + popular grid ---------------- */
function renderDestChips() {
  const wrap = document.getElementById("destChips");
  wrap.innerHTML = DESTINATIONS.map(
    (d) => `<button class="dest-chip" data-dest="${d.id}">${d.name}</button>`
  ).join("");
  wrap.querySelectorAll(".dest-chip").forEach((btn) => {
    btn.addEventListener("click", () => selectDestination(btn.dataset.dest));
  });
}

function renderPopularGrid() {
  const grid = document.getElementById("popularGrid");
  grid.innerHTML = DESTINATIONS.map(
    (d) => `
    <div class="popular-card" data-dest="${d.id}">
      <img loading="lazy" src="${d.heroImage}" alt="${d.name}, ${d.country}" onerror="this.remove()" />
      <div class="popular-card-scrim"></div>
      <div class="popular-card-text">
        <h3>${d.name}</h3>
        <span>${d.country}</span>
      </div>
    </div>`
  ).join("");
  grid.querySelectorAll(".popular-card").forEach((card) => {
    card.addEventListener("click", () => selectDestination(card.dataset.dest));
  });
}

function curatedMatches(q) {
  return DESTINATIONS.filter(
    (d) => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
  );
}

function renderSuggestionList(box, q, matches) {
  const curatedHtml = matches
    .map(
      (d) => `
    <div class="suggestion-item" data-dest="${d.id}">
      <div class="suggestion-thumb" style="background-image:url('${d.heroImage}')"></div>
      <div><strong>${d.name}</strong><div style="font-size:11.5px;color:var(--text-dim)">${d.country}</div></div>
    </div>`
    )
    .join("");
  const worldRowHtml = `
    <div class="suggestion-item suggestion-world" data-world="${encodeURIComponent(q)}">
      <div class="suggestion-thumb suggestion-thumb-icon">🌍</div>
      <div><strong>Search "${q}" worldwide</strong><div style="font-size:11.5px;color:var(--text-dim)">Live lookup via Wikipedia — works for any real place</div></div>
    </div>`;
  box.innerHTML = curatedHtml + worldRowHtml;
  box.querySelectorAll(".suggestion-item[data-dest]").forEach((el) => {
    el.addEventListener("click", () => { selectDestination(el.dataset.dest); closeSuggestions(box); });
  });
  const worldEl = box.querySelector(".suggestion-world");
  if (worldEl) worldEl.addEventListener("click", () => runGlobalSearch(decodeURIComponent(worldEl.dataset.world), box));
}

function closeSuggestions(box) {
  box.classList.remove("show");
}

async function runGlobalSearch(query, box) {
  if (!query) return;
  box.innerHTML = `<div class="suggestion-empty suggestion-loading">🔎 Searching worldwide for "${query}"…</div>`;
  box.classList.add("show");
  try {
    const dest = await fetchGlobalDestination(query);
    state.destination = dest;
    renderPlanScreen();
    goTo("plan");
    closeSuggestions(box);
  } catch (e) {
    box.innerHTML = `<div class="suggestion-empty suggestion-error">⚠️ ${e.message}</div>`;
  }
}

function setupSearch() {
  const input = document.getElementById("destInput");
  const box = document.getElementById("searchSuggestions");
  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (!q) { closeSuggestions(box); box.innerHTML = ""; return; }
    renderSuggestionList(box, q, curatedMatches(q.toLowerCase()));
    box.classList.add("show");
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const q = input.value.trim();
    if (!q) return;
    const matches = curatedMatches(q.toLowerCase());
    if (matches.length > 0) { selectDestination(matches[0].id); closeSuggestions(box); }
    else runGlobalSearch(q, box);
  });
  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) closeSuggestions(box);
  });
}

function selectDestination(id) {
  const dest = DESTINATIONS.find((d) => d.id === id);
  if (!dest) return;
  state.destination = dest;
  renderPlanScreen();
  goTo("plan");
}

/* ---------------- Plan screen ---------------- */
function renderPlanScreen() {
  const d = state.destination;
  const heroImg = document.getElementById("planHeroImg");
  if (d.heroImage) { heroImg.style.display = ""; heroImg.src = d.heroImage; } else { heroImg.style.display = "none"; }
  heroImg.alt = `${d.name}, ${d.country}`;
  document.getElementById("planDestCountry").textContent = d.isCustom
    ? (d.country ? `${d.country} · 🌍 Live Wikipedia lookup` : "🌍 Live Wikipedia lookup")
    : d.country;
  document.getElementById("planDestName").textContent = d.name;
  document.getElementById("planDestTagline").textContent = d.tagline;
  document.getElementById("daysValue").textContent = state.settings.days;
  document.getElementById("groupValue").textContent = state.settings.group;
  document.getElementById("intensityHint").textContent = INTENSITY[state.settings.intensity].desc;
  renderSegmented("intensitySeg", INTENSITY, state.settings.intensity, pickIntensity);
  renderSegmented("budgetSeg", BUDGET_TIERS, state.settings.budgetTier, pickBudget);
  renderInterestChips();
}

function pickIntensity(key) {
  state.settings.intensity = key;
  document.getElementById("intensityHint").textContent = INTENSITY[key].desc;
  renderSegmented("intensitySeg", INTENSITY, key, pickIntensity);
}

function pickBudget(key) {
  state.settings.budgetTier = key;
  renderSegmented("budgetSeg", BUDGET_TIERS, key, pickBudget);
}

function renderSegmented(containerId, source, activeKey, onPick) {
  const el = document.getElementById(containerId);
  el.innerHTML = Object.keys(source)
    .map((key) => `<button type="button" class="seg-btn ${key === activeKey ? "active" : ""}" data-key="${key}">${source[key].label}</button>`)
    .join("");
  el.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => onPick(btn.dataset.key));
  });
}

function renderInterestChips() {
  const wrap = document.getElementById("interestChips");
  wrap.innerHTML = INTERESTS.map(
    (i) => `<button type="button" class="interest-chip ${state.settings.interests.includes(i.id) ? "active" : ""}" data-id="${i.id}">${i.emoji} ${i.label}</button>`
  ).join("");
  wrap.querySelectorAll(".interest-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const id = chip.dataset.id;
      const idx = state.settings.interests.indexOf(id);
      if (idx === -1) state.settings.interests.push(id);
      else state.settings.interests.splice(idx, 1);
      chip.classList.toggle("active");
    });
  });
}

function setupSteppers() {
  document.getElementById("daysStepper").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const delta = Number(btn.dataset.step);
    state.settings.days = Math.min(14, Math.max(1, state.settings.days + delta));
    document.getElementById("daysValue").textContent = state.settings.days;
  });
  document.getElementById("groupStepper").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const delta = Number(btn.dataset.step);
    state.settings.group = Math.min(12, Math.max(1, state.settings.group + delta));
    document.getElementById("groupValue").textContent = state.settings.group;
  });
}

/* ---------------- Itinerary generation ---------------- */
function buildPool(destination) {
  const attractions = destination.attractions.map((a) => ({ ...a, kind: "attraction" }));
  const experiences = (destination.experiences || []).map((a) => ({ ...a, kind: "experience" }));
  // rank = curated/notability order (0 = most prominent). Attractions are listed
  // most-iconic-first in the data, so array position is a meaningful priority signal —
  // without it, the hidden-gem bonus alone would push minor spots ahead of headline ones
  // whenever no interest tags are selected to differentiate them.
  return [...attractions, ...experiences].map((item, rank) => ({ ...item, rank }));
}

function scoreItem(item, interests, weather) {
  let score = 55;
  const matched = item.tags.filter((t) => interests.includes(t));
  score += matched.length * 12;
  score -= item.rank * 0.7;
  if (matched.length >= 3) score += 6;
  if (item.hiddenGem) score += 2;
  if (weather === "rainy" || weather === "snow") {
    score += item.indoor ? 12 : -14;
  } else if (weather === "sunny") {
    score += item.indoor ? -3 : 6;
  }
  score = Math.max(28, Math.min(99, Math.round(score)));
  return { score, matched };
}

function estTransferMinutes(nameA, nameB) {
  let hash = 0;
  const str = nameA + "|" + nameB;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return (Math.abs(hash) % 24) + 7;
}

function bucketIntoSlots(items) {
  const order = { morning: 0, afternoon: 1, evening: 2 };
  const sorted = [...items].sort((a, b) => (order[a.slot] ?? 1) - (order[b.slot] ?? 1));
  const third = Math.max(1, Math.ceil(sorted.length / 3));
  return {
    morning: sorted.slice(0, third),
    afternoon: sorted.slice(third, third * 2),
    evening: sorted.slice(third * 2),
  };
}

function generateItinerary(destination, settings) {
  const pool = buildPool(destination)
    .map((item) => {
      const { score, matched } = scoreItem(item, settings.interests, settings.weather);
      return { ...item, score, matchedInterests: matched };
    })
    .sort((a, b) => b.score - a.score);

  const perDay = INTENSITY[settings.intensity].perDay;
  const days = [];
  let idx = 0;
  for (let d = 1; d <= settings.days; d++) {
    const items = [];
    for (let i = 0; i < perDay; i++) {
      const base = pool[idx % pool.length];
      const revisit = idx >= pool.length;
      items.push({ ...base, revisit, uid: `${d}-${i}-${base.name}` });
      idx++;
    }
    days.push({ day: d, sections: bucketIntoSlots(items) });
  }
  return days;
}

/* ---------------- Itinerary rendering ---------------- */
function whyText(item, destination) {
  const labels = item.matchedInterests
    .map((id) => INTERESTS.find((i) => i.id === id)?.label)
    .filter(Boolean);
  if (labels.length) return `Matches your interest in ${labels.join(", ")}.`;
  if (item.hiddenGem) return `A quieter favorite locals love — most first-time visitors miss this one.`;
  return `A signature pick for ${destination.name}.`;
}

function mapsUrl(item, destination) {
  const q = encodeURIComponent(`${item.name}, ${item.area || ""} ${destination.name}, ${destination.country}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function matchTier(score) {
  if (score >= 85) return "high";
  if (score >= 65) return "mid";
  return "low";
}

function renderStopCard(item, prevItem, destination) {
  const cat = CATEGORY_META[item.category] || { label: item.category, icon: "📍" };
  const media = item.image
    ? `<img loading="lazy" src="${item.image}" alt="${item.name}" onerror="this.remove()" /><span class="placeholder-icon">${cat.icon}</span>`
    : `<span class="placeholder-icon">${cat.icon}</span>`;
  const transfer = prevItem
    ? `<span class="transfer-time">🚶 ~${estTransferMinutes(prevItem.name, item.name)} min from ${prevItem.name}</span>`
    : `<span class="transfer-time">📍 First stop</span>`;
  return `
  <div class="stop-card">
    <div class="stop-media">
      ${media}
      <span class="match-badge ${matchTier(item.score)}">${item.score}</span>
      ${item.hiddenGem ? `<span class="gem-badge">💎 Gem</span>` : ""}
    </div>
    <div class="stop-content">
      <div class="stop-top">
        <span class="stop-cat">${cat.icon} ${cat.label}</span>
        ${item.revisit ? `<span class="revisit-tag">revisit</span>` : ""}
      </div>
      <div class="stop-name">${item.name}</div>
      <div class="stop-loc">📍 ${item.area ? item.area + ", " : ""}${destination.name}, ${destination.country}</div>
      <p class="stop-blurb">${item.blurb}</p>
      <p class="stop-why">✨ ${whyText(item, destination)}</p>
      <div class="stop-actions">
        <a class="map-link" href="${mapsUrl(item, destination)}" target="_blank" rel="noopener">Open in Maps ↗</a>
        ${transfer}
      </div>
    </div>
  </div>`;
}

function renderDayTabs() {
  const wrap = document.getElementById("dayTabs");
  wrap.innerHTML = state.itinerary
    .map((d) => `<button class="day-tab ${d.day === state.currentDay ? "active" : ""}" data-day="${d.day}">Day ${d.day}</button>`)
    .join("");
  wrap.querySelectorAll(".day-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentDay = Number(btn.dataset.day);
      renderDayTabs();
      renderItinBody();
    });
  });
}

const SECTION_META = {
  morning: { label: "Morning", icon: "🌅" },
  afternoon: { label: "Afternoon", icon: "☀️" },
  evening: { label: "Evening", icon: "🌆" },
};

function renderItinBody() {
  const dest = state.destination;
  const dayData = state.itinerary.find((d) => d.day === state.currentDay);
  const body = document.getElementById("itinBody");
  let html = "";
  let prevItem = null;
  ["morning", "afternoon", "evening"].forEach((slot) => {
    const items = dayData.sections[slot];
    if (!items.length) return;
    html += `<div class="day-section">
      <div class="day-section-title">${SECTION_META[slot].icon} ${SECTION_META[slot].label}</div>
      ${items.map((item) => { const card = renderStopCard(item, prevItem, dest); prevItem = item; return card; }).join("")}
    </div>`;
  });
  const foodPick = dest.food[(state.currentDay - 1) % dest.food.length];
  html += `<div class="food-card">
    <span class="food-icon">🍽</span>
    <div><h4>Eat & drink today</h4><p>${foodPick}</p></div>
  </div>`;
  body.innerHTML = html;
}

function renderWeatherBar() {
  const wrap = document.getElementById("weatherBar");
  wrap.innerHTML = WEATHER_OPTIONS.map(
    (w) => `<button class="weather-chip ${w.id === state.settings.weather ? "active" : ""}" data-w="${w.id}">${w.emoji} ${w.label}</button>`
  ).join("");
  wrap.querySelectorAll(".weather-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.settings.weather = btn.dataset.w;
      state.itinerary = generateItinerary(state.destination, state.settings);
      renderWeatherBar();
      renderItinBody();
    });
  });
}

function renderItineraryScreen() {
  const d = state.destination;
  document.getElementById("itinDestName").textContent = `${d.name} Trip`;
  document.getElementById("itinMeta").textContent = `${state.settings.days} days · ${state.settings.group} traveler${state.settings.group > 1 ? "s" : ""} · ${INTENSITY[state.settings.intensity].label} pace`;
  state.itinerary = generateItinerary(d, state.settings);
  state.currentDay = 1;
  renderWeatherBar();
  renderDayTabs();
  renderItinBody();
  renderBudget();
}

/* ---------------- Budget ---------------- */
const FOOD_CAP_PER_DAY = 50; // EUR, per person — never exceeded regardless of tier/destination
const TRANSPORT_CAP_PER_DAY = 20; // EUR, per person — never exceeded regardless of tier/destination

function calcBudget(destination, settings) {
  const tier = BUDGET_TIERS[settings.budgetTier].perDay;
  const mult = destination.costMultiplier;
  const rooms = Math.max(1, Math.ceil(settings.group / 2));
  // Accommodation & attractions track destination cost-of-living directly.
  const accommodation = tier.accommodation * mult * rooms * settings.days;
  const attractions = tier.attractions * mult * settings.group * settings.days;
  // Food & transport move with destination/experience type too, but within a hard daily cap —
  // a fancy dinner or a private transfer costs more in Norway than in Bali, but not unbounded.
  const livingMult = Math.max(0.6, Math.min(1.15, mult));
  const foodPerDay = Math.min(FOOD_CAP_PER_DAY, tier.food * livingMult);
  const transportPerDay = Math.min(TRANSPORT_CAP_PER_DAY, tier.transport * livingMult);
  const food = foodPerDay * settings.group * settings.days;
  const transport = transportPerDay * settings.group * settings.days;
  const total = accommodation + food + attractions + transport;
  return { accommodation, food, attractions, transport, total, foodPerDay, transportPerDay };
}

function fmtEUR(n) {
  return "€" + Math.round(n).toLocaleString("en-US");
}

function renderBudget() {
  const b = calcBudget(state.destination, state.settings);
  document.getElementById("budgetFabValue").textContent = `${fmtEUR(b.total)} estimated total`;
  document.getElementById("budgetBody").innerHTML = `
    <div class="budget-row"><span>🏨 Accommodation</span><span>${fmtEUR(b.accommodation)}</span></div>
    <div class="budget-row"><span>🍽 Food & drink <small>(${fmtEUR(b.foodPerDay)}/day pp)</small></span><span>${fmtEUR(b.food)}</span></div>
    <div class="budget-row"><span>🎟 Attractions & experiences</span><span>${fmtEUR(b.attractions)}</span></div>
    <div class="budget-row"><span>🚕 Local transport <small>(${fmtEUR(b.transportPerDay)}/day pp)</small></span><span>${fmtEUR(b.transport)}</span></div>
    <div class="budget-total"><span>Total (${state.settings.days} days, ${state.settings.group} traveler${state.settings.group > 1 ? "s" : ""})</span><span>${fmtEUR(b.total)}</span></div>
    <p class="budget-note">Rough planning estimate in EUR for the "${BUDGET_TIERS[state.settings.budgetTier].label}" tier, adjusted for ${state.destination.name}'s relative cost of travel. Food is capped at €${FOOD_CAP_PER_DAY}/day and transport at €${TRANSPORT_CAP_PER_DAY}/day per person, regardless of tier or destination. Actual prices vary by season and provider — treat this as a starting point, not a quote.</p>
  `;
}

/* ---------------- Safety & tips sheet ---------------- */
function renderTips() {
  const d = state.destination;
  document.getElementById("tipsTitle").textContent = `${d.name}: safety & local tips`;
  document.getElementById("tipsBody").innerHTML = `
    <div class="tips-meta">
      <span>💱 ${d.currency}</span>
      <span>🗓 Best: ${d.bestMonths}</span>
    </div>
    ${d.safetyTips.map((t) => `<div class="tips-item">🛡 <span>${t}</span></div>`).join("")}
  `;
}

/* ---------------- Sheets ---------------- */
function openSheet(name) {
  document.getElementById(`${name}Backdrop`).classList.add("show");
  document.getElementById(`${name}Sheet`).classList.add("show");
}
function closeSheet(name) {
  document.getElementById(`${name}Backdrop`).classList.remove("show");
  document.getElementById(`${name}Sheet`).classList.remove("show");
}

/* ---------------- Wire up static events ---------------- */
function setupNav() {
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => goTo(btn.dataset.back));
  });
  document.getElementById("generateBtn").addEventListener("click", () => {
    renderItineraryScreen();
    goTo("itinerary");
  });
  document.getElementById("budgetFab").addEventListener("click", () => openSheet("budget"));
  document.getElementById("tipsBtn").addEventListener("click", () => { renderTips(); openSheet("tips"); });
  document.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", () => closeSheet(el.dataset.close));
  });
}

/* ---------------- Init ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initBgCarousel();
  renderDestChips();
  renderPopularGrid();
  setupSearch();
  setupSteppers();
  setupNav();
});
