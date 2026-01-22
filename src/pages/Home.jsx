import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProductsContext } from "../context/ProductsContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProductToggleCard from "../components/ProductToggleCard";

export default function Home() {
  const { products, setProducts } = useContext(ProductsContext);
  const navigate = useNavigate();

  const toggleAvailability = (id, checked) => {
    setProducts(
      products.map(p =>
        p.id === id ? { ...p, available: checked } : p
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Dashboard Admin</h2>

            <button
              onClick={() => navigate("/productos/nuevo")}
              className="bg-[#041E42] text-white px-4 py-2 rounded-lg"
            >
              + Agregar platillo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(product => (
              <ProductToggleCard
                key={product.id}
                name={product.name}
                available={product.available}
                onToggle={(checked) =>
                  toggleAvailability(product.id, checked)
                }
                onEdit={() =>
                  navigate(`/productos/${product.id}/editar`)
                }
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
