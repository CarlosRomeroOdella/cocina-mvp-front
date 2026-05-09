import { apiFetch } from "./apiFetch";
import { PLATILLOS } from "../data/platillos";
import { INGREDIENTES } from "../data/ingredientes";
import { EXTRAS } from "../data/extras";
import { RELACIONES_PLATILLO_INGREDIENTE } from "../data/relaciones";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// ── Platillos ──
export async function getProducts() {
  if (USE_MOCK) { await delay(); return PLATILLOS; }
  return apiFetch("/productos");
}

export async function createProduct(data) {
  if (USE_MOCK) { await delay(); return { ...data, id: Date.now() }; }
  return apiFetch("/productos", { method: "POST", body: JSON.stringify(data) });
}

export async function updateProduct(id, data) {
  if (USE_MOCK) { await delay(); return { ...data, id }; }
  return apiFetch(`/productos/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteProduct(id) {
  if (USE_MOCK) { await delay(); return { id }; }
  return apiFetch(`/productos/${id}`, { method: "DELETE" });
}

// ── Ingredientes ──
export async function getIngredientes() {
  if (USE_MOCK) { await delay(); return INGREDIENTES; }
  return apiFetch("/ingredientes");
}

export async function createIngrediente(data) {
  if (USE_MOCK) { await delay(); return { ...data, id: Date.now() }; }
  return apiFetch("/ingredientes", { method: "POST", body: JSON.stringify(data) });
}

export async function updateIngrediente(id, data) {
  if (USE_MOCK) { await delay(); return { ...data, id }; }
  return apiFetch(`/ingredientes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteIngrediente(id) {
  if (USE_MOCK) { await delay(); return { id }; }
  return apiFetch(`/ingredientes/${id}`, { method: "DELETE" });
}

// ── Extras ──
export async function getExtras() {
  if (USE_MOCK) { await delay(); return EXTRAS; }
  return apiFetch("/extras");
}

export async function createExtra(data) {
  if (USE_MOCK) { await delay(); return { ...data, id: Date.now() }; }
  return apiFetch("/extras", { method: "POST", body: JSON.stringify(data) });
}

export async function updateExtra(id, data) {
  if (USE_MOCK) { await delay(); return { ...data, id }; }
  return apiFetch(`/extras/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteExtra(id) {
  if (USE_MOCK) { await delay(); return { id }; }
  return apiFetch(`/extras/${id}`, { method: "DELETE" });
}

// ── Relaciones platillo-ingrediente ──
export async function getRelaciones() {
  if (USE_MOCK) { await delay(); return RELACIONES_PLATILLO_INGREDIENTE; }
  return apiFetch("/relaciones");
}
