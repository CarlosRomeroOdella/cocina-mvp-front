import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function ProductForm() {
  const { products, setProducts } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const editing = Boolean(id);
  const [name, setName] = useState("");

  useEffect(() => {
    if (editing) {
      const product = products.find(p => p.id === Number(id));
      if (product) setName(product.name);
    }
  }, [editing, id, products]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (editing) {
      setProducts(products.map(p =>
        p.id === Number(id) ? { ...p, name } : p
      ));
    } else {
      setProducts([
        ...products,
        { id: Date.now(), name, available: true },
      ]);
    }

    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6 flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">
              {editing ? "Editar platillo" : "Nuevo platillo"}
            </h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del platillo"
              className="w-full border rounded px-3 py-2 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-gray-600"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
