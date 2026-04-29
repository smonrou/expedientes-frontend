import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AppLayout from "@/components/layout/AppLayout";
import CatalogosPage from "@/pages/CatalogosPage";
import UsuariosPage from "@/pages/UsuariosPage";
import EstudiantesPage from "@/pages/EstudiantesPage";
import EstudianteDetallePage from "@/pages/EstudianteDetallePage";
import EstudianteFormPage from "@/pages/EstudianteFormPage";
import JustificacionesPage from "@/pages/JustificacionesPage";
import JustificacionDetallePage from "@/pages/JustificacionDetallePage";
import JustificacionFormPage from "@/pages/JustificacionFormPage";
import NotificacionesPage from "@/pages/NotificacionesPage";
import NotFoundPage from "@/pages/NotFoundPage";
import MiExpedientePage from "@/pages/MiExpedientePage";
import { useAuth } from "@/hooks/useAuth";

/**
 * Router principal de la aplicación SEEC.
 * Define las rutas públicas y protegidas con guards por rol.
 *
 * Niveles de acceso:
 *  - Sin roles → cualquier usuario autenticado
 *  - ADMIN + COORDINADOR → /estudiantes y sub-rutas
 *  - ADMIN → /usuarios, /catalogos, /estudiantes/nuevo, /estudiantes/:id/editar
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas — cualquier usuario autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Accesible para todos los roles */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/justificaciones" element={<JustificacionesPage />} />
            <Route
              path="/justificaciones/:id"
              element={<JustificacionDetallePage />}
            />
            <Route
              path="/justificaciones/nueva"
              element={<JustificacionFormPage />}
            />
            <Route path="/notificaciones" element={<NotificacionesPage />} />

            {/* Solo ADMIN y COORDINADOR — listado y detalle de estudiantes */}
            <Route
              element={
                <ProtectedRoute rolesPermitidos={["ADMIN", "COORDINADOR"]} />
              }
            >
              <Route path="/estudiantes" element={<EstudiantesPage />} />
              <Route
                path="/estudiantes/:id"
                element={<EstudianteDetallePage />}
              />
            </Route>

            {/* Solo ADMIN — creación, edición, usuarios y catálogos */}
            <Route element={<ProtectedRoute rolesPermitidos={["ADMIN"]} />}>
              <Route
                path="/estudiantes/nuevo"
                element={<EstudianteFormPage />}
              />
              <Route
                path="/estudiantes/:id/editar"
                element={<EstudianteFormPage />}
              />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/catalogos" element={<CatalogosPage />} />
            </Route>
            {/* Solo Estudiante */}
            <Route
              element={<ProtectedRoute rolesPermitidos={["ESTUDIANTE"]} />}
            >
              + <Route path="/mi-expediente" element={<MiExpedientePage />} />
              +{" "}
            </Route>
          </Route>
        </Route>

        {/* Página sin permiso */}
        <Route
          path="/sin-permiso"
          element={
            <div
              className="flex items-center justify-center h-screen"
              style={{ color: "#475569" }}
            >
              <div className="text-center space-y-2">
                <p className="text-lg font-medium" style={{ color: "#F4E9CD" }}>
                  Acceso denegado
                </p>
                <p className="text-sm">
                  No tienes permisos para acceder a esta página.
                </p>
                <a
                  href="/dashboard"
                  className="block text-xs mt-4 hover:opacity-70 transition"
                  style={{ color: "#F4E9CD" }}
                >
                  Volver al dashboard
                </a>
              </div>
            </div>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<RedireccionInicial />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );

  function RedireccionInicial() {
    const { tieneRol } = useAuth();
    if (tieneRol("ESTUDIANTE")) return <Navigate to="/mi-expediente" replace />;
    return <Navigate to="/justificaciones" replace />;
  }
}
