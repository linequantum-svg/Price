export const firebaseStockConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};

export const firebaseStockCollection = "stockStatuses";

export function isFirebaseStockConfigured() {
  return Boolean(
    firebaseStockConfig.apiKey &&
      firebaseStockConfig.authDomain &&
      firebaseStockConfig.projectId &&
      firebaseStockConfig.appId
  );
}
