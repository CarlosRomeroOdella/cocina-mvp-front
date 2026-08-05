/**
 * lib/estadosPedido.js — Etiquetas y colores de los estados de un pedido
 *
 * Fuente única para el label/color de cada status ("en_espera", "listo", etc.),
 * usada tanto por la UI (tablero de Pedidos) como por la exportación a Excel.
 */
export const STATUS_CONFIG = {
  en_espera:      { label: "En espera",      color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400"  },
  en_preparacion: { label: "En preparación", color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-400"    },
  listo:          { label: "Listo",          color: "bg-green-100 text-green-700 border-green-200",    dot: "bg-green-500"   },
  cancelado:      { label: "Cancelado",      color: "bg-red-100 text-red-600 border-red-200",          dot: "bg-red-400"     },
  en_revision:    { label: "En revisión",    color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500"  },
};
