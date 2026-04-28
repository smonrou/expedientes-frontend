import { obtenerSesion, cerrarSesion, haySession } from '@/stores/authStore'
import type { SesionUsuario, Rol } from '@/types'

/**
 * Hook que expone la sesión actual del usuario y utilidades de autenticación.
 */
export function useAuth() {
  const sesion: SesionUsuario | null = obtenerSesion()
  const autenticado: boolean = haySession()

  /**
   * Verifica si el usuario tiene alguno de los roles indicados.
   */
  function tieneRol(...roles: Rol[]): boolean {
    if (!sesion) return false
    return roles.includes(sesion.rol)
  }

  return {
    sesion,
    autenticado,
    tieneRol,
    logout: cerrarSesion,
  }
}