import type { SesionUsuario } from '@/types'

const TOKEN_KEY = 'seec_token'
const SESION_KEY = 'seec_sesion'

/**
 * Guarda la sesión del usuario en localStorage.
 */
export function guardarSesion(sesion: SesionUsuario): void {
  localStorage.setItem(TOKEN_KEY, sesion.token)
  localStorage.setItem(SESION_KEY, JSON.stringify(sesion))
}

/**
 * Recupera la sesión guardada, o null si no existe.
 */
export function obtenerSesion(): SesionUsuario | null {
  const raw = localStorage.getItem(SESION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SesionUsuario
  } catch {
    return null
  }
}

/**
 * Recupera el token JWT actual, o null si no hay sesión.
 */
export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Elimina la sesión del usuario (logout).
 */
export function cerrarSesion(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(SESION_KEY)
}

/**
 * Retorna true si hay una sesión activa.
 */
export function haySession(): boolean {
  return !!obtenerToken()
}