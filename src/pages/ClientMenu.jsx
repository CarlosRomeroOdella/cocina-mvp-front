import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import { crearPedido, getPedido, getCocinaEstado } from "../services/pedidosService";
import { changeMyPassword } from "../services/usuariosService";

const STATUS_LABEL = {
  en_espera:      "En espera…",
  en_preparacion: "¡En preparación!",
  listo:          "¡Listo para recoger!",
};
const STATUS_COLOR = {
  en_espera:      "bg-yellow-500",
  en_preparacion: "bg-blue-500",
  listo:          "bg-green-500",
};

export default function ClientMenu() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { platillos, ingredientes, extras, loading } = useProducts();

  const [menuTab, setMenuTab] = useState("platillos");
  const [busqueda, setBusqueda] = useState("");
  const [selectedPlatilloId, setSelectedPlatilloId] = useState(null);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [extrasCantidad, setExtrasCantidad] = useState({});
  const [cantidad, setCantidad] = useState(1);
  // bebidas/postres: { [id]: cantidad }
  const [bebidasCantidad, setBebidasCantidad] = useState({});
  const [postresCantidad, setPostresCantidad] = useState({});
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [nota, setNota] = useState("");
  const [pwdModal, setPwdModal] = useState(false);

  const [cocinaAbierta, setCocinaAbierta] = useState(null);

  const [pedidoActivo, setPedidoActivo] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pedido_activo") ?? "null"); } catch { return null; }
  });
  const prevStatusRef = useRef(pedidoActivo?.status ?? null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    getCocinaEstado()
      .then((d) => setCocinaAbierta(d.abierta))
      .catch(() => setCocinaAbierta(false));
    const iv = setInterval(() => {
      getCocinaEstado().then((d) => setCocinaAbierta(d.abierta)).catch(() => {});
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!pedidoActivo || pedidoActivo.status === "listo") return;
    const poll = async () => {
      try {
        const data = await getPedido(pedidoActivo.id);
        if (data.status !== prevStatusRef.current) {
          prevStatusRef.current = data.status;
          const nuevo = { id: data.id, status: data.status };
          setPedidoActivo(nuevo);
          localStorage.setItem("pedido_activo", JSON.stringify(nuevo));
          mostrarToast(data.status);
          if (Notification.permission === "granted") {
            new Notification("Cocina Odellā", { body: STATUS_LABEL[data.status], icon: "/favicon.ico" });
          }
        }
      } catch { /* silencioso */ }
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [pedidoActivo?.id, pedidoActivo?.status]);

  const mostrarToast = (status) => {
    setToastMsg(STATUS_LABEL[status]);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const pedirNotificaciones = () => {
    if (Notification.permission === "default") Notification.requestPermission();
  };

  /* ── Cálculos de precio ── */
  const platilloSeleccionado = platillos.find((p) => p.id === selectedPlatilloId);
  const precioBase = Number(platilloSeleccionado?.precio) || 0;
  const cargoIngredientes = Math.max(0, ingredientesSeleccionados.length - 1) * 5;
  const cargoExtras = Object.entries(extrasCantidad).reduce((acc, [id, cant]) => {
    const ex = extras.find((e) => e.id === Number(id));
    return acc + (Number(ex?.precio) || 0) * cant;
  }, 0);
  const precioUnitario = precioBase + cargoIngredientes + cargoExtras;
  const totalActual = precioUnitario * cantidad;

  const totalBebidas = Object.entries(bebidasCantidad).reduce((acc, [id, cant]) => {
    const beb = extras.find((e) => e.id === Number(id));
    return acc + (Number(beb?.precio) || 0) * cant;
  }, 0);
  const totalPostres = Object.entries(postresCantidad).reduce((acc, [id, cant]) => {
    const pos = extras.find((e) => e.id === Number(id));
    return acc + (Number(pos?.precio) || 0) * cant;
  }, 0);
  const totalCarrito = carrito.reduce((acc, item) => acc + Number(item.total), 0);

  /* ── Helpers ── */
  const toggleIngrediente = (id) =>
    setIngredientesSeleccionados((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const setCantidadCategoria = (setter) => (id, val) =>
    setter((prev) => {
      const next = { ...prev };
      if (val <= 0) delete next[id]; else next[id] = val;
      return next;
    });
  const setCantidadBebida  = setCantidadCategoria(setBebidasCantidad);
  const setCantidadPostre  = setCantidadCategoria(setPostresCantidad);
  const setCantidadExtra   = setCantidadCategoria(setExtrasCantidad);

  /* ── Agregar al carrito ── */
  const agregarAlCarrito = (p, requeridos) => {
    const item = {
      id: Date.now(),
      nombre: p.nombre,
      tipo: "platillo",
      cantidad,
      precioUnitario,
      ingredientes: [
        ...requeridos.map((i) => ({ id: i.id, nombre: i.nombre })),
        ...ingredientesSeleccionados.map((id) => ({ id, nombre: ingredientes.find((i) => i.id === id)?.nombre || "" })),
      ],
      extras: Object.entries(extrasCantidad)
        .filter(([, cant]) => cant > 0)
        .map(([id, cant]) => {
          const ex = extras.find((e) => e.id === Number(id));
          return { id: Number(id), nombre: ex?.nombre || "", precio: Number(ex?.precio) || 0, cantidad: cant };
        }),
      total: totalActual,
    };
    setCarrito((prev) => [...prev, item]);
    setSelectedPlatilloId(null);
    setIngredientesSeleccionados([]);
    setExtrasCantidad({});
    setCantidad(1);
    setCarritoAbierto(true);
  };

  const agregarBebidasAlCarrito = () => {
    const entries = Object.entries(bebidasCantidad).filter(([, c]) => c > 0);
    if (!entries.length) return;
    setCarrito((prev) => [
      ...prev,
      ...entries.map(([id, cant]) => {
        const beb = extras.find((e) => e.id === Number(id));
        const pu = Number(beb?.precio) || 0;
        return { id: Date.now() + Number(id), nombre: beb?.nombre || "", tipo: "bebida", cantidad: cant, precioUnitario: pu, ingredientes: [], extras: [], total: pu * cant };
      }),
    ]);
    setBebidasCantidad({});
    setCarritoAbierto(true);
  };

  const agregarPostresAlCarrito = () => {
    const entries = Object.entries(postresCantidad).filter(([, c]) => c > 0);
    if (!entries.length) return;
    setCarrito((prev) => [
      ...prev,
      ...entries.map(([id, cant]) => {
        const pos = extras.find((e) => e.id === Number(id));
        const pu = Number(pos?.precio) || 0;
        return { id: Date.now() + Number(id), nombre: pos?.nombre || "", tipo: "postre", cantidad: cant, precioUnitario: pu, ingredientes: [], extras: [], total: pu * cant };
      }),
    ]);
    setPostresCantidad({});
    setCarritoAbierto(true);
  };

  const eliminarDelCarrito = (itemId) => setCarrito((prev) => prev.filter((i) => i.id !== itemId));

  const confirmarPedido = async () => {
    if (!cocinaAbierta) return;
    setConfirmando(true);
    pedirNotificaciones();
    try {
      const pedido = await crearPedido({ items: carrito, total: totalCarrito, nota: nota.trim() || null });
      const activo = { id: pedido.id, status: pedido.status };
      setPedidoActivo(activo);
      prevStatusRef.current = pedido.status;
      localStorage.setItem("pedido_activo", JSON.stringify(activo));
      setCarrito([]);
      setNota("");
      setCarritoAbierto(false);
      mostrarToast(pedido.status);
    } catch (err) {
      alert(err.message || "Error al enviar el pedido");
    } finally {
      setConfirmando(false);
    }
  };

  const cerrarTracking = () => {
    setPedidoActivo(null);
    localStorage.removeItem("pedido_activo");
  };

  const bebidas = extras.filter((e) => e.categoria === "bebida" && e.disponible);
  const postres = extras.filter((e) => e.categoria === "postre" && e.disponible);

  const totalBebidasSeleccionadas = Object.values(bebidasCantidad).reduce((s, c) => s + c, 0);
  const totalPostresSeleccionados = Object.values(postresCantidad).reduce((s, c) => s + c, 0);

  if (loading || cocinaAbierta === null) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen font-sans" style={{ background: "linear-gradient(135deg, #fff7f0 0%, #fff 60%, #fff3e8 100%)" }}>

      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {!cocinaAbierta && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-2 text-center">
          <p className="text-xs font-semibold text-red-500">🔴 Cocina cerrada — No se están aceptando pedidos por el momento</p>
        </div>
      )}

      {pedidoActivo && (
        <div className={`${STATUS_COLOR[pedidoActivo.status]} text-white px-6 py-2.5 flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
            <span className="text-sm font-semibold">
              Pedido #{pedidoActivo.id} · {STATUS_LABEL[pedidoActivo.status]}
            </span>
          </div>
          {pedidoActivo.status === "listo" ? (
            <button onClick={cerrarTracking} className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all">
              Cerrar
            </button>
          ) : (
            <span className="text-xs opacity-70">Actualizando…</span>
          )}
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header
        className="sticky top-0 z-40 px-6 py-4 border-b border-orange-100"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-orange-200">C</div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">Cocina Odellā</h1>
              <p className="text-xs text-gray-400 mt-0.5">Menú del día</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <button onClick={() => navigate("/admin")} className="text-sm text-gray-500 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-full hover:bg-orange-50 border border-gray-200 hover:border-orange-200">
                Panel Admin
              </button>
            )}
            <button onClick={() => setPwdModal(true)} className="text-sm text-gray-500 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-full hover:bg-orange-50 border border-gray-200 hover:border-orange-200">
              Mi contraseña
            </button>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50 border border-gray-200 hover:border-red-200">
              Cerrar sesión
            </button>
            <button
              onClick={() => setCarritoAbierto(true)}
              className="relative flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-md shadow-orange-200"
            >
              <span>Carrito</span>
              {carrito.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">{carrito.length}</span>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-3 flex gap-1">
          {[
            { key: "platillos", label: "Platillos" },
            { key: "bebidas",   label: `Bebidas${bebidas.length > 0 ? ` (${bebidas.length})` : ""}` },
            { key: "postres",   label: `Postres${postres.length > 0 ? ` (${postres.length})` : ""}` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setMenuTab(key); setSelectedPlatilloId(null); setExtrasCantidad({}); setCantidad(1); setBusqueda(""); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                menuTab === key ? "bg-orange-500 text-white shadow-sm shadow-orange-200" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ── PLATILLOS ── */}
        {menuTab === "platillos" && (() => {
          const platillosFiltrados = platillos
            .filter((p) => p.disponible)
            .filter((p) => !busqueda.trim() || p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));

          return (
          <>
            {/* Buscador */}
            <div className="relative mb-6 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
              <input
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setSelectedPlatilloId(null); }}
                placeholder="Buscar platillo..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-full outline-none transition-all bg-white"
              />
              {busqueda && (
                <button onClick={() => setBusqueda("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
              )}
            </div>

            <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">
              {platillosFiltrados.length} {platillosFiltrados.length === 1 ? "resultado" : "resultados"}
              {busqueda && <span className="normal-case ml-1">para "<span className="text-orange-400">{busqueda}</span>"</span>}
            </p>

            {platillosFiltrados.length === 0 && (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-gray-400 text-sm">Sin resultados</p>
                <button onClick={() => setBusqueda("")} className="mt-3 text-xs text-orange-500 hover:underline">Limpiar búsqueda</button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {platillosFiltrados.map((p) => {
                const isSelected = selectedPlatilloId === p.id;
                const ingredientesPlatillo = (p.ingredientes ?? []).map((id) => ingredientes.find((i) => i.id === id)).filter(Boolean).filter((i) => i.disponible);
                const idsRequeridos = new Set(p.ingredientesRequeridos ?? []);
                const requeridos = ingredientesPlatillo.filter((i) => idsRequeridos.has(i.id));
                const opcionales = ingredientesPlatillo.filter((i) => !idsRequeridos.has(i.id));

                return (
                  <div
                    key={p.id}
                    onClick={() => { if (!isSelected) { setSelectedPlatilloId(p.id); setIngredientesSeleccionados([]); setExtrasCantidad({}); setCantidad(1); } }}
                    className={`relative rounded-2xl border overflow-hidden transition-all duration-500 ${
                      isSelected
                        ? "border-orange-400 col-span-1 sm:col-span-2 lg:col-span-3 shadow-xl shadow-orange-100"
                        : "border-orange-100 bg-white hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 cursor-pointer"
                    } ${selectedPlatilloId && !isSelected ? "opacity-40 scale-95" : ""}`}
                    style={isSelected ? { background: "rgba(255,255,255,0.97)" } : {}}
                  >
                    <div
                      className={`flex items-center justify-center transition-all duration-500 ${isSelected ? "h-48 sm:h-64" : "h-40"}`}
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
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{p.nombre}</h3>
                          {p.descripcion && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{p.descripcion}</p>}
                        </div>
                        {isSelected && (
                          <button onClick={(e) => { e.stopPropagation(); setSelectedPlatilloId(null); setExtrasCantidad({}); setCantidad(1); }} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 flex items-center justify-center transition-all text-lg leading-none ml-2 shrink-0">×</button>
                        )}
                      </div>

                      <div className={`overflow-hidden transition-all duration-500 ${isSelected ? "max-h-[900px] opacity-100 mt-5" : "max-h-0 opacity-0"}`}>

                        {requeridos.length > 0 && (
                          <div className="mb-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Incluye</p>
                            <div className="flex flex-wrap gap-2">
                              {requeridos.map((i) => (
                                <span key={i.id} className="px-3 py-1 text-xs bg-green-50 text-green-600 border border-green-200 rounded-full font-medium">✓ {i.nombre}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {opcionales.length > 0 && (
                          <div className="mb-5">
                            <div className="flex items-baseline gap-2 mb-2">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Personaliza</p>
                              <p className="text-xs text-orange-400">1er ingrediente gratis · +$5 c/u después</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {opcionales.map((i) => {
                                const sel = ingredientesSeleccionados.includes(i.id);
                                return (
                                  <button key={i.id} onClick={(e) => { e.stopPropagation(); toggleIngrediente(i.id); }} className={`px-3 py-1 text-xs rounded-full border font-medium transition-all ${sel ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200" : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 bg-white"}`}>
                                    {i.nombre}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {(p.extras ?? []).length > 0 && (
                          <div className="mb-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Extras</p>
                            <div className="flex flex-wrap gap-2">
                              {(p.extras ?? []).map((id) => extras.find((e) => e.id === id)).filter(Boolean).filter((e) => e.disponible).map((e) => {
                                const cant = extrasCantidad[e.id] ?? 0;
                                return (
                                  <div key={e.id} onClick={(ev) => ev.stopPropagation()} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium transition-all ${cant > 0 ? "bg-orange-50 border-orange-400" : "border-gray-200 bg-white"}`}>
                                    <span className={cant > 0 ? "text-orange-700" : "text-gray-500"}>
                                      {e.nombre}{e.precio ? ` +$${Number(e.precio)}` : ""}
                                    </span>
                                    {cant > 0 ? (
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => setCantidadExtra(e.id, cant - 1)} className="w-5 h-5 rounded-full bg-white border border-orange-300 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center text-xs font-bold transition-all leading-none">−</button>
                                        <span className="text-orange-600 font-bold w-4 text-center">{cant}</span>
                                        <button onClick={() => setCantidadExtra(e.id, cant + 1)} className="w-5 h-5 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center text-xs font-bold transition-all leading-none">+</button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setCantidadExtra(e.id, 1)} className="w-5 h-5 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center text-xs font-bold transition-all leading-none">+</button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* ── Cantidad + footer ── */}
                        <div className="pt-4 border-t border-orange-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Cantidad</p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); setCantidad((c) => Math.max(1, c - 1)); }}
                                className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 flex items-center justify-center text-lg font-bold transition-all"
                              >
                                −
                              </button>
                              <span className="text-base font-bold text-gray-900 w-6 text-center">{cantidad}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); setCantidad((c) => c + 1); }}
                                className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 flex items-center justify-center text-lg font-bold transition-all"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-400">Total</p>
                              <p className="text-2xl font-bold text-orange-500">${totalActual}</p>
                              {(cargoIngredientes > 0 || cargoExtras > 0 || cantidad > 1) && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  ${precioUnitario} c/u
                                  {cargoIngredientes > 0 && <span className="text-orange-400"> +${cargoIngredientes} ing.</span>}
                                  {cargoExtras > 0 && <span className="text-orange-400"> +${cargoExtras} extras</span>}
                                </p>
                              )}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); agregarAlCarrito(p, requeridos); }} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition-all text-sm shadow-md shadow-orange-200">
                              + Agregar al carrito
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
          );
        })()}

        {/* ── BEBIDAS ── */}
        {menuTab === "bebidas" && (
          <CategoriaTab
            items={bebidas}
            cantidades={bebidasCantidad}
            onSetCantidad={setCantidadBebida}
            onAgregar={agregarBebidasAlCarrito}
            totalSeleccionados={totalBebidasSeleccionadas}
            total={totalBebidas}
            emptyIcon="🥤"
            emptyMsg="No hay bebidas disponibles por ahora"
            emptyHint="El administrador puede agregar bebidas desde la pestaña Extras"
            btnLabel="bebida"
          />
        )}

        {/* ── POSTRES ── */}
        {menuTab === "postres" && (
          <CategoriaTab
            items={postres}
            cantidades={postresCantidad}
            onSetCantidad={setCantidadPostre}
            onAgregar={agregarPostresAlCarrito}
            totalSeleccionados={totalPostresSeleccionados}
            total={totalPostres}
            emptyIcon="🍰"
            emptyMsg="No hay postres disponibles por ahora"
            emptyHint="El administrador puede agregar postres desde la pestaña Extras"
            btnLabel="postre"
          />
        )}
      </main>

      {/* ===== CARRITO FLOTANTE ===== */}
      {carrito.length > 0 && !carritoAbierto && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button onClick={() => setCarritoAbierto(true)} className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-2xl shadow-orange-300 transition-all">
            <span>{carrito.length} {carrito.length === 1 ? "ítem" : "ítems"}</span>
            <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-sm font-bold">${totalCarrito}</span>
          </button>
        </div>
      )}

      {/* ===== DRAWER CARRITO ===== */}
      {carritoAbierto && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }} onClick={() => setCarritoAbierto(false)} />
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 flex flex-col shadow-2xl border-l border-orange-100" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}>
            <div className="flex justify-between items-center px-6 py-5 border-b border-orange-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tu pedido</h2>
                <p className="text-xs text-gray-400">{carrito.length} {carrito.length === 1 ? "ítem" : "ítems"}</p>
              </div>
              <button onClick={() => setCarritoAbierto(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 flex items-center justify-center transition-all text-xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {carrito.length === 0 ? (
                <div className="text-center mt-16"><p className="text-gray-400 text-sm">Tu carrito está vacío</p></div>
              ) : (
                carrito.map((item) => (
                  <div key={item.id} className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">
                          {item.nombre}
                          {(item.cantidad ?? 1) > 1 && (
                            <span className="ml-1.5 text-xs font-semibold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">×{item.cantidad}</span>
                          )}
                        </h3>
                        {item.tipo !== "platillo" && <span className="text-xs text-blue-400 font-medium capitalize">{item.tipo}</span>}
                      </div>
                      <button onClick={() => eliminarDelCarrito(item.id)} className="w-6 h-6 rounded-full bg-white hover:bg-red-50 text-gray-300 hover:text-red-400 flex items-center justify-center transition-all text-sm leading-none ml-2 border border-gray-100">×</button>
                    </div>
                    {item.ingredientes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.ingredientes.map((i) => (
                          <span key={i.id} className="text-xs text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full">{i.nombre}</span>
                        ))}
                      </div>
                    )}
                    {item.extras.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.extras.map((e) => (
                          <span key={e.id} className="text-xs text-orange-500 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                            + {e.nombre}{(e.cantidad ?? 1) > 1 ? ` ×${e.cantidad}` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-orange-500 font-bold text-sm mt-1">${item.total}</p>
                  </div>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <div className="px-6 py-5 border-t border-orange-100">
                {!cocinaAbierta && (
                  <p className="text-xs text-red-400 font-medium text-center mb-3">🔴 Cocina cerrada — no se aceptan pedidos</p>
                )}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nota <span className="normal-case font-normal text-gray-300">(opcional)</span></label>
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Ej: sin cebolla, sin chile..."
                    rows={2}
                    className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-3 py-2 text-sm outline-none transition-all resize-none"
                  />
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-sm font-medium">Total</span>
                  <span className="text-2xl font-bold text-orange-500">${totalCarrito}</span>
                </div>
                <button
                  onClick={confirmarPedido}
                  disabled={confirmando || !cocinaAbierta}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition-all shadow-md shadow-orange-200"
                >
                  {confirmando ? "Enviando pedido…" : "Confirmar pedido"}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {pwdModal && <CambiarPasswordModal onClose={() => setPwdModal(false)} />}
    </div>
  );
}

/* ── CategoriaTab con cantidad por ítem ── */
function CategoriaTab({ items, cantidades, onSetCantidad, onAgregar, totalSeleccionados, total, emptyIcon, emptyMsg, emptyHint, btnLabel }) {
  const [busqueda, setBusqueda] = useState("");
  const filtrados = busqueda.trim()
    ? items.filter((i) => i.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : items;

  return (
    <>
      {items.length > 0 && (
        <div className="relative mb-6">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={`Buscar ${btnLabel}...`}
            className="w-full sm:w-72 pl-9 pr-4 py-2 text-sm border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-full outline-none transition-all bg-white"
          />
          {busqueda && (
            <button onClick={() => setBusqueda("")} className="absolute left-[17rem] top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg leading-none sm:block hidden">×</button>
          )}
        </div>
      )}
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-6">{filtrados.length} disponibles</p>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">{emptyIcon}</p>
          <p className="text-gray-400 text-sm">{emptyMsg}</p>
          <p className="text-gray-300 text-xs mt-1">{emptyHint}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {filtrados.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-sm">Sin resultados para "<span className="text-orange-400">{busqueda}</span>"</p>
                <button onClick={() => setBusqueda("")} className="mt-2 text-xs text-orange-500 hover:underline">Limpiar</button>
              </div>
            )}
            {filtrados.map((item) => {
              const cant = cantidades[item.id] ?? 0;
              return (
                <div key={item.id} className={`relative rounded-2xl border p-4 transition-all ${cant > 0 ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-100" : "border-orange-100 bg-white hover:border-orange-300 hover:shadow-md hover:shadow-orange-100"}`}>
                  <div className="w-full h-24 rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #fef3e8, #fde8d0)" }}>
                    <span className="text-4xl">{btnLabel === "bebida" ? "🥤" : "🍰"}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{item.nombre}</p>
                  {item.precio && <p className="text-sm font-semibold text-orange-500 mt-0.5">${Number(item.precio)}</p>}

                  {/* Stepper de cantidad */}
                  <div className="flex items-center justify-between mt-3">
                    {cant > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSetCantidad(item.id, cant - 1)}
                          className="w-7 h-7 rounded-full bg-white border border-orange-300 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center text-base font-bold transition-all"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-gray-900 w-5 text-center">{cant}</span>
                        <button
                          onClick={() => onSetCantidad(item.id, cant + 1)}
                          className="w-7 h-7 rounded-full bg-orange-500 border border-orange-500 text-white hover:bg-orange-600 flex items-center justify-center text-base font-bold transition-all"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onSetCantidad(item.id, 1)}
                        className="w-full py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-all"
                      >
                        + Agregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {totalSeleccionados > 0 && (
            <div className="sticky bottom-6 flex justify-center">
              <button onClick={onAgregar} className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full shadow-2xl shadow-orange-300 transition-all">
                <span>Agregar al carrito ({totalSeleccionados})</span>
                <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-sm font-bold">${total}</span>
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function CambiarPasswordModal({ onClose }) {
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.nueva !== form.confirmar) { setError("Las contraseñas nuevas no coinciden"); return; }
    if (form.nueva.length < 6) { setError("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    setGuardando(true);
    setError(null);
    try {
      await changeMyPassword(form.actual, form.nueva);
      setOk(true);
    } catch (err) {
      setError(err.message || "Error al cambiar contraseña");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl border border-orange-100 bg-white p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-gray-900">Cambiar contraseña</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 flex items-center justify-center text-lg">×</button>
        </div>

        {ok ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-3xl">✅</p>
            <p className="text-sm font-semibold text-green-600">Contraseña actualizada</p>
            <button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2 rounded-full transition-all">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {[
              { key: "actual",    label: "Contraseña actual",    placeholder: "Tu contraseña actual" },
              { key: "nueva",     label: "Nueva contraseña",     placeholder: "Mínimo 6 caracteres" },
              { key: "confirmar", label: "Confirmar contraseña", placeholder: "Repite la nueva contraseña" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
                <input
                  type="password"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>
            ))}
            {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={guardando} className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={guardando || !form.actual || !form.nueva || !form.confirmar} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-md shadow-orange-200">
                {guardando ? "Guardando..." : "Cambiar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
