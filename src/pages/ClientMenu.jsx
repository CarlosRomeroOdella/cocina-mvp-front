import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


/* ================= CLIENT MENU ================= */

export default function ClientMenu() {
  /* ================= MOCK DATA ================= */
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();


  const platillos = [
    { id: 1, nombre: "Sandwich", disponible: true },
    { id: 2, nombre: "Pan pita", disponible: true },
  ];

  const ingredientes = [
    { id: 1, nombre: "Pan sandwich", disponible: true },
    { id: 2, nombre: "Jamón", disponible: true },
    { id: 3, nombre: "Queso", disponible: true },
    { id: 4, nombre: "Pan pita", disponible: true },
  ];

  const relaciones = [
    { platilloId: 1, ingredienteId: 1, requerido: true },
    { platilloId: 1, ingredienteId: 2, requerido: false },
    { platilloId: 1, ingredienteId: 3, requerido: false },
    { platilloId: 2, ingredienteId: 4, requerido: true },
  ];

  /* ================= STATE ================= */

  const [selectedPlatilloId, setSelectedPlatilloId] = useState(null);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);

  const platilloSeleccionado = platillos.find(
    (p) => p.id === selectedPlatilloId
  );

  const ingredientesDelPlatillo = relaciones
    .filter((r) => r.platilloId === selectedPlatilloId)
    .map((r) => ({
      ...r,
      ...ingredientes.find((i) => i.id === r.ingredienteId),
    }))
    .filter((i) => i.disponible);

  const toggleIngrediente = (ingredienteId) => {
    setIngredientesSeleccionados((prev) =>
      prev.includes(ingredienteId)
        ? prev.filter((id) => id !== ingredienteId)
        : [...prev, ingredienteId]
    );
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Menú</h1>

    {user?.role === "admin" && (
      <button
        onClick={() => navigate("/admin")}
        className="text-sm text-blue-600 hover:underline"
      >
        Volver a Dashboard Admin
      </button>
      )}
        </div>
      </header>


      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* ================= PLATILLOS ================= */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Platillos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platillos
              .filter((p) => p.disponible)
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPlatilloId(p.id);
                    setIngredientesSeleccionados([]);
                  }}
                  className={`
                    bg-white rounded-2xl p-6 cursor-pointer
                    shadow-sm transition-all
                    ${
                      selectedPlatilloId === p.id
                        ? "ring-2 ring-orange-500"
                        : "hover:shadow-lg hover:-translate-y-1"
                    }
                  `}
                >
                  <div className="h-32 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400">
                    Imagen
                  </div>

                  <h3 className="text-lg font-medium text-gray-800">
                    {p.nombre}
                  </h3>
                </div>
              ))}
          </div>
        </section>

        {/* ================= INGREDIENTES ================= */}
        {platilloSeleccionado && (
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Ingredientes de {platilloSeleccionado.nombre}
            </h2>

            <div className="space-y-3">
              {ingredientesDelPlatillo.map((i) => {
                const isChecked =
                  i.requerido || ingredientesSeleccionados.includes(i.ingredienteId);

                return (
                  <label
                    key={i.ingredienteId}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={i.requerido}
                      onChange={() => toggleIngrediente(i.ingredienteId)}
                      className="accent-orange-500"
                    />
                    <span className="text-gray-800">{i.nombre}</span>
                    {i.requerido && (
                      <span className="text-xs text-gray-500">(incluido)</span>
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
