import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { ProductsProvider } from "./context/ProductsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { msalInstance } from "./lib/msalConfig";
import "./index.css";

msalInstance.initialize().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <ThemeProvider>
          <AuthProvider>
            <ProductsProvider>
              <RouterProvider router={router} />
            </ProductsProvider>
          </AuthProvider>
        </ThemeProvider>
      </MsalProvider>
    </React.StrictMode>
  );
});
