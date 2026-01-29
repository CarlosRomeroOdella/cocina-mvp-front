import { apiFetch } from "./apiFetch";

// GET productos
export function getProducts() {
  return apiFetch("/productos");
}

// POST crear producto
export function createProduct(data) {
  return apiFetch("/productos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT actualizar producto
export function updateProduct(id, data) {
  return apiFetch(`/productos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
