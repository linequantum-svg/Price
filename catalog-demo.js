const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const clearSearchButton = document.getElementById("clearSearch");
const availabilitySort = document.getElementById("availabilitySort");
const priceSort = document.getElementById("priceSort");
const itemsCount = document.getElementById("itemsCount");
const availableCount = document.getElementById("availableCount");
const priceRange = document.getElementById("priceRange");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");

const CURRENT_CATEGORY = "\u0413\u043e\u0434\u0438\u043d\u043d\u0438\u043a\u0438 Olevs";
const MARKERS_CATEGORY = "\u041c\u0430\u0440\u043a\u0435\u0440\u0438, \u0444\u043b\u043e\u043c\u0430\u0441\u0442\u0435\u0440\u0438";
const COMPLECTS_CATEGORY = "\u041a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u0438";
const SMARTWATCHES_CATEGORY = "\u0421\u043c\u0430\u0440\u0442-\u0433\u043e\u0434\u0438\u043d\u043d\u0438\u043a\u0438";
const KIDS_SMARTWATCHES_CATEGORY = "\u0414\u0438\u0442\u044f\u0447\u0456 \u0421\u043c\u0430\u0440\u0442-\u0433\u043e\u0434\u0438\u043d\u043d\u0438\u043a\u0438";
const WIRELESS_HEADPHONES_CATEGORY = "\u041d\u0430\u0432\u0443\u0448\u043d\u0438\u043a\u0438 TWS";
const OVER_EAR_HEADPHONES_CATEGORY = "\u041d\u0430\u043a\u043b\u0430\u0434\u043d\u0456 \u043d\u0430\u0432\u0443\u0448\u043d\u0438\u043a\u0438";
const LIGHTING_CATEGORY = "\u0421\u0432\u0456\u0442\u0438\u043b\u044c\u043d\u0438\u043a\u0438";
const ADAPTERS_CATEGORY = "\u0410\u0434\u0430\u043f\u0442\u0435\u0440\u0438";
const CASES_CATEGORY = "\u0427\u043e\u0445\u043b\u0438";
const AVAILABLE_LABEL = "\u0412 \u043d\u0430\u044f\u0432\u043d\u043e\u0441\u0442\u0456";
const UNAVAILABLE_LABEL = "\u041d\u0435\u043c\u0430\u0454 \u0432 \u043d\u0430\u044f\u0432\u043d\u043e\u0441\u0442\u0456";
const PHOTO_LABEL = "\u0424\u043e\u0442\u043e";
const PHOTO_COMING_SOON_LABEL = "\u0424\u043e\u0442\u043e \u0441\u043a\u043e\u0440\u043e \u0431\u0443\u0434\u0435";
const DROP_LABEL = "\u0414\u0440\u043e\u043f";
const OPT_LABEL = "\u041e\u043f\u0442";
const POSITIONS_LABEL = "\u043f\u043e\u0437\u0438\u0446\u0456\u0439";
const CURRENCY_UAH = "\u0433\u0440\u043d";

const currentCategoryProducts = olevsProducts;
const allProducts = [...olevsProducts, ...markersProducts, ...complectsProducts, ...smartwatchesProducts, ...kidsSmartwatchesProducts, ...wirelessHeadphonesProducts, ...overEarHeadphonesProducts, ...casesProducts,
  ...phoneCasesProducts, ...lightingProducts, ...adaptersProducts,
  ...powerbanksProducts,
  ...skmeiProducts,
  ...strapsProducts];
