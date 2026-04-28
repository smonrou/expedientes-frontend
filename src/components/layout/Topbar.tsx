import { Bell } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { conteoNoLeidas } from '@/api/notificaciones'
import { useAuth } from '@/hooks/useAuth'

const titulos: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/estudiantes':     'Estudiantes',
  '/justificaciones': 'Justificaciones',
  '/notificaciones':  'Notificaciones',
  '/catalogos':       'Catálogos',
  '/usuarios':        'Usuarios',
}

/**
 * Barra superior con título de sección y badge de notificaciones con polling cada 30s.
 */
export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { sesion } = useAuth()

  const titulo = Object.entries(titulos).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'SEEC'

  const { data } = useQuery({
    queryKey: ['notificaciones-conteo', sesion?.usuarioId],
    queryFn: () => conteoNoLeidas(sesion!.usuarioId),
    enabled: !!sesion,
    refetchInterval: 30_000,
  })

  const conteo = data?.total ?? 0

  return (
    <header
      className="flex items-center justify-between px-6 py-3 shrink-0"
      style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}
    >
      <p className="text-sm font-medium" style={{ color: '#F4E9CD' }}>
        {titulo}
      </p>

      <button
        onClick={() => navigate('/notificaciones')}
        className="relative flex items-center justify-center rounded-lg transition hover:opacity-70"
        style={{ width: 32, height: 32, background: '#1e293b' }}
      >
        <Bell size={14} style={{ color: '#94a3b8' }} />
        {conteo > 0 && (
          <span
            className="absolute flex items-center justify-center rounded-full text-xs font-bold"
            style={{
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              background: '#F4E9CD',
              color: '#0f172a',
              fontSize: 9,
              padding: '0 3px',
            }}
          >
            {conteo > 99 ? '99+' : conteo}
          </span>
        )}
      </button>
    </header>
  )
}