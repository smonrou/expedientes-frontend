import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import type { CarreraResponse } from "@/types";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().min(1, "El código es requerido"),
  nombreCoordinador: z.string().min(1, "El coordinador es requerido"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  item?: CarreraResponse | null;
  onGuardar: (data: FormData) => Promise<void>;
  onCerrar: () => void;
  cargando?: boolean;
}

/**
 * Modal para crear o editar una carrera (nombre, código, coordinador).
 */
export default function ModalCarrera({
  item,
  onGuardar,
  onCerrar,
  cargando,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    reset({
      nombre: item?.nombre ?? "",
      codigo: item?.codigo ?? "",
      nombreCoordinador: item?.nombreCoordinador ?? "",
    });
  }, [item, reset]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.8)" }}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#1e293b", border: "1px solid #334155" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #334155" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#F4E9CD" }}>
            {item ? "Editar carrera" : "Nueva carrera"}
          </p>
          <button onClick={onCerrar} className="hover:opacity-70 transition">
            <X size={16} style={{ color: "#475569" }} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onGuardar)}
          className="px-6 py-5 space-y-4"
        >
          {[
            {
              field: "nombre" as const,
              label: "Nombre",
              placeholder: "Ingeniería en Sistemas",
            },
            { field: "codigo" as const, label: "Código", placeholder: "ISC" },
            {
              field: "nombreCoordinador" as const,
              label: "Coordinador",
              placeholder: "Nombre del coordinador",
            },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#94a3b8" }}
              >
                {label}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1"
                style={{
                  background: "#0f172a",
                  border: errors[field]
                    ? "1px solid #f87171"
                    : "1px solid #334155",
                  color: "#f1f5f9",
                  ["--tw-ring-color" as string]: "#F4E9CD",
                }}
                {...register(field)}
              />
              {errors[field] && (
                <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                  {errors[field]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{
                background: "#0f172a",
                color: "#94a3b8",
                border: "1px solid #334155",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
              style={{
                background: cargando ? "#c9c0a8" : "#F4E9CD",
                color: "#0f172a",
                cursor: cargando ? "not-allowed" : "pointer",
              }}
            >
              {cargando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
