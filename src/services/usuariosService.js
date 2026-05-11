import { apiFetch } from "./apiFetch";

export async function getUsuarios() {
  return apiFetch("/usuarios");
}

export async function crearUsuario(data) {
  return apiFetch("/usuarios", { method: "POST", body: JSON.stringify(data) });
}

export async function actualizarUsuario(id, data) {
  return apiFetch(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function resetPassword(id, contrasena) {
  return apiFetch(`/usuarios/${id}/reset-password`, { method: "PATCH", body: JSON.stringify({ contrasena }) });
}

export async function eliminarUsuario(id) {
  return apiFetch(`/usuarios/${id}`, { method: "DELETE" });
}

export async function changeMyPassword(actual, nueva) {
  return apiFetch("/usuarios/me/password", { method: "PATCH", body: JSON.stringify({ actual, nueva }) });
}
