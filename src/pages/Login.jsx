import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { AuthContext } from "../context/AuthContext";
import { login as loginRequest, loginMicrosoft } from "../services/authService";
import { loginRequest as msalLoginRequest } from "../lib/msalConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMs, setLoadingMs] = useState(false);

  const { login } = useContext(AuthContext);
  const { instance } = useMsal();
  const navigate = useNavigate();

  // Maneja el resultado cuando Microsoft redirige de vuelta a la app
  useEffect(() => {
    instance.handleRedirectPromise()
      .then(async (result) => {
        if (!result?.idToken) return;
        setLoadingMs(true);
        try {
          const data = await loginMicrosoft({ idToken: result.idToken });
          const normalizedUser = {
            id: data.usuario.id,
            correo: data.usuario.correo,
            nombre: data.usuario.nombre,
            role: data.usuario.rol === "cliente" ? "client" : data.usuario.rol,
            token: data.access_token,
          };
          login(normalizedUser);
          navigate(normalizedUser.role === "admin" ? "/admin" : "/menu", { replace: true });
        } catch (error) {
          setErr(error.message || "Error al iniciar sesión con Microsoft");
        } finally {
          setLoadingMs(false);
        }
      })
      .catch((error) => {
        if (error.errorCode !== "user_cancelled") {
          setErr(error.message || "Error con Microsoft");
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const data = await loginRequest({ email, password });
      const normalizedUser = {
        id: data.usuario.id,
        correo: data.usuario.correo,
        nombre: data.usuario.nombre,
        role: data.usuario.rol === "cliente" ? "client" : data.usuario.rol,
        token: data.access_token,
      };
      login(normalizedUser);
      navigate(normalizedUser.role === "admin" ? "/admin" : "/menu", { replace: true });
    } catch (error) {
      setErr(error.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = () => {
    setErr(null);
    instance.loginRedirect(msalLoginRequest);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-bg">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-200 mb-4">
            C
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cocina Odellā</h1>
          <p className="text-sm text-gray-400 mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-orange-100 p-8 shadow-xl shadow-orange-50">

          {err && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
              {err}
            </div>
          )}

          {/* Botón Microsoft */}
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loadingMs || loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 font-semibold py-2.5 rounded-xl transition-all mb-4"
          >
            {loadingMs ? (
              <span className="text-sm">Conectando...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
                <span className="text-sm">Entrar con Microsoft</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 font-medium">o</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Correo
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || loadingMs}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-orange-200 mt-2"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
