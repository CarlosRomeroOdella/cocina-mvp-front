import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            Dashboard Cocina
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Órdenes Hoy" value="12" />
            <StatCard title="Ventas" value="$3,450" />
            <StatCard title="Platillos" value="28" />
          </div>
        </main>
      </div>
    </div>
  );
}
