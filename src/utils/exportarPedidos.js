/**
 * utils/exportarPedidos.js — Exportar pedidos a Excel (.xlsx)
 *
 * Genera un libro con una fila por pedido (número, cliente, fecha, ítems,
 * modalidad, estado, pagado, total y nota) y dispara la descarga en el
 * navegador. No depende del backend: recibe los pedidos ya cargados.
 */
import * as XLSX from "xlsx";
import { STATUS_CONFIG } from "../lib/estadosPedido";

const MODALIDAD_LABEL = { en_cocina: "En cocina", para_llevar: "Para llevar" };

function formatearItems(items) {
  return (items ?? [])
    .map((i) => `${i.nombre}${(i.cantidad ?? 1) > 1 ? ` x${i.cantidad}` : ""}`)
    .join(", ");
}

/**
 * @param {Array} pedidos - pedidos a incluir (ya filtrados/buscados en pantalla)
 */
export function exportarPedidosExcel(pedidos) {
  const filas = pedidos.map((p) => ({
    "N° Pedido": p.id,
    Cliente: p.cliente?.nombre ?? "—",
    Fecha: new Date(p.createdAt),
    "Ítems": formatearItems(p.items),
    Modalidad: MODALIDAD_LABEL[p.modalidad] ?? p.modalidad,
    Estado: STATUS_CONFIG[p.status]?.label ?? p.status,
    Pagado: p.pagado ? "Sí" : "No",
    Total: Number(p.total),
    Nota: p.nota ?? "",
  }));

  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Pedidos");

  const nombreArchivo = `pedidos_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(libro, nombreArchivo);
}
