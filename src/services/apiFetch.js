import { API_BASE_URL } from "./api";

export async function apiFetch(endpoint, options = {}) {
  // ✅ Lee desde app_user, igual que AuthContext
  let token = null;
  try {
    const raw = localStorage.getItem("app_user");
    if (raw) token = JSON.parse(raw).token;
  } catch {}

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("app_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Error en la petición");
  }

  return response.json();
}