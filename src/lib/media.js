// media.js
import { getApiBase } from "./api.js";

export const getMedia = async (scope = "global", user = null, album = null) => {
  const API_BASE = getApiBase();
  console.log("[getMedia] Called with:", { scope, user, album });

  let endpoint = "";
  if (scope === "global") {
    endpoint = `${API_BASE}/gallery`;
  } else if (scope === "user") {
    if (!user) throw new Error("Missing 'user' for user scope");
    endpoint = `${API_BASE}/gallery/user/${encodeURIComponent(user)}`;
  } else if (scope === "album") {
    if (!album) throw new Error("Missing 'album' for album scope");
    endpoint = `${API_BASE}/album/${encodeURIComponent(album)}/media`;
  } else {
    throw new Error("Unknown media scope: " + scope);
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Missing auth token");

    console.log("[getMedia] Fetching from:", endpoint);
    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[getMedia] Response status:", res.status);
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to fetch media list: ${res.status} ${msg}`);
    }

    const raw = await res.json();
    console.log("[getMedia] Group keys:", Object.keys(raw));
    return raw;
  } catch (err) {
    console.error("[getMedia] FINAL ERROR:", err);
    return {};
  }
};
