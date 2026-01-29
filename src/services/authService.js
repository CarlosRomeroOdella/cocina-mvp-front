import api from "./api";
import { mockLogin } from "../mocks/auth.mock";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function login({ email, password }) {
  if (USE_MOCK) {
    return mockLogin({ email, password });
  }

  // 🔌 BACK REAL (cuando esté estable)
  const payload = { correo: email, contrasena: password };
  const res = await api.post("/auth/login", payload);
  return res.data;
}
