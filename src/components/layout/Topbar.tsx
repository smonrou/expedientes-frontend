import { useState } from "react";
import { Bell, KeyRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { conteoNoLeidas } from "@/api/notificaciones";
import { cambiarContrasena } from "@/api/usuarios";
import { useAuth } from "@/hooks/useAuth";

const titulos: Record<string, string> = {
  "/estudiantes": "Estudiantes",
  "/justificaciones": "Justificaciones",
  "/notificaciones": "Notificaciones",
  "/catalogos": "Catálogos",
  "/usuarios": "Usuarios",
  "/mi-expediente": "Mi expediente",
};

const inputSt: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
};

/**
 * Barra superior con título de sección, badge de notificaciones (polling 30s)
 * y acceso al cambio de contraseña propio.
 */
export default function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { sesion } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);

  const titulo =
    Object.entries(titulos).find(
      ([key]) => pathname === key || pathname.startsWith(key + "/"),
    )?.[1] ?? "SEEC";

  const { data } = useQuery({
    queryKey: ["notificaciones-conteo", sesion?.usuarioId],
    queryFn: () => conteoNoLeidas(sesion!.usuarioId),
    enabled: !!sesion,
    refetchInterval: 30_000,
  });

  const conteo = data?.total ?? 0;

  const iniciales =
    sesion?.nombreUsuario
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <>
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}
      >
        <p className="text-sm font-medium" style={{ color: "#F4E9CD" }}>
          {titulo}
        </p>

        <div className="flex items-center gap-2">
          {/* Badge notificaciones */}
          <button
            onClick={() => navigate("/notificaciones")}
            className="relative flex items-center justify-center rounded-lg transition hover:opacity-70"
            style={{ width: 32, height: 32, background: "#1e293b" }}
          >
            <Bell size={14} style={{ color: "#94a3b8" }} />
            {conteo > 0 && (
              <span
                className="absolute flex items-center justify-center rounded-full text-xs font-bold"
                style={{
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  background: "#F4E9CD",
                  color: "#0f172a",
                  fontSize: 9,
                  padding: "0 3px",
                }}
              >
                {conteo > 99 ? "99+" : conteo}
              </span>
            )}
          </button>

          {/* Avatar — abre modal de contraseña */}
          <button
            onClick={() => setModalAbierto(true)}
            title="Cambiar contraseña"
            className="relative flex items-center justify-center rounded-lg transition hover:opacity-80"
            style={{
              width: 32,
              height: 32,
              background: "rgba(244,233,205,0.1)",
            }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: "#F4E9CD" }}
            >
              {iniciales}
            </span>
          </button>
        </div>
      </header>

      {/* Modal cambio de contraseña */}
      {modalAbierto && sesion && (
        <ModalCambiarContrasena
          usuarioId={sesion.usuarioId}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}

// ─── Modal cambio de contraseña ───────────────────────────────────────────────

/**
 * Modal para que cualquier usuario autenticado cambie su propia contraseña.
 * Llama a PATCH /api/usuarios/{id}/contrasena.
 */
function ModalCambiarContrasena({
  usuarioId,
  onClose,
}: {
  usuarioId: number;
  onClose: () => void;
}) {
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      cambiarContrasena(usuarioId, { nuevaContrasena: contrasenaNueva }),
    onSuccess: () => {
      toast.success("Contraseña actualizada");
      onClose();
    },
    onError: () => toast.error("Error al cambiar la contraseña"),
  });

  const guardar = () => {
    if (contrasenaNueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (contrasenaNueva !== confirmar) {
      toast.error("Las contraseñas no coinciden");
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
        className="w-full max-w-sm rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}
          className="px-5 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <KeyRound size={14} style={{ color: "#F4E9CD" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#F4E9CD" }}>
              Cambiar contraseña
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ color: "#475569" }}
            className="text-xl leading-none hover:text-slate-300 transition"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <div>
            <label
              className="block text-xs mb-1.5"
              style={{ color: "#94a3b8" }}
            >
              Nueva contraseña
            </label>
            <input
              type="password"
              value={contrasenaNueva}
              onChange={(e) => setContrasenaNueva(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={inputSt}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
            />
          </div>
          <div>
            <label
              className="block text-xs mb-1.5"
              style={{ color: "#94a3b8" }}
            >
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="••••••••"
              style={{
                ...inputSt,
                border:
                  confirmar && confirmar !== contrasenaNueva
                    ? "1px solid #f87171"
                    : "1px solid #334155",
              }}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
            />
            {confirmar && confirmar !== contrasenaNueva && (
              <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                Las contraseñas no coinciden
              </p>
            )}
          </div>
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
            {mut.isPending ? "Guardando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}
