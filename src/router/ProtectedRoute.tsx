import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { Rol } from '@/types'

interface Props {
  rolesPermitidos?: Rol[]
}

/**
 * Guard de rutas. Redirige a /login si no hay sesión activa.
 * Si se especifican rolesPermitidos, verifica que el usuario tenga el rol correcto.
 */
export default function ProtectedRoute({ rolesPermitidos }: Props) {
  const { autenticado, tieneRol } = useAuth()

  if (!autenticado) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos && !tieneRol(...rolesPermitidos)) {
    return <Navigate to="/sin-permiso" replace />
  }

  return <Outlet />
}