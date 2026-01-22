import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../pages/Layout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ClientMenu from "../pages/ClientMenu";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "admin",
        element: <Home />,
      },
      {
        path: "menu",
        element: <ClientMenu />,
      },
    ],
  },
]);
