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
const ADAPTERS_PHOTO_URL = "https://drive.google.com/drive/folders/1Y8mUsDt-15TbTN--cvaudPC1OIDEVnSP";

const AVAILABLE_LABEL = "В наявності";
const POSITIONS_LABEL = "позицій";
const CURRENCY_UAH = "грн";

const getProducts = (value) => (Array.isArray(value) ? value : []);

const currentCategoryProducts = getProducts(
  typeof adaptersProducts !== "undefined" ? adaptersProducts : []
);
const allProducts = [
  ...getProducts(typeof olevsProducts !== "undefined" ? olevsProducts : []),
  ...getProducts(typeof markersProducts !== "undefined" ? markersProducts : []),
  ...getProducts(typeof complectsProducts !== "undefined" ? complectsProducts : []),
  ...getProducts(typeof smartwatchesProducts !== "undefined" ? smartwatchesProducts : []),
  ...getProducts(
    typeof kidsSmartwatchesProducts !== "undefined" ? kidsSmartwatchesProducts : []
  ),
  ...getProducts(
    typeof wirelessHeadphonesProducts !== "undefined" ? wirelessHeadphonesProducts : []
  ),
  ...getProducts(
    typeof overEarHeadphonesProducts !== "undefined" ? overEarHeadphonesProducts : []
  ),
  ...getProducts(typeof casesProducts !== "undefined" ? casesProducts : []),
  ...getProducts(typeof lightingProducts !== "undefined" ? lightingProducts : []),
  ...currentCategoryProducts,
  ...getProducts(typeof powerbanksProducts !== "undefined" ? powerbanksProducts : []),
  ...getProducts(typeof skmeiProducts !== "undefined" ? skmeiProducts : []),
  ...getProducts(typeof strapsProducts !== "undefined" ? strapsProducts : []),
  ...getProducts(typeof miceProducts !== "undefined" ? miceProducts : [])
];

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
  const hasImage = Boolean(String(product.image || "").trim());
  const mediaClassName = hasImage ? "product-media" : "product-media is-empty";
  const mediaMarkup = hasImage
    ? `<img src="${product.image}" alt="${product.name}" loading="lazy">`
    : `<div class="product-media-placeholder">Фото скоро буде</div>`;

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
          <span>Дропшип</span>
          <strong>${product.drop || "-"}</strong>
        </div>
        <div class="price-box">
          <span>Опт</span>
          <strong>${product.bulk || "-"}</strong>
        </div>
      </div>
      <div class="product-actions">
        <span class="availability-link ${product.availability === AVAILABLE_LABEL ? "is-available" : "is-unavailable"}">${product.availability}</span>
        <a class="ghost-note" href="${ADAPTERS_PHOTO_URL}" target="_blank" rel="noreferrer">Фото</a>
      </div>
    </div>
  `;
  return card;
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

  priceRange.textContent = dropValues.length
    ? `${dropValues[0]}-${dropValues.at(-1)} ${CURRENCY_UAH}`
    : "-";

  resultsCount.textContent = formatCount(products.length);
};

const renderProducts = () => {
  const query = normalizeQuery(searchInput.value);
  const source = query ? allProducts : currentCategoryProducts;
  const filtered = source.filter((product) =>
    normalizeQuery(`${product.name} ${product.category}`).includes(query)
  );

  productGrid.replaceChildren(...filtered.map(buildCard));
  emptyState.hidden = filtered.length !== 0;
  updateStats(filtered);
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



