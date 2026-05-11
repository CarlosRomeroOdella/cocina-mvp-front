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
