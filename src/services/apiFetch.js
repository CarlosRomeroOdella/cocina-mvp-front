/**
 * services/apiFetch.js — Wrapper de fetch para todas las llamadas a la API
 *
 * Centraliza la lógica común de todas las peticiones HTTP:
 *   - Leer el token JWT del localStorage y agregarlo como Bearer token
 *   - Setear los headers Content-Type y Accept como JSON
 *   - Manejar errores HTTP (401 → redirige a login, otros → lanza excepción)
 *
 * Todos los servicios (productsService, pedidosService, etc.) usan esta función
 * en lugar de llamar fetch() directamente.
 *
 * Uso:
 *   const data = await apiFetch("/productos");
 *   const nuevo = await apiFetch("/productos", { method: "POST", body: JSON.stringify({...}) });
 */
import { API_BASE_URL } from "./api";

export async function apiFetch(endpoint, options = {}) {
  // Lee el token del localStorage donde AuthContext lo guardó al hacer login
  let token = null;
  try {
    const raw = localStorage.getItem("app_user");
    if (raw) token = JSON.parse(raw).token;
  } catch {}

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}), // Permite sobreescribir headers desde el llamador
  };

  // Agrega el token solo si existe (las rutas públicas no lo necesitan)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Token expirado o inválido → limpia sesión y redirige a login
    if (response.status === 401) {
      localStorage.removeItem("app_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    // Intenta leer el mensaje de error del backend (campo "detail")
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Error en la petición");
  }

  return response.json();
}
