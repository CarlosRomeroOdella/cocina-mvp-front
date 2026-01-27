import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, role, token? }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("app_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        if (parsed.token) api.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
      } catch {
        localStorage.removeItem("app_user");
      }
    }
    setLoading(false);
  }, []);

  const loginContext = (userData) => {
    setUser(userData);
    localStorage.setItem("app_user", JSON.stringify(userData));
    if (userData.token) api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("app_user");
    delete api.defaults.headers.common["Authorization"];
  };

  const hasRole = (roles = []) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginContext, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}