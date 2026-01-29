export async function mockLogin({ email, password }) {
  // simulamos latencia
  await new Promise((r) => setTimeout(r, 300));

  // credenciales fake
  if (email === "admin@demo.com" && password === "admin") {
    return {
      access_token: "mock-token-admin",
      usuario: {
        id: 1,
        correo: email,
        nombre: "Admin",
        rol: "admin",
        activo: 1,
      },
    };
  }

  if (email === "client@demo.com" && password === "client") {
    return {
      access_token: "mock-token-client",
      usuario: {
        id: 2,
        correo: email,
        nombre: "Cliente",
        rol: "cliente",
        activo: 1,
      },
    };
  }

  throw new Error("Credenciales incorrectas");
}
