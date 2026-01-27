export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">No autorizado</h2>
        <p>No tienes permisos para ver esta página.</p>
      </div>
    </div>
  );
} 