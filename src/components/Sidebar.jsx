import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6">
      {/* "Admin Cocina" en una sola línea */}
      <h1 className="text-3xl font-bold mb-10 flex items-center gap-3 text-[#041E42]">
        <span className="text-4xl">🍳</span>
        Admin Cocina
      </h1>

      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg transition ${
              isActive 
                ? "bg-[#041E42] text-white font-medium" 
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          Dashboards
        </NavLink>

        <NavLink
          to="/productos"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg transition ${
              isActive 
                ? "bg-[#041E42] text-white font-medium" 
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          Productos
        </NavLink>

        <NavLink
          to="/ordenes"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg transition ${
              isActive 
                ? "bg-[#041E42] text-white font-medium" 
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          Órdenes
        </NavLink>

        <NavLink
          to="/ventas"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg transition ${
              isActive 
                ? "bg-[#041E42] text-white font-medium" 
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          Ventas
        </NavLink>
      </nav>
    </aside>
  );
}