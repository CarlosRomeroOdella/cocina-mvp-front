import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProductToggleCard from "../components/ProductToggleCard";

/* ================= ADMIN DASHBOARD ================= */

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("platillos");
  const [selectedPlatilloId, setSelectedPlatilloId] = useState(1);

  /* ====== MOCK GLOBAL (luego backend) ====== */
  const [platillos, setPlatillos] = useState([
    {
      id: 1,
      nombre: "Sandwich",
      disponible: true,
      ingredientes: [1, 2],
      extras: [1],
    },
    {
      id: 2,
      nombre: "Pan pita",
      disponible: true,
      ingredientes: [3],
      extras: [],
    },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard Admin</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/menu")}
            className="text-sm text-gray-600 hover:underline"
          >
            Ver menú cliente
          </button>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ================= TABS ================= */}
      <div className="bg-white border-b px-6">
        <nav className="flex gap-6">
          <Tab
            label="Platillos"
            active={activeTab === "platillos"}
            onClick={() => setActiveTab("platillos")}
          />
          <Tab
            label="Ingredientes"
            active={activeTab === "ingredientes"}
            onClick={() => setActiveTab("ingredientes")}
          />
          <Tab
            label="Extras"
            active={activeTab === "extras"}
            onClick={() => setActiveTab("extras")}
          />
        </nav>
      </div>

      {/* ================= CONTENIDO ================= */}
      <main className="p-6 space-y-6">
        {activeTab === "platillos" && (
          <PlatillosPanel
            platillos={platillos}
            setPlatillos={setPlatillos}
            selectedPlatilloId={selectedPlatilloId}
            setSelectedPlatilloId={setSelectedPlatilloId}
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
    </div>
  );
}

/* ================= COMPONENTES ================= */

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 text-sm font-medium border-b-2 ${
        active
          ? "border-orange-500 text-orange-500"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

/* ================= PLATILLOS ================= */

function PlatillosPanel({
  platillos,
  setPlatillos,
  selectedPlatilloId,
  setSelectedPlatilloId,
}) {
  const toggleDisponible = (id) => {
    setPlatillos(
      platillos.map((p) =>
        p.id === id ? { ...p, disponible: !p.disponible } : p
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Platillos</h2>
        <button className="bg-orange-500 text-white px-3 py-1 rounded text-sm">
          + Agregar platillo
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
            onEdit={() => console.log("Editar platillo", p.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ================= INGREDIENTES ================= */

function IngredientesPanel({
  platillos,
  setPlatillos,
  ingredientes,
  selectedPlatilloId,
}) {
  const platillo = platillos.find((p) => p.id === selectedPlatilloId);

  const toggleIngrediente = (ingredienteId) => {
    setPlatillos(
      platillos.map((p) =>
        p.id !== selectedPlatilloId
          ? p
          : {
              ...p,
              ingredientes: p.ingredientes.includes(ingredienteId)
                ? p.ingredientes.filter((id) => id !== ingredienteId)
                : [...p.ingredientes, ingredienteId],
            }
      )
    );
  };

  if (!platillo) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">
        Ingredientes · {platillo.nombre}
      </h2>

      {ingredientes.map((i) => (
        <label key={i.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={platillo.ingredientes.includes(i.id)}
            onChange={() => toggleIngrediente(i.id)}
          />
          {i.nombre}
        </label>
      ))}
    </div>
  );
}

/* ================= EXTRAS ================= */

function ExtrasPanel({
  platillos,
  setPlatillos,
  extras,
  selectedPlatilloId,
}) {
  const platillo = platillos.find((p) => p.id === selectedPlatilloId);

  const toggleExtra = (extraId) => {
    setPlatillos(
      platillos.map((p) =>
        p.id !== selectedPlatilloId
          ? p
          : {
              ...p,
              extras: p.extras.includes(extraId)
                ? p.extras.filter((id) => id !== extraId)
                : [...p.extras, extraId],
            }
      )
    );
  };

  if (!platillo) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">
        Extras · {platillo.nombre}
      </h2>

      {extras.map((e) => (
        <label key={e.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={platillo.extras.includes(e.id)}
            onChange={() => toggleExtra(e.id)}
          />
          {e.nombre}
        </label>
      ))}
    </div>
  );
}
