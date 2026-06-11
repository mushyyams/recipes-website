const STORAGE_KEY = "recipe-site-user-ratings";

type RatingMap = Record<string, number>;

function readMap(): RatingMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as RatingMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: RatingMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function ratingTargetKey(
  targetType: "original" | "fork",
  id: string
): string {
  return `${targetType}:${id}`;
}

export function getStoredUserRating(key: string): number | undefined {
  const value = readMap()[key];
  return typeof value === "number" && value >= 1 && value <= 5 ? value : undefined;
}

export function setStoredUserRating(key: string, rating: number) {
  const map = readMap();
  map[key] = rating;
  writeMap(map);
}

export function clearStoredUserRating(key: string) {
  const map = readMap();
  delete map[key];
  writeMap(map);
}
