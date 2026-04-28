import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import AppLayout from '@/components/layout/AppLayout'

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
  )
}