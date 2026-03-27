import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProductToggleCard from "../components/ProductToggleCard";

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("platillos");
  const [selectedPlatilloId, setSelectedPlatilloId] = useState(1);
  const [editModal, setEditModal] = useState(null);

  const [platillos, setPlatillos] = useState([
    { id: 1, nombre: "Sandwich", disponible: true, imagen: "", ingredientes: [1, 2], extras: [1] },
    { id: 2, nombre: "Pan pita", disponible: true, imagen: "", ingredientes: [3], extras: [] },
  ]);

  const [ingredientes] = useState([
    { id: 1, nombre: "Pan sandwich" },
    { id: 2, nombre: "Jamón" },
    { id: 3, nombre: "Pan pita" },
  ]);

  const [extras] = useState([
    { id: 1, nombre: "Refresco" },
    { id: 2, nombre: "Galletas" },
  ]);

  const handleEdit = (platillo) => setEditModal({ ...platillo });

  const handleSaveEdit = (updated) => {
    setPlatillos(platillos.map((p) => (p.id === updated.id ? updated : p)));
    setEditModal(null);
  };

  const handleAddPlatillo = () => {
    setEditModal({ id: Date.now(), nombre: "", disponible: true, imagen: "", ingredientes: [], extras: [] });
  };

  const handleSaveNew = (nuevo) => {
    setPlatillos([...platillos, nuevo]);
    setEditModal(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fff7f0 0%, #fff 60%, #fff3e8 100%)" }}>

      {/* HEADER */}
      <header
        className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b border-orange-100"
        style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-orange-200">
            A
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Dashboard Admin</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/menu")}
            className="text-sm text-gray-500 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-full hover:bg-orange-50"
          >
            Ver menú cliente
          </button>
          <button
            onClick={logout}
            className="text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-full transition-all shadow-sm shadow-orange-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* TABS */}
      <div
        className="px-6 border-b border-orange-100"
        style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}
      >
        <nav className="flex gap-1 max-w-6xl mx-auto">
          {["platillos", "ingredientes", "extras"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium border-b-2 capitalize transition-all ${
                activeTab === tab
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENIDO */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {activeTab === "platillos" && (
          <PlatillosPanel
            platillos={platillos}
            setPlatillos={setPlatillos}
            selectedPlatilloId={selectedPlatilloId}
            setSelectedPlatilloId={setSelectedPlatilloId}
            onEdit={handleEdit}
            onAdd={handleAddPlatillo}
          />
        )}
        {activeTab === "ingredientes" && (
          <IngredientesPanel
            platillos={platillos}
            setPlatillos={setPlatillos}
            ingredientes={ingredientes}
            selectedPlatilloId={selectedPlatilloId}
          />
        )}
        {activeTab === "extras" && (
          <ExtrasPanel
            platillos={platillos}
            setPlatillos={setPlatillos}
            extras={extras}
            selectedPlatilloId={selectedPlatilloId}
          />
        )}
      </main>

      {/* MODAL */}
      {editModal && (
        <EditModal
          platillo={editModal}
          ingredientes={ingredientes}
          extras={extras}
          isNew={!platillos.find((p) => p.id === editModal.id)}
          onSave={platillos.find((p) => p.id === editModal.id) ? handleSaveEdit : handleSaveNew}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}

/* ================= MODAL ================= */
function EditModal({ platillo, ingredientes, extras, isNew, onSave, onClose }) {
  const [form, setForm] = useState({ ...platillo });

  const toggleIngrediente = (id) => {
    setForm((f) => ({
      ...f,
      ingredientes: f.ingredientes.includes(id)
        ? f.ingredientes.filter((i) => i !== id)
        : [...f.ingredientes, id],
    }));
  };

  const toggleExtra = (id) => {
    setForm((f) => ({
      ...f,
      extras: f.extras.includes(id)
        ? f.extras.filter((e) => e !== id)
        : [...f.extras, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-orange-100"
        style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isNew ? "Nuevo platillo" : "Editar platillo"}
              </h2>
              {!isNew && <p className="text-sm text-orange-400 font-medium">{platillo.nombre}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 flex items-center justify-center transition-all text-lg"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nombre</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre del platillo"
                className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              />
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Imagen (URL)</label>
              <input
                value={form.imagen}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              />
              {form.imagen && (
                <img
                  src={form.imagen}
                  alt="preview"
                  className="mt-2 w-full h-36 object-cover rounded-xl border border-orange-100"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
              <div>
                <p className="text-sm font-semibold text-gray-700">Disponible</p>
                <p className="text-xs text-gray-400">Visible en el menú del cliente</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, disponible: !form.disponible })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shadow-inner ${
                  form.disponible ? "bg-orange-500" : "bg-gray-200"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.disponible ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ingredientes</label>
              <div className="space-y-2">
                {ingredientes.map((i) => (
                  <label
                    key={i.id}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      form.ingredientes.includes(i.id)
                        ? "bg-orange-50 border-orange-300 text-orange-700"
                        : "bg-white border-gray-100 hover:border-orange-200 text-gray-600"
                    }`}
                  >
                    <input type="checkbox" checked={form.ingredientes.includes(i.id)} onChange={() => toggleIngrediente(i.id)} className="accent-orange-500 w-4 h-4" />
                    <span className="text-sm font-medium">{i.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Extras</label>
              <div className="space-y-2">
                {extras.map((e) => (
                  <label
                    key={e.id}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      form.extras.includes(e.id)
                        ? "bg-orange-50 border-orange-300 text-orange-700"
                        : "bg-white border-gray-100 hover:border-orange-200 text-gray-600"
                    }`}
                  >
                    <input type="checkbox" checked={form.extras.includes(e.id)} onChange={() => toggleExtra(e.id)} className="accent-orange-500 w-4 h-4" />
                    <span className="text-sm font-medium">{e.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-all shadow-md shadow-orange-200"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ================= PLATILLOS PANEL ================= */
function PlatillosPanel({ platillos, setPlatillos, selectedPlatilloId, setSelectedPlatilloId, onEdit, onAdd }) {
  const toggleDisponible = (id) => {
    setPlatillos(platillos.map((p) => (p.id === id ? { ...p, disponible: !p.disponible } : p)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Platillos</h2>
          <p className="text-xs text-gray-400">{platillos.length} platillos registrados</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-200 flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> Agregar platillo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {platillos.map((p) => (
          <ProductToggleCard
            key={p.id}
            name={p.nombre}
            available={p.disponible}
            isActive={p.id === selectedPlatilloId}
            onSelect={() => setSelectedPlatilloId(p.id)}
            onToggle={() => toggleDisponible(p.id)}
            onEdit={() => onEdit(p)}
          />
        ))}
      </div>
    </div>
  );
}

/* ================= INGREDIENTES PANEL ================= */
function IngredientesPanel({ platillos, setPlatillos, ingredientes, selectedPlatilloId }) {
  const platillo = platillos.find((p) => p.id === selectedPlatilloId);

  const toggleIngrediente = (ingredienteId) => {
    setPlatillos(platillos.map((p) =>
      p.id !== selectedPlatilloId ? p : {
        ...p,
        ingredientes: p.ingredientes.includes(ingredienteId)
          ? p.ingredientes.filter((id) => id !== ingredienteId)
          : [...p.ingredientes, ingredienteId],
      }
    ));
  };

  if (!platillo) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Ingredientes</h2>
        <p className="text-sm text-orange-500 font-medium">{platillo.nombre}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ingredientes.map((i) => (
          <label
            key={i.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
              platillo.ingredientes.includes(i.id)
                ? "bg-orange-50 border-orange-300 text-orange-700"
                : "bg-white border-gray-100 hover:border-orange-200 text-gray-600"
            }`}
          >
            <input type="checkbox" checked={platillo.ingredientes.includes(i.id)} onChange={() => toggleIngrediente(i.id)} className="accent-orange-500 w-4 h-4" />
            <span className="text-sm font-medium">{i.nombre}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ================= EXTRAS PANEL ================= */
function ExtrasPanel({ platillos, setPlatillos, extras, selectedPlatilloId }) {
  const platillo = platillos.find((p) => p.id === selectedPlatilloId);

  const toggleExtra = (extraId) => {
    setPlatillos(platillos.map((p) =>
      p.id !== selectedPlatilloId ? p : {
        ...p,
        extras: p.extras.includes(extraId)
          ? p.extras.filter((id) => id !== extraId)
          : [...p.extras, extraId],
      }
    ));
  };

  if (!platillo) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Extras</h2>
        <p className="text-sm text-orange-500 font-medium">{platillo.nombre}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {extras.map((e) => (
          <label
            key={e.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
              platillo.extras.includes(e.id)
                ? "bg-orange-50 border-orange-300 text-orange-700"
                : "bg-white border-gray-100 hover:border-orange-200 text-gray-600"
            }`}
          >
            <input type="checkbox" checked={platillo.extras.includes(e.id)} onChange={() => toggleExtra(e.id)} className="accent-orange-500 w-4 h-4" />
            <span className="text-sm font-medium">{e.nombre}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
