import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useProducts } from "../context/ProductsContext";
import { getPedidos, actualizarStatusPedido, marcarPagado, getCocinaEstado, setCocinaEstado, getResumen, actualizarNota, eliminarItemPedido } from "../services/pedidosService";
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, resetPassword } from "../services/usuariosService";

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const { dark, toggle: toggleTheme } = useTheme();
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
  const actualizarIngrediente = ctx?.actualizarIngrediente ?? (async () => {});
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
  const [pendientesCobro, setPendientesCobro] = useState(0);

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
    setEditModal({ id: null, nombre: "", descripcion: "", disponible: true, imagen: "", precio: "", ingredientesGratis: 1, ingredientes: [], ingredientesRequeridos: [], extras: [] });
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
    try { await eliminarPlatillo(id); }
    catch { /* silencioso */ }
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
    <div className="min-h-screen page-bg">

      {/* HEADER */}
      <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b border-orange-100 header-bg">
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
          <button
            onClick={toggleTheme}
            title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
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
          <button onClick={logout} className="text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-full transition-all shadow-sm shadow-orange-200">
            Salir
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="px-6 border-b border-orange-100 tabs-bg">
        <nav className="flex gap-1 max-w-6xl mx-auto">
          {["pedidos", "reportes", "platillos", "ingredientes", "extras", "usuarios"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium border-b-2 capitalize transition-all ${
                activeTab === tab ? "border-orange-500 text-orange-500" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="relative inline-flex items-center gap-1.5">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "pedidos" && pendientesCobro > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {pendientesCobro}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENIDO */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {activeTab === "pedidos" && (
          <PedidosTab onPendientesChange={setPendientesCobro} />
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
            onActualizar={actualizarIngrediente}
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
  const [busqueda, setBusqueda] = useState("");
  const [filtroDisp, setFiltroDisp] = useState("todos");
  const [confirmandoDeleteId, setConfirmandoDeleteId] = useState(null);

  const filtrados = platillos
    .filter((p) => filtroDisp === "disponibles" ? p.disponible : filtroDisp === "no_disponibles" ? !p.disponible : true)
    .filter((p) => !busqueda.trim() || p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .sort((a, b) => (a.disponible === b.disponible ? 0 : a.disponible ? -1 : 1));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Platillos</h2>
          <p className="text-xs text-gray-400">{filtrados.length}/{platillos.length} registrados</p>
        </div>
        <button onClick={onAdd} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-200 flex items-center gap-1.5">
          <span className="text-lg leading-none">+</span> Agregar platillo
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar platillo..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl outline-none transition-all bg-white" />
          {busqueda && <button onClick={() => setBusqueda("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>}
        </div>
        <div className="flex gap-1 shrink-0">
          {[{ k: "todos", l: "Todos" }, { k: "disponibles", l: "Disp." }, { k: "no_disponibles", l: "No disp." }].map(({ k, l }) => (
            <button key={k} onClick={() => setFiltroDisp(k)} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${filtroDisp === k ? "bg-orange-500 text-white shadow-sm" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtrados.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-8">Sin resultados</p>}
        {filtrados.map((p) => (
          <div
            key={p.id}
            className={`group bg-white border rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100 ${
              p.disponible ? "border-orange-100 hover:border-orange-300" : "border-gray-100 opacity-60 hover:opacity-90"
            }`}
          >
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Ícono imagen */}
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg,#fef3e8,#fde8d0)" }}>
                  {p.imagen ? (
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                  ) : null}
                  <div className={`w-full h-full items-center justify-center text-lg font-bold text-orange-300 ${p.imagen ? "hidden" : "flex"}`}>
                    {p.nombre.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{p.nombre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`text-xs font-medium ${p.disponible ? "text-green-600" : "text-red-400"}`}>
                      {p.disponible ? "Disponible" : "No disp."}
                    </p>
                    {p.precio && <span className="text-xs font-bold text-orange-500">${Number(p.precio).toFixed(0)}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => onEdit(p)} className="text-xs text-orange-500 hover:text-orange-600 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-all">Editar</button>
                {confirmandoDeleteId === p.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setConfirmandoDeleteId(null); onDelete(p.id); }} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg transition-all">Sí</button>
                    <button onClick={() => setConfirmandoDeleteId(null)} className="text-xs text-gray-400 hover:text-gray-600 font-semibold px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-all">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmandoDeleteId(p.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all">Eliminar</button>
                )}
                <button
                  onClick={() => onToggle(p.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 shadow-inner ${p.disponible ? "bg-orange-500" : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${p.disponible ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */

function IngredientesTab({ ingredientes, platillos, onCrear, onActualizar, onEliminar, guardarPlatillo }) {
  return (
    <div className="space-y-10">
      <CatalogoPanel
        titulo="Ingredientes"
        items={ingredientes}
        onCrear={onCrear}
        onActualizar={onActualizar}
        onEliminar={onEliminar}
        conPrecio={true}
        conCategoria={true}
        categoriaLibre={true}
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
        conTamanos={true}
        conSabores={true}
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

function CatalogoPanel({ titulo, items, onCrear, onActualizar, onEliminar, conPrecio, conCategoria, categoriaLibre = false, conTamanos = false, conSabores = false }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagen, setImagen] = useState("");
  const [tamanos, setTamanos] = useState([]);
  const [newTamanoNombre, setNewTamanoNombre] = useState("");
  const [newTamanoPrecio, setNewTamanoPrecio] = useState("");
  const [sabores, setSabores] = useState([]);
  const [newSabor, setNewSabor] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editPrecio, setEditPrecio] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [editImagen, setEditImagen] = useState("");
  const [editTamanos, setEditTamanos] = useState([]);
  const [editNewTamanoNombre, setEditNewTamanoNombre] = useState("");
  const [editNewTamanoPrecio, setEditNewTamanoPrecio] = useState("");
  const [editSabores, setEditSabores] = useState([]);
  const [editNewSabor, setEditNewSabor] = useState("");
  const [guardandoEdit, setGuardandoEdit] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroDisponible, setFiltroDisponible] = useState("todos");
  const [apiError, setApiError] = useState(null);

  const filtrados = items
    .filter((i) => !filtroCategoria || i.categoria === filtroCategoria)
    .filter((i) => filtroDisponible === "todos" || (filtroDisponible === "si" ? i.disponible : !i.disponible))
    .filter((i) => !busqueda.trim() || i.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));

  const categoriasPresentes = conCategoria
    ? [...new Set(items.map((i) => i.categoria).filter(Boolean))]
    : [];

  const handleCrear = async (e) => {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) return;
    setGuardando(true);
    setApiError(null);
    try {
      await onCrear(n, precio ? Number(precio) : null, categoria || null, imagen.trim() || null, tamanos, sabores);
      setNombre("");
      setPrecio("");
      setCategoria("");
      setImagen("");
      setTamanos([]);
      setSabores([]);
      setNewTamanoNombre("");
      setNewTamanoPrecio("");
      setNewSabor("");
    } catch (err) {
      setApiError(err.message || "Error al agregar");
    } finally {
      setGuardando(false);
    }
  };

  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState(null);

  const handleEliminar = async (id) => {
    setEliminando(id);
    setConfirmandoEliminarId(null);
    try { await onEliminar(id); }
    catch (err) { setApiError(err.message || "Error al eliminar"); }
    finally { setEliminando(null); }
  };

  const handleToggleDisponible = async (item) => {
    setToggling(item.id);
    try { await onActualizar(item.id, { disponible: !item.disponible }); }
    catch (err) { setApiError(err.message || "Error al actualizar"); }
    finally { setToggling(null); }
  };

  const [editNombre, setEditNombre] = useState("");

  const handleStartEdit = (item) => {
    setEditandoId(item.id);
    setEditNombre(item.nombre);
    setEditPrecio(item.precio != null ? String(Number(item.precio)) : "");
    setEditCategoria(item.categoria ?? "");
    setEditImagen(item.imagen ?? "");
    setEditTamanos(Array.isArray(item.tamanos) ? item.tamanos : []);
    setEditSabores(Array.isArray(item.sabores) ? item.sabores : []);
    setEditNewTamanoNombre("");
    setEditNewTamanoPrecio("");
    setEditNewSabor("");
  };

  const handleGuardarEdit = async (item) => {
    if (!editNombre.trim()) return;
    setGuardandoEdit(true);
    setApiError(null);
    try {
      await onActualizar(item.id, {
        nombre: editNombre.trim(),
        ...(conPrecio    && { precio: editPrecio !== "" ? Number(editPrecio) : null }),
        ...(conCategoria && { categoria: editCategoria || null }),
        imagen: editImagen.trim() || null,
        ...(conTamanos   && { tamanos: editTamanos }),
        ...(conSabores   && { sabores: editSabores }),
      });
      setEditandoId(null);
    } catch (err) {
      setApiError(err.message || "Error al guardar");
    } finally {
      setGuardandoEdit(false);
    }
  };

  const addTamano = (list, setList, nomState, setNom, precState, setPrec) => {
    const n = nomState.trim();
    if (!n || !precState) return;
    setList((prev) => [...prev, { nombre: n, precio: Number(precState) }]);
    setNom("");
    setPrec("");
  };

  const addSabor = (list, setList, sabState, setSab) => {
    const s = sabState.trim();
    if (!s) return;
    setList((prev) => [...prev, s]);
    setSab("");
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
        <p className="text-xs text-gray-400">{filtrados.length}/{items.length} registrados</p>
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
        {conCategoria && !categoriaLibre && (
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
        {conCategoria && categoriaLibre && (
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Categoría (ej: Carnes)"
            className="w-36 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
          />
        )}
        <input
          value={imagen}
          onChange={(e) => setImagen(e.target.value)}
          placeholder="URL imagen (opcional)"
          className="flex-1 min-w-40 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
        />
        <button
          type="submit"
          disabled={guardando || !nombre.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-200 whitespace-nowrap"
        >
          {guardando ? "..." : "Agregar"}
        </button>
      </form>

      {/* Tamaños en formulario de creación */}
      {conTamanos && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tamaños (opcional)</p>
          <div className="flex gap-2 flex-wrap">
            <input value={newTamanoNombre} onChange={(e) => setNewTamanoNombre(e.target.value)} placeholder="Ej: Chico" className="flex-1 min-w-24 border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 rounded-lg px-3 py-1.5 text-sm outline-none" />
            <input value={newTamanoPrecio} onChange={(e) => setNewTamanoPrecio(e.target.value)} placeholder="$Precio" type="number" min="0" step="0.50" className="w-24 border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 rounded-lg px-3 py-1.5 text-sm outline-none" />
            <button type="button" onClick={() => addTamano(tamanos, setTamanos, newTamanoNombre, setNewTamanoNombre, newTamanoPrecio, setNewTamanoPrecio)} disabled={!newTamanoNombre.trim() || !newTamanoPrecio} className="text-xs font-semibold text-orange-500 border border-orange-300 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40">+ Agregar</button>
          </div>
          {tamanos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tamanos.map((t, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                  {t.nombre} ${t.precio}
                  <button type="button" onClick={() => setTamanos((prev) => prev.filter((_, j) => j !== i))} className="text-orange-400 hover:text-red-500 ml-0.5 leading-none">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sabores en formulario de creación */}
      {conSabores && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sabores (opcional)</p>
          <div className="flex gap-2">
            <input value={newSabor} onChange={(e) => setNewSabor(e.target.value)} placeholder="Ej: Vainilla" className="flex-1 border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 rounded-lg px-3 py-1.5 text-sm outline-none" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSabor(sabores, setSabores, newSabor, setNewSabor); } }} />
            <button type="button" onClick={() => addSabor(sabores, setSabores, newSabor, setNewSabor)} disabled={!newSabor.trim()} className="text-xs font-semibold text-orange-500 border border-orange-300 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40">+ Agregar</button>
          </div>
          {sabores.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sabores.map((s, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                  {s}
                  <button type="button" onClick={() => setSabores((prev) => prev.filter((_, j) => j !== i))} className="text-purple-400 hover:text-red-500 ml-0.5 leading-none">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {apiError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{apiError}</p>
      )}

      {/* Buscador + filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder={`Buscar ${titulo === "Extras" ? "extra" : "ingrediente"}...`} className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl outline-none transition-all bg-white" />
          {busqueda && <button onClick={() => setBusqueda("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>}
        </div>
        <div className="flex gap-1">
          {[{ v: "todos", l: "Todos" }, { v: "si", l: "Activos" }, { v: "no", l: "Inactivos" }].map(({ v, l }) => (
            <button key={v} onClick={() => setFiltroDisponible(v)} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${filtroDisponible === v ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>{l}</button>
          ))}
        </div>
        {conCategoria && categoriasPresentes.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setFiltroCategoria("")} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${filtroCategoria === "" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>Todas</button>
            {categoriasPresentes.map((cat) => (
              <button key={cat} onClick={() => setFiltroCategoria(filtroCategoria === cat ? "" : cat)} className={`px-3 py-2 text-xs font-semibold rounded-xl capitalize transition-all ${filtroCategoria === cat ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>{cat}</button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 && items.length > 0 && <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>}
        {filtrados.map((item) => (
          <div key={item.id} className={`bg-white border rounded-xl px-4 py-3 transition-all ${item.disponible ? "border-orange-100 hover:border-orange-200" : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"}`}>
            {editandoId === item.id ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="flex-1 min-w-28 border border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-lg px-2 py-1 text-sm outline-none"
                    autoFocus
                  />
                  {conPrecio && (
                    <input
                      value={editPrecio}
                      onChange={(e) => setEditPrecio(e.target.value)}
                      type="number"
                      min="0"
                      step="0.50"
                      placeholder="$Precio"
                      className="w-24 border border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-lg px-2 py-1 text-sm outline-none"
                    />
                  )}
                  {conCategoria && !categoriaLibre && (
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
                  {conCategoria && categoriaLibre && (
                    <input
                      value={editCategoria}
                      onChange={(e) => setEditCategoria(e.target.value)}
                      placeholder="Categoría"
                      className="w-32 border border-orange-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 rounded-lg px-2 py-1 text-sm outline-none"
                    />
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
                <div className="flex items-center gap-2">
                  <input
                    value={editImagen}
                    onChange={(e) => setEditImagen(e.target.value)}
                    placeholder="URL imagen (opcional)"
                    className="flex-1 border border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-lg px-2 py-1 text-sm outline-none"
                  />
                  {editImagen && (
                    <img src={editImagen} alt="preview" className="w-8 h-8 rounded-lg object-cover border border-orange-200 shrink-0" onError={(e) => (e.target.style.display = "none")} />
                  )}
                </div>

                {/* Tamaños en modo edición */}
                {conTamanos && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tamaños</p>
                    <div className="flex gap-2 flex-wrap">
                      <input value={editNewTamanoNombre} onChange={(e) => setEditNewTamanoNombre(e.target.value)} placeholder="Ej: Grande" className="flex-1 min-w-20 border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 rounded-lg px-2 py-1 text-xs outline-none" />
                      <input value={editNewTamanoPrecio} onChange={(e) => setEditNewTamanoPrecio(e.target.value)} placeholder="$" type="number" min="0" step="0.50" className="w-20 border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 rounded-lg px-2 py-1 text-xs outline-none" />
                      <button type="button" onClick={() => addTamano(editTamanos, setEditTamanos, editNewTamanoNombre, setEditNewTamanoNombre, editNewTamanoPrecio, setEditNewTamanoPrecio)} disabled={!editNewTamanoNombre.trim() || !editNewTamanoPrecio} className="text-xs font-semibold text-orange-500 border border-orange-300 hover:bg-orange-50 px-2.5 py-1 rounded-lg transition-all disabled:opacity-40">+</button>
                    </div>
                    {editTamanos.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {editTamanos.map((t, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                            {t.nombre} ${t.precio}
                            <button type="button" onClick={() => setEditTamanos((prev) => prev.filter((_, j) => j !== i))} className="text-orange-400 hover:text-red-500 leading-none">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sabores en modo edición */}
                {conSabores && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sabores</p>
                    <div className="flex gap-2">
                      <input value={editNewSabor} onChange={(e) => setEditNewSabor(e.target.value)} placeholder="Ej: Chocolate" className="flex-1 border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 rounded-lg px-2 py-1 text-xs outline-none" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSabor(editSabores, setEditSabores, editNewSabor, setEditNewSabor); } }} />
                      <button type="button" onClick={() => addSabor(editSabores, setEditSabores, editNewSabor, setEditNewSabor)} disabled={!editNewSabor.trim()} className="text-xs font-semibold text-orange-500 border border-orange-300 hover:bg-orange-50 px-2.5 py-1 rounded-lg transition-all disabled:opacity-40">+</button>
                    </div>
                    {editSabores.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {editSabores.map((s, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                            {s}
                            <button type="button" onClick={() => setEditSabores((prev) => prev.filter((_, j) => j !== i))} className="text-purple-400 hover:text-red-500 leading-none">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  {item.imagen && (
                    <img src={item.imagen} alt={item.nombre} className="w-7 h-7 rounded-lg object-cover border border-orange-100 shrink-0" onError={(e) => (e.target.style.display = "none")} />
                  )}
                  <span className="text-sm font-medium text-gray-700">{item.nombre}</span>
                  {item.precio != null && (
                    <span className="text-xs text-orange-500 font-semibold">${Number(item.precio).toFixed(2)}</span>
                  )}
                  {item.categoria && (
                    <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium capitalize">
                      {item.categoria}
                    </span>
                  )}
                  {Array.isArray(item.tamanos) && item.tamanos.length > 0 && (
                    <span className="text-xs text-orange-400 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                      {item.tamanos.length} tamaño{item.tamanos.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {Array.isArray(item.sabores) && item.sabores.length > 0 && (
                    <span className="text-xs text-purple-500 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full font-medium">
                      {item.sabores.length} sabor{item.sabores.length !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleDisponible(item)}
                    disabled={toggling === item.id}
                    title={item.disponible ? "Deshabilitar" : "Habilitar"}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all disabled:opacity-50 ${
                      item.disponible
                        ? "bg-green-50 border-green-200 text-green-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                        : "bg-gray-100 border-gray-200 text-gray-400 hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                    }`}
                  >
                    {toggling === item.id ? "…" : item.disponible ? "Activo" : "Inactivo"}
                  </button>
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="text-xs text-orange-500 hover:text-orange-600 font-semibold px-2 py-1 rounded-lg hover:bg-orange-50 transition-all"
                  >
                    Editar
                  </button>
                  {confirmandoEliminarId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEliminar(item.id)} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-all">Sí</button>
                      <button onClick={() => setConfirmandoEliminarId(null)} className="text-xs text-gray-400 hover:text-gray-600 font-semibold px-2 py-1 rounded-lg hover:bg-gray-100 transition-all">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmandoEliminarId(item.id)}
                      disabled={eliminando === item.id}
                      className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      {eliminando === item.id ? "..." : "Eliminar"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No hay {titulo.toLowerCase()} registrados aún</p>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */

function AsignacionIngredientesPanel({ items, platillos, guardarPlatillo }) {
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const handleToggleAsignado = async (platillo, ingredienteId) => {
    const key = `${platillo.id}-${ingredienteId}`;
    setSaving(key);
    setSaveError(null);
    const asignados = platillo.ingredientes ?? [];
    const requeridos = platillo.ingredientesRequeridos ?? [];
    const tieneAsignado = asignados.includes(ingredienteId);
    const nuevosAsignados = tieneAsignado ? asignados.filter((id) => id !== ingredienteId) : [...asignados, ingredienteId];
    const nuevosRequeridos = tieneAsignado ? requeridos.filter((id) => id !== ingredienteId) : requeridos;
    try {
      await guardarPlatillo({ ...platillo, ingredientes: nuevosAsignados, ingredientesRequeridos: nuevosRequeridos });
    } catch (err) {
      setSaveError(err.message || "Error al guardar");
    } finally {
      setSaving(null);
    }
  };

  const handleToggleRequerido = async (platillo, ingredienteId) => {
    const key = `req-${platillo.id}-${ingredienteId}`;
    setSaving(key);
    setSaveError(null);
    const requeridos = platillo.ingredientesRequeridos ?? [];
    const esRequerido = requeridos.includes(ingredienteId);
    const nuevosRequeridos = esRequerido
      ? requeridos.filter((id) => id !== ingredienteId)
      : [...requeridos, ingredienteId];
    try {
      await guardarPlatillo({ ...platillo, ingredientesRequeridos: nuevosRequeridos });
    } catch (err) {
      setSaveError(err.message || "Error al guardar");
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
        {saveError && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl mt-2">{saveError}</p>}
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
  const [saveError, setSaveError] = useState(null);

  const handleToggle = async (platillo, itemId) => {
    const key = `${platillo.id}-${itemId}`;
    setToggling(key);
    setSaveError(null);
    const actuales = platillo[tipoKey] ?? [];
    const tiene = actuales.includes(itemId);
    const nuevos = tiene ? actuales.filter((id) => id !== itemId) : [...actuales, itemId];
    try {
      await guardarPlatillo({ ...platillo, [tipoKey]: nuevos });
    } catch (err) {
      setSaveError(err.message || "Error al guardar");
    } finally {
      setToggling(null);
    }
  };

  const handleSelectAll = async (itemId, todosSeleccionados) => {
    setSelectingAll(itemId);
    setSaveError(null);
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
    } catch (err) {
      setSaveError(err.message || "Error al guardar");
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
        {saveError && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl mt-2">{saveError}</p>}
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
    ingredientesGratis: platillo.ingredientesGratis ?? 1,
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
      ingredientesGratis: Number(form.ingredientesGratis) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-orange-100 modal-bg">
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
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Descripción <span className="normal-case font-normal text-gray-300">(opcional)</span></label>
              <textarea
                value={form.descripcion ?? ""}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Breve descripción del platillo..."
                rows={2}
                className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all resize-none"
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
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Ingredientes opcionales gratis
              </label>
              <div className="flex items-center gap-3">
                <input
                  value={form.ingredientesGratis}
                  onChange={(e) => setForm({ ...form, ingredientesGratis: e.target.value })}
                  type="number"
                  min="0"
                  step="1"
                  className="w-24 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
                <p className="text-xs text-gray-400">
                  {Number(form.ingredientesGratis) === 0
                    ? "Todos tienen costo desde el primero"
                    : Number(form.ingredientesGratis) === 1
                    ? "El primero es gratis, los demás tienen costo"
                    : `Los primeros ${form.ingredientesGratis} son gratis`}
                </p>
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

            {/* Ingredientes con toggle requerido, agrupados por categoría */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ingredientes</label>
              {ingredientes.length === 0 ? (
                <p className="text-xs text-gray-400 px-1">Agrega ingredientes en la pestaña "Ingredientes"</p>
              ) : (() => {
                const sinCategoria = ingredientes.filter((i) => !i.categoria);
                const categorias = [...new Set(ingredientes.filter((i) => i.categoria).map((i) => i.categoria))];
                const grupos = [
                  ...categorias.map((cat) => ({ label: cat, items: ingredientes.filter((i) => i.categoria === cat) })),
                  ...(sinCategoria.length > 0 ? [{ label: null, items: sinCategoria }] : []),
                ];
                return (
                  <div className="space-y-3">
                    {grupos.map((grupo) => (
                      <details key={grupo.label ?? "__sin__"} open className="group">
                        {grupo.label && (
                          <summary className="flex items-center gap-2 cursor-pointer list-none mb-1.5 select-none">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{grupo.label}</span>
                            <span className="text-gray-300 text-xs group-open:rotate-90 transition-transform">▶</span>
                          </summary>
                        )}
                        <div className="space-y-1.5">
                          {grupo.items.map((item) => {
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
                        </div>
                      </details>
                    ))}
                  </div>
                );
              })()}
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
  en_espera:      { label: "En espera",      color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400"  },
  en_preparacion: { label: "En preparación", color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-400"    },
  listo:          { label: "Listo",          color: "bg-green-100 text-green-700 border-green-200",    dot: "bg-green-500"   },
  cancelado:      { label: "Cancelado",      color: "bg-red-100 text-red-600 border-red-200",          dot: "bg-red-400"     },
  en_revision:    { label: "En revisión",    color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500"  },
};

const ALL_STATUSES = [
  { value: "en_espera",      label: "En espera" },
  { value: "en_preparacion", label: "En prep." },
  { value: "listo",          label: "Listo" },
  { value: "en_revision",    label: "Revisión" },
];

function PedidosTab({ onPendientesChange }) {
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [cambiando, setCambiando] = useState(null);
  const prevCountRef = useRef(0);
  const [hayNuevos, setHayNuevos] = useState(false);

  const cargarPedidos = async (silent = false) => {
    try {
      if (!silent) setLoadingPedidos(true);
      const data = await getPedidos("en_espera,en_preparacion,listo,en_revision");
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

  const handleActualizarNota = async (pedidoId, nota) => {
    const actualizado = await actualizarNota(pedidoId, nota);
    setPedidos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
  };

  const handleEliminarItem = async (pedidoId, itemId) => {
    const actualizado = await eliminarItemPedido(pedidoId, itemId);
    setPedidos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
  };

  const [busquedaPedidos, setBusquedaPedidos] = useState("");
  const matchPedido = (p) => !busquedaPedidos.trim() ||
    (p.cliente?.nombre ?? "").toLowerCase().includes(busquedaPedidos.trim().toLowerCase()) ||
    String(p.id).includes(busquedaPedidos.trim());

  const enEspera       = pedidos.filter((p) => p.status === "en_espera"       && matchPedido(p));
  const enPreparacion  = pedidos.filter((p) => p.status === "en_preparacion"  && matchPedido(p));
  const listos         = pedidos.filter((p) => p.status === "listo" && !p.pagado && matchPedido(p));
  const enRevision     = pedidos.filter((p) => p.status === "en_revision"     && matchPedido(p));
  const pendientesPago = pedidos.filter((p) => p.status === "listo" && !p.pagado && matchPedido(p));
  const hoy = new Date().toDateString();
  const cobrados       = pedidos.filter((p) => p.pagado && matchPedido(p) && new Date(p.createdAt).toDateString() === hoy).slice(-8);

  const totalPendientesCobro = pedidos.filter((p) => p.status === "listo" && !p.pagado).length;
  useEffect(() => { onPendientesChange?.(totalPendientesCobro); }, [totalPendientesCobro]);

  if (loadingPedidos) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">

      {/* ── Alerta pagos pendientes ── */}
      {totalPendientesCobro > 0 && (
        <div className="flex items-center justify-between gap-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">
                {totalPendientesCobro} pedido{totalPendientesCobro !== 1 ? "s" : ""} sin cobrar
              </p>
              <p className="text-xs text-red-400">
                Total: ${pedidos.filter((p) => p.status === "listo" && !p.pagado).reduce((s, p) => s + Number(p.total), 0).toFixed(0)}
              </p>
            </div>
          </div>
          <span className="text-xl font-bold text-red-600">
            ${pedidos.filter((p) => p.status === "listo" && !p.pagado).reduce((s, p) => s + Number(p.total), 0).toFixed(0)}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Pedidos activos</h2>
          <p className="text-xs text-gray-400">Se actualiza cada 5 segundos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
            <input value={busquedaPedidos} onChange={(e) => setBusquedaPedidos(e.target.value)} placeholder="Buscar cliente o #id..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl outline-none transition-all bg-white w-52" />
            {busquedaPedidos && <button onClick={() => setBusquedaPedidos("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>}
          </div>
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

      {/* EN REVISIÓN — esperando respuesta del cliente */}
      {enRevision.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-purple-100">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <h3 className="text-sm font-bold text-purple-700">En revisión — esperando al cliente</h3>
            <span className="text-xs font-semibold bg-purple-100 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full">{enRevision.length}</span>
            <span className="text-xs text-purple-400 ml-1">El cliente puede modificar o cancelar su pedido</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enRevision.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                cambiando={cambiando}
                onCambiarStatus={handleCambiarStatus}
                onPagado={handlePagado}
                onActualizarNota={handleActualizarNota}
                onEliminarItem={handleEliminarItem}
              />
            ))}
          </div>
        </div>
      )}

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
                onActualizarNota={handleActualizarNota}
                onEliminarItem={handleEliminarItem}
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
                onActualizarNota={handleActualizarNota}
                onEliminarItem={handleEliminarItem}
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
                onActualizarNota={handleActualizarNota}
                onEliminarItem={handleEliminarItem}
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

function PedidoCard({ pedido, cambiando, onCambiarStatus, onPagado, onActualizarNota, onEliminarItem, dimmed, resaltarPago }) {
  const cfg = STATUS_CONFIG[pedido.status] ?? STATUS_CONFIG.en_espera;
  const hora = new Date(pedido.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const loadingStatus = cambiando === pedido.id;
  const loadingPago   = cambiando === `pago-${pedido.id}`;

  const [notaEditando, setNotaEditando] = useState(false);
  const [notaEdit, setNotaEdit] = useState(pedido.nota ?? "");
  const [notaGuardando, setNotaGuardando] = useState(false);
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);

  useEffect(() => {
    if (!notaEditando) setNotaEdit(pedido.nota ?? "");
  }, [pedido.nota, notaEditando]);

  const handleGuardarNota = async () => {
    setNotaGuardando(true);
    try {
      await onActualizarNota(pedido.id, notaEdit.trim() || null);
      setNotaEditando(false);
    } finally {
      setNotaGuardando(false);
    }
  };

  const canEditItems = pedido.status === "en_espera" && !dimmed && pedido.items.length > 1;
  const canEditNota  = !dimmed && pedido.status !== "cancelado";

  return (
    <div className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${dimmed ? "opacity-50" : "hover:shadow-md"} ${resaltarPago ? "border-red-200" : "border-orange-100 hover:border-orange-200"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 font-medium">#{pedido.id} · {hora}</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">{pedido.cliente?.nombre ?? "Cliente"}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
          {pedido.modalidad === "para_llevar" && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200">Para llevar</span>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-1.5 mb-3">
        {pedido.items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <span className="text-xs text-gray-300 mt-0.5 shrink-0">·</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-700">{item.nombre}</span>
              {(item.cantidad ?? 1) > 1 && (
                <span className="ml-1 text-xs text-gray-400">×{item.cantidad}</span>
              )}
              {Array.isArray(item.ingredientes) && item.ingredientes.length > 0 && (
                <p className="text-xs text-gray-400 truncate">{item.ingredientes.map((i) => i.nombre).join(", ")}</p>
              )}
              {Array.isArray(item.extras) && item.extras.length > 0 && (
                <p className="text-xs text-orange-400 truncate">+ {item.extras.map((e) => e.nombre).join(", ")}</p>
              )}
            </div>
            {canEditItems && (
              <button
                onClick={() => onEliminarItem(pedido.id, item.id)}
                title="Quitar ítem"
                className="shrink-0 w-4 h-4 mt-0.5 rounded-full bg-red-50 text-red-300 hover:bg-red-400 hover:text-white flex items-center justify-center text-xs transition-all leading-none border border-red-100"
              >×</button>
            )}
          </div>
        ))}
      </div>

      {/* Nota editable */}
      {canEditNota && (
        <div className="mb-3">
          {notaEditando ? (
            <div className="space-y-1.5">
              <textarea
                value={notaEdit}
                onChange={(e) => setNotaEdit(e.target.value)}
                placeholder="Agregar nota al pedido..."
                rows={2}
                autoFocus
                className="w-full border border-yellow-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 rounded-lg px-2.5 py-1.5 text-xs outline-none resize-none transition-all"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={handleGuardarNota}
                  disabled={notaGuardando}
                  className="flex-1 text-xs py-1 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-all"
                >
                  {notaGuardando ? "..." : "Guardar"}
                </button>
                <button
                  onClick={() => { setNotaEditando(false); setNotaEdit(pedido.nota ?? ""); }}
                  className="flex-1 text-xs py-1 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNotaEditando(true)}
              className="w-full text-left text-xs bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-1.5 hover:bg-yellow-100 hover:border-yellow-200 transition-all italic"
            >
              {pedido.nota
                ? <span className="text-gray-500">"{pedido.nota}" <span className="not-italic text-gray-300 text-[10px]">✏</span></span>
                : <span className="text-gray-300">✏ Agregar nota…</span>}
            </button>
          )}
        </div>
      )}
      {!canEditNota && pedido.nota && (
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
          {confirmandoCancelar ? (
            <div className="flex gap-1">
              <button onClick={() => { setConfirmandoCancelar(false); onCambiarStatus(pedido, "cancelado"); }} className="flex-1 text-xs py-1 rounded-full bg-red-500 border-red-500 text-white font-semibold transition-all">Sí, cancelar</button>
              <button onClick={() => setConfirmandoCancelar(false)} className="flex-1 text-xs py-1 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 transition-all">No</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmandoCancelar(true)}
              disabled={loadingStatus}
              className="w-full text-xs py-1 rounded-full border border-gray-100 text-gray-300 hover:border-red-300 hover:text-red-400 transition-all disabled:opacity-50"
            >
              Cancelar pedido
            </button>
          )}
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

  const [confirmandoRolId, setConfirmandoRolId] = useState(null);
  const [confirmandoEliminarUsuarioId, setConfirmandoEliminarUsuarioId] = useState(null);

  const handleCambiarRol = async (u) => {
    const nuevoRol = u.rol === "admin" ? "cliente" : "admin";
    setConfirmandoRolId(null);
    try {
      const actualizado = await actualizarUsuario(u.id, { rol: nuevoRol });
      setUsuarios((prev) => prev.map((x) => (x.id === actualizado.id ? actualizado : x)));
    } catch { /* silencioso */ }
  };

  const handleEliminar = async (u) => {
    setConfirmandoEliminarUsuarioId(null);
    try {
      await eliminarUsuario(u.id);
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      setError(err.message || "Error al eliminar usuario");
    }
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

  const [busquedaUsuarios, setBusquedaUsuarios] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const usuariosFiltrados = usuarios
    .filter((u) => !filtroRol || u.rol === filtroRol)
    .filter((u) => !busquedaUsuarios.trim() ||
      u.nombre.toLowerCase().includes(busquedaUsuarios.trim().toLowerCase()) ||
      u.correo.toLowerCase().includes(busquedaUsuarios.trim().toLowerCase())
    );

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Usuarios</h2>
          <p className="text-xs text-gray-400">{usuariosFiltrados.length}/{usuarios.length} registrados · Solo tú puedes crear cuentas</p>
        </div>
        <button
          onClick={() => { setError(null); setModal("crear"); }}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-200 flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> Nuevo usuario
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
          <input value={busquedaUsuarios} onChange={(e) => setBusquedaUsuarios(e.target.value)} placeholder="Buscar por nombre o correo..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl outline-none transition-all bg-white" />
          {busquedaUsuarios && <button onClick={() => setBusquedaUsuarios("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>}
        </div>
        <div className="flex gap-1">
          {[{ k: "", l: "Todos" }, { k: "admin", l: "Admin" }, { k: "cliente", l: "Cliente" }].map(({ k, l }) => (
            <button key={k} onClick={() => setFiltroRol(k)} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${filtroRol === k ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {usuariosFiltrados.length === 0 && usuarios.length > 0 && <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>}
        {usuariosFiltrados.map((u) => (
          <div key={u.id} className={`bg-white border border-orange-100 rounded-xl p-4 flex items-center justify-between gap-3 transition-all ${!u.activo ? "opacity-50" : ""}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{u.nombre}</p>
                {confirmandoRolId === u.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">→ {u.rol === "admin" ? "cliente" : "admin"}?</span>
                    <button onClick={() => handleCambiarRol(u)} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-2 py-0.5 rounded-full transition-all">Sí</button>
                    <button onClick={() => setConfirmandoRolId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded-full hover:bg-gray-100 transition-all">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmandoRolId(u.id)}
                    title="Click para cambiar rol"
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-all hover:scale-105 ${
                      u.rol === "admin"
                        ? "bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200"
                        : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {u.rol}
                  </button>
                )}
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
              {confirmandoEliminarUsuarioId === u.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEliminar(u)} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-all">Sí</button>
                  <button onClick={() => setConfirmandoEliminarUsuarioId(null)} className="text-xs text-gray-400 hover:text-gray-600 font-semibold px-2 py-1 rounded-lg hover:bg-gray-100 transition-all">No</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmandoEliminarUsuarioId(u.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                  title="Eliminar usuario"
                >
                  Eliminar
                </button>
              )}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl border border-orange-100 modal-bg p-6">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl border border-orange-100 modal-bg p-6">
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
