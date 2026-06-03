/**
 * services/pedidosService.js — Comunicación con la API de pedidos
 *
 * Cubre todas las operaciones relacionadas con pedidos y configuración de cocina.
 * Todas las funciones devuelven Promises — úsalas con await.
 */
import { apiFetch } from "./apiFetch";

/**
 * Crea un nuevo pedido.
 * @param {Object} data - { items: [...], total: number, nota?: string }
 */
export async function crearPedido(data) {
  return apiFetch("/pedidos", { method: "POST", body: JSON.stringify(data) });
}

/**
 * Lista pedidos del servidor.
 * @param {string} [statusFilter] - Filtrar por status (ej: "en_espera,en_preparacion")
 */
export async function getPedidos(statusFilter) {
  const qs = statusFilter ? `?status=${statusFilter}` : "";
  return apiFetch(`/pedidos${qs}`);
}

/** Obtiene un pedido por su ID */
export async function getPedido(id) {
  return apiFetch(`/pedidos/${id}`);
}

/** Obtiene los últimos pedidos del cliente autenticado */
export async function getMisPedidos() {
  return apiFetch("/pedidos/mios");
}

/**
 * Cambia el status de un pedido (admin).
 * @param {number} id
 * @param {string} status - "en_espera" | "en_preparacion" | "listo" | "cancelado"
 */
export async function actualizarStatusPedido(id, status) {
  return apiFetch(`/pedidos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

/**
 * Marca o desmarca un pedido como pagado (admin).
 * @param {number} id
 * @param {boolean} pagado
 */
export async function marcarPagado(id, pagado) {
  return apiFetch(`/pedidos/${id}/pagado`, { method: "PATCH", body: JSON.stringify({ pagado }) });
}

/**
 * Cliente re-envía su pedido en_revision con ítems modificados.
 * El servidor recalcula el total y devuelve el pedido a en_espera.
 * @param {number} id
 * @param {Array} items - mismos ítems que en crearPedido
 */
export async function reenviarPedido(id, items) {
  return apiFetch(`/pedidos/${id}/reenviar`, { method: "PATCH", body: JSON.stringify({ items }) });
}

/**
 * Cliente (o admin) cancela un pedido que está en_revision.
 * @param {number} id
 */
export async function cancelarPedido(id) {
  return apiFetch(`/pedidos/${id}/cancelar`, { method: "PATCH", body: JSON.stringify({}) });
}

/**
 * Actualiza la nota de un pedido (admin).
 * @param {number} id
 * @param {string|null} nota
 */
export async function actualizarNota(id, nota) {
  return apiFetch(`/pedidos/${id}/nota`, { method: "PATCH", body: JSON.stringify({ nota }) });
}

/**
 * Elimina un ítem de un pedido en_espera (admin).
 * @param {number} pedidoId
 * @param {number} itemId
 */
export async function eliminarItemPedido(pedidoId, itemId) {
  return apiFetch(`/pedidos/${pedidoId}/items/${itemId}`, { method: "DELETE" });
}

/** Obtiene las estadísticas del dashboard de reportes (admin) */
export async function getResumen() {
  return apiFetch("/pedidos/resumen");
}

/** Lee si la cocina está abierta o cerrada */
export async function getCocinaEstado() {
  return apiFetch("/configuracion/cocina");
}

/**
 * Abre o cierra la cocina (admin).
 * @param {boolean} abierta
 */
export async function setCocinaEstado(abierta) {
  return apiFetch("/configuracion/cocina", { method: "PATCH", body: JSON.stringify({ abierta }) });
}

export async function getYoutubeUrl() {
  return apiFetch(`/configuracion/youtube?_=${Date.now()}`);
}

export async function setYoutubeUrl(url) {
  return apiFetch("/configuracion/youtube", { method: "PATCH", body: JSON.stringify({ url }) });
}
