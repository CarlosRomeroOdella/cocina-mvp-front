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

export async function loginMicrosoft({ idToken }) {
  const res = await api.post("/auth/login-microsoft", { id_token: idToken });
  return res.data;
}

export async function loginTeams({ teamsToken }) {
  const res = await api.post("/auth/login-teams", { teams_token: teamsToken });
  return res.data;
}

export async function logout() {
  if (USE_MOCK) return;

  try {
    await api.post("/auth/logout");
  } catch {}
}