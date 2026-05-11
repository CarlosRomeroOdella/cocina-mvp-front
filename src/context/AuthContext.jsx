/**
 * context/AuthContext.jsx — Estado global de autenticación
 *
 * Provee a toda la app el usuario logueado (o null) y las funciones login/logout.
 * Se usa con: const { user, loading, login, logout } = useContext(AuthContext)
 *
 * El usuario se guarda en localStorage (clave "app_user") para que al recargar
 * la página, la sesión persista sin tener que loguearse de nuevo.
 *
 * Estructura de "user" en localStorage:
 * {
 *   token: "eyJhbGci...",    ← JWT para autenticar las peticiones a la API
 *   id: 1,
 *   correo: "admin@demo.com",
 *   nombre: "Admin",
 *   rol: "admin" | "cliente"
 * }
 */
import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras se verifica localStorage al arrancar

  // Al montar, intenta recuperar la sesión guardada en localStorage
  useEffect(() => {
    const raw = localStorage.getItem("app_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        // También setea el header de axios para que las llamadas de api.js incluyan el token
        if (parsed.token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
        }
      } catch {
        // Si el JSON está corrupto, limpia y arranca sin sesión
        localStorage.removeItem("app_user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Guarda la sesión después de un login exitoso.
   * @param {Object} userData - Objeto user ya normalizado (con token incluido)
   */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("app_user", JSON.stringify(userData));
    if (userData.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    }
  };

  /** Borra la sesión local. El backend no invalida el token (stateless). */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("app_user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
