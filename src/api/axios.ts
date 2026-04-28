import axios from 'axios'
import { obtenerToken, cerrarSesion } from '@/stores/authStore'

/**
 * Instancia principal de Axios configurada para el backend SEEC.
 * Agrega automáticamente el token JWT en cada petición.
 */
const api = axios.create({
  baseURL: '/api',   // el proxy de Vite lo redirige a localhost:8080
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Interceptor de request: adjunta el JWT ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = obtenerToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Interceptor de response: manejo global de errores ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido — cerrar sesión y redirigir
      cerrarSesion()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api