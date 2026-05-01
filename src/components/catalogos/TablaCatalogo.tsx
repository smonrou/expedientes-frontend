import { Pencil, Trash2 } from "lucide-react";
import type { CatalogoResponse } from "@/types";

interface Props {
  items: CatalogoResponse[];
  onEditar: (item: CatalogoResponse) => void;
  onEliminar: (item: CatalogoResponse) => void;
  soloLectura?: boolean;
}

/**
 * Tabla reutilizable para mostrar cualquier catálogo simple.
 */
export default function TablaCatalogo({
  items,
  onEditar,
  onEliminar,
  soloLectura,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: "#475569" }}>
          No hay registros aún.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid #1e293b" }}>
            <th
              className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
              style={{ color: "#475569" }}
            >
              ID
            </th>
            <th
              className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
              style={{ color: "#475569" }}
            >
              Nombre
            </th>
            {!soloLectura && (
              <th
                className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "#475569" }}
              >
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              style={{
                borderBottom:
                  i < items.length - 1 ? "1px solid #1e293b" : "none",
              }}
              className="transition hover:bg-white/5"
            >
              <td className="px-4 py-3 text-xs" style={{ color: "#475569" }}>
                {item.id}
              </td>
              <td className="px-4 py-3" style={{ color: "#cbd5e1" }}>
                {item.nombre}
              </td>
              {!soloLectura && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditar(item)}
                      className="flex items-center justify-center rounded-lg transition hover:opacity-70"
                      style={{ width: 30, height: 30, background: "#1e293b" }}
                      title="Editar"
                    >
                      <Pencil size={13} style={{ color: "#94a3b8" }} />
                    </button>
                    <button
                      onClick={() => onEliminar(item)}
                      className="flex items-center justify-center rounded-lg transition hover:opacity-70"
                      style={{ width: 30, height: 30, background: "#1e293b" }}
                      title="Eliminar"
                    >
                      <Trash2 size={13} style={{ color: "#f87171" }} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
