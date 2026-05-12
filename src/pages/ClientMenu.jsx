import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useProducts } from "../context/ProductsContext";
import { crearPedido, getPedido, getCocinaEstado, reenviarPedido, cancelarPedido } from "../services/pedidosService";
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
  const { dark, toggle: toggleTheme } = useTheme();
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
  const prevNotaRef   = useRef(pedidoActivo?.nota ?? null);
  const [toastMsg, setToastMsg] = useState(null);
  const [pedidoRevision, setPedidoRevision] = useState(null);

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
    if (!pedidoActivo || pedidoActivo.status === "listo" || pedidoActivo.status === "cancelado") return;
    const poll = async () => {
      try {
        const data = await getPedido(pedidoActivo.id);
        const statusChanged = data.status !== prevStatusRef.current;
        const notaChanged   = (data.nota ?? null) !== prevNotaRef.current;
        if (statusChanged || notaChanged) {
          prevStatusRef.current = data.status;
          prevNotaRef.current   = data.nota ?? null;
          const nuevo = { id: data.id, status: data.status, nota: data.nota ?? null };
          setPedidoActivo(nuevo);
          localStorage.setItem("pedido_activo", JSON.stringify(nuevo));
          if (data.status === "en_revision") {
            setPedidoRevision(data);
            mostrarToast("Tu pedido necesita revisión — toca el banner");
            if (Notification.permission === "granted") {
              new Notification("Cocina Odellā", { body: `Revisa tu pedido: ${data.nota ?? "necesita cambios"}`, icon: "/favicon.ico" });
            }
          } else if (statusChanged) {
            setPedidoRevision(null);
            mostrarToast(STATUS_LABEL[data.status] ?? data.status);
            if (Notification.permission === "granted") {
              new Notification("Cocina Odellā", { body: STATUS_LABEL[data.status], icon: "/favicon.ico" });
            }
          } else if (notaChanged) {
            mostrarToast(data.nota ? `Nota: ${data.nota}` : "Nota del pedido eliminada");
          }
        }
      } catch { /* silencioso */ }
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => clearInterval(iv);
  }, [pedidoActivo?.id, pedidoActivo?.status]);

  const mostrarToast = (msg) => {
    setToastMsg(msg);
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
      platilloId: p.id,
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
        return { id: Date.now() + Number(id), extraId: Number(id), nombre: beb?.nombre || "", tipo: "bebida", cantidad: cant, precioUnitario: pu, ingredientes: [], extras: [], total: pu * cant };
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
        return { id: Date.now() + Number(id), extraId: Number(id), nombre: pos?.nombre || "", tipo: "postre", cantidad: cant, precioUnitario: pu, ingredientes: [], extras: [], total: pu * cant };
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
      const activo = { id: pedido.id, status: pedido.status, nota: pedido.nota ?? null };
      setPedidoActivo(activo);
      prevStatusRef.current = pedido.status;
      prevNotaRef.current   = pedido.nota ?? null;
      localStorage.setItem("pedido_activo", JSON.stringify(activo));
      setCarrito([]);
      setNota("");
      setCarritoAbierto(false);
      mostrarToast(STATUS_LABEL[pedido.status]);
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
    <div className="min-h-screen font-sans page-bg">

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
        <div
          className={`${pedidoActivo.status === "en_revision" ? "bg-purple-600" : STATUS_COLOR[pedidoActivo.status]} text-white px-6 py-2.5 flex items-center justify-between gap-4 ${pedidoActivo.status === "en_revision" ? "cursor-pointer hover:bg-purple-700 transition-colors" : ""}`}
          onClick={pedidoActivo.status === "en_revision" ? () => getPedido(pedidoActivo.id).then(setPedidoRevision).catch(() => {}) : undefined}
        >
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full bg-white/60 shrink-0 ${pedidoActivo.status === "en_revision" ? "animate-ping" : "animate-pulse"}`} />
            <div>
              <span className="text-sm font-semibold">
                {pedidoActivo.status === "en_revision"
                  ? `⚠ Pedido #${pedidoActivo.id} necesita tu atención — toca aquí`
                  : `Pedido #${pedidoActivo.id} · ${STATUS_LABEL[pedidoActivo.status]}`}
              </span>
              {pedidoActivo.nota && pedidoActivo.status !== "en_revision" && (
                <p className="text-xs opacity-80 mt-0.5 italic">"{pedidoActivo.nota}"</p>
              )}
              {pedidoActivo.status === "en_revision" && pedidoActivo.nota && (
                <p className="text-xs opacity-90 mt-0.5 italic">"{pedidoActivo.nota}"</p>
              )}
            </div>
          </div>
          {pedidoActivo.status === "listo" ? (
            <button onClick={(e) => { e.stopPropagation(); cerrarTracking(); }} className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all shrink-0">
              Cerrar
            </button>
          ) : pedidoActivo.status === "en_revision" ? (
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full shrink-0">Modificar →</span>
          ) : (
            <span className="text-xs opacity-70 shrink-0">Actualizando…</span>
          )}
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 px-6 py-4 border-b border-orange-100 header-bg">
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
            <button
              onClick={toggleTheme}
              title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all border border-gray-200 hover:border-orange-200"
            >
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
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
                      className={`icon-bg flex items-center justify-center transition-all duration-500 ${isSelected ? "h-48 sm:h-64" : "h-40"}`}
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
                                <span key={i.id} className="flex items-center gap-1.5 px-3 py-1 text-xs bg-green-50 text-green-600 border border-green-200 rounded-full font-medium">
                                  {i.imagen && <img src={i.imagen} alt={i.nombre} className="w-4 h-4 rounded-full object-cover" onError={(e) => (e.target.style.display = "none")} />}
                                  ✓ {i.nombre}
                                </span>
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
                                  <button key={i.id} onClick={(e) => { e.stopPropagation(); toggleIngrediente(i.id); }} className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border font-medium transition-all ${sel ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200" : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 bg-white"}`}>
                                    {i.imagen && <img src={i.imagen} alt={i.nombre} className="w-4 h-4 rounded-full object-cover" onError={(e) => (e.target.style.display = "none")} />}
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
                                    {e.imagen && <img src={e.imagen} alt={e.nombre} className="w-5 h-5 rounded-full object-cover" onError={(ev) => (ev.target.style.display = "none")} />}
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

      {pedidoRevision && (
        <RevisionModal
          pedido={pedidoRevision}
          platillos={platillos}
          ingredientes={ingredientes}
          extras={extras}
          onReenviar={async (items) => {
            const actualizado = await reenviarPedido(pedidoRevision.id, items);
            const nuevo = { id: actualizado.id, status: actualizado.status, nota: null };
            setPedidoActivo(nuevo);
            prevStatusRef.current = actualizado.status;
            prevNotaRef.current   = null;
            localStorage.setItem("pedido_activo", JSON.stringify(nuevo));
            setPedidoRevision(null);
            mostrarToast(STATUS_LABEL[actualizado.status]);
          }}
          onCancelar={async () => {
            await cancelarPedido(pedidoRevision.id);
            setPedidoActivo(null);
            setPedidoRevision(null);
            localStorage.removeItem("pedido_activo");
            mostrarToast("Pedido cancelado");
          }}
          onCerrar={() => setPedidoRevision(null)}
        />
      )}
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
                  <div className="icon-bg w-full h-24 rounded-xl overflow-hidden flex items-center justify-center mb-3">
                    {item.imagen
                      ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
                      : null}
                    <span className={`text-4xl ${item.imagen ? "hidden" : "flex"}`}>{btnLabel === "bebida" ? "🥤" : "🍰"}</span>
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

/* ── Modal de revisión de pedido ─────────────────────────────────────────── */
function RevisionModal({ pedido, platillos, ingredientes, onReenviar, onCancelar, onCerrar }) {
  const [items, setItems] = useState(pedido.items);
  const [expandedId, setExpandedId] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState(null);

  const removerItem = (itemId) => setItems((prev) => prev.filter((i) => i.id !== itemId));

  const toggleIngredienteEnItem = (itemId, ingId) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== itemId) return item;
      const yaEsta = item.ingredientes.some((i) => i.id === ingId);
      return {
        ...item,
        ingredientes: yaEsta
          ? item.ingredientes.filter((i) => i.id !== ingId)
          : [...item.ingredientes, { id: ingId, nombre: ingredientes.find((i) => i.id === ingId)?.nombre ?? "" }],
      };
    }));
  };

  const handleReenviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      const payload = items.map((item) => {
        if (item.tipo === "platillo") {
          const platillo = platillos.find((p) => p.nombre === item.nombre);
          return {
            platilloId: platillo?.id ?? null,
            nombre: item.nombre,
            tipo: "platillo",
            cantidad: item.cantidad ?? 1,
            precioUnitario: Number(item.precio),
            ingredientes: item.ingredientes,
            extras: item.extras,
          };
        }
        return {
          extraId: item.extraId ?? null,
          nombre: item.nombre,
          tipo: item.tipo,
          cantidad: item.cantidad ?? 1,
          precioUnitario: Number(item.precio),
          ingredientes: [],
          extras: [],
        };
      });
      await onReenviar(payload);
    } catch (err) {
      setError(err.message || "Error al reenviar el pedido");
    } finally {
      setEnviando(false);
    }
  };

  const handleCancelar = async () => {
    if (!window.confirm("¿Cancelar el pedido? Esta acción no se puede deshacer.")) return;
    setCancelando(true);
    try {
      await onCancelar();
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl bg-white flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-purple-100 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Pedido #{pedido.id} — En revisión</span>
              <h2 className="text-base font-bold text-gray-900 mt-0.5">Modifica tu pedido</h2>
            </div>
            <button onClick={onCerrar} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100 text-gray-400 hover:text-purple-500 flex items-center justify-center text-lg transition-all">×</button>
          </div>
          {pedido.nota && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-0.5">Mensaje de cocina</p>
              <p className="text-sm text-purple-800 italic">"{pedido.nota}"</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No quedan ítems — cancela el pedido o vuelve a agregar.</p>
          )}
          {items.map((item) => {
            const platillo = platillos.find((p) => p.nombre === item.nombre);
            const isExpanded = expandedId === item.id;
            const idsRequeridos = new Set(platillo?.ingredientesRequeridos ?? []);
            const ingredientesOpcionales = (platillo?.ingredientes ?? [])
              .map((id) => ingredientes.find((i) => i.id === id))
              .filter((i) => i && i.disponible && !idsRequeridos.has(i.id));
            const ingredientesRequeridos = (platillo?.ingredientes ?? [])
              .map((id) => ingredientes.find((i) => i.id === id))
              .filter((i) => i && i.disponible && idsRequeridos.has(i.id));

            return (
              <div key={item.id} className="border border-orange-100 rounded-2xl overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{item.nombre}</span>
                      {(item.cantidad ?? 1) > 1 && <span className="text-xs text-gray-400">×{item.cantidad}</span>}
                      <span className="text-xs text-orange-500 font-semibold ml-auto">${Number(item.precio) * (item.cantidad ?? 1)}</span>
                    </div>
                    {item.tipo === "platillo" && item.ingredientes.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{item.ingredientes.map((i) => i.nombre).join(", ")}</p>
                    )}
                    {item.tipo !== "platillo" && (
                      <span className="text-xs text-blue-400 capitalize">{item.tipo}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.tipo === "platillo" && ingredientesOpcionales.length > 0 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="text-xs text-purple-500 hover:text-purple-700 border border-purple-200 hover:border-purple-400 px-2 py-1 rounded-full transition-all"
                      >
                        {isExpanded ? "Cerrar" : "Editar"}
                      </button>
                    )}
                    {items.length > 1 && (
                      <button
                        onClick={() => removerItem(item.id)}
                        className="w-6 h-6 rounded-full bg-red-50 text-red-300 hover:bg-red-400 hover:text-white flex items-center justify-center text-sm transition-all border border-red-100"
                      >×</button>
                    )}
                  </div>
                </div>

                {/* Ingredientes opcionales expandibles */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-orange-50 pt-3">
                    {ingredientesRequeridos.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Incluye siempre</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ingredientesRequeridos.map((i) => (
                            <span key={i.id} className="text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-full">✓ {i.nombre}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Ingredientes opcionales</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ingredientesOpcionales.map((ing) => {
                        const sel = item.ingredientes.some((i) => i.id === ing.id);
                        return (
                          <button
                            key={ing.id}
                            onClick={() => toggleIngredienteEnItem(item.id, ing.id)}
                            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${sel ? "bg-orange-500 border-orange-500 text-white" : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500"}`}
                          >
                            {ing.nombre}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-orange-100 space-y-2 shrink-0">
          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
          <button
            onClick={handleReenviar}
            disabled={enviando || items.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-all shadow-md shadow-orange-200 text-sm"
          >
            {enviando ? "Reenviando…" : "Confirmar y re-enviar pedido"}
          </button>
          <button
            onClick={handleCancelar}
            disabled={cancelando || enviando}
            className="w-full border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 font-medium py-2.5 rounded-full transition-all text-sm"
          >
            {cancelando ? "Cancelando…" : "Cancelar pedido"}
          </button>
        </div>
      </div>
    </div>
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
