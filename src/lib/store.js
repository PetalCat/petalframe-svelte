//store.js
import localforage from "localforage";

// IndexedDB for full media blobs
const mediaCache = localforage.createInstance({
  name: "petal-frame",
  storeName: "media-cache",
});

/**
 * Get blob from cache (if available).
 * @param {string} key - filename
 * @returns {Promise<Blob|null>}
 */
export async function getMediaFromCache(key) {
  return await mediaCache.getItem(key);
}

/**
 * Save blob to cache after a successful fetch.
 * @param {string} key - filename
 * @param {Blob} blob
 * @returns {Promise<void>}
 */
export async function saveMediaToCache(key, blob) {
  await mediaCache.setItem(key, blob);
}

/**
 * Clear all cached media (optional admin/debug tool)
 */
export async function clearMediaCache() {
  await mediaCache.clear();
}
