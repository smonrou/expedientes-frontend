import type { EstadoJustificacion } from '@/types'

const CONFIG: Record<EstadoJustificacion, { label: string; color: string; bg: string }> = {
  PRESENTADA:  { label: 'Presentada',  color: '#F4E9CD', bg: 'rgba(244,233,205,0.1)' },
  EN_REVISION: { label: 'En revisión', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  APROBADA:    { label: 'Aprobada',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  RECHAZADA:   { label: 'Rechazada',   color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
}

/**
 * Badge visual para mostrar el estado de una justificación.
 */
export default function BadgeEstado({ estado }: { estado: EstadoJustificacion }) {
  const { label, color, bg } = CONFIG[estado]
  return (
    <span
      className="px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  )
}