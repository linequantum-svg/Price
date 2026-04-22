const searchInput = document.querySelector("#searchInput");
const clearButton = document.querySelector("#clearSearch");
const availabilitySort = document.querySelector("#availabilitySort");
const priceSort = document.querySelector("#priceSort");
const productGrid = document.querySelector("#productGrid");
const emptyState = document.querySelector("#emptyState");
const itemsCount = document.querySelector("#itemsCount");
const availableCount = document.querySelector("#availableCount");
const priceRange = document.querySelector("#priceRange");
const resultsCount = document.querySelector("#resultsCount");

const OLEVS_CATEGORY = "Годинники Olevs";
const MARKERS_CATEGORY = "Маркери, фломастери";
const COMPLECTS_CATEGORY = "Комплекти";
const SMARTWATCHES_CATEGORY = "Смарт-годинники";
const KIDS_SMARTWATCHES_CATEGORY = "Дитячі годинники";
const CURRENT_CATEGORY = "\u041d\u0430\u0432\u0443\u0448\u043d\u0438\u043a\u0438 TWS";
const OVER_EAR_HEADPHONES_CATEGORY = "Накладні навушники";
const LIGHTING_CATEGORY = "Світильники";
const ADAPTERS_CATEGORY = "Адаптери";
const PHOTO_FOLDER_URL = "https://drive.google.com/drive/folders/1nbVj9VT4-4jCmiJOMKKnSHXSjPTx6euB";
const AVAILABLE_LABEL = "В наявності";
const UNAVAILABLE_LABEL = "Немає в наявності";
const PHOTO_LABEL = "Фото";
const PHOTO_COMING_SOON_LABEL = "Фото скоро буде";
const DROP_LABEL = "Дропшип";
const OPT_LABEL = "Опт";
const POSITIONS_LABEL = "позицій";
const CURRENCY_UAH = "грн";

const currentCategoryProducts = wirelessHeadphonesProducts;
const allProducts = [
  ...olevsProducts,
  ...markersProducts,
  ...complectsProducts,
  ...smartwatchesProducts,
  ...kidsSmartwatchesProducts,
  ...wirelessHeadphonesProducts,
  ...overEarHeadphonesProducts,
  ...casesProducts,
  ...phoneCasesProducts,
  ...lightingProducts,
  ...adaptersProducts,
  ...powerbanksProducts,
  ...skmeiProducts,
  ...strapsProducts
];
const defaultOrder = new Map(
  currentCategoryProducts.map((product, index) => [product.name, index])
);

const availabilityRank = {
  [AVAILABLE_LABEL]: 0,
  [UNAVAILABLE_LABEL]: 1,
  ["Немає в наявності"]: 3
};

const parsePriceValue = (value) => {
  if (!value) return Number.POSITIVE_INFINITY;
  return Number.parseFloat(
    String(value)
      .replace(/[^\d,.-]/g, "")
      .replace(",", ".")
  );
};

const normalizeQuery = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const formatCount = (count) => `${count} ${POSITIONS_LABEL}`;

const buildCard = (product) => {
  const card = document.createElement("article");
  card.className = "product-card";

  const isAvailable = product.availability === AVAILABLE_LABEL;
  const availabilityClass = isAvailable ? "is-available" : "is-unavailable";
  const hasImage = Boolean(String(product.image || "").trim());
  const mediaClassName = hasImage ? "product-media" : "product-media is-empty";
  const mediaMarkup = hasImage
    ? `<img src="${product.image}" alt="${product.name}" loading="lazy">`
    : `<div class="product-media-placeholder">${PHOTO_COMING_SOON_LABEL}</div>`;

  card.innerHTML = `
    <div class="${mediaClassName}">
      ${mediaMarkup}
    </div>
    <div class="product-body">
      <div class="product-heading">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-subtitle">${product.category}</div>
      </div>
      <div class="prices">
        <div class="price-box">
          <span>${DROP_LABEL}</span>
          <strong>${product.drop || "-"}</strong>
        </div>
        <div class="price-box">
          <span>${OPT_LABEL}</span>
          <strong>${product.bulk || "-"}</strong>
        </div>
      </div>
      <div class="product-actions">
        <span class="availability-link ${availabilityClass}">
          ${isAvailable ? AVAILABLE_LABEL : UNAVAILABLE_LABEL}
        </span>
        <a class="ghost-note" href="${PHOTO_FOLDER_URL}" target="_blank" rel="noreferrer">${PHOTO_LABEL}</a>
      </div>
    </div>
  `;

  return card;
};

const sortProducts = (products) => {
  const sorted = [...products];

  const availabilityMode = availabilitySort.value;
  const priceMode = priceSort.value;

  sorted.sort((a, b) => {
    if (availabilityMode !== "default") {
      const aRank = availabilityRank[a.availability] ?? 99;
      const bRank = availabilityRank[b.availability] ?? 99;
      if (aRank !== bRank) {
        return availabilityMode === "available-first" ? aRank - bRank : bRank - aRank;
      }
    }

    if (priceMode !== "default") {
      const aPrice = parsePriceValue(a.drop);
      const bPrice = parsePriceValue(b.drop);
      if (aPrice !== bPrice) {
        return priceMode === "drop-asc" ? aPrice - bPrice : bPrice - aPrice;
      }
    }

    const aIndex = defaultOrder.get(a.name);
    const bIndex = defaultOrder.get(b.name);

    if (Number.isInteger(aIndex) && Number.isInteger(bIndex)) {
      return aIndex - bIndex;
    }

    return a.name.localeCompare(b.name, "uk");
  });

  return sorted;
};

const updateStats = (products) => {
  itemsCount.textContent = String(products.length);
  availableCount.textContent = String(
    products.filter((product) => product.availability === AVAILABLE_LABEL).length
  );

  const dropValues = products
    .map((product) => parsePriceValue(product.drop))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (dropValues.length) {
    priceRange.textContent = `${dropValues[0]}-${dropValues.at(-1)} ${CURRENCY_UAH}`;
  } else {
    priceRange.textContent = "-";
  }

  resultsCount.textContent = formatCount(products.length);
};

const renderProducts = () => {
  const query = normalizeQuery(searchInput.value);
  const source = query ? allProducts : currentCategoryProducts;

  const filtered = source.filter((product) =>
    normalizeQuery(`${product.name} ${product.category}`).includes(query)
  );

  const sorted = sortProducts(filtered);

  productGrid.replaceChildren(...sorted.map(buildCard));
  emptyState.hidden = sorted.length !== 0;
  updateStats(sorted);
};

searchInput.addEventListener("input", renderProducts);
clearButton.addEventListener("click", () => {
  searchInput.value = "";
  availabilitySort.value = "default";
  priceSort.value = "default";
  renderProducts();
});
availabilitySort.addEventListener("change", renderProducts);
priceSort.addEventListener("change", renderProducts);

async function initializeStockSync() {
  try {
    const { syncKnownProductCollections } = await import("./stock-sync.js?v=2");
    await syncKnownProductCollections(window);
  } catch (error) {
    console.error("Stock sync initialization failed.", error);
  }
}

(async () => {
  await initializeStockSync();
  renderProducts();
})();






