import { push, pop, replace } from "svelte-spa-router";
let API_BASE = localStorage.getItem("api_base") || "http://localhost:8000";

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
  const result = await res.json();

  return result;
}
export async function fetchAvatarBlob(filename) {
  const res = await fetch(`http://localhost:8000/avatar/${filename}`, {
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

  // Get most recent media item
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

  // Fetch the full media file
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
  return URL.createObjectURL(blob); // usable as <img src=...> or <video src=...>
}

// fetchAlbums
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

// fetchmedia
export async function fetchMedia(filename) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_BASE}/media/${filename}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch media: ${res.status} ${msg}`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob); // usable as <img src=...> or <video src=...>
}
