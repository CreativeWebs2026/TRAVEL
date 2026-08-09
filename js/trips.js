/* TravelAI — local profile + saved itineraries.
   No account, no server: everything lives in this browser's localStorage.
   Depends on `state`, `goTo`, `openSheet`, `closeSheet`, `renderWeatherBar`,
   `renderDayTabs`, `renderItinBody`, `renderBudget` from app.js — all
   referenced only inside event handlers, so load order relative to app.js
   doesn't matter as long as both have loaded before DOMContentLoaded fires. */

const PROFILE_KEY = "travelai_profile";
const TRIPS_KEY = "travelai_trips";
const AVATAR_OPTIONS = ["🧭", "🌍", "🏖", "⛰️", "🎒", "📸", "🦁", "🌴"];

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { name: "Traveler", avatar: "🧭" };
}

function saveProfile(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {}
}

function loadTrips() {
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveTrips(trips) {
  try { localStorage.setItem(TRIPS_KEY, JSON.stringify(trips)); } catch (e) {}
}

function findTripBySignature(trips, destination, settings) {
  const sig = JSON.stringify(settings.interests.slice().sort());
  return trips.find((t) => {
    try {
      return (
        t.destination.id === destination.id &&
        t.settings.days === settings.days &&
        t.settings.group === settings.group &&
        t.settings.intensity === settings.intensity &&
        t.settings.budgetTier === settings.budgetTier &&
        JSON.stringify(t.settings.interests.slice().sort()) === sig
      );
    } catch (e) {
      return false; // malformed/older saved trip — never let it block matching against valid ones
    }
  });
}

/* ---------------- Profile chip + sheet ---------------- */
function renderProfileChip() {
  const p = loadProfile();
  document.getElementById("profileAvatar").textContent = p.avatar;
  document.getElementById("profileName").textContent = p.name;
}

function renderTripCountBadge() {
  const trips = loadTrips();
  const btn = document.getElementById("myTripsBtn");
  const existing = btn.querySelector(".trip-count-badge");
  if (existing) existing.remove();
  if (trips.length > 0) {
    const badge = document.createElement("span");
    badge.className = "trip-count-badge";
    badge.textContent = trips.length > 9 ? "9+" : String(trips.length);
    btn.appendChild(badge);
  }
}

function renderAvatarGrid(activeAvatar) {
  const grid = document.getElementById("avatarGrid");
  grid.innerHTML = AVATAR_OPTIONS.map(
    (a) => `<button type="button" class="avatar-option ${a === activeAvatar ? "active" : ""}" data-avatar="${a}">${a}</button>`
  ).join("");
  grid.querySelectorAll(".avatar-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      grid.querySelectorAll(".avatar-option").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function openProfileSheet() {
  const p = loadProfile();
  document.getElementById("profileNameInput").value = p.name;
  renderAvatarGrid(p.avatar);
  openSheet("profile");
}

/* ---------------- My Trips screen ---------------- */
function formatSavedDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function renderTripCard(t) {
  const days = t.settings && t.settings.days;
  const group = t.settings && t.settings.group;
  const intensityMeta = t.settings && INTENSITY[t.settings.intensity];
  const name = (t.destination && t.destination.name) || "Untitled trip";
  const metaBits = [
    days ? `${days} days` : null,
    group ? `${group} traveler${group > 1 ? "s" : ""}` : null,
    intensityMeta ? intensityMeta.label : null,
  ].filter(Boolean);
  const hero = t.destination && t.destination.heroImage;
  return `
    <div class="trip-card">
      <div class="trip-card-media">${hero ? `<img loading="lazy" src="${hero}" alt="${name}" onerror="this.remove()" />` : ""}</div>
      <div class="trip-card-content">
        <div class="trip-card-name">${name}</div>
        <div class="trip-card-meta">${metaBits.join(" · ") || "Details unavailable"}</div>
        <div class="trip-card-date">Saved ${formatSavedDate(t.savedAt)}</div>
      </div>
      <div class="trip-card-actions">
        <button type="button" class="trip-open-btn" data-open="${t.id}" aria-label="Open trip">→</button>
        <button type="button" class="trip-delete-btn" data-delete="${t.id}" aria-label="Delete trip">🗑</button>
      </div>
    </div>`;
}

function renderMyTripsScreen() {
  const body = document.getElementById("mytripsBody");
  let trips = [];
  try {
    trips = loadTrips().slice().sort((a, b) => b.savedAt - a.savedAt);
  } catch (e) {
    console.error("Failed to load saved trips:", e);
  }

  if (trips.length === 0) {
    body.innerHTML = `
      <div class="mytrips-empty">
        <div class="mytrips-empty-icon">🧳</div>
        <h3>No saved trips yet</h3>
        <p>Plan a trip and tap the heart on the itinerary screen to save it here.</p>
        <button class="cta-btn" id="mytripsEmptyCta" type="button">Plan a trip</button>
      </div>`;
    const cta = document.getElementById("mytripsEmptyCta");
    if (cta) cta.addEventListener("click", () => goTo("home"));
    return;
  }

  // A single malformed saved trip (e.g. saved by an older version of the app)
  // must never take down the whole list — skip it instead of throwing.
  const cardsHtml = trips
    .map((t) => {
      try { return renderTripCard(t); }
      catch (e) { console.error("Skipping unrenderable trip:", t && t.id, e); return ""; }
    })
    .join("");
  body.innerHTML = cardsHtml || `<div class="mytrips-empty"><p>Your saved trips couldn't be displayed. Try clearing this device's saved trips and saving again.</p></div>`;

  body.querySelectorAll("[data-open]").forEach((btn) => btn.addEventListener("click", () => openSavedTrip(btn.dataset.open)));
  body.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", (e) => { e.stopPropagation(); deleteSavedTrip(btn.dataset.delete); })
  );
}

function openSavedTrip(tripId) {
  const trip = loadTrips().find((t) => t.id === tripId);
  if (!trip) return;
  try {
    state.destination = trip.destination;
    state.settings = JSON.parse(JSON.stringify(trip.settings));
    state.itinerary = JSON.parse(JSON.stringify(trip.itinerary));
    state.currentDay = 1;
    state.activeTripId = trip.id;

    document.getElementById("itinDestName").textContent = `${trip.destination.name} Trip`;
    document.getElementById("itinMeta").textContent =
      `${trip.settings.days} days · ${trip.settings.group} traveler${trip.settings.group > 1 ? "s" : ""} · ${INTENSITY[trip.settings.intensity].label} pace`;
    renderWeatherBar();
    renderDayTabs();
    renderItinBody();
    renderBudget();
    updateSaveButtonState();
    goTo("itinerary");
  } catch (e) {
    console.error("Couldn't open saved trip — it may have been saved by an older version of the app:", tripId, e);
  }
}

function deleteSavedTrip(tripId) {
  const trips = loadTrips().filter((t) => t.id !== tripId);
  saveTrips(trips);
  renderTripCountBadge();
  renderMyTripsScreen();
  if (state.activeTripId === tripId) updateSaveButtonState();
}

/* ---------------- Save toggle on the itinerary screen ---------------- */
function updateSaveButtonState() {
  const btn = document.getElementById("saveTripBtn");
  if (!btn || !state.destination) return;
  let existing = null;
  try {
    const trips = loadTrips();
    existing = state.activeTripId
      ? trips.find((t) => t.id === state.activeTripId)
      : findTripBySignature(trips, state.destination, state.settings);
  } catch (e) {
    console.error("updateSaveButtonState failed:", e);
  }
  if (existing) {
    state.activeTripId = existing.id;
    btn.textContent = "❤️";
    btn.classList.add("saved");
  } else {
    state.activeTripId = null;
    btn.textContent = "🤍";
    btn.classList.remove("saved");
  }
}

function toggleSaveTrip() {
  const btn = document.getElementById("saveTripBtn");
  let trips = loadTrips();
  if (state.activeTripId) {
    trips = trips.filter((t) => t.id !== state.activeTripId);
    saveTrips(trips);
    state.activeTripId = null;
  } else {
    const trip = {
      id: "trip-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      destination: state.destination,
      settings: JSON.parse(JSON.stringify(state.settings)),
      itinerary: JSON.parse(JSON.stringify(state.itinerary)),
      savedAt: Date.now(),
    };
    trips.push(trip);
    saveTrips(trips);
    state.activeTripId = trip.id;
  }
  updateSaveButtonState();
  renderTripCountBadge();
  btn.classList.add("pulse");
  setTimeout(() => btn.classList.remove("pulse"), 450);
}

/* ---------------- Init ---------------- */
function initTripsUI() {
  renderProfileChip();
  renderTripCountBadge();

  document.getElementById("myTripsBtn").addEventListener("click", () => {
    goTo("mytrips");
    try { renderMyTripsScreen(); } catch (e) { console.error("renderMyTripsScreen failed:", e); }
  });
  document.getElementById("profileChip").addEventListener("click", openProfileSheet);
  document.getElementById("editProfileBtn").addEventListener("click", openProfileSheet);
  document.getElementById("saveTripBtn").addEventListener("click", toggleSaveTrip);
  document.getElementById("saveProfileBtn").addEventListener("click", () => {
    const name = document.getElementById("profileNameInput").value.trim() || "Traveler";
    const activeAvatarBtn = document.querySelector(".avatar-option.active");
    const avatar = activeAvatarBtn ? activeAvatarBtn.dataset.avatar : "🧭";
    saveProfile({ name, avatar });
    renderProfileChip();
    closeSheet("profile");
  });
}

document.addEventListener("DOMContentLoaded", initTripsUI);
