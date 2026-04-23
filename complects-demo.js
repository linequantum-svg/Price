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

const OLEVS_CATEGORY = "\u0413\u043e\u0434\u0438\u043d\u043d\u0438\u043a\u0438 Olevs";
const MARKERS_CATEGORY = "\u041c\u0430\u0440\u043a\u0435\u0440\u0438, \u0444\u043b\u043e\u043c\u0430\u0441\u0442\u0435\u0440\u0438";
const CURRENT_CATEGORY = "\u041a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u0438";
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
const DROP_LABEL = "\u0414\u0440\u043e\u043f\u0448\u0438\u043f";
const OPT_LABEL = "\u041e\u043f\u0442";
const POSITIONS_LABEL = "\u043f\u043e\u0437\u0438\u0446\u0456\u0439";
const CURRENCY_UAH = "\u0433\u0440\u043d";

const currentCategoryProducts = complectsProducts;
const allProducts = [...olevsProducts, ...markersProducts, ...complectsProducts, ...smartwatchesProducts, ...kidsSmartwatchesProducts, ...wirelessHeadphonesProducts, ...overEarHeadphonesProducts, ...casesProducts,
  ...phoneCasesProducts, ...lightingProducts, ...adaptersProducts,
  ...powerbanksProducts,
  ...skmeiProducts,
  ...strapsProducts,
  ...miceProducts];
const defaultOrder = new Map(
  currentCategoryProducts.map((product, index) => [product.name, index])
);
const categoryPhotoFolderUrls = {
  [OLEVS_CATEGORY]: "https://drive.google.com/drive/folders/1zEVL5BXCgh3jEJ1Cq_iQG7XjFvkpXS_T",
  [MARKERS_CATEGORY]: "https://drive.google.com/drive/folders/1xJrjvroaG9CQ9HZPx7u0rt4PrLmPzExS",
  [CURRENT_CATEGORY]: "https://drive.google.com/drive/folders/1_fkneQ2_jjqxjLgxbT1sXCstKNaJIdLR",
  [SMARTWATCHES_CATEGORY]: "https://drive.google.com/drive/folders/1e_82mlV4UWysgEmE9KIsnkUE6jrEumYV?usp=sharing",
  [KIDS_SMARTWATCHES_CATEGORY]: "https://docs.google.com/spreadsheets/u/0/d/1m2Q9k_wTTadYmDHRk82PgL8UWn84aC6R/htmlview/sheet?hl=en&pli=1&headers=true&gid=80987745",
  [WIRELESS_HEADPHONES_CATEGORY]: "#",
  [OVER_EAR_HEADPHONES_CATEGORY]: "#",
  [LIGHTING_CATEGORY]: "#",
  [ADAPTERS_CATEGORY]: "#",
  [CASES_CATEGORY]: "#"
};

const availabilityRank = {
  [AVAILABLE_LABEL]: 0,
  [UNAVAILABLE_LABEL]: 1,
  ["\u0423\u0442\u043e\u0447\u043d\u044e\u0454\u0442\u044c\u0441\u044f"]: 3
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

  const availabilityClass = product.availability === AVAILABLE_LABEL ? "is-available" : "is-unavailable";
  const photoUrl = categoryPhotoFolderUrls[product.category] || categoryPhotoFolderUrls[CURRENT_CATEGORY];
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
          ${product.availability}
        </span>
        <a class="ghost-note" href="${photoUrl}" target="_blank" rel="noreferrer">${PHOTO_LABEL}</a>
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




