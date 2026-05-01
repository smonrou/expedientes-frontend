import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TelefonoInput } from "@/api/estudiantes";
import { actualizarTelefonos } from "@/api/estudiantes";

type TipoTelefono = "CASA" | "CELULAR" | "TRABAJO";

interface TelefonoExistente {
  numero: string;
  tipo: TipoTelefono;
}

interface Props {
  estudianteId: number;
  telefonosActuales: TelefonoExistente[];
  onClose: () => void;
}

const TIPOS: TipoTelefono[] = ["CELULAR", "CASA", "TRABAJO"];

const inputStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
} as const;

export default function ModalTelefonos({
  estudianteId,
  telefonosActuales,
  onClose,
}: Props) {
  const qc = useQueryClient();
  const [lista, setLista] = useState<TelefonoInput[]>(
    telefonosActuales.length > 0
      ? telefonosActuales
      : [{ numero: "", tipo: "CELULAR" }],
  );

  const mut = useMutation({
    mutationFn: (data: TelefonoInput[]) =>
      actualizarTelefonos(estudianteId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estudiante", estudianteId] });
      toast.success("Teléfonos actualizados");
      onClose();
    },
    onError: () => toast.error("Error al actualizar teléfonos"),
  });

  const agregar = () =>
    setLista((p) => [...p, { numero: "", tipo: "CELULAR" }]);
  const quitar = (i: number) =>
    setLista((p) => p.filter((_, idx) => idx !== i));
  const cambiar = (i: number, campo: keyof TelefonoInput, val: string) =>
    setLista((p) =>
      p.map((t, idx) => (idx === i ? { ...t, [campo]: val } : t)),
    );

  const guardar = () => {
    const limpios = lista.filter((t) => t.numero.trim() !== "");
    if (limpios.length === 0) {
      toast.error("Agrega al menos un teléfono");
      return;
    }
    mut.mutate(limpios);
  };

  return (
    <div
      style={{ background: "rgba(2,6,23,0.8)" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ background: "#1e293b", border: "1px solid #334155" }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}
          className="px-5 py-4 flex items-center justify-between"
        >
          <h2 style={{ color: "#F4E9CD" }} className="text-sm font-semibold">
            Teléfonos del estudiante
          </h2>
          <button
            onClick={onClose}
            style={{ color: "#475569" }}
            className="text-lg leading-none hover:text-slate-300 transition"
          ></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
          {lista.map((t, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Número"
                value={t.numero}
                onChange={(e) => cambiar(i, "numero", e.target.value)}
                style={{ ...inputStyle, border: "1px solid #334155" }}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
              />
              <select
                value={t.tipo}
                onChange={(e) => cambiar(i, "tipo", e.target.value)}
                style={{ ...inputStyle, border: "1px solid #334155" }}
                className="px-3 py-2 rounded-lg text-sm outline-none"
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              <button
                onClick={() => quitar(i)}
                style={{ color: "#f87171" }}
                className="text-sm px-2 py-2 hover:opacity-70 transition"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={agregar}
            style={{ color: "#94a3b8", border: "1px dashed #334155" }}
            className="w-full py-2 rounded-lg text-sm hover:border-slate-400 transition"
          >
            + Agregar teléfono
          </button>
        </div>

        {/* Footer */}
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
            onClick={guardar}
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
