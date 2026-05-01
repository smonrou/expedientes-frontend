import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DiscapacidadRequest } from "@/types";
import { actualizarDiscapacidades } from "@/api/estudiantes";
import { listarCatalogo } from "@/api/catalogos";

interface DiscapacidadExistente {
  tipoDiscapacidad: { id: number; nombre: string };
  observaciones?: string;
}

interface Props {
  estudianteId: number;
  discapacidadesActuales: DiscapacidadExistente[];
  onClose: () => void;
}

const inputStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
} as const;

export default function ModalDiscapacidades({
  estudianteId,
  discapacidadesActuales,
  onClose,
}: Props) {
  const qc = useQueryClient();

  const { data: catalogo = [] } = useQuery({
    queryKey: ["catalogo", "tipo-discapacidad"],
    queryFn: () => listarCatalogo("tipo-discapacidad"),
  });

  const [lista, setLista] = useState<DiscapacidadRequest[]>(
    discapacidadesActuales.map((d) => ({
      tipoDiscapacidadId: d.tipoDiscapacidad.id,
      observaciones: d.observaciones ?? undefined,
    })),
  );

  const mut = useMutation({
    mutationFn: () => actualizarDiscapacidades(estudianteId, lista),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estudiante", estudianteId] });
      toast.success("Discapacidades actualizadas");
      onClose();
    },
    onError: () => toast.error("Error al actualizar discapacidades"),
  });

  const agregar = () => {
    const yaUsados = new Set(lista.map((l) => l.tipoDiscapacidadId));
    const disponible = catalogo.find(
      (c: { id: number }) => !yaUsados.has(c.id),
    );
    if (!disponible) {
      toast.error("Ya están todos los tipos agregados");
      return;
    }
    setLista((p) => [...p, { tipoDiscapacidadId: disponible.id }]);
  };

  const quitar = (i: number) =>
    setLista((p) => p.filter((_, idx) => idx !== i));
  const cambiarTipo = (i: number, id: number) =>
    setLista((p) =>
      p.map((d, idx) => (idx === i ? { ...d, tipoDiscapacidadId: id } : d)),
    );
  const cambiarObs = (i: number, val: string) =>
    setLista((p) =>
      p.map((d, idx) =>
        idx === i ? { ...d, observaciones: val || undefined } : d,
      ),
    );

  return (
    <div
      style={{ background: "rgba(2,6,23,0.8)" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ background: "#1e293b", border: "1px solid #334155" }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
      >
        <div
          style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}
          className="px-5 py-4 flex items-center justify-between"
        >
          <h2 style={{ color: "#F4E9CD" }} className="text-sm font-semibold">
            Discapacidades
          </h2>
          <button
            onClick={onClose}
            style={{ color: "#475569" }}
            className="text-lg leading-none hover:text-slate-300 transition"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
          {lista.length === 0 && (
            <p
              style={{ color: "#475569" }}
              className="text-sm text-center py-4"
            >
              Sin discapacidades registradas
            </p>
          )}
          {lista.map((d, i) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-2 items-center">
                <select
                  value={d.tipoDiscapacidadId}
                  onChange={(e) => cambiarTipo(i, Number(e.target.value))}
                  style={inputStyle}
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                >
                  {catalogo.map((c: { id: number; nombre: string }) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => quitar(i)}
                  style={{ color: "#f87171" }}
                  className="px-2 py-2 hover:opacity-70 transition text-sm"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="Observaciones (opcional)"
                value={d.observaciones ?? ""}
                onChange={(e) => cambiarObs(i, e.target.value)}
                style={{ ...inputStyle, border: "1px solid #1e293b" }}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none focus:ring-1"
              />
            </div>
          ))}
          <button
            onClick={agregar}
            style={{ color: "#94a3b8", border: "1px dashed #334155" }}
            className="w-full py-2 rounded-lg text-sm hover:border-slate-400 transition"
          >
            + Agregar discapacidad
          </button>
        </div>

        <div
          style={{ borderTop: "1px solid #1e293b" }}
          className="px-5 py-4 flex justify-end gap-3"
        >
          <button
            onClick={onClose}
            style={{
              background: "#0f172a",
              color: "#94a3b8",
              border: "1px solid #334155",
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            style={{
              background: mut.isPending ? "#c9c0a8" : "#F4E9CD",
              color: "#0f172a",
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            {mut.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
