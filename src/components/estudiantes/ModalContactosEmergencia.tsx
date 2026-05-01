import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ContactoEmergenciaRequest } from "@/types";
import { actualizarContactosEmergencia } from "@/api/estudiantes";

interface Props {
  estudianteId: number;
  contactosActuales: ContactoEmergenciaRequest[];
  onClose: () => void;
}

const inputStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
} as const;

const CONTACTO_VACIO: ContactoEmergenciaRequest = {
  nombreCompleto: "",
  parentesco: "",
};

export default function ModalContactosEmergencia({
  estudianteId,
  contactosActuales,
  onClose,
}: Props) {
  const qc = useQueryClient();
  const [lista, setLista] = useState<ContactoEmergenciaRequest[]>(
    contactosActuales.length > 0 ? contactosActuales : [{ ...CONTACTO_VACIO }],
  );

  const mut = useMutation({
    mutationFn: () => actualizarContactosEmergencia(estudianteId, lista),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estudiante", estudianteId] });
      toast.success("Contactos de emergencia actualizados");
      onClose();
    },
    onError: () => toast.error("Error al actualizar contactos"),
  });

  const agregar = () => setLista((p) => [...p, { ...CONTACTO_VACIO }]);
  const quitar = (i: number) =>
    setLista((p) => p.filter((_, idx) => idx !== i));
  const cambiar = (
    i: number,
    campo: keyof ContactoEmergenciaRequest,
    val: string,
  ) =>
    setLista((p) =>
      p.map((c, idx) => (idx === i ? { ...c, [campo]: val || undefined } : c)),
    );

  const guardar = () => {
    const invalidos = lista.filter(
      (c) => !c.nombreCompleto.trim() || !c.parentesco.trim(),
    );
    if (invalidos.length > 0) {
      toast.error("Nombre y parentesco son requeridos en todos los contactos");
      return;
    }
    mut.mutate();
  };

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
            Contactos de emergencia
          </h2>
          <button
            onClick={onClose}
            style={{ color: "#475569" }}
            className="text-lg leading-none hover:text-slate-300 transition"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-112 overflow-y-auto">
          {lista.map((c, i) => (
            <div
              key={i}
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}
              className="rounded-xl p-4 space-y-2 relative"
            >
              <button
                onClick={() => quitar(i)}
                style={{ color: "#f87171" }}
                className="absolute top-3 right-3 text-sm hover:opacity-70 transition"
              >
                ✕
              </button>

              <p
                style={{ color: "#475569" }}
                className="text-xs font-medium uppercase tracking-wider mb-3"
              >
                Contacto {i + 1}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label
                    style={{ color: "#94a3b8" }}
                    className="block text-xs mb-1"
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={c.nombreCompleto}
                    onChange={(e) =>
                      cambiar(i, "nombreCompleto", e.target.value)
                    }
                    style={inputStyle}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
                  />
                </div>
                <div>
                  <label
                    style={{ color: "#94a3b8" }}
                    className="block text-xs mb-1"
                  >
                    Parentesco *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Madre, Padre..."
                    value={c.parentesco}
                    onChange={(e) => cambiar(i, "parentesco", e.target.value)}
                    style={inputStyle}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
                  />
                </div>
                <div>
                  <label
                    style={{ color: "#94a3b8" }}
                    className="block text-xs mb-1"
                  >
                    Dirección
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={c.direccion ?? ""}
                    onChange={(e) => cambiar(i, "direccion", e.target.value)}
                    style={inputStyle}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={agregar}
            style={{ color: "#94a3b8", border: "1px dashed #334155" }}
            className="w-full py-2 rounded-lg text-sm hover:border-slate-400 transition"
          >
            + Agregar contacto
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
