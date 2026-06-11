const STORAGE_KEY = "recipe-site-rater-key";

export function getOrCreateRaterKey(): string {
  if (typeof window === "undefined") return "";

  let key = localStorage.getItem(STORAGE_KEY);
  if (!key) {
    key =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `rater_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}
