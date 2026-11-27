// DealSleuth front end: renders the deal cards and wires up search,
// category chips, store and discount filters, and sorting. All data
// lives in deals.js; nothing here fetches anything from the network.

import { DEALS, SOURCES, CHECKED_LABEL, CATEGORIES, STORES } from "./deals.js";

const grid = document.getElementById("deal-grid");
const countLine = document.getElementById("result-count");
const searchBox = document.getElementById("search");
const storeSelect = document.getElementById("store-filter");
const discountSelect = document.getElementById("discount-filter");
const sortSelect = document.getElementById("sort");
const chipRow = document.getElementById("category-chips");
const emptyNote = document.getElementById("empty-note");

let activeCategory = "All";

export function discountPct(deal) {
  return Math.round((1 - deal.sale / deal.usual) * 100);
}

export function savedAmount(deal) {
  return deal.usual - deal.sale;
}

export function money(value) {
  return "$" + value.toFixed(2).replace(/\.00$/, "");
}

// The "really a deal" verdict: discount depth against the usual price,
// plus how the price was checked. A small cut on a new product is
// labelled honestly instead of dressed up as a bargain.
export function verdictFor(deal) {
  const pct = discountPct(deal);
  if (pct >= 50) {
    return {
      level: "real",
      label: "REAL DEAL",
      why: "Half price or better off the usual price — a genuine deep cut.",
    };
  }
  if (pct >= 30) {
    return {
      level: "good",
      label: "GOOD DEAL",
      why: "A solid cut of a third or more off the usual price.",
    };
  }
  if (pct >= 20) {
    return {
      level: "decent",
      label: "DECENT DEAL",
      why: "A real saving, but not the lowest this product has ever been.",
    };
  }
  return {
    level: "small",
    label: "SMALL CUT",
    why: "Only a modest trim off list — worth it if you need it now, not a bargain to chase.",
  };
}

function storeClass(store) {
  return "store-" + store.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function cardHtml(deal) {
  const pct = discountPct(deal);
  const verdict = verdictFor(deal);
  const source = SOURCES[deal.source];
  return `
<article class="card" data-id="${deal.id}">
  <div class="card-top">
    <span class="cat-tag">${deal.category}</span>
    <span class="verdict verdict-${verdict.level}" title="${verdict.why}">${verdict.label}</span>
  </div>
  <h2 class="card-name">${deal.name}</h2>
  <p class="card-blurb">${deal.blurb}</p>
  <div class="price-row">
    <span class="sale-price">${money(deal.sale)}</span>
    <span class="usual-price"><s>${money(deal.usual)}</s></span>
    <span class="off-badge">−${pct}%</span>
  </div>
  <p class="save-line">You save ${money(savedAmount(deal))} off the usual price.</p>
  <p class="verdict-why">${verdict.why}</p>
  <div class="card-meta">
    <span class="store-chip ${storeClass(deal.store)}">${deal.store}</span>
    <span class="checked">Checked ${CHECKED_LABEL}</span>
  </div>
  <p class="source-note">Source: ${source.label} — ${source.detail}</p>
  <a class="store-link" href="${deal.url}" target="_blank" rel="noopener">View this deal at ${deal.store} →</a>
</article>`;
}

function applyFilters() {
  const query = searchBox.value.trim().toLowerCase();
  const store = storeSelect.value;
  const minOff = Number(discountSelect.value);
  const sort = sortSelect.value;

  let shown = DEALS.filter((deal) => {
    if (activeCategory !== "All" && deal.category !== activeCategory) return false;
    if (store !== "All" && deal.store !== store) return false;
    if (discountPct(deal) < minOff) return false;
    if (query) {
      const hay = (deal.name + " " + deal.category + " " + deal.store + " " + deal.blurb).toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  if (sort === "discount") shown.sort((a, b) => discountPct(b) - discountPct(a));
  if (sort === "saving") shown.sort((a, b) => savedAmount(b) - savedAmount(a));
  if (sort === "price-asc") shown.sort((a, b) => a.sale - b.sale);
  if (sort === "price-desc") shown.sort((a, b) => b.sale - a.sale);

  grid.innerHTML = shown.map(cardHtml).join("");
  emptyNote.hidden = shown.length > 0;
  const totalSaved = shown.reduce((sum, deal) => sum + savedAmount(deal), 0);
  countLine.textContent =
    shown.length === DEALS.length
      ? `Showing all ${shown.length} deals · total saving ${money(totalSaved)} if you bought one of each`
      : `Showing ${shown.length} of ${DEALS.length} deals · total saving ${money(totalSaved)} on this selection`;
}

function buildChips() {
  chipRow.innerHTML = CATEGORIES.map(
    (cat) =>
      `<button type="button" class="chip${cat === activeCategory ? " active" : ""}" data-category="${cat}">${cat}</button>`,
  ).join("");
  chipRow.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.category;
      buildChips();
      applyFilters();
    });
  });
}

function buildStoreOptions() {
  storeSelect.innerHTML = STORES.map((store) => `<option value="${store}">${store === "All" ? "All stores" : store}</option>`).join("");
}

function fillStats() {
  const totalSaved = DEALS.reduce((sum, deal) => sum + savedAmount(deal), 0);
  const stores = new Set(DEALS.map((deal) => deal.store)).size;
  const cats = new Set(DEALS.map((deal) => deal.category)).size;
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set("stat-deals", String(DEALS.length));
  set("stat-saving", money(totalSaved));
  set("stat-stores", String(stores));
  set("stat-cats", String(cats));
  set("stat-checked", CHECKED_LABEL);
}

function readShareLink() {
  // A filtered view can be shared as a link, e.g.
  // index.html?category=TVs&store=Amazon&discount=50&q=oled&sort=saving
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  if (category && CATEGORIES.includes(category)) activeCategory = category;
  const store = params.get("store");
  if (store && STORES.includes(store)) storeSelect.value = store;
  const discount = params.get("discount");
  if (discount && ["0", "20", "30", "40", "50"].includes(discount)) discountSelect.value = discount;
  const sort = params.get("sort");
  if (sort && ["discount", "saving", "price-asc", "price-desc"].includes(sort)) sortSelect.value = sort;
  const query = params.get("q");
  if (query) searchBox.value = query;
}

buildStoreOptions();
fillStats();
readShareLink();
buildChips();
searchBox.addEventListener("input", applyFilters);
storeSelect.addEventListener("change", applyFilters);
discountSelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);
applyFilters();