const categoryPhotoFolderUrls = {
  [CURRENT_CATEGORY]: "https://drive.google.com/drive/folders/1zEVL5BXCgh3jEJ1Cq_iQG7XjFvkpXS_T",
  [MARKERS_CATEGORY]: "https://drive.google.com/drive/folders/1xJrjvroaG9CQ9HZPx7u0rt4PrLmPzExS",
  [COMPLECTS_CATEGORY]: "https://drive.google.com/drive/folders/1_fkneQ2_jjqxjLgxbT1sXCstKNaJIdLR",
  [SMARTWATCHES_CATEGORY]: "https://drive.google.com/drive/folders/1e_82mlV4UWysgEmE9KIsnkUE6jrEumYV?usp=sharing",
  [KIDS_SMARTWATCHES_CATEGORY]: "https://docs.google.com/spreadsheets/u/0/d/1m2Q9k_wTTadYmDHRk82PgL8UWn84aC6R/htmlview/sheet?hl=en&pli=1&headers=true&gid=80987745",
  [WIRELESS_HEADPHONES_CATEGORY]: "#",
  [OVER_EAR_HEADPHONES_CATEGORY]: "#",
  [LIGHTING_CATEGORY]: "#",
  [ADAPTERS_CATEGORY]: "#",
  [CASES_CATEGORY]: "#"
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function parseDropAmount(value) {
  const match = String(value || "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : null;
}

function formatRange(items) {
  const values = items.map((item) => parseDropAmount(item.drop)).filter((value) => value !== null);

  if (!values.length) {
    return "-";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  return min === max ? `${min} ${CURRENCY_UAH}` : `${min}-${max} ${CURRENCY_UAH}`;
}

function isAvailable(value) {
  return normalize(value) === normalize(AVAILABLE_LABEL);
}

function sortProducts(items) {
  const sorted = [...items];

  if (availabilitySort.value === "available-first") {
    sorted.sort((first, second) => Number(isAvailable(second.availability)) - Number(isAvailable(first.availability)));
  } else if (availabilitySort.value === "unavailable-first") {
    sorted.sort((first, second) => Number(isAvailable(first.availability)) - Number(isAvailable(second.availability)));
  }

  if (priceSort.value === "drop-asc") {
    sorted.sort((first, second) => (parseDropAmount(first.drop) ?? Number.MAX_SAFE_INTEGER) - (parseDropAmount(second.drop) ?? Number.MAX_SAFE_INTEGER));
  } else if (priceSort.value === "drop-desc") {
    sorted.sort((first, second) => (parseDropAmount(second.drop) ?? -1) - (parseDropAmount(first.drop) ?? -1));
  }

  return sorted;
}

function renderProducts(items) {
  productGrid.innerHTML = "";

  items.forEach((item) => {
    const article = document.createElement("article");
    const available = isAvailable(item.availability);
    const availabilityLabel = available ? AVAILABLE_LABEL : UNAVAILABLE_LABEL;
    const photoUrl = categoryPhotoFolderUrls[item.category] || categoryPhotoFolderUrls[CURRENT_CATEGORY];
    const hasImage = Boolean(String(item.image || "").trim());
    const mediaClassName = hasImage ? "product-media" : "product-media is-empty";
    const mediaMarkup = hasImage
      ? `<img src="${item.image}" alt="${item.name}" loading="lazy">`
      : `<div class="product-media-placeholder">${PHOTO_COMING_SOON_LABEL}</div>`;

    article.className = "product-card";
    article.innerHTML = `
      <div class="${mediaClassName}">
        ${mediaMarkup}
      </div>
      <div class="product-body">
        <div class="product-heading">
          <h3 class="product-title">${item.name}</h3>
          <div class="product-subtitle">${item.category}</div>
        </div>
        <div class="prices">
          <div class="price-box">
            <span>${DROP_LABEL}</span>
            <strong>${item.drop || "-"}</strong>
          </div>
          <div class="price-box">
            <span>${OPT_LABEL}</span>
            <strong>${item.bulk || "-"}</strong>
          </div>
        </div>
        <div class="product-actions">
          <span class="availability-link ${available ? "is-available" : "is-unavailable"}">${availabilityLabel}</span>
          <a class="ghost-note" href="${photoUrl}" target="_blank" rel="noreferrer">${PHOTO_LABEL}</a>
        </div>
      </div>
    `;
    productGrid.appendChild(article);
  });

  emptyState.hidden = items.length > 0;
}

function updateStats(items) {
  itemsCount.textContent = items.length;
  availableCount.textContent = items.filter((item) => isAvailable(item.availability)).length;
  priceRange.textContent = formatRange(items);
  resultsCount.textContent = `${items.length} ${POSITIONS_LABEL}`;
}

function filterProducts(query) {
  const normalizedQuery = normalize(query);
  const source = normalizedQuery ? allProducts : currentCategoryProducts;

  if (!normalizedQuery) {
    return source;
  }

  return source.filter((item) => normalize(`${item.name} ${item.category}`).includes(normalizedQuery));
}

function refreshCatalog() {
  const filtered = sortProducts(filterProducts(searchInput.value));
  renderProducts(filtered);
  updateStats(filtered);
}

searchInput.addEventListener("input", refreshCatalog);
availabilitySort.addEventListener("change", refreshCatalog);
priceSort.addEventListener("change", refreshCatalog);

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  availabilitySort.value = "default";
  priceSort.value = "default";
  refreshCatalog();
});

refreshCatalog();



