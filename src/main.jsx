import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { ProductsProvider } from "./context/ProductsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { msalInstance, msalRedirectPromise } from "./lib/msalConfig";
import "./index.css";

msalRedirectPromise.then(() => {
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
