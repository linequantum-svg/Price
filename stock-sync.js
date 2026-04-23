import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore-lite.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import {
  firebaseStockConfig,
  firebaseStockCollection,
  isFirebaseStockConfigured
} from "./firebase-config.js";

export const AVAILABLE_LABEL = "В наявності";
export const UNAVAILABLE_LABEL = "Немає в наявності";

const PRODUCT_COLLECTION_NAMES = [
  "priceData",
  "olevsProducts",
  "markersProducts",
  "complectsProducts",
  "smartwatchesProducts",
  "kidsSmartwatchesProducts",
  "wirelessHeadphonesProducts",
  "overEarHeadphonesProducts",
  "casesProducts",
  "phoneCasesProducts",
  "lightingProducts",
  "adaptersProducts",
  "powerbanksProducts",
  "skmeiProducts",
  "strapsProducts",
  "miceProducts"
];

let firebaseAppInstance = null;

function getFirebaseAppInstance() {
  if (!isFirebaseStockConfigured()) {
    return null;
  }

  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }

  firebaseAppInstance = getApps().length ? getApp() : initializeApp(firebaseStockConfig);
  return firebaseAppInstance;
}

function getFirestoreInstance() {
  const app = getFirebaseAppInstance();
  return app ? getFirestore(app) : null;
}

export function normalizeAvailability(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized.includes("немає")) {
    return UNAVAILABLE_LABEL;
  }

  if (normalized.includes("наяв")) {
    return AVAILABLE_LABEL;
  }

  return UNAVAILABLE_LABEL;
}

function slugifySegment(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function createProductKey(product) {
  return `${slugifySegment(product.category)}__${slugifySegment(product.name)}`;
}

export function getKnownProductCollections(scope = globalThis) {
  return PRODUCT_COLLECTION_NAMES
    .map((name) => scope[name])
    .filter((collection) => Array.isArray(collection));
}

export function getKnownProducts(scope = globalThis) {
  const seen = new Map();

  getKnownProductCollections(scope).forEach((collection) => {
    collection.forEach((product) => {
      if (!product || !product.name || !product.category) {
        return;
      }

      const productKey = createProductKey(product);

      if (!seen.has(productKey)) {
        seen.set(productKey, {
          ...product,
          productKey,
          baseAvailability: normalizeAvailability(product.availability)
        });
      }
    });
  });

  return [...seen.values()];
}

export async function fetchStockOverrides() {
  const db = getFirestoreInstance();

  if (!db) {
    return new Map();
  }

  const snapshot = await getDocs(collection(db, firebaseStockCollection));
  const overrides = new Map();

  snapshot.forEach((entry) => {
    const data = entry.data() || {};
    const status =
      typeof data.available === "boolean"
        ? (data.available ? AVAILABLE_LABEL : UNAVAILABLE_LABEL)
        : normalizeAvailability(data.status);

    overrides.set(entry.id, status);
  });

  return overrides;
}

export function applyStockOverridesToCollections(collections, overrides) {
  collections.forEach((collection) => {
    collection.forEach((product) => {
      const productKey = createProductKey(product);

      if (overrides.has(productKey)) {
        product.availability = overrides.get(productKey);
      }
    });
  });
}

export async function syncKnownProductCollections(scope = globalThis) {
  if (!isFirebaseStockConfigured()) {
    return {
      connected: false,
      overrides: new Map()
    };
  }

  const overrides = await fetchStockOverrides();
  applyStockOverridesToCollections(getKnownProductCollections(scope), overrides);

  return {
    connected: true,
    overrides
  };
}

export function getStockAdminAuth() {
  const app = getFirebaseAppInstance();
  return app ? getAuth(app) : null;
}

export function subscribeToAuthState(callback) {
  const auth = getStockAdminAuth();

  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function loginStockAdmin(email, password) {
  const auth = getStockAdminAuth();

  if (!auth) {
    throw new Error("Firebase config is missing.");
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutStockAdmin() {
  const auth = getStockAdminAuth();

  if (!auth) {
    return;
  }

  await signOut(auth);
}

export async function saveProductAvailability(product, nextStatus) {
  const db = getFirestoreInstance();

  if (!db) {
    throw new Error("Firebase config is missing.");
  }

  const normalizedStatus = normalizeAvailability(nextStatus);
  const productKey = createProductKey(product);

  await setDoc(
    doc(db, firebaseStockCollection, productKey),
    {
      key: productKey,
      name: product.name,
      category: product.category,
      status: normalizedStatus,
      available: normalizedStatus === AVAILABLE_LABEL,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  return normalizedStatus;
}

export function isStockFirebaseReady() {
  return isFirebaseStockConfigured();
}
