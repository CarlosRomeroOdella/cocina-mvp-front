import { createBrowserRouter } from "react-router-dom";
import Layout from "../pages/Layout";
import Home from "../pages/Home";
import ProductForm from "../pages/ProductForm";
import ClientMenu from "../pages/ClientMenu";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/productos/nuevo",
        element: <ProductForm />,
      },
      {
        path: "/productos/:id/editar",
        element: <ProductForm />,
      },
      {
        path: "/menu",
        element: <ClientMenu />,
      },
    ],
  },
]);
