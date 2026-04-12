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
const WIRELESS_HEADPHONES_CATEGORY = "\u041d\u0430\u0432\u0443\u0448\u043d\u0438\u043a\u0438 TWS";
const OVER_EAR_HEADPHONES_CATEGORY = "Накладні навушники";
const ADAPTERS_CATEGORY = "Адаптери";
const CURRENT_CATEGORY = "Дитячі годинники";
const AVAILABLE_LABEL = "В наявності";
const UNAVAILABLE_LABEL = "Немає в наявності";
const PHOTO_LABEL = "Фото";
const PHOTO_COMING_SOON_LABEL = "Фото скоро буде";
const DROP_LABEL = "Дроп";
const OPT_LABEL = "Опт";
const POSITIONS_LABEL = "позицій";
const CURRENCY_UAH = "грн";

const currentCategoryProducts = kidsSmartwatchesProducts;
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
const categoryPhotoFolderUrls = {
  [OLEVS_CATEGORY]: "https://drive.google.com/drive/folders/1zEVL5BXCgh3jEJ1Cq_iQG7XjFvkpXS_T",
  [MARKERS_CATEGORY]: "https://drive.google.com/drive/folders/1xJrjvroaG9CQ9HZPx7u0rt4PrLmPzExS",
  [COMPLECTS_CATEGORY]: "https://drive.google.com/drive/folders/1_fkneQ2_jjqxjLgxbT1sXCstKNaJIdLR",
  [SMARTWATCHES_CATEGORY]: "https://drive.google.com/drive/folders/1e_82mlV4UWysgEmE9KIsnkUE6jrEumYV?usp=sharing",
  [CURRENT_CATEGORY]: "https://docs.google.com/spreadsheets/u/0/d/1m2Q9k_wTTadYmDHRk82PgL8UWn84aC6R/htmlview/sheet?hl=en&pli=1&headers=true&gid=80987745",
  [WIRELESS_HEADPHONES_CATEGORY]: "#",
  [OVER_EAR_HEADPHONES_CATEGORY]: "#"
};

const availabilityRank = {
  [AVAILABLE_LABEL]: 0,
  [UNAVAILABLE_LABEL]: 1,
  ["Уточнюється"]: 3
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

renderProducts();




