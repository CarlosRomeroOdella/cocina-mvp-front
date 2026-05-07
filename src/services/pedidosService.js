import { apiFetch } from "./apiFetch";

export async function crearPedido(data) {
  return apiFetch("/pedidos", { method: "POST", body: JSON.stringify(data) });
}

export async function getPedidos(statusFilter) {
  const qs = statusFilter ? `?status=${statusFilter}` : "";
  return apiFetch(`/pedidos${qs}`);
}

export async function getPedido(id) {
  return apiFetch(`/pedidos/${id}`);
}

export async function actualizarStatusPedido(id, status) {
  return apiFetch(`/pedidos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function marcarPagado(id, pagado) {
  return apiFetch(`/pedidos/${id}/pagado`, { method: "PATCH", body: JSON.stringify({ pagado }) });
}

export async function getResumen() {
  return apiFetch("/pedidos/resumen");
}

export async function getCocinaEstado() {
  return apiFetch("/configuracion/cocina");
}

export async function setCocinaEstado(abierta) {
  return apiFetch("/configuracion/cocina", { method: "PATCH", body: JSON.stringify({ abierta }) });
}
