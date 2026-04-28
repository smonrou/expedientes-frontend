import { Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titulos: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/estudiantes': 'Estudiantes',
  '/justificaciones': 'Justificaciones',
  '/notificaciones': 'Notificaciones',
  '/catalogos': 'Catálogos',
  '/usuarios': 'Usuarios',
}

/**
 * Barra superior con el título de la sección actual y acceso rápido a notificaciones.
 */
export default function Topbar() {
  const { pathname } = useLocation()
  const titulo = titulos[pathname] ?? 'SEEC'

  return (
    <header
      className="flex items-center justify-between px-6 py-3 flex-shrink-0"
      style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}
    >
      <p className="text-sm font-medium" style={{ color: '#F4E9CD' }}>
        {titulo}
      </p>

      <div className="flex items-center gap-2">
        <button
          className="relative flex items-center justify-center rounded-lg transition hover:opacity-70"
          style={{ width: 32, height: 32, background: '#1e293b' }}
        >
          <Bell size={14} style={{ color: '#94a3b8' }} />
          {/* Badge — conectar con conteo real después */}
          <span
            className="absolute top-1 right-1 rounded-full"
            style={{ width: 6, height: 6, background: '#F4E9CD' }}
          />
        </button>
      </div>
    </header>
  )
}