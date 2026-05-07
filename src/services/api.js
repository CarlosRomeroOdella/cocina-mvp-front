import axios from "axios";

const _envUrl = import.meta.env.VITE_API_URL ?? "";
export const API_BASE_URL = _envUrl
  ? _envUrl.replace("localhost", window.location.hostname)
  : `http://${window.location.hostname}:3000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Agrega el token automáticamente en cada request
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("app_user");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Maneja errores globalmente
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("app_user");
      window.location.href = "/login";
    }
    const mensaje = error.response?.data?.detail || "Error en la petición";
    return Promise.reject(new Error(mensaje));
  }
);

export default api;