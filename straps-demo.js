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
const STRAPS_PHOTO_URL = "https://drive.google.com/drive/folders/1xuOtVHts5lBlode_keZi_u_tgc1LAQ5E";

const AVAILABLE_LABEL = "В наявності";
const POSITIONS_LABEL = "позицій";
const CURRENCY_UAH = "грн";

const currentCategoryProducts = strapsProducts;
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

const sortProducts = (products) => {
  const availabilityMode = availabilitySort.value;
  const priceMode = priceSort.value;
  const orderMap = { "В наявності": 0, "Немає в наявності": 1 };

  return [...products].sort((a, b) => {
    if (availabilityMode !== "default") {
      const aRank = orderMap[a.availability] ?? 99;
      const bRank = orderMap[b.availability] ?? 99;
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

    return 0;
  });
};

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
          <span>Дроп</span>
          <strong>${product.drop || "-"}</strong>
        </div>
        <div class="price-box">
          <span>Опт</span>
          <strong>${product.bulk || "-"}</strong>
        </div>
      </div>
      <div class="product-actions">
        <span class="availability-link ${product.availability === AVAILABLE_LABEL ? "is-available" : "is-unavailable"}">${product.availability}</span>
        <a class="ghost-note" href="${STRAPS_PHOTO_URL}" target="_blank" rel="noreferrer">Фото</a>
      </div>
    </div>
  `;
  return card;
};

const updateStats = (products) => {
  itemsCount.textContent = String(products.length);
  availableCount.textContent = String(products.filter((product) => product.availability === AVAILABLE_LABEL).length);

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

renderProducts();



