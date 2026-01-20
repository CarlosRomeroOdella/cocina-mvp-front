import { useParams, useNavigate, useOutletContext } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useOutletContext();

  const product = products.find(
  p => p.id === Number(id) && p.available
);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Platillo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:underline"
          >
            ← Volver
          </button>

          <h1 className="text-xl font-semibold text-gray-800">
            {product.name}
          </h1>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Imagen */}
        <div className="h-64 bg-gray-100 rounded-2xl mb-6 flex items-center justify-center text-gray-400">
          Imagen del platillo
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {product.name}
          </h2>

          <p className="text-gray-500 mb-4">
            Descripción breve del platillo.  
            (esto luego viene del backend)
          </p>

          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            Disponible
          </span>
        </div>
      </main>
    </div>
  );
}
