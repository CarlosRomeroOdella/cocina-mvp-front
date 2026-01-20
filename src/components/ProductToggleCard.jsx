export default function ProductToggleCard({
  name,
  available,
  onToggle,
  onEdit,
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
      <div>
        <h3 className="font-semibold">{name}</h3>
        <p className={`text-sm ${available ? "text-green-600" : "text-red-500"}`}>
          {available ? "Disponible" : "No disponible"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onEdit}
          className="text-blue-600 text-sm hover:underline"
        >
          Editar
        </button>

        <input
          type="checkbox"
          checked={available}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-5 h-5 accent-orange-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
