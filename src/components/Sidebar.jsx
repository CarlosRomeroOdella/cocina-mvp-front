import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h1 className="text-xl font-bold mb-6">🍳 Admin Cocina</h1>

      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg ${
              isActive ? "bg-orange-500 text-white" : "hover:bg-gray-100"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink to="/productos" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
          Productos
        </NavLink>

        <NavLink to="/ordenes" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
          Órdenes
        </NavLink>

        <NavLink to="/ventas" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
          Ventas
        </NavLink>
      </nav>
    </aside>
  );
}
