import api from "./api";
import { mockLogin } from "../mocks/auth.mock";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function login({ email, password }) {
  if (USE_MOCK) {
    return mockLogin({ email, password });
  }

  const res = await api.post("/auth/login", {
    correo: email,
    contrasena: password,
  });
  return res.data;
}

// ✅ NUEVO: logout también puede llamar al backend si es necesario
export async function logout() {
  if (USE_MOCK) return;

  try {
    await api.post("/auth/logout");
  } catch {}
  // Aunque falle el backend, el AuthContext limpia la sesión local
}