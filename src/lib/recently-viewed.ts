const STORAGE_KEY = "spa-recently-viewed";
const MAX_ITEMS = 10;

export function addRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;
  const ids = getRecentlyViewedIds();
  const filtered = ids.filter(id => id !== productId);
  filtered.unshift(productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
}

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
