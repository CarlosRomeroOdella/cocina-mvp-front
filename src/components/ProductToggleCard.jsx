export default function ProductToggleCard({
  name,
  available,
  isActive,
  onSelect,
  onToggle,
  onEdit,
}) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg p-4 shadow border transition
        ${isActive ? "border-orange-500 bg-orange-50" : "bg-white"}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p
            className={`text-sm ${
              available ? "text-green-600" : "text-red-500"
            }`}
          >
            {available ? "Disponible" : "No disponible"}
          </p>
        </div>

        <div
          className="flex items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="text-blue-600 text-sm hover:underline"
          >
            Editar
          </button>

          <input
            type="checkbox"
            checked={available}
            onChange={onToggle}
            className="w-5 h-5 accent-orange-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
