import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import { getPedidos, actualizarStatusPedido, marcarPagado, getCocinaEstado, setCocinaEstado, getResumen } from "../services/pedidosService";
import { getUsuarios, crearUsuario, actualizarUsuario, resetPassword } from "../services/usuariosService";

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const ctx = useProducts();
  const platillos = ctx?.platillos ?? [];
  const ingredientes = ctx?.ingredientes ?? [];
  const extras = ctx?.extras ?? [];
  const loading = ctx?.loading ?? true;
  const error = ctx?.error ?? null;
  const toggleDisponible = ctx?.toggleDisponible ?? (() => {});
  const guardarPlatillo = ctx?.guardarPlatillo ?? (async () => {});
  const eliminarPlatillo = ctx?.eliminarPlatillo ?? (async () => {});
  const crearIngrediente = ctx?.crearIngrediente ?? (async () => {});
  const eliminarIngrediente = ctx?.eliminarIngrediente ?? (async () => {});
  const crearExtra = ctx?.crearExtra ?? (async () => {});
  const actualizarExtra = ctx?.actualizarExtra ?? (async () => {});
  const eliminarExtra = ctx?.eliminarExtra ?? (async () => {});

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pedidos");
  const [editModal, setEditModal] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [cocinaAbierta, setCocinaAbierta] = useState(false);
  const [togglingCocina, setTogglingCocina] = useState(false);

  useEffect(() => {
    getCocinaEstado().then((d) => setCocinaAbierta(d.abierta)).catch(() => {});
  }, []);

  const handleToggleCocina = async () => {
    setTogglingCocina(true);
    try {
      const d = await setCocinaEstado(!cocinaAbierta);
      setCocinaAbierta(d.abierta);
    } finally {
      setTogglingCocina(false);
    }
  };

  const handleEdit = (platillo) => {
    setSaveError(null);
    setEditModal({ ...platillo });
  };

  const handleAddPlatillo = () => {
    setSaveError(null);
    setEditModal({ id: null, nombre: "", disponible: true, imagen: "", precio: "", ingredientes: [], ingredientesRequeridos: [], extras: [] });
  };

  const handleSave = async (data) => {
    setSaving(true);
    setSaveError(null);
    try {
      await guardarPlatillo(data);
      setEditModal(null);
    } catch (err) {
      setSaveError(err.message || "Error al guardar el platillo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este platillo?")) return;
    try { await eliminarPlatillo(id); }
    catch (err) { alert(err.message || "Error al eliminar"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fff7f0 0%, #fff 60%, #fff3e8 100%)" }}>

      {/* HEADER */}
      <header
        className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b border-orange-100"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-orange-200">A</div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Dashboard Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle cocina */}
          <button
            onClick={handleToggleCocina}
            disabled={togglingCocina}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              cocinaAbierta
                ? "bg-green-500 hover:bg-green-600 border-green-500 text-white shadow-sm shadow-green-200"
                : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-500"
            } disabled:opacity-60`}
          >
            <span className={`w-2 h-2 rounded-full ${cocinaAbierta ? "bg-white" : "bg-gray-400"}`} />
            {togglingCocina ? "..." : cocinaAbierta ? "Cocina abierta" : "Cocina cerrada"}
          </button>

          <button onClick={() => navigate("/menu")} className="text-sm text-gray-500 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-full hover:bg-orange-50">
            Ver menú cliente
          </button>
          <button onClick={logout} className="text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-full transition-all shadow-sm shadow-orange-200">
            Salir
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="px-6 border-b border-orange-100" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <nav className="flex gap-1 max-w-6xl mx-auto">
          {["pedidos", "reportes", "platillos", "ingredientes", "extras", "usuarios"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium border-b-2 capitalize transition-all ${
                activeTab === tab ? "border-orange-500 text-orange-500" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENIDO */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {activeTab === "pedidos" && (
          <PedidosTab />
        )}
        {activeTab === "reportes" && (
          <ReportesTab />
        )}
        {activeTab === "usuarios" && (
          <UsuariosTab />
        )}
        {activeTab === "platillos" && (
          <PlatillosPanel
            platillos={platillos}
            onToggle={toggleDisponible}
            onEdit={handleEdit}
            onAdd={handleAddPlatillo}
            onDelete={handleDelete}
          />
        )}
        {activeTab === "ingredientes" && (
          <IngredientesTab
            ingredientes={ingredientes}
            platillos={platillos}
            onCrear={crearIngrediente}
            onEliminar={eliminarIngrediente}
            guardarPlatillo={guardarPlatillo}
          />
        )}
        {activeTab === "extras" && (
          <ExtrasTab
            extras={extras}
            platillos={platillos}
            onCrear={crearExtra}
            onActualizar={actualizarExtra}
            onEliminar={eliminarExtra}
            guardarPlatillo={guardarPlatillo}
          />
        )}
      </main>

      {editModal && (
        <EditModal
          platillo={editModal}
          ingredientes={ingredientes}
          extras={extras}
          onSave={handleSave}
          onClose={() => setEditModal(null)}
          saving={saving}
          error={saveError}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */

function PlatillosPanel({ platillos, onToggle, onEdit, onAdd, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Platillos</h2>
          <p className="text-xs text-gray-400">{platillos.length} registrados</p>
        </div>
        <button onClick={onAdd} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-200 flex items-center gap-1.5">
          <span className="text-lg leading-none">+</span> Agregar platillo
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {platillos.map((p) => (
          <div key={p.id} className="bg-white border border-orange-100 rounded-xl p-4 flex items-center justify-between gap-2 hover:border-orange-200 transition-all">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.nombre}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className={`text-xs font-medium ${p.disponible ? "text-green-600" : "text-red-400"}`}>
                  {p.disponible ? "Disponible" : "No disponible"}
                </p>
                {p.precio && <p className="text-xs text-orange-500 font-semibold">${Number(p.precio).toFixed(0)}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => onEdit(p)} className="text-xs text-orange-500 hover:text-orange-600 font-semibold px-2 py-1 rounded-lg hover:bg-orange-50 transition-all">Editar</button>
              <button onClick={() => onDelete(p.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-all">Eliminar</button>
              <button
                onClick={() => onToggle(p.id)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${p.disponible ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${p.disponible ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */

function IngredientesTab({ ingredientes, platillos, onCrear, onEliminar, guardarPlatillo }) {
  return (
    <div className="space-y-10">
      <CatalogoPanel
        titulo="Ingredientes"
        items={ingredientes}
        onCrear={onCrear}
        onEliminar={onEliminar}
        conPrecio={false}
        conCategoria={false}
      />
      <AsignacionIngredientesPanel
        items={ingredientes}
        platillos={platillos}
        guardarPlatillo={guardarPlatillo}
      />
    </div>
  );
}

function ExtrasTab({ extras, platillos, onCrear, onActualizar, onEliminar, guardarPlatillo }) {
  return (
    <div className="space-y-10">
      <CatalogoPanel
        titulo="Extras"
        items={extras}
        onCrear={onCrear}
        onActualizar={onActualizar}
        onEliminar={onEliminar}
        conPrecio={true}
        conCategoria={true}
      />
      <AsignacionPanel
        titulo="Asignar extras a platillos"
        subtitulo="Marca qué extras puede llevar cada platillo"
        items={extras}
        platillos={platillos}
        tipoKey="extras"
        guardarPlatillo={guardarPlatillo}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────── */

const CATEGORIAS_EXTRA = [
  { value: "", label: "Sin categoría" },
  { value: "bebida", label: "Bebida" },
  { value: "postre", label: "Postre" },
  { value: "complemento", label: "Complemento" },
];

function CatalogoPanel({ titulo, items, onCrear, onActualizar, onEliminar, conPrecio, conCategoria }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editPrecio, setEditPrecio] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  const handleCrear = async (e) => {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) return;
    setGuardando(true);
    try {
      await onCrear(n, precio ? Number(precio) : null, categoria || null);
      setNombre("");
      setPrecio("");
      setCategoria("");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    const singular = titulo === "Extras" ? "extra" : "ingrediente";
    if (!window.confirm(`¿Eliminar este ${singular}?`)) return;
    setEliminando(id);
    try { await onEliminar(id); }
    finally { setEliminando(null); }
  };

  const handleStartEdit = (item) => {
    setEditandoId(item.id);
    setEditPrecio(item.precio != null ? String(Number(item.precio)) : "");
    setEditCategoria(item.categoria ?? "");
  };

  const handleGuardarEdit = async (item) => {
    setGuardandoEdit(true);
    try {
      await onActualizar(item.id, {
        precio: editPrecio !== "" ? Number(editPrecio) : null,
        ...(conCategoria && { categoria: editCategoria || null }),
      });
      setEditandoId(null);
    } finally {
      setGuardandoEdit(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
        <p className="text-xs text-gray-400">{items.length} registrados</p>
      </div>

      <form onSubmit={handleCrear} className="flex gap-2 flex-wrap">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={`Nombre del ${titulo === "Extras" ? "extra" : "ingrediente"}...`}
          className="flex-1 min-w-32 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
        />
        {conPrecio && (
          <input
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="$Precio"
            type="number"
            min="0"
            step="0.50"
            className="w-24 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
          />
        )}
        {conCategoria && (
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-3 py-2.5 text-sm outline-none transition-all bg-white text-gray-600"
          >
            {CATEGORIAS_EXTRA.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        )}
        <button
          type="submit"
          disabled={guardando || !nombre.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-200 whitespace-nowrap"
        >
          {guardando ? "..." : "Agregar"}
        </button>
      </form>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-orange-100 rounded-xl px-4 py-3 hover:border-orange-200 transition-all">
            {editandoId === item.id ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 flex-1 min-w-24">{item.nombre}</span>
                {conPrecio && (
                  <input
                    value={editPrecio}
                    onChange={(e) => setEditPrecio(e.target.value)}
                    type="number"
                    min="0"
                    step="0.50"
                    placeholder="$Precio"
                    className="w-24 border border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-lg px-2 py-1 text-sm outline-none"
                    autoFocus
                  />
                )}
                {conCategoria && (
                  <select
                    value={editCategoria}
                    onChange={(e) => setEditCategoria(e.target.value)}
                    className="border border-orange-300 focus:border-orange-400 rounded-lg px-2 py-1 text-sm outline-none bg-white text-gray-600"
                  >
                    {CATEGORIAS_EXTRA.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => handleGuardarEdit(item)}
                  disabled={guardandoEdit}
                  className="text-xs text-white bg-orange-500 hover:bg-orange-600 font-semibold px-3 py-1 rounded-lg transition-all disabled:opacity-50"
                >
                  {guardandoEdit ? "..." : "Guardar"}
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-semibold px-2 py-1 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">{item.nombre}</span>
                  {item.precio != null && (
                    <span className="text-xs text-orange-500 font-semibold">${Number(item.precio).toFixed(2)}</span>
                  )}
                  {item.categoria && (
                    <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium capitalize">
                      {item.categoria}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {conPrecio && (
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="text-xs text-orange-500 hover:text-orange-600 font-semibold px-2 py-1 rounded-lg hover:bg-orange-50 transition-all"
                    >
                      Editar
                    </button>
                  )}
                  <button
                    onClick={() => handleEliminar(item.id)}
                    disabled={eliminando === item.id}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    {eliminando === item.id ? "..." : "Eliminar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No hay {titulo.toLowerCase()} registrados</p>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */

function AsignacionIngredientesPanel({ items, platillos, guardarPlatillo }) {
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);

  const handleToggleAsignado = async (platillo, ingredienteId) => {
    const key = `${platillo.id}-${ingredienteId}`;
    setSaving(key);
    const asignados = platillo.ingredientes ?? [];
    const requeridos = platillo.ingredientesRequeridos ?? [];
    const tieneAsignado = asignados.includes(ingredienteId);
    const nuevosAsignados = tieneAsignado ? asignados.filter((id) => id !== ingredienteId) : [...asignados, ingredienteId];
    const nuevosRequeridos = tieneAsignado ? requeridos.filter((id) => id !== ingredienteId) : requeridos;
    try {
      await guardarPlatillo({ ...platillo, ingredientes: nuevosAsignados, ingredientesRequeridos: nuevosRequeridos });
    } finally {
      setSaving(null);
    }
  };

  const handleToggleRequerido = async (platillo, ingredienteId) => {
    const key = `req-${platillo.id}-${ingredienteId}`;
    setSaving(key);
    const requeridos = platillo.ingredientesRequeridos ?? [];
    const esRequerido = requeridos.includes(ingredienteId);
    const nuevosRequeridos = esRequerido
      ? requeridos.filter((id) => id !== ingredienteId)
      : [...requeridos, ingredienteId];
    try {
      await guardarPlatillo({ ...platillo, ingredientesRequeridos: nuevosRequeridos });
    } finally {
      setSaving(null);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="border-t border-orange-100 pt-6">
        <h3 className="text-base font-bold text-gray-900">Asignar ingredientes a platillos</h3>
        <p className="text-xs text-gray-400 mt-0.5">Marca a qué platillos pertenece cada ingrediente · activa "Req." para que aparezca incluido por defecto</p>
      </div>

      <div className="space-y-2 max-w-xl">
        {items.map((item) => {
          const asignados = platillos.filter((p) => (p.ingredientes ?? []).includes(item.id));
          const isOpen = expanded === item.id;

          return (
            <div key={item.id} className="bg-white border border-orange-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : item.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate">{item.nombre}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${asignados.length > 0 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                    {asignados.length}/{platillos.length} platillos
                  </span>
                </div>
                <span className="text-gray-300 text-xs ml-2 shrink-0">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-3 border-t border-orange-50 space-y-2">
                  {platillos.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No hay platillos registrados</p>
                  ) : (
                    platillos.map((p) => {
                      const asignado = (p.ingredientes ?? []).includes(item.id);
                      const esRequerido = (p.ingredientesRequeridos ?? []).includes(item.id);
                      const keyAsg = `${p.id}-${item.id}`;
                      const keyReq = `req-${p.id}-${item.id}`;
                      const loadingAsg = saving === keyAsg;
                      const loadingReq = saving === keyReq;

                      return (
                        <div
                          key={p.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                            asignado ? (esRequerido ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200") : "border-gray-100 bg-white"
                          }`}
                        >
                          {/* Checkbox asignar */}
                          <label className={`flex items-center gap-2 flex-1 cursor-pointer ${loadingAsg ? "opacity-50" : ""}`}>
                            <input
                              type="checkbox"
                              checked={asignado}
                              disabled={loadingAsg || loadingReq}
                              onChange={() => handleToggleAsignado(p, item.id)}
                              className="accent-orange-500 w-4 h-4 shrink-0"
                            />
                            <span className="text-xs font-medium text-gray-700 truncate">{p.nombre}</span>
                          </label>

                          {/* Toggle requerido (solo si está asignado) */}
                          {asignado && (
                            <button
                              onClick={() => handleToggleRequerido(p, item.id)}
                              disabled={loadingReq || loadingAsg}
                              title={esRequerido ? "Quitar de requerido" : "Marcar como requerido (incluido por defecto)"}
                              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                                esRequerido
                                  ? "bg-green-500 border-green-500 text-white shadow-sm"
                                  : "border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-500 bg-white"
                              } ${loadingReq ? "opacity-50 cursor-wait" : ""}`}
                            >
                              {loadingReq ? "..." : esRequerido ? "Req. ✓" : "Req."}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */

function AsignacionPanel({ titulo, subtitulo, items, platillos, tipoKey, guardarPlatillo }) {
  const [expanded, setExpanded] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [selectingAll, setSelectingAll] = useState(null);

  const handleToggle = async (platillo, itemId) => {
    const key = `${platillo.id}-${itemId}`;
    setToggling(key);
    const actuales = platillo[tipoKey] ?? [];
    const tiene = actuales.includes(itemId);
    const nuevos = tiene ? actuales.filter((id) => id !== itemId) : [...actuales, itemId];
    try {
      await guardarPlatillo({ ...platillo, [tipoKey]: nuevos });
    } finally {
      setToggling(null);
    }
  };

  const handleSelectAll = async (itemId, todosSeleccionados) => {
    setSelectingAll(itemId);
    try {
      const pending = platillos.filter((p) => {
        const tiene = (p[tipoKey] ?? []).includes(itemId);
        return todosSeleccionados ? tiene : !tiene;
      });
      await Promise.all(
        pending.map((p) => {
          const nuevos = todosSeleccionados
            ? (p[tipoKey] ?? []).filter((id) => id !== itemId)
            : [...(p[tipoKey] ?? []), itemId];
          return guardarPlatillo({ ...p, [tipoKey]: nuevos });
        })
      );
    } finally {
      setSelectingAll(null);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="border-t border-orange-100 pt-6">
        <h3 className="text-base font-bold text-gray-900">{titulo}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>
      </div>

      <div className="space-y-2 max-w-xl">
        {items.map((item) => {
          const asignados = platillos.filter((p) => (p[tipoKey] ?? []).includes(item.id));
          const todosSeleccionados = platillos.length > 0 && asignados.length === platillos.length;
          const algunosSeleccionados = asignados.length > 0 && !todosSeleccionados;
          const isOpen = expanded === item.id;
          const loadingAll = selectingAll === item.id;

          return (
            <div key={item.id} className="bg-white border border-orange-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : item.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate">{item.nombre}</span>
                  {item.categoria && (
                    <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium capitalize shrink-0">
                      {item.categoria}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${asignados.length > 0 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                    {asignados.length}/{platillos.length} platillos
                  </span>
                </div>
                <span className="text-gray-300 text-xs ml-2 shrink-0">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-3 border-t border-orange-50 space-y-3">
                  {platillos.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No hay platillos registrados</p>
                  ) : (
                    <>
                      <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all font-semibold text-sm ${
                        todosSeleccionados ? "bg-orange-100 border-orange-400 text-orange-700" : "border-orange-200 text-orange-500 hover:bg-orange-50"
                      } ${loadingAll ? "opacity-50 cursor-wait" : ""}`}>
                        <input
                          type="checkbox"
                          checked={todosSeleccionados}
                          ref={(el) => { if (el) el.indeterminate = algunosSeleccionados; }}
                          disabled={loadingAll}
                          onChange={() => handleSelectAll(item.id, todosSeleccionados)}
                          className="accent-orange-500 w-4 h-4 shrink-0"
                        />
                        {loadingAll ? "Guardando..." : todosSeleccionados ? "Desmarcar todos" : "Marcar todos los platillos"}
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {platillos.map((p) => {
                          const asignado = (p[tipoKey] ?? []).includes(item.id);
                          const key = `${p.id}-${item.id}`;
                          return (
                            <label
                              key={p.id}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                                toggling === key || loadingAll ? "opacity-50" : ""
                              } ${asignado ? "bg-orange-50 border-orange-300 text-orange-700" : "border-gray-100 text-gray-600 hover:border-orange-200 bg-white"}`}
                            >
                              <input
                                type="checkbox"
                                checked={asignado}
                                disabled={toggling === key || loadingAll}
                                onChange={() => handleToggle(p, item.id)}
                                className="accent-orange-500 w-4 h-4 shrink-0"
                              />
                              <span className="text-xs font-medium truncate">{p.nombre}</span>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */

function EditModal({ platillo, ingredientes, extras, onSave, onClose, saving, error }) {
  const [form, setForm] = useState({
    ...platillo,
    ingredientes: platillo.ingredientes ?? [],
    ingredientesRequeridos: platillo.ingredientesRequeridos ?? [],
    extras: platillo.extras ?? [],
    precio: platillo.precio ?? "",
  });

  const toggleItem = (key, id) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id],
    }));
  };

  const toggleRequerido = (id) => {
    setForm((f) => {
      const reqs = f.ingredientesRequeridos;
      return {
        ...f,
        ingredientesRequeridos: reqs.includes(id) ? reqs.filter((x) => x !== id) : [...reqs, id],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave({
      ...form,
      precio: form.precio !== "" ? Number(form.precio) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-orange-100" style={{ background: "rgba(255,255,255,0.97)" }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">{platillo.id ? "Editar platillo" : "Nuevo platillo"}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 flex items-center justify-center transition-all text-lg">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nombre</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre del platillo"
                className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Precio</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.50"
                  className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Imagen (URL)</label>
              <input
                value={form.imagen ?? ""}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              />
              {form.imagen && (
                <img src={form.imagen} alt="preview" className="mt-2 w-full h-36 object-cover rounded-xl border border-orange-100" onError={(e) => (e.target.style.display = "none")} />
              )}
            </div>

            <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
              <div>
                <p className="text-sm font-semibold text-gray-700">Disponible</p>
                <p className="text-xs text-gray-400">Visible en el menú del cliente</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, disponible: !form.disponible })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.disponible ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.disponible ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Ingredientes con toggle requerido */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ingredientes</label>
              <div className="space-y-2">
                {ingredientes.map((item) => {
                  const asignado = form.ingredientes.includes(item.id);
                  const esRequerido = form.ingredientesRequeridos.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
                        asignado ? (esRequerido ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-300") : "bg-white border-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={asignado}
                        onChange={() => {
                          toggleItem("ingredientes", item.id);
                          if (asignado && esRequerido) toggleRequerido(item.id);
                        }}
                        className="accent-orange-500 w-4 h-4 shrink-0"
                      />
                      <span className={`text-sm font-medium flex-1 ${asignado ? (esRequerido ? "text-green-700" : "text-orange-700") : "text-gray-600"}`}>
                        {item.nombre}
                      </span>
                      {asignado && (
                        <button
                          type="button"
                          onClick={() => toggleRequerido(item.id)}
                          title={esRequerido ? "Quitar requerido" : "Marcar como requerido (incluido por defecto)"}
                          className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                            esRequerido
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-500"
                          }`}
                        >
                          {esRequerido ? "Req. ✓" : "Req."}
                        </button>
                      )}
                    </div>
                  );
                })}
                {ingredientes.length === 0 && (
                  <p className="text-xs text-gray-400 px-1">Agrega ingredientes en la pestaña "Ingredientes"</p>
                )}
              </div>
            </div>

            {/* Extras */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Extras</label>
              <div className="space-y-2">
                {extras.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      form.extras.includes(item.id) ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-gray-100 hover:border-orange-200 text-gray-600"
                    }`}
                  >
                    <input type="checkbox" checked={form.extras.includes(item.id)} onChange={() => toggleItem("extras", item.id)} className="accent-orange-500 w-4 h-4" />
                    <span className="text-sm font-medium flex-1">{item.nombre}</span>
                    {item.precio && <span className="text-xs text-orange-400 font-semibold">${Number(item.precio).toFixed(2)}</span>}
                    {item.categoria && (
                      <span className="text-xs text-blue-400 font-medium capitalize">{item.categoria}</span>
                    )}
                  </label>
                ))}
                {extras.length === 0 && (
                  <p className="text-xs text-gray-400 px-1">Agrega extras en la pestaña "Extras"</p>
                )}
              </div>
            </div>

            {error && <div className="px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">{error}</div>}

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={onClose} disabled={saving} className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2 rounded-xl transition-all shadow-md shadow-orange-200">
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */

const PERIODOS = [
  { key: "hoy",          label: "Hoy" },
  { key: "semana",       label: "Semana" },
  { key: "mes",          label: "Mes" },
  { key: "todoElTiempo", label: "Total" },
];

function ReportesTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("hoy");

  useEffect(() => {
    getResumen()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!data) return <p className="text-sm text-red-400 py-10 text-center">Error cargando reportes</p>;

  const cur = data[periodo];
  const maxCant = data.topItems[0]?.cantidad ?? 1;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Header + selector + número principal ── */}
      <div className="bg-white border border-orange-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ventas cobradas</h2>
          {data.pendientes.pedidos > 0 && (
            <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
              ${data.pendientes.total.toFixed(0)} pendiente{data.pendientes.pedidos > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Pills de período */}
        <div className="flex gap-1 mb-5">
          {PERIODOS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriodo(key)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                periodo === key
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                  : "text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Número grande */}
        <div className="flex items-end gap-4">
          <div>
            <p className="text-4xl font-bold text-gray-900">${cur.total.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">{cur.pedidos} {cur.pedidos === 1 ? "pedido cobrado" : "pedidos cobrados"}</p>
          </div>
          {cur.pedidos > 0 && (
            <p className="text-sm text-gray-400 mb-1">
              ~${(cur.total / cur.pedidos).toFixed(0)} promedio
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top ítems */}
        {data.topItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Top ítems</p>
            {data.topItems.map((item, i) => (
              <div key={item.nombre} className="bg-white border border-orange-100 rounded-xl px-4 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-300 font-bold w-3 shrink-0">{i + 1}</span>
                    <span className="text-sm font-semibold text-gray-800 truncate">{item.nombre}</span>
                  </div>
                  <div className="shrink-0 ml-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-orange-500">{item.cantidad} uds</span>
                    <span className="text-xs text-gray-400">${item.ingreso.toFixed(0)}</span>
                  </div>
                </div>
                <div className="h-1 bg-orange-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${Math.round((item.cantidad / maxCant) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cobros recientes */}
        {data.recientes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Cobros recientes</p>
            {data.recientes.map((p) => (
              <div key={p.id} className="bg-white border border-orange-100 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-300">#{p.id}</span>
                    <span className="text-sm font-semibold text-gray-800 truncate">{p.cliente}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{p.items}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-orange-500">${p.total.toFixed(0)}</p>
                  <p className="text-xs text-gray-300">
                    {new Date(p.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.topItems.length === 0 && (
        <div className="text-center py-14">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-gray-400 text-sm">Sin ventas registradas aún</p>
          <p className="text-gray-300 text-xs mt-1">Aparecerán cuando marques pedidos como pagados</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */

const STATUS_CONFIG = {
  en_espera:      { label: "En espera",      color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  en_preparacion: { label: "En preparación", color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-400"   },
  listo:          { label: "Listo",          color: "bg-green-100 text-green-700 border-green-200",    dot: "bg-green-500"  },
  cancelado:      { label: "Cancelado",      color: "bg-red-100 text-red-600 border-red-200",          dot: "bg-red-400"    },
};

const ALL_STATUSES = [
  { value: "en_espera",      label: "En espera" },
  { value: "en_preparacion", label: "En prep." },
  { value: "listo",          label: "Listo" },
];

function PedidosTab() {
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [cambiando, setCambiando] = useState(null);
  const prevCountRef = useRef(0);
  const [hayNuevos, setHayNuevos] = useState(false);

  const cargarPedidos = async (silent = false) => {
    try {
      if (!silent) setLoadingPedidos(true);
      const data = await getPedidos("en_espera,en_preparacion,listo");
      setPedidos(data);
      const enEspera = data.filter((p) => p.status === "en_espera").length;
      if (silent && enEspera > prevCountRef.current) setHayNuevos(true);
      prevCountRef.current = enEspera;
    } finally {
      if (!silent) setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(() => cargarPedidos(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCambiarStatus = async (pedido, nuevoStatus) => {
    if (pedido.status === nuevoStatus) return;
    if (nuevoStatus === "cancelado" && !window.confirm("¿Cancelar este pedido? Esta acción no se puede deshacer.")) return;
    setCambiando(pedido.id);
    try {
      const actualizado = await actualizarStatusPedido(pedido.id, nuevoStatus);
      setPedidos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
    } finally {
      setCambiando(null);
    }
  };

  const handlePagado = async (pedido) => {
    setCambiando(`pago-${pedido.id}`);
    try {
      const actualizado = await marcarPagado(pedido.id, !pedido.pagado);
      setPedidos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
    } finally {
      setCambiando(null);
    }
  };

  const enEspera      = pedidos.filter((p) => p.status === "en_espera");
  const enPreparacion = pedidos.filter((p) => p.status === "en_preparacion");
  const listos        = pedidos.filter((p) => p.status === "listo" && !p.pagado);
  const pendientesPago = pedidos.filter((p) => p.status === "listo" && !p.pagado);
  const cobrados      = pedidos.filter((p) => p.pagado).slice(-8);

  if (loadingPedidos) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Pedidos activos</h2>
          <p className="text-xs text-gray-400">Se actualiza cada 5 segundos</p>
        </div>
        {hayNuevos && (
          <button
            onClick={() => { setHayNuevos(false); cargarPedidos(); }}
            className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full animate-pulse font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Nuevos pedidos — actualizar
          </button>
        )}
      </div>

      {/* KANBAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { titulo: "En espera",       dot: "bg-yellow-400", lista: enEspera },
          { titulo: "En preparación",  dot: "bg-blue-400",   lista: enPreparacion },
          { titulo: "Listos (sin cobrar)", dot: "bg-green-500", lista: listos },
        ].map(({ titulo, dot, lista }) => (
          <div key={titulo} className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
              <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              <h3 className="text-sm font-bold text-gray-700">{titulo}</h3>
              {lista.length > 0 && <span className="ml-auto text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{lista.length}</span>}
            </div>
            {lista.length === 0 && (
              <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center">
                <p className="text-xs text-gray-300">Vacío</p>
              </div>
            )}
            {lista.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                cambiando={cambiando}
                onCambiarStatus={handleCambiarStatus}
                onPagado={handlePagado}
              />
            ))}
          </div>
        ))}
      </div>

      {/* PENDIENTES POR PAGAR */}
      {pendientesPago.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 pt-4 border-t border-orange-100">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <h3 className="text-sm font-bold text-gray-700">Pendientes por pagar</h3>
            <span className="text-xs font-semibold bg-red-100 text-red-500 border border-red-200 px-2 py-0.5 rounded-full">{pendientesPago.length}</span>
            <span className="ml-auto text-sm font-bold text-orange-500">
              Total: ${pendientesPago.reduce((s, p) => s + Number(p.total), 0).toFixed(0)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendientesPago.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                cambiando={cambiando}
                onCambiarStatus={handleCambiarStatus}
                onPagado={handlePagado}
                resaltarPago
              />
            ))}
          </div>
        </div>
      )}

      {/* COBRADOS HOY */}
      {cobrados.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 pt-4 border-t border-orange-100">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <h3 className="text-sm font-bold text-gray-400">Cobrados recientes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cobrados.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                cambiando={cambiando}
                onCambiarStatus={handleCambiarStatus}
                onPagado={handlePagado}
                dimmed
              />
            ))}
          </div>
        </div>
      )}

      {pedidos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🍳</p>
          <p className="text-gray-400 text-sm">Sin pedidos activos por ahora</p>
        </div>
      )}
    </div>
  );
}

function PedidoCard({ pedido, cambiando, onCambiarStatus, onPagado, dimmed, resaltarPago }) {
  const cfg = STATUS_CONFIG[pedido.status] ?? STATUS_CONFIG.en_espera;
  const hora = new Date(pedido.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const loadingStatus = cambiando === pedido.id;
  const loadingPago   = cambiando === `pago-${pedido.id}`;

  return (
    <div className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${dimmed ? "opacity-50" : "hover:shadow-md"} ${resaltarPago ? "border-red-200" : "border-orange-100 hover:border-orange-200"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 font-medium">#{pedido.id} · {hora}</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">{pedido.cliente?.nombre ?? "Cliente"}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
      </div>

      <div className="space-y-1.5 mb-3">
        {pedido.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xs text-gray-300 mt-0.5 shrink-0">·</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-700">{item.nombre}</span>
              {Array.isArray(item.ingredientes) && item.ingredientes.length > 0 && (
                <p className="text-xs text-gray-400 truncate">{item.ingredientes.map((i) => i.nombre).join(", ")}</p>
              )}
              {Array.isArray(item.extras) && item.extras.length > 0 && (
                <p className="text-xs text-orange-400 truncate">+ {item.extras.map((e) => e.nombre).join(", ")}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {pedido.nota && (
        <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-1.5 mb-3 italic">"{pedido.nota}"</p>
      )}

      {/* Status libre */}
      {!dimmed && pedido.status !== "cancelado" && (
        <div className="mb-3 space-y-1.5">
          <div className="flex gap-1">
            {ALL_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => onCambiarStatus(pedido, s.value)}
                disabled={loadingStatus || pedido.status === s.value}
                className={`flex-1 text-xs py-1 rounded-full border font-medium transition-all ${
                  pedido.status === s.value
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500"
                } disabled:cursor-not-allowed`}
              >
                {loadingStatus && pedido.status !== s.value ? "" : s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => onCambiarStatus(pedido, "cancelado")}
            disabled={loadingStatus}
            className="w-full text-xs py-1 rounded-full border border-gray-100 text-gray-300 hover:border-red-300 hover:text-red-400 transition-all disabled:opacity-50"
          >
            Cancelar pedido
          </button>
        </div>
      )}
      {pedido.status === "cancelado" && (
        <div className="mb-3 text-center">
          <span className="text-xs font-semibold text-red-400 bg-red-50 border border-red-100 px-3 py-1 rounded-full">Cancelado</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-orange-50">
        <p className="text-sm font-bold text-orange-500">${Number(pedido.total).toFixed(0)}</p>
        <button
          onClick={() => onPagado(pedido)}
          disabled={loadingPago}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
            pedido.pagado
              ? "bg-green-500 border-green-500 text-white"
              : resaltarPago
                ? "bg-red-50 border-red-300 text-red-500 hover:bg-red-500 hover:text-white"
                : "border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-600"
          } disabled:opacity-50`}
        >
          {loadingPago ? "..." : pedido.pagado ? "✓ Pagado" : "Marcar pagado"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */

function UsuariosTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "crear" | { id, nombre, correo, rol, activo }
  const [resetModal, setResetModal] = useState(null); // null | { id, nombre }
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUsuarios().then(setUsuarios).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCrear = async (form) => {
    setGuardando(true);
    setError(null);
    try {
      const nuevo = await crearUsuario(form);
      setUsuarios((prev) => [...prev, nuevo]);
      setModal(null);
    } catch (err) {
      setError(err.message || "Error al crear usuario");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (u) => {
    try {
      const actualizado = await actualizarUsuario(u.id, { activo: !u.activo });
      setUsuarios((prev) => prev.map((x) => (x.id === actualizado.id ? actualizado : x)));
    } catch { /* silencioso */ }
  };

  const handleReset = async (id, contrasena) => {
    setGuardando(true);
    setError(null);
    try {
      await resetPassword(id, contrasena);
      setResetModal(null);
    } catch (err) {
      setError(err.message || "Error al resetear contraseña");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Usuarios</h2>
          <p className="text-xs text-gray-400">{usuarios.length} registrados · Solo tú puedes crear cuentas</p>
        </div>
        <button
          onClick={() => { setError(null); setModal("crear"); }}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-200 flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> Nuevo usuario
        </button>
      </div>

      <div className="space-y-2">
        {usuarios.map((u) => (
          <div key={u.id} className={`bg-white border border-orange-100 rounded-xl p-4 flex items-center justify-between gap-3 transition-all ${!u.activo ? "opacity-50" : ""}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{u.nombre}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.rol === "admin" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                  {u.rol}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{u.correo}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setError(null); setResetModal({ id: u.id, nombre: u.nombre }); }}
                className="text-xs text-orange-500 hover:text-orange-600 font-semibold px-2 py-1 rounded-lg hover:bg-orange-50 transition-all"
              >
                Reset contraseña
              </button>
              <button
                onClick={() => handleToggleActivo(u)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${u.activo ? "bg-orange-500" : "bg-gray-200"}`}
                title={u.activo ? "Desactivar" : "Activar"}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${u.activo ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal crear usuario */}
      {modal === "crear" && (
        <UsuarioModal
          onSave={handleCrear}
          onClose={() => setModal(null)}
          guardando={guardando}
          error={error}
        />
      )}

      {/* Modal reset contraseña */}
      {resetModal && (
        <ResetPasswordModal
          usuario={resetModal}
          onSave={(pwd) => handleReset(resetModal.id, pwd)}
          onClose={() => setResetModal(null)}
          guardando={guardando}
          error={error}
        />
      )}
    </div>
  );
}

function UsuarioModal({ onSave, onClose, guardando, error }) {
  const [form, setForm] = useState({ nombre: "", correo: "", contrasena: "", rol: "cliente" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl border border-orange-100 bg-white p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-gray-900">Nuevo usuario</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 flex items-center justify-center text-lg">×</button>
        </div>
        <div className="space-y-3">
          {[
            { key: "nombre",     label: "Nombre completo",    type: "text",     placeholder: "Carlos Romero" },
            { key: "correo",     label: "Correo",             type: "email",    placeholder: "carlos@odella.com" },
            { key: "contrasena", label: "Contraseña inicial", type: "password", placeholder: "Mínimo 6 caracteres" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Rol</label>
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="w-full border border-gray-200 focus:border-orange-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white"
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} disabled={guardando} className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button
              onClick={() => onSave(form)}
              disabled={guardando || !form.nombre || !form.correo || !form.contrasena}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-md shadow-orange-200"
            >
              {guardando ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ usuario, onSave, onClose, guardando, error }) {
  const [pwd, setPwd] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl border border-orange-100 bg-white p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Resetear contraseña</h2>
            <p className="text-xs text-gray-400 mt-0.5">{usuario.nombre}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 flex items-center justify-center text-lg">×</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Nueva contraseña temporal"
              className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            />
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} disabled={guardando} className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button
              onClick={() => onSave(pwd)}
              disabled={guardando || !pwd}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-md shadow-orange-200"
            >
              {guardando ? "Guardando..." : "Resetear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
