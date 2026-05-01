import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, KeyRound, UserCheck, UserX } from "lucide-react";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarContrasena,
  activarUsuario,
  desactivarUsuario,
} from "@/api/usuarios";
import ModalUsuario from "@/components/usuarios/ModalUsuario";
import ModalContrasena from "@/components/usuarios/ModalContrasena";
import type { UsuarioResponse, Rol } from "@/types";

const ROL_COLORS: Record<Rol, string> = {
  ADMIN: "#f87171",
  COORDINADOR: "#F4E9CD",
  ESTUDIANTE: "#94a3b8",
};

/**
 * Página de gestión de usuarios del sistema. Solo accesible para ADMIN.
 */
export default function UsuariosPage() {
  const qc = useQueryClient();
  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalContrasena, setModalContrasena] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<UsuarioResponse | null>(null);

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: listarUsuarios,
  });

  // ─── Mutations ─────────────────────────────────────────────
  const crearMut = useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      cerrarModales();
      toast.success("Usuario creado");
    },
    onError: () => toast.error("Error al crear el usuario"),
  });

  const actualizarMut = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: Parameters<typeof actualizarUsuario>[1];
    }) => actualizarUsuario(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      cerrarModales();
      toast.success("Usuario actualizado");
    },
    onError: () => toast.error("Error al actualizar el usuario"),
  });

  const contrasenaMut = useMutation({
    mutationFn: ({
      id,
      nuevaContrasena,
    }: {
      id: number;
      nuevaContrasena: string;
    }) => cambiarContrasena(id, { nuevaContrasena }),
    onSuccess: () => {
      cerrarModales();
      toast.success("Contraseña actualizada");
    },
    onError: () => toast.error("Error al cambiar la contraseña"),
  });

  const activarMut = useMutation({
    mutationFn: activarUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario activado");
    },
    onError: () => toast.error("Error al activar el usuario"),
  });

  const desactivarMut = useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuario desactivado");
    },
    onError: () => toast.error("Error al desactivar el usuario"),
  });

  // ─── Handlers ──────────────────────────────────────────────
  function cerrarModales() {
    setModalUsuario(false);
    setModalContrasena(false);
    setUsuarioSeleccionado(null);
  }

  function abrirCrear() {
    setUsuarioSeleccionado(null);
    setModalUsuario(true);
  }

  function abrirEditar(u: UsuarioResponse) {
    setUsuarioSeleccionado(u);
    setModalUsuario(true);
  }

  function abrirContrasena(u: UsuarioResponse) {
    setUsuarioSeleccionado(u);
    setModalContrasena(true);
  }

  async function handleGuardarUsuario(data: Record<string, unknown>) {
    if (usuarioSeleccionado) {
      await actualizarMut.mutateAsync({
        id: usuarioSeleccionado.id,
        dto: {
          nombreUsuario: data.nombreUsuario as string,
          correo: data.correo as string,
          rol: data.rol as Rol,
          activo: data.activo as boolean,
        },
      });
    } else {
      await crearMut.mutateAsync({
        nombreUsuario: data.nombreUsuario as string,
        correo: data.correo as string,
        contrasena: data.contrasena as string,
        rol: data.rol as Rol,
      });
    }
  }

  async function handleGuardarContrasena(nuevaContrasena: string) {
    if (!usuarioSeleccionado) return;
    await contrasenaMut.mutateAsync({
      id: usuarioSeleccionado.id,
      nuevaContrasena,
    });
  }

  function toggleActivar(u: UsuarioResponse) {
    const accion = u.activo ? "desactivar" : "activar";
    if (
      !confirm(
        `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${u.nombreUsuario}?`,
      )
    )
      return;
    if (u.activo) {
      desactivarMut.mutate(u.id);
    } else {
      activarMut.mutate(u.id);
    }
  }

  const mutCargando = crearMut.isPending || actualizarMut.isPending;
  const contrasenaCargando = contrasenaMut.isPending;

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "#F4E9CD" }}>
            Usuarios
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
            Gestión de cuentas del sistema
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
          style={{ background: "#F4E9CD", color: "#0f172a" }}
        >
          <Plus size={15} />
          Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: "#475569" }}>
              Cargando...
            </p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: "#475569" }}>
              No hay usuarios registrados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #1e293b" }}>
                  {[
                    "Usuario",
                    "Correo",
                    "Rol",
                    "Estado",
                    "Creado",
                    "Acciones",
                  ].map((col) => (
                    <th
                      key={col}
                      className={`px-4 py-3 text-xs font-medium uppercase tracking-wider ${col === "Acciones" ? "text-right" : "text-left"}`}
                      style={{ color: "#475569" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom:
                        i < usuarios.length - 1 ? "1px solid #1e293b" : "none",
                    }}
                    className="transition hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center rounded-full text-xs font-medium shrink-0"
                          style={{
                            width: 28,
                            height: 28,
                            background: "rgba(244,233,205,0.08)",
                            color: "#F4E9CD",
                          }}
                        >
                          {u.nombreUsuario.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ color: "#cbd5e1" }}>
                          {u.nombreUsuario}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: "#94a3b8" }}
                    >
                      {u.correo}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{
                          background: `${ROL_COLORS[u.rol]}15`,
                          color: ROL_COLORS[u.rol],
                        }}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{
                          background: u.activo
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(248,113,113,0.1)",
                          color: u.activo ? "#22c55e" : "#f87171",
                        }}
                      >
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: "#475569" }}
                    >
                      {new Date(u.creadoEn).toLocaleDateString("es-GT")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Editar */}
                        <button
                          onClick={() => abrirEditar(u)}
                          className="flex items-center justify-center rounded-lg transition hover:opacity-70"
                          style={{
                            width: 30,
                            height: 30,
                            background: "#1e293b",
                          }}
                          title="Editar"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {/* Cambiar contraseña */}
                        <button
                          onClick={() => abrirContrasena(u)}
                          className="flex items-center justify-center rounded-lg transition hover:opacity-70"
                          style={{
                            width: 30,
                            height: 30,
                            background: "#1e293b",
                          }}
                          title="Cambiar contraseña"
                        >
                          <KeyRound size={13} style={{ color: "#94a3b8" }} />
                        </button>
                        {/* Activar / Desactivar */}
                        <button
                          onClick={() => toggleActivar(u)}
                          className="flex items-center justify-center rounded-lg transition hover:opacity-70"
                          style={{
                            width: 30,
                            height: 30,
                            background: "#1e293b",
                          }}
                          title={u.activo ? "Desactivar" : "Activar"}
                        >
                          {u.activo ? (
                            <UserX size={13} style={{ color: "#f87171" }} />
                          ) : (
                            <UserCheck size={13} style={{ color: "#22c55e" }} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      {modalUsuario && (
        <ModalUsuario
          usuario={usuarioSeleccionado}
          onGuardar={handleGuardarUsuario as never}
          onCerrar={cerrarModales}
          cargando={mutCargando}
        />
      )}

      {modalContrasena && usuarioSeleccionado && (
        <ModalContrasena
          nombreUsuario={usuarioSeleccionado.nombreUsuario}
          onGuardar={handleGuardarContrasena}
          onCerrar={cerrarModales}
          cargando={contrasenaCargando}
        />
      )}
    </div>
  );
}
