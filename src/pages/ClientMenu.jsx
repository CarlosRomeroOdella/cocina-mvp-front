import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion} from "framer-motion";
import { PLATILLOS } from "../data/platillos";
import { INGREDIENTES } from "../data/ingredientes";
import { RELACIONES_PLATILLO_INGREDIENTE } from "../data/relaciones";
import { EXTRAS } from "../data/extras";

export default function ClientMenu() {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedPlatilloId, setSelectedPlatilloId] = useState(null);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);

  const platilloSeleccionado = PLATILLOS.find(p => p.id === selectedPlatilloId);

  const toggleIngrediente = (id) => {
    setIngredientesSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const toggleExtra = (id) => {
    setExtrasSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const total =
    (platilloSeleccionado?.precio || 0) +
    extrasSeleccionados.reduce((acc, id) => {
      const ex = EXTRAS.find(e => e.id === id);
      return acc + (ex?.precio || 0);
    }, 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-semibold">Menú</h1>

          {user?.rol === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="text-blue-600 hover:underline text-sm"
            >
              Volver a Admin
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">

        <h2 className="text-lg font-semibold mb-6">Platillos</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {PLATILLOS.filter(p => p.disponible).map(p => {

            const isSelected = selectedPlatilloId === p.id;

            const ingredientesPlatillo = RELACIONES_PLATILLO_INGREDIENTE
              .filter(r => r.platilloId === p.id)
              .map(r => ({
                ...r,
                ...INGREDIENTES.find(i => i.id === r.ingredienteId)
              }))
              .filter(i => i.disponible);

            const requeridos = ingredientesPlatillo.filter(i => i.requerido);
            const opcionales = ingredientesPlatillo.filter(i => !i.requerido);

            return (

              <div
              key={p.id}
              className={`
                bg-white rounded-xl p-6 cursor-pointer
                shadow-sm transform
                transition-all duration-700 ease-in-out
                ${isSelected
                  ? "ring-2 ring-orange-500 col-span-1 sm:col-span-2 lg:col-span-3 scale-[1.03]"
                  : "hover:shadow-lg hover:scale-[1.01]"}
                ${selectedPlatilloId && !isSelected ? "opacity-40 scale-[0.97]" : ""}
               `}
              onClick={() => {
                setSelectedPlatilloId(p.id);
                setIngredientesSeleccionados([]);
                setExtrasSeleccionados([]);
                }}
              >

                {/* Imagen */}
                <div className="h-32 bg-gray-100 rounded mb-4 flex items-center justify-center">
                  Imagen
                </div>

                <h3 className="text-lg font-medium">{p.nombre}</h3>

                {/* CONTENIDO EXPANDIDO */}
                <div
                  className={`
                    mt-6 space-y-6 overflow-hidden
                    transition-all duration-700 ease-in-out
                    ${isSelected ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"}
                  `}
                >

                  {/* INGREDIENTES INCLUIDOS */}
                  {requeridos.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-gray-700">
                        Incluye
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {requeridos.map(i => (
                          <span
                            key={i.id}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full"
                          >
                            ✔ {i.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* INGREDIENTES OPCIONALES */}
                  {opcionales.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-gray-700">
                        Personaliza
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {opcionales.map(i => {

                          const selected = ingredientesSeleccionados.includes(i.id);

                          return (
                            <button
                              key={i.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleIngrediente(i.id);
                              }}
                              className={`
                                px-3 py-1 rounded-full border text-sm
                                transition
                                ${selected
                                  ? "bg-orange-500 text-white border-orange-500"
                                  : "bg-white hover:bg-gray-100"}
                              `}
                            >
                              {i.nombre}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* EXTRAS */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">
                      Extras
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {EXTRAS.filter(e => e.disponible).map(e => {

                        const selected = extrasSeleccionados.includes(e.id);

                        return (
                          <button
                            key={e.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleExtra(e.id);
                            }}
                            className={`
                              px-3 py-1 rounded-full border text-sm
                              transition
                              ${selected
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-white hover:bg-gray-100"}
                            `}
                          >
                            {e.nombre}
                            {e.precio ? ` +$${e.precio}` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TOTAL */}
                  <div className="flex justify-between items-center pt-4 border-t">

                    <div className="text-lg font-semibold">
                      Total: ${total}
                    </div>

                    <div className="flex gap-3">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlatilloId(null);
                        }}
                        className="text-sm text-gray-500 hover:underline"
                      >
                        Cancelar
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          const pedido = {
                            platilloId: p.id,
                            ingredientes: [
                              ...requeridos.map(i => ({
                                id: i.id,
                                requerido: true
                              })),
                              ...ingredientesSeleccionados.map(id => ({
                                id,
                                requerido: false
                              }))
                            ],
                            extras: extrasSeleccionados
                          };

                          console.log("PEDIDO:", pedido);
                        }}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                      >
                        Agregar
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </main>

    </div>
  );
}