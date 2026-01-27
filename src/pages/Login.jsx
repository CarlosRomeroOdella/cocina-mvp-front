import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login as loginRequest } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    try {
      const data = await loginRequest({
        correo: email,
        contrasena: password,
      });

      // Normalizamos payload
      const userPayload = data.usuario
        ? { ...data.usuario, token: data.access_token }
        : data;

      login(userPayload);

      if (userPayload.rol === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/menu", { replace: true });
      }
    } catch (error) {
      setErr("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded shadow w-80"
      >
        <h2 className="mb-4 text-lg font-bold">Iniciar sesión</h2>

        {err && <div className="text-red-600 mb-2">{err}</div>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-2 w-full"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
