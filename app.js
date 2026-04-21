const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const categoryChips = document.getElementById("categoryChips");
const clearSearchButton = document.getElementById("clearSearch");
const availabilitySort = document.getElementById("availabilitySort");
const itemsCount = document.getElementById("itemsCount");
const categoriesCount = document.getElementById("categoriesCount");
const availableCount = document.getElementById("availableCount");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");

const categories = [...new Set(priceData.map((item) => item.category).filter(Boolean))].sort(
  (first, second) => first.localeCompare(second, "uk")
);

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function isAvailable(status) {
  return normalize(status).includes("наяв");
}

function sortRowsByAvailability(rows, sortMode) {
  if (sortMode === "available-first") {
    return [...rows].sort((first, second) => Number(isAvailable(second.availability)) - Number(isAvailable(first.availability)));
  }

  if (sortMode === "unavailable-first") {
    return [...rows].sort((first, second) => Number(isAvailable(first.availability)) - Number(isAvailable(second.availability)));
  }

  return rows;
}

function formatOptPrice(value) {
  return value ? `$${value}` : "-";
}

function formatDropPrice(value) {
  return value ? `${value} грн` : "-";
}

function populateCategoryFilter() {
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function renderCategoryChips() {
  const currentCategory = categoryFilter.value;
  const chipData = [{ label: "Усі", value: "" }, ...categories.map((category) => ({ label: category, value: category }))];

  categoryChips.innerHTML = "";

  chipData.forEach((chip) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${chip.value === currentCategory ? " is-active" : ""}`;
    button.textContent = chip.label;
    button.addEventListener("click", () => {
      categoryFilter.value = chip.value;
      refreshCatalog();
    });
    categoryChips.appendChild(button);
  });
}

function renderProducts(rows) {
  productGrid.innerHTML = "";

  rows.forEach((item) => {
    const article = document.createElement("article");
    const available = isAvailable(item.availability);
    article.className = "product-card";
    article.innerHTML = `
      <div class="product-top">
        <div>
          <span class="product-category">${item.category || "Категорія"}</span>
          <h3 class="product-title">${item.name}</h3>
        </div>
        <span class="availability${available ? "" : " is-waiting"}">${item.availability || "Уточнюється"}</span>
      </div>
      <div class="product-prices">
        <div class="price-box">
          <span>Опт, $</span>
          <strong>${formatOptPrice(item.opt)}</strong>
        </div>
        <div class="price-box">
          <span>Дроп, грн</span>
          <strong>${formatDropPrice(item.drop)}</strong>
        </div>
      </div>
      <div class="product-footer">
        <span class="product-meta">Товар з локального каталогу</span>
        <span class="contact-button">Уточнити ціну</span>
      </div>
    `;
    productGrid.appendChild(article);
  });

  emptyState.hidden = rows.length > 0;
}

function updateStats(rows) {
  const visibleCategories = new Set(rows.map((item) => item.category).filter(Boolean));
  const visibleAvailable = rows.filter((item) => isAvailable(item.availability));

  itemsCount.textContent = rows.length;
  categoriesCount.textContent = visibleCategories.size;
  availableCount.textContent = visibleAvailable.length;
  resultsCount.textContent = `${rows.length} товарів`;
}

function filterRows(query, selectedCategory) {
  const normalizedQuery = normalize(query);

  return priceData.filter((item) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesQuery =
      !normalizedQuery ||
      Object.values(item).some((value) => normalize(value).includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });
}

function refreshCatalog() {
  const filtered = filterRows(searchInput.value, categoryFilter.value);
  const sorted = sortRowsByAvailability(filtered, availabilitySort?.value);
  renderCategoryChips();
  renderProducts(sorted);
  updateStats(sorted);
}

searchInput.addEventListener("input", refreshCatalog);
categoryFilter.addEventListener("change", refreshCatalog);
availabilitySort?.addEventListener("change", refreshCatalog);

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";
  if (availabilitySort) {
    availabilitySort.value = "default";
  }
  refreshCatalog();
});

populateCategoryFilter();
refreshCatalog();
