export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">
        Cocina MVP
      </h1>

      <nav className="space-y-4">
        <div className="hover:text-yellow-400 cursor-pointer">
          Dashboard
        </div>
        <div className="hover:text-yellow-400 cursor-pointer">
          Órdenes
        </div>
        <div className="hover:text-yellow-400 cursor-pointer">
          Platillos
        </div>
        <div className="hover:text-yellow-400 cursor-pointer">
          Usuarios
        </div>
      </nav>
    </aside>
  );
}
