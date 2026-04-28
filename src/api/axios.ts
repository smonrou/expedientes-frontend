import axios from 'axios'
import { obtenerToken, cerrarSesion } from '@/stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// ─── Interceptor de request ───────────────────────────────────
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

// ─── Interceptor de response ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      cerrarSesion()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api