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
import NotificacionesPage from '@/pages/NotificacionesPage'

/**
 * Router principal de la aplicación SEEC.
 * Define las rutas públicas y protegidas con guards por rol.
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/catalogos" element={<CatalogosPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/estudiantes" element={<EstudiantesPage />} />
            <Route path="/estudiantes/nuevo" element={<EstudianteFormPage />} />
            <Route path="/justificaciones" element={<JustificacionesPage />} />
            <Route path="/notificaciones" element={<NotificacionesPage />} />
            <Route
              path="/justificaciones/nueva"
              element={<JustificacionFormPage />}
            />
            <Route
              path="/justificaciones/:id"
              element={<JustificacionDetallePage />}
            />
            <Route
              path="/estudiantes/:id"
              element={<EstudianteDetallePage />}
            />
            <Route
              path="/estudiantes/:id/editar"
              element={<EstudianteFormPage />}
            />
            {/* Se irán agregando aquí los módulos */}
          </Route>
        </Route>

        {/* Página sin permiso */}
        <Route
          path="/sin-permiso"
          element={
            <div className="flex items-center justify-center h-screen text-gray-500">
              No tienes permisos para acceder a esta página.
            </div>
          }
        />

        {/* Redirect raíz */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
