import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [products, setProducts] = useState([
    { id: 1, name: "Sandwich", available: true },
    { id: 2, name: "Sincronizada", available: true },
    { id: 3, name: "Torta", available: false },
    { id: 4, name: "Cuernito", available: true },
    { id: 5, name: "Pan Pita", available: false },
    { id: 6, name: "Café Americano", available: true },
    { id: 7, name: "Licuado", available: true },
    { id: 8, name: "Quesadilla", available: false },
    { id: 9, name: "Burritos", available: true },
    { id: 10, name: "Huevo", available: true },
  ]);

  return <Outlet context={{ products, setProducts }} />;
}
