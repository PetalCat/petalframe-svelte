import { push, pop, replace } from "svelte-spa-router";
import { getMediaFromCache, saveMediaToCache } from "./store.js";

let API_BASE = localStorage.getItem("api_base") || "http://localhost:8000";

// Removed duplicate declaration of blobUrlCache
const MAX_BLOB_URLS = 50;

function manageBlobUrlCache(filename, blob) {
  // If already in cache, move to the end (most recently used)
  if (blobUrlCache.has(filename)) {
    const existing = blobUrlCache.get(filename);
    blobUrlCache.delete(filename);
    URL.revokeObjectURL(existing);
  }
  const url = URL.createObjectURL(blob);
  blobUrlCache.set(filename, url);

  // Evict oldest if over limit
  while (blobUrlCache.size > MAX_BLOB_URLS) {
    const [oldestKey, oldestUrl] = blobUrlCache.entries().next().value;
    URL.revokeObjectURL(oldestUrl);
    blobUrlCache.delete(oldestKey);
  }

  return url;
}

export function setApiBase(base) {
  API_BASE = base;
  localStorage.setItem("api_base", base);
}

export function getApiBase() {
  return API_BASE;
}

export async function login(username, password) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  if (!res.ok) throw new Error("Login failed");
  return await res.json();
}

export async function register(username, password) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  if (!res.ok) throw new Error("Registration failed");
  return await res.json();
}

export async function getMe() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch user: ${res.status} ${msg}`);
  }

  return await res.json();
}

export async function fetchAvatarBlob(filename) {
  const res = await fetch(`${API_BASE}/avatar/${filename}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function fetchGalleryBG() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/feed?limit=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch feed: ${res.status} ${msg}`);
  }
  const items = await res.json();
  if (!items.length) throw new Error("Feed is empty");

  const filename = items[0].filename;

  const mediaRes = await fetch(`${API_BASE}/media/${filename}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!mediaRes.ok) {
    const msg = await mediaRes.text();
    throw new Error(`Failed to fetch media: ${mediaRes.status} ${msg}`);
  }

  const blob = await mediaRes.blob();
  return URL.createObjectURL(blob);
}

export async function fetchAlbums() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/albums`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch albums: ${res.status} ${msg}`);
  }
  return await res.json();
}

// 🔒 In-memory blob URL cache to avoid memory leaks
const blobUrlCache = new Map();

/**
 * Fetch media, using localForage for persistent cache
 * and in-memory blob URL reuse.
 */
export async function fetchMedia(filename) {
  try {
    const cached = await getMediaFromCache(filename);
    if (cached && cached.size > 0) {
      if (blobUrlCache.has(filename)) {
        return blobUrlCache.get(filename);
      }
      return manageBlobUrlCache(filename, cached);
    }
  } catch (err) {
    console.warn("Cache read error:", filename, err);
  }

  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/media/${filename}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Fetch failed: ${res.status} ${msg}`);
  }

  const blob = await res.blob();
  if (blob.size === 0) throw new Error("Empty blob");

  await saveMediaToCache(filename, blob);
  return manageBlobUrlCache(filename, blob);
}

/**
 * Optional cleanup: revoke all object URLs when needed
 */
export function revokeAllBlobUrls() {
  for (const url of blobUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  blobUrlCache.clear();
}
