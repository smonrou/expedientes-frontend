import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { login } from "@/api/auth";
import { guardarSesion } from "@/stores/authStore";
import type { SesionUsuario } from "@/types";

const loginSchema = z.object({
  correo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo válido"),
  contrasena: z.string().min(1, "La contraseña es requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(datos: LoginForm) {
    setCargando(true);
    try {
      const respuesta = await login(datos);
      const sesion: SesionUsuario = {
        token: respuesta.token,
        correo: respuesta.correo,
        nombreUsuario: respuesta.nombreUsuario,
        rol: respuesta.rol,
        usuarioId: respuesta.usuarioId,
      };
      guardarSesion(sesion);
      toast.success(`Bienvenido, ${sesion.nombreUsuario}`);
      navigate("/estudiantes");
    } catch (error: unknown) {
      const status = (error as { response?: { status: number } })?.response
        ?.status;
      if (status === 401) {
        toast.error("Correo o contraseña incorrectos");
      } else {
        toast.error("Error al conectar con el servidor");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#020617" }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#1e293b", border: "1px solid #334155" }}
        >
          {/* Header */}
          <div
            className="px-8 py-8 text-center"
            style={{ background: "#0f172a", borderBottom: "1px solid #334155" }}
          >
            <div className="flex justify-center mb-3">
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(244,233,205,0.1)" }}
              >
                <GraduationCap
                  style={{ color: "#F4E9CD", width: 28, height: 28 }}
                />
              </div>
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>
              SEEC — CUNORI
            </h1>
            <p className="text-sm mt-1" style={{ color: "#F4E9CD" }}>
              Sistema de Expedientes Estudiantiles
            </p>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <h2
              className="text-lg font-semibold mb-6"
              style={{ color: "#f1f5f9" }}
            >
              Iniciar sesión
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              {/* Correo */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#94a3b8" }}
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@cunori.edu.gt"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1"
                  style={{
                    background: "#0f172a",
                    border: errors.correo
                      ? "1px solid #f87171"
                      : "1px solid #334155",
                    color: "#f1f5f9",
                    ["--tw-ring-color" as string]: "#F4E9CD",
                  }}
                  {...register("correo")}
                />
                {errors.correo && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    {errors.correo.message}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#94a3b8" }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg text-sm outline-none transition focus:ring-1"
                    style={{
                      background: "#0f172a",
                      border: errors.correo
                        ? "1px solid #f87171"
                        : "1px solid #334155",
                      color: "#f1f5f9",
                      ["--tw-ring-color" as string]: "#F4E9CD",
                    }}
                    {...register("contrasena")}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                    style={{ color: "#475569" }}
                    tabIndex={-1}
                  >
                    {mostrarContrasena ? (
                      <EyeOff style={{ width: 16, height: 16 }} />
                    ) : (
                      <Eye style={{ width: 16, height: 16 }} />
                    )}
                  </button>
                </div>
                {errors.contrasena && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    {errors.contrasena.message}
                  </p>
                )}
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full font-semibold py-2.5 rounded-lg text-sm transition"
                style={{
                  background: cargando ? "#c9c0a8" : "#F4E9CD",
                  color: "#0f172a",
                  cursor: cargando ? "not-allowed" : "pointer",
                }}
              >
                {cargando ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-4" style={{ color: "#475569" }}>
          Centro Universitario de Oriente — {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
