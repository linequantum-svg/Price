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
const AVAILABLE_LABEL = "В наявності";
const POSITIONS_LABEL = "позицій";
const CURRENCY_UAH = "грн";
const PHONE_CASES_CATEGORY_LABEL = "Чохли для телефонів";
const PHONE_CASES_PHOTO_URL = "https://drive.google.com/drive/folders/1H1OiqQ0n2qgpWKtooPwmRAbsv6l6dRfd";

const currentCategoryProducts = phoneCasesProducts;
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
  ...strapsProducts,
  ...miceProducts
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

const splitPhoneCaseName = (product) => {
  const originalName = String(product.name || "").trim();
  const normalizedName = originalName.replace(/\s+/g, " ").trim();
  const doubleSpaceParts = originalName
    .split(/\s{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (doubleSpaceParts.length >= 2) {
    return {
      baseName: doubleSpaceParts.slice(0, -1).join(" ").trim(),
      colorName: doubleSpaceParts.at(-1)
    };
  }

  const parts = normalizedName.split(" ");

  if (parts.length >= 2) {
    return {
      baseName: parts.slice(0, -1).join(" ").trim(),
      colorName: parts.at(-1)
    };
  }

  return {
    baseName: normalizedName,
    colorName: ""
  };
};

const getPhoneCaseBaseName = (product) => splitPhoneCaseName(product).baseName;
const getPhoneCaseColorName = (product) => splitPhoneCaseName(product).colorName;

const formatPhoneCaseTitle = (product) => {
  const baseName = getPhoneCaseBaseName(product);
  const colorName = getPhoneCaseColorName(product);

  if (!colorName) {
    return baseName;
  }

  return `${baseName}<br><span class="product-title-meta">${colorName}</span>`;
};

const sortProducts = (products) => {
  const availabilityMode = availabilitySort.value;
  const priceMode = priceSort.value;
  const orderMap = { "В наявності": 0, "Немає в наявності": 1, "Немає в наявності": 2 };

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
        <h3 class="product-title">${formatPhoneCaseTitle(product)}</h3>
        <div class="product-subtitle">${PHONE_CASES_CATEGORY_LABEL}</div>
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
        <a class="ghost-note" href="${PHONE_CASES_PHOTO_URL}" target="_blank" rel="noreferrer">Фото</a>
      </div>
    </div>
  `;
  return card;
};

const getPhoneCaseGroupName = (product) => getPhoneCaseBaseName(product);

const buildProductGroup = (groupName, products) => {
  const section = document.createElement("section");
  section.className = "product-group";

  const heading = document.createElement("div");
  heading.className = "product-group-head";
  heading.innerHTML = `
    <h3>${groupName}</h3>
    <span>${products.length} ${POSITIONS_LABEL}</span>
  `;

  const groupGrid = document.createElement("div");
  groupGrid.className = "product-group-grid";
  groupGrid.replaceChildren(...products.map(buildCard));

  section.replaceChildren(heading, groupGrid);
  return section;
};

const buildGroupedProducts = (products) => {
  const groups = new Map();

  products.forEach((product) => {
    const groupName = getPhoneCaseGroupName(product);

    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }

    groups.get(groupName).push(product);
  });

  return [...groups.entries()].map(([groupName, groupProducts]) =>
    buildProductGroup(groupName, groupProducts)
  );
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
  const sorted = sortProducts(filtered);

  productGrid.classList.toggle("is-grouped", !query);
  productGrid.replaceChildren(...(!query ? buildGroupedProducts(sorted) : sorted.map(buildCard)));
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


