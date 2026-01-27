import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Home from "./pages/Home";
import ClientMenu from "./pages/ClientMenu";
import Unauthorized from "./pages/Unauthorized";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Home />
              </PrivateRoute>
            }
          />

          <Route
            path="/clientmenu"
            element={
              <PrivateRoute allowedRoles={["client", "admin"]}>
                <ClientMenu />
              </PrivateRoute>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
