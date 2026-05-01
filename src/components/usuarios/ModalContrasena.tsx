import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";

const schema = z
  .object({
    nuevaContrasena: z.string().min(6, "Mínimo 8 caracteres"),
    confirmar: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((d) => d.nuevaContrasena === d.confirmar, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar"],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  nombreUsuario: string;
  onGuardar: (nuevaContrasena: string) => Promise<void>;
  onCerrar: () => void;
  cargando?: boolean;
}

/**
 * Modal para cambiar la contraseña de un usuario existente.
 */
export default function ModalContrasena({
  nombreUsuario,
  onGuardar,
  onCerrar,
  cargando,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    await onGuardar(data.nuevaContrasena);
  }

  const inputStyle = (hasError: boolean) => ({
    background: "#0f172a",
    border: hasError ? "1px solid #f87171" : "1px solid #334155",
    color: "#f1f5f9",
    ["--tw-ring-color" as string]: "#F4E9CD",
  });

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
          <div>
            <p className="text-sm font-semibold" style={{ color: "#F4E9CD" }}>
              Cambiar contraseña
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              {nombreUsuario}
            </p>
          </div>
          <button onClick={onCerrar} className="hover:opacity-70 transition">
            <X size={16} style={{ color: "#475569" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {[
            {
              field: "nuevaContrasena" as const,
              label: "Nueva contraseña",
              placeholder: "Mínimo 6 caracteres",
            },
            {
              field: "confirmar" as const,
              label: "Confirmar contraseña",
              placeholder: "Repite la contraseña",
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
                type="password"
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1"
                style={inputStyle(!!errors[field])}
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
              {cargando ? "Guardando..." : "Cambiar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
