const searchInput = document.getElementById("searchInput");
const clearSearchButton = document.getElementById("clearSearch");
const availabilitySort = document.getElementById("availabilitySort");
const priceSort = document.getElementById("priceSort");
const searchResultsSection = document.getElementById("searchResultsSection");
const productGrid = document.getElementById("productGrid");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");

const AVAILABLE_LABEL = "Р’ РЅР°СЏРІРЅРѕСЃС‚С–";
const UNAVAILABLE_LABEL = "РќРµРјР°С” РІ РЅР°СЏРІРЅРѕСЃС‚С–";
const PHOTO_LABEL = "Р¤РѕС‚Рѕ";
const PHOTO_COMING_SOON_LABEL = "Р¤РѕС‚Рѕ СЃРєРѕСЂРѕ Р±СѓРґРµ";
const DROP_LABEL = "Дропшип";
const OPT_LABEL = "РћРїС‚";
const POSITIONS_LABEL = "РїРѕР·РёС†С–Р№";

const categoryPhotoFolderUrls = {
  "Р“РѕРґРёРЅРЅРёРєРё Olevs": "https://drive.google.com/drive/folders/1zEVL5BXCgh3jEJ1Cq_iQG7XjFvkpXS_T",
  "РњР°СЂРєРµСЂРё, С„Р»РѕРјР°СЃС‚РµСЂРё": "https://drive.google.com/drive/folders/1xJrjvroaG9CQ9HZPx7u0rt4PrLmPzExS",
  "РљРѕРјРїР»РµРєС‚Рё": "https://drive.google.com/drive/folders/1_fkneQ2_jjqxjLgxbT1sXCstKNaJIdLR",
  "РЎРјР°СЂС‚-РіРѕРґРёРЅРЅРёРєРё": "https://drive.google.com/drive/folders/1e_82mlV4UWysgEmE9KIsnkUE6jrEumYV?usp=sharing",
  "Р”РёС‚СЏС‡С– РЎРјР°СЂС‚-РіРѕРґРёРЅРЅРёРєРё": "https://drive.google.com/drive/folders/1yzbaBqPhleuNkdBjPneUp93GzU_hhvON",
  "Р”РёС‚СЏС‡С– РіРѕРґРёРЅРЅРёРєРё": "https://drive.google.com/drive/folders/1yzbaBqPhleuNkdBjPneUp93GzU_hhvON",
  "РќР°РІСѓС€РЅРёРєРё TWS": "https://drive.google.com/drive/folders/1nbVj9VT4-4jCmiJOMKKnSHXSjPTx6euB",
  "РќР°РєР»Р°РґРЅС– РЅР°РІСѓС€РЅРёРєРё": "https://drive.google.com/drive/folders/1sAdgP63i4HGtvK2jFLGIHm9i5hhAyJbu",
  "Р§РѕС…Р»Рё": "https://drive.google.com/drive/folders/1H235sCA4MTgPyZciZvWCVaXenkaXgX9T",
  "Р§РѕС…Р»Рё РґР»СЏ РЅР°РІСѓС€РЅРёРєС–РІ": "https://drive.google.com/drive/folders/1H235sCA4MTgPyZciZvWCVaXenkaXgX9T",
  "Р§РѕС…Р»Рё РґР»СЏ С‚РµР»РµС„РѕРЅС–РІ": "https://drive.google.com/drive/folders/1H1OiqQ0n2qgpWKtooPwmRAbsv6l6dRfd",
  "РЎРІС–С‚РёР»СЊРЅРёРєРё": "https://drive.google.com/drive/folders/1xsfMF3q1vQ27gllevrxopFcNOdARr5ia",
  "РђРґР°РїС‚РµСЂРё": "https://drive.google.com/drive/folders/1Y8mUsDt-15TbTN--cvaudPC1OIDEVnSP",
  "РџР°РІРµСЂР±Р°РЅРєРё, Р·Р°СЂСЏРґРЅС– РїСЂРёСЃС‚СЂРѕС—": "https://drive.google.com/drive/folders/1s7LYi9A2hD2Z3N9dcYqA5EEylYCD4MWc",
  "Р“РѕРґРёРЅРЅРёРєРё Skmei": "https://drive.google.com/drive/folders/16hmFwuw-bINqC3WVNSHGRzbyusUUjXGD",
  "Р РµРјС–РЅС†С–": "https://drive.google.com/drive/folders/1xuOtVHts5lBlode_keZi_u_tgc1LAQ5E"
};

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

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function parseDropAmount(value) {
  const match = String(value || "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : null;
}

function isAvailable(value) {
  return normalize(value) === normalize(AVAILABLE_LABEL);
}

function getPhotoUrl(product) {
  return categoryPhotoFolderUrls[product.category] || "#";
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
    const photoUrl = getPhotoUrl(item);
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
            <strong>${item.bulk || item.opt || "-"}</strong>
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

function filterProducts(query) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  return allProducts.filter((item) => normalize(`${item.name} ${item.category}`).includes(normalizedQuery));
}

function refreshCatalog() {
  const query = searchInput.value.trim();

  if (!query) {
    searchResultsSection.hidden = true;
    productGrid.innerHTML = "";
    emptyState.hidden = true;
    resultsCount.textContent = `0 ${POSITIONS_LABEL}`;
    return;
  }

  const filtered = sortProducts(filterProducts(query));
  searchResultsSection.hidden = false;
  renderProducts(filtered);
  resultsCount.textContent = `${filtered.length} ${POSITIONS_LABEL}`;
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

