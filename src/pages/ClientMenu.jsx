import { useOutletContext, useNavigate } from "react-router-dom";

export default function ClientMenu() {
  const { products } = useOutletContext();
  const navigate = useNavigate();

  // 🔒 FILTRO ÚNICO Y OBLIGATORIO
  const availableProducts = products.filter(p => p.available === true);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Menú
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map(product => (
            <div
              key={product.id}
              onClick={() => navigate(`/menu/${product.id}`)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition cursor-pointer"
            >
              <div className="h-36 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400">
                Imagen
              </div>

              <h3 className="text-lg font-medium text-gray-800">
                {product.name}
              </h3>
            </div>
          ))}
        </div>

        {/* 🧪 DEBUG TEMPORAL (opcional, bórralo luego) */}
        {/* <pre>{JSON.stringify(products, null, 2)}</pre> */}
      </main>
    </div>
  );
}
