import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import {
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from '@/api/notificaciones'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { NotificacionResponse } from '@/types'

/**
 * Página de notificaciones del usuario autenticado.
 */
export default function NotificacionesPage() {
  const { sesion } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const usuarioId = sesion!.usuarioId

  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones', usuarioId],
    queryFn: () => listarNotificaciones(usuarioId),
  })

  const marcarLeidaMut = useMutation({
    mutationFn: (id: number) => marcarLeida(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificaciones', usuarioId] })
      qc.invalidateQueries({ queryKey: ['notificaciones-conteo', usuarioId] })
    },
  })

  const marcarTodasMut = useMutation({
    mutationFn: () => marcarTodasLeidas(usuarioId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notificaciones', usuarioId] })
      qc.invalidateQueries({ queryKey: ['notificaciones-conteo', usuarioId] })
      toast.success('Todas marcadas como leídas')
    },
  })

  const noLeidas = notificaciones.filter(n => !n.leida).length

  function handleClick(n: NotificacionResponse) {
    if (!n.leida) {
      marcarLeidaMut.mutate(n.id)
    }
    navigate(`/justificaciones/${n.justificacionId}`)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: '#F4E9CD' }}>
            Notificaciones
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            {noLeidas > 0
              ? `${noLeidas} sin leer`
              : 'Todo al día'}
          </p>
        </div>

        {noLeidas > 0 && (
          <button
            onClick={() => marcarTodasMut.mutate()}
            disabled={marcarTodasMut.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition hover:opacity-80"
            style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
          >
            <CheckCheck size={14} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Lista */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#0f172a', border: '1px solid #1e293b' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#475569' }}>Cargando...</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BellOff size={28} style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#475569' }}>
              No tienes notificaciones.
            </p>
          </div>
        ) : (
          <div>
            {notificaciones.map((n, i) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className="flex items-start gap-4 px-5 py-4 transition cursor-pointer hover:bg-white/5"
                style={{
                  borderBottom: i < notificaciones.length - 1 ? '1px solid #1e293b' : 'none',
                  background: n.leida ? 'transparent' : 'rgba(244,233,205,0.03)',
                }}
              >
                {/* Ícono */}
                <div
                  className="flex items-center justify-center rounded-lg shrink-0 mt-0.5"
                  style={{
                    width: 32,
                    height: 32,
                    background: n.leida
                      ? 'rgba(71,85,105,0.3)'
                      : 'rgba(244,233,205,0.1)',
                  }}
                >
                  <Bell
                    size={14}
                    style={{ color: n.leida ? '#475569' : '#F4E9CD' }}
                  />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: n.leida ? '#64748b' : '#cbd5e1' }}
                  >
                    {n.mensaje}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#475569' }}>
                    {format(new Date(n.creadaEn), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>

                {/* Indicador no leída */}
                {!n.leida && (
                  <div
                    className="rounded-full shrink-0 mt-1.5"
                    style={{ width: 7, height: 7, background: '#F4E9CD' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}