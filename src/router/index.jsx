import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../pages/Layout";
import Login from "../pages/Login";
import ClientMenu from "../pages/ClientMenu";
import AdminDashboard from "../pages/AdminDashboard";
import Unauthorized from "../pages/Unauthorized";
import PrivateRoute from "../components/PrivateRoute";

export const router = createBrowserRouter([
  // 🌐 Público
  {
    path: "/login",
    element: <Login />,
  },

  // 🔐 App protegida
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "admin",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "menu",
        element: (
          <PrivateRoute allowedRoles={["admin", "client"]}>
            <ClientMenu />
          </PrivateRoute>
        ),
      },
    ],
  },

  // 🚫 No autorizado
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },

  // ❌ Fallback
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
