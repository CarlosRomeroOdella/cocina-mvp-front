import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
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
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const platilloSeleccionado = PLATILLOS.find((p) => p.id === selectedPlatilloId);

  const toggleIngrediente = (id) =>
    setIngredientesSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleExtra = (id) =>
    setExtrasSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const totalActual =
    (platilloSeleccionado?.precio || 0) +
    extrasSeleccionados.reduce((acc, id) => {
      const ex = EXTRAS.find((e) => e.id === id);
      return acc + (ex?.precio || 0);
    }, 0);

  const totalCarrito = carrito.reduce((acc, item) => acc + item.total, 0);

  const agregarAlCarrito = (p, requeridos) => {
    const item = {
      id: Date.now(),
      platilloId: p.id,
      nombre: p.nombre,
      ingredientes: [
        ...requeridos.map((i) => ({ id: i.id, nombre: i.nombre, requerido: true })),
        ...ingredientesSeleccionados.map((id) => {
          const ing = INGREDIENTES.find((i) => i.id === id);
          return { id, nombre: ing?.nombre || "", requerido: false };
        }),
      ],
      extras: extrasSeleccionados.map((id) => {
        const ex = EXTRAS.find((e) => e.id === id);
        return { id, nombre: ex?.nombre || "", precio: ex?.precio || 0 };
      }),
      total: totalActual,
    };
    setCarrito((prev) => [...prev, item]);
    setSelectedPlatilloId(null);
    setIngredientesSeleccionados([]);
    setExtrasSeleccionados([]);
    setCarritoAbierto(true);
  };

  const eliminarDelCarrito = (itemId) =>
    setCarrito((prev) => prev.filter((i) => i.id !== itemId));

  const confirmarPedido = () => {
    console.log("PEDIDO CONFIRMADO:", carrito);
    setCarrito([]);
    setCarritoAbierto(false);
    alert("¡Pedido enviado! 🎉");
  };

  const platillosDisponibles = PLATILLOS.filter((p) => p.disponible);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "linear-gradient(135deg, #fff7f0 0%, #fff 60%, #fff3e8 100%)" }}
    >
      {/* ===== HEADER ===== */}
      <header
        className="sticky top-0 z-40 px-6 py-4 border-b border-orange-100"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-orange-200">
              C
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">Cocina Odellā</h1>
              <p className="text-xs text-gray-400 mt-0.5">Menú del día</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="text-sm text-gray-500 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-full hover:bg-orange-50 border border-gray-200 hover:border-orange-200"
              >
                ⚙ Panel Admin
              </button>
            )}
            <button
              onClick={() => setCarritoAbierto(true)}
              className="relative flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-md shadow-orange-200"
            >
              🛒 <span>Carrito</span>
              {carrito.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {carrito.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== GRID ===== */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-6">
          {platillosDisponibles.length} platillos disponibles
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platillosDisponibles.map((p) => {
            const isSelected = selectedPlatilloId === p.id;

            const ingredientesPlatillo = RELACIONES_PLATILLO_INGREDIENTE
              .filter((r) => r.platilloId === p.id)
              .map((r) => ({
                ...r,
                ...INGREDIENTES.find((i) => i.id === r.ingredienteId),
              }))
              .filter((i) => i.disponible);

            const requeridos = ingredientesPlatillo.filter((i) => i.requerido);
            const opcionales = ingredientesPlatillo.filter((i) => !i.requerido);

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (!isSelected) {
                    setSelectedPlatilloId(p.id);
                    setIngredientesSeleccionados([]);
                    setExtrasSeleccionados([]);
                  }
                }}
                className={`
                  relative rounded-2xl border overflow-hidden transition-all duration-500
                  ${isSelected
                    ? "border-orange-400 col-span-1 sm:col-span-2 lg:col-span-3 shadow-xl shadow-orange-100"
                    : "border-orange-100 bg-white hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 cursor-pointer"}
                  ${selectedPlatilloId && !isSelected ? "opacity-40 scale-95" : ""}
                `}
                style={isSelected ? { background: "rgba(255,255,255,0.97)" } : {}}
              >
                {/* Imagen */}
                <div
                  className={`flex items-center justify-center text-sm transition-all duration-500 ${isSelected ? "h-48 sm:h-64" : "h-40"}`}
                  style={{ background: "linear-gradient(135deg, #fef3e8, #fde8d0)" }}
                >
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-orange-300">
                      <span className="text-4xl">🍽️</span>
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-gray-900">{p.nombre}</h3>
                    {isSelected && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPlatilloId(null); }}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 flex items-center justify-center transition-all text-lg leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Contenido expandido */}
                  <div className={`overflow-hidden transition-all duration-500 ${isSelected ? "max-h-[700px] opacity-100 mt-5" : "max-h-0 opacity-0"}`}>

                    {/* Incluye */}
                    {requeridos.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Incluye</p>
                        <div className="flex flex-wrap gap-2">
                          {requeridos.map((i) => (
                            <span key={i.id} className="px-3 py-1 text-xs bg-green-50 text-green-600 border border-green-200 rounded-full font-medium">
                              ✓ {i.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personaliza */}
                    {opcionales.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Personaliza</p>
                        <div className="flex flex-wrap gap-2">
                          {opcionales.map((i) => {
                            const sel = ingredientesSeleccionados.includes(i.id);
                            return (
                              <button
                                key={i.id}
                                onClick={(e) => { e.stopPropagation(); toggleIngrediente(i.id); }}
                                className={`px-3 py-1 text-xs rounded-full border font-medium transition-all ${
                                  sel
                                    ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200"
                                    : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 bg-white"
                                }`}
                              >
                                {i.nombre}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Extras */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Extras</p>
                      <div className="flex flex-wrap gap-2">
                        {EXTRAS.filter((e) => e.disponible && e.id).map((e) => {
                          const sel = extrasSeleccionados.includes(e.id);
                          return (
                            <button
                              key={e.id}
                              onClick={(ev) => { ev.stopPropagation(); toggleExtra(e.id); }}
                              className={`px-3 py-1 text-xs rounded-full border font-medium transition-all ${
                                sel
                                  ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200"
                                  : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 bg-white"
                              }`}
                            >
                              {e.nombre}{e.precio ? ` +$${e.precio}` : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer platillo */}
                    <div className="flex justify-between items-center pt-4 border-t border-orange-100">
                      <div>
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-2xl font-bold text-orange-500">${totalActual}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); agregarAlCarrito(p, requeridos); }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition-all text-sm shadow-md shadow-orange-200"
                      >
                        + Agregar al carrito
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ===== CARRITO FLOTANTE ===== */}
      {carrito.length > 0 && !carritoAbierto && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setCarritoAbierto(true)}
            className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-2xl shadow-orange-300 transition-all"
          >
            🛒
            <span>{carrito.length} {carrito.length === 1 ? "platillo" : "platillos"}</span>
            <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-sm font-bold">${totalCarrito}</span>
          </button>
        </div>
      )}

      {/* ===== DRAWER CARRITO ===== */}
      {carritoAbierto && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
            onClick={() => setCarritoAbierto(false)}
          />

          <div
            className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 flex flex-col shadow-2xl border-l border-orange-100"
            style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}
          >
            {/* Header drawer */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-orange-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tu pedido</h2>
                <p className="text-xs text-gray-400">{carrito.length} {carrito.length === 1 ? "platillo" : "platillos"}</p>
              </div>
              <button
                onClick={() => setCarritoAbierto(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 flex items-center justify-center transition-all text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {carrito.length === 0 ? (
                <div className="text-center mt-16">
                  <p className="text-4xl mb-3">🛒</p>
                  <p className="text-gray-400 text-sm">Tu carrito está vacío</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div key={item.id} className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm text-gray-900">{item.nombre}</h3>
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="w-6 h-6 rounded-full bg-white hover:bg-red-50 text-gray-300 hover:text-red-400 flex items-center justify-center transition-all text-sm leading-none ml-2 border border-gray-100"
                      >
                        ×
                      </button>
                    </div>

                    {item.ingredientes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.ingredientes.map((i) => (
                          <span key={i.id} className="text-xs text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full">
                            {i.nombre}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.extras.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.extras.map((e) => (
                          <span key={e.id} className="text-xs text-orange-500 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                            + {e.nombre}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-orange-500 font-bold text-sm mt-1">${item.total}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer drawer */}
            {carrito.length > 0 && (
              <div className="px-6 py-5 border-t border-orange-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-sm font-medium">Total</span>
                  <span className="text-2xl font-bold text-orange-500">${totalCarrito}</span>
                </div>
                <button
                  onClick={confirmarPedido}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full transition-all shadow-md shadow-orange-200"
                >
                  Confirmar pedido
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
