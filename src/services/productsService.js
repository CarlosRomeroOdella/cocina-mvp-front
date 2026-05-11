/**
 * services/productsService.js — Comunicación con la API de productos, ingredientes y extras
 *
 * Si VITE_USE_MOCK=true en el .env, usa datos locales de /data/*.js en lugar de la API real.
 * Esto sirve para desarrollar el frontend sin necesitar el backend corriendo.
 *
 * En producción (VITE_USE_MOCK=false o no definido), todas las funciones llaman a la API real.
 */
import { apiFetch } from "./apiFetch";
import { PLATILLOS } from "../data/platillos";
import { INGREDIENTES } from "../data/ingredientes";
import { EXTRAS } from "../data/extras";
import { RELACIONES_PLATILLO_INGREDIENTE } from "../data/relaciones";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms)); // Simula latencia de red en mock

// ── Platillos ──────────────────────────────────────────────────────────────────

/** Lista todos los platillos con sus ingredientes y extras */
export async function getProducts() {
  if (USE_MOCK) { await delay(); return PLATILLOS; }
  return apiFetch("/productos");
}

/** Crea un platillo nuevo */
export async function createProduct(data) {
  if (USE_MOCK) { await delay(); return { ...data, id: Date.now() }; }
  return apiFetch("/productos", { method: "POST", body: JSON.stringify(data) });
}

/** Actualiza un platillo existente por su ID */
export async function updateProduct(id, data) {
  if (USE_MOCK) { await delay(); return { ...data, id }; }
  return apiFetch(`/productos/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

/** Elimina un platillo por su ID */
export async function deleteProduct(id) {
  if (USE_MOCK) { await delay(); return { id }; }
  return apiFetch(`/productos/${id}`, { method: "DELETE" });
}

// ── Ingredientes ───────────────────────────────────────────────────────────────

/** Lista todos los ingredientes */
export async function getIngredientes() {
  if (USE_MOCK) { await delay(); return INGREDIENTES; }
  return apiFetch("/ingredientes");
}

/** Crea un ingrediente nuevo */
export async function createIngrediente(data) {
  if (USE_MOCK) { await delay(); return { ...data, id: Date.now() }; }
  return apiFetch("/ingredientes", { method: "POST", body: JSON.stringify(data) });
}

/** Actualiza parcialmente un ingrediente (nombre y/o disponible) */
export async function updateIngrediente(id, data) {
  if (USE_MOCK) { await delay(); return { ...data, id }; }
  return apiFetch(`/ingredientes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

/** Elimina un ingrediente y sus relaciones con platillos */
export async function deleteIngrediente(id) {
  if (USE_MOCK) { await delay(); return { id }; }
  return apiFetch(`/ingredientes/${id}`, { method: "DELETE" });
}

// ── Extras ─────────────────────────────────────────────────────────────────────

/** Lista todos los extras (bebidas, postres, etc.) */
export async function getExtras() {
  if (USE_MOCK) { await delay(); return EXTRAS; }
  return apiFetch("/extras");
}

/** Crea un extra nuevo */
export async function createExtra(data) {
  if (USE_MOCK) { await delay(); return { ...data, id: Date.now() }; }
  return apiFetch("/extras", { method: "POST", body: JSON.stringify(data) });
}

/** Actualiza un extra existente */
export async function updateExtra(id, data) {
  if (USE_MOCK) { await delay(); return { ...data, id }; }
  return apiFetch(`/extras/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

/** Elimina un extra y sus relaciones con platillos */
export async function deleteExtra(id) {
  if (USE_MOCK) { await delay(); return { id }; }
  return apiFetch(`/extras/${id}`, { method: "DELETE" });
}

// ── Relaciones platillo-ingrediente ───────────────────────────────────────────

/**
 * Lista todas las relaciones entre platillos e ingredientes.
 * Usado para construir la vista del menú (saber qué ingredientes tiene cada platillo).
 */
export async function getRelaciones() {
  if (USE_MOCK) { await delay(); return RELACIONES_PLATILLO_INGREDIENTE; }
  return apiFetch("/relaciones");
}
