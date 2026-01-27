import api from "./api";

export async function login({ email, password }) {
  try {
    const payload = {
      correo: email,
      contrasena: password,
    };

    const res = await api.post("/auth/login", payload);
    return res.data;
  } catch (err) {
    if (err.response && err.response.data) {
      throw err.response.data;
    }
    throw new Error("Network error");
  }
}
