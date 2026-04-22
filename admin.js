import {
  AVAILABLE_LABEL,
  UNAVAILABLE_LABEL,
  createProductKey,
  fetchStockOverrides,
  getKnownProducts,
  isStockFirebaseReady,
  loginStockAdmin,
  logoutStockAdmin,
  normalizeAvailability,
  saveProductAvailability,
  subscribeToAuthState
} from "./stock-sync.js";

const firebaseState = document.getElementById("firebaseState");
const authState = document.getElementById("authState");
const connectionNote = document.getElementById("connectionNote");
const loginForm = document.getElementById("loginForm");
const sessionPanel = document.getElementById("sessionPanel");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const sessionEmail = document.getElementById("sessionEmail");
const authMessage = document.getElementById("authMessage");
const productsMessage = document.getElementById("productsMessage");
const productsList = document.getElementById("productsList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const availabilityFilter = document.getElementById("availabilityFilter");

const state = {
  products: getKnownProducts(window).sort((first, second) => {
    const categoryOrder = first.category.localeCompare(second.category, "uk");
    return categoryOrder || first.name.localeCompare(second.name, "uk");
  }),
  overrides: new Map(),
  user: null,
  savingKeys: new Set()
};

function setMessage(element, text, tone = "") {
  element.textContent = text || "";
  element.className = "admin-message";

  if (tone) {
    element.classList.add(`is-${tone}`);
  }
}

function setFirebaseConnectionState() {
  if (isStockFirebaseReady()) {
    firebaseState.textContent = "Firebase підключений";
    firebaseState.className = "status-pill is-live";
    connectionNote.textContent =
      "Після входу адмінка читає і записує статуси в Firestore. Ці зміни побачать усі відвідувачі сайту.";
    return;
  }

  firebaseState.textContent = "Немає конфігу";
  firebaseState.className = "status-pill is-offline";
  connectionNote.textContent =
    "Заповни `firebase-config.js`, щоб сторінки сайту та адмінка почали працювати з Firestore.";
}

function populateCategoryFilter() {
  const categories = [...new Set(state.products.map((product) => product.category))].sort((a, b) =>
    a.localeCompare(b, "uk")
  );

  categoryFilter.innerHTML = '<option value="">Усі категорії</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function getEffectiveStatus(product) {
  return state.overrides.get(createProductKey(product)) || normalizeAvailability(product.baseAvailability);
}

function getFilteredProducts() {
  const query = String(searchInput.value || "").trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedAvailability = availabilityFilter.value;

  return state.products.filter((product) => {
    const status = getEffectiveStatus(product);
    const matchesQuery =
      !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesAvailability = !selectedAvailability || status === selectedAvailability;

    return matchesQuery && matchesCategory && matchesAvailability;
  });
}

function createStatusChip(label, className = "") {
  const chip = document.createElement("span");
  chip.className = `admin-chip ${className}`.trim();
  chip.textContent = label;
  return chip;
}

function renderProducts() {
  const products = getFilteredProducts();

  productsList.innerHTML = "";

  if (!products.length) {
    const empty = document.createElement("div");
    empty.className = "admin-empty";
    empty.textContent = "Нічого не знайдено за поточним фільтром.";
    productsList.appendChild(empty);
    setMessage(productsMessage, `Позицій: 0`);
    return;
  }

  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    const currentStatus = getEffectiveStatus(product);
    const isSaving = state.savingKeys.has(product.productKey);

    const card = document.createElement("article");
    card.className = "admin-product";

    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = product.name;

    const meta = document.createElement("div");
    meta.className = "admin-product-meta";
    meta.appendChild(createStatusChip(product.category));
    meta.appendChild(
      createStatusChip(
        `База: ${normalizeAvailability(product.baseAvailability)}`,
        normalizeAvailability(product.baseAvailability) === AVAILABLE_LABEL ? "is-current" : "is-out"
      )
    );
    meta.appendChild(
      createStatusChip(
        `Поточний: ${currentStatus}`,
        currentStatus === AVAILABLE_LABEL ? "is-current" : "is-out"
      )
    );

    copy.appendChild(title);
    copy.appendChild(meta);

    const controls = document.createElement("div");
    const select = document.createElement("select");
    select.className = "availability-toggle";
    select.disabled = !state.user || !isStockFirebaseReady() || isSaving;
    select.dataset.productKey = product.productKey;

    [AVAILABLE_LABEL, UNAVAILABLE_LABEL].forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = status === currentStatus;
      select.appendChild(option);
    });

    select.addEventListener("change", async (event) => {
      const nextStatus = event.target.value;
      state.savingKeys.add(product.productKey);
      renderProducts();
      setMessage(productsMessage, `Зберігаю: ${product.name}`);

      try {
        const savedStatus = await saveProductAvailability(product, nextStatus);
        state.overrides.set(product.productKey, savedStatus);
        setMessage(productsMessage, `Оновлено: ${product.name}`, "success");
      } catch (error) {
        event.target.value = currentStatus;
        setMessage(
          productsMessage,
          `Не вдалося зберегти "${product.name}": ${error.message}`,
          "error"
        );
      } finally {
        state.savingKeys.delete(product.productKey);
        renderProducts();
      }
    });

    controls.appendChild(select);
    card.appendChild(copy);
    card.appendChild(controls);
    fragment.appendChild(card);
  });

  productsList.appendChild(fragment);
  setMessage(productsMessage, `Позицій: ${products.length}`);
}

async function refreshOverrides() {
  if (!isStockFirebaseReady()) {
    state.overrides = new Map();
    renderProducts();
    return;
  }

  try {
    state.overrides = await fetchStockOverrides();
    renderProducts();
  } catch (error) {
    setMessage(productsMessage, `Не вдалося прочитати Firestore: ${error.message}`, "error");
  }
}

function updateSessionUi() {
  const loggedIn = Boolean(state.user);

  loginForm.hidden = loggedIn;
  sessionPanel.hidden = !loggedIn;
  authState.textContent = loggedIn ? "Авторизовано" : "Не авторизовано";
  authState.className = `status-pill ${loggedIn ? "is-live" : "is-muted"}`;

  if (loggedIn) {
    sessionEmail.textContent = `Увійшов як ${state.user.email || "користувач"}`;
  }

  renderProducts();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isStockFirebaseReady()) {
    setMessage(authMessage, "Спершу заповни `firebase-config.js`.", "error");
    return;
  }

  loginButton.disabled = true;
  setMessage(authMessage, "Виконую вхід…");

  try {
    await loginStockAdmin(emailInput.value.trim(), passwordInput.value);
    passwordInput.value = "";
    setMessage(authMessage, "Вхід успішний.", "success");
  } catch (error) {
    setMessage(authMessage, `Помилка входу: ${error.message}`, "error");
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  setMessage(authMessage, "Вихід…");

  try {
    await logoutStockAdmin();
    setMessage(authMessage, "Сесію завершено.");
  } catch (error) {
    setMessage(authMessage, `Не вдалося вийти: ${error.message}`, "error");
  } finally {
    logoutButton.disabled = false;
  }
});

[searchInput, categoryFilter, availabilityFilter].forEach((element) => {
  element.addEventListener("input", renderProducts);
  element.addEventListener("change", renderProducts);
});

setFirebaseConnectionState();
populateCategoryFilter();
renderProducts();

subscribeToAuthState(async (user) => {
  state.user = user;
  updateSessionUi();

  if (user) {
    await refreshOverrides();
  }
});

if (isStockFirebaseReady()) {
  refreshOverrides();
}
