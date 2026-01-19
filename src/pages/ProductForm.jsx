import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProductToggleCard from "../components/ProductToggleCard";

export default function Home() {
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

  const addProduct = () => {
    const name = prompt("Nombre del platillo");
    if (!name) return;

    setProducts([...products, {
      id: Date.now(),
      name,
      available: true,
    }]);
  };

  const toggleAvailability = (id) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, available: !p.available } : p
    ));
  };

  const editProduct = (id) => {
    const newName = prompt("Nuevo nombre del platillo");
    if (!newName) return;

    setProducts(products.map(p =>
      p.id === id ? { ...p, name: newName } : p
    ));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Dashboard Admin</h2>

            <button
              onClick={addProduct}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              + Agregar platillo
            </button>
          </div>

          {/* LISTADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(product => (
              <ProductToggleCard
                key={product.id}
                name={product.name}
                available={product.available}
                onToggle={() => toggleAvailability(product.id)}
                onEdit={() => editProduct(product.id)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
