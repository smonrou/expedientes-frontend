import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { listarPorCarrera, listarPorEstudiante } from '@/api/justificaciones'
import { listarCarreras } from '@/api/catalogos'
import { useAuth } from '@/hooks/useAuth'
import BadgeEstado from '@/components/justificaciones/BadgeEstado'
import type { EstadoJustificacion, JustificacionResumenResponse } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADOS: { value: EstadoJustificacion | ''; label: string }[] = [
  { value: '',            label: 'Todos los estados' },
  { value: 'PRESENTADA',  label: 'Presentada'  },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'APROBADA',    label: 'Aprobada'    },
  { value: 'RECHAZADA',   label: 'Rechazada'   },
]

/**
 * Página principal de justificaciones.
 * ADMIN/COORDINADOR ven por carrera con filtros.
 * ESTUDIANTE ve sus propias justificaciones.
 */
export default function JustificacionesPage() {
  const navigate = useNavigate()
  const { sesion, tieneRol } = useAuth()
  const [carreraId, setCarreraId] = useState<number | undefined>()
  const [estado, setEstado] = useState<EstadoJustificacion | ''>('')
  const [estudianteId] = useState<number | undefined>(
    tieneRol('ESTUDIANTE') ? sesion?.usuarioId : undefined
  )

  const { data: carreras = [] } = useQuery({
    queryKey: ['catalogo', 'carreras'],
    queryFn: listarCarreras,
    enabled: tieneRol('ADMIN', 'COORDINADOR'),
  })

  const { data: justificaciones = [], isLoading } = useQuery({
    queryKey: ['justificaciones', carreraId, estado, estudianteId],
    queryFn: () => {
      if (tieneRol('ESTUDIANTE') && estudianteId) {
        return listarPorEstudiante(estudianteId)
      }
      if (carreraId) {
        return listarPorCarrera(carreraId, estado || undefined)
      }
      return Promise.resolve<JustificacionResumenResponse[]>([])
    },
    enabled: tieneRol('ESTUDIANTE') ? !!estudianteId : !!carreraId,
  })

  const inputStyle = {
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#f1f5f9',
    ['--tw-ring-color' as string]: '#F4E9CD',
  }

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: '#F4E9CD' }}>
            Justificaciones
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            {tieneRol('ESTUDIANTE')
              ? 'Tus justificaciones de inasistencia'
              : 'Gestión de justificaciones por carrera'}
          </p>
        </div>
        {tieneRol('ADMIN', 'ESTUDIANTE') && (
          <button
            onClick={() => navigate('/justificaciones/nueva')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
            style={{ background: '#F4E9CD', color: '#0f172a' }}
          >
            <Plus size={15} />
            Nueva justificación
          </button>
        )}
      </div>

      {/* Filtros — solo ADMIN/COORDINADOR */}
      {tieneRol('ADMIN', 'COORDINADOR') && (
        <div
          className="flex gap-3 p-4 rounded-xl flex-wrap"
          style={{ background: '#0f172a', border: '1px solid #1e293b' }}
        >
          <select
            value={carreraId ?? ''}
            onChange={e => setCarreraId(e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-1"
            style={{ ...inputStyle, minWidth: 180 }}
          >
            <option value="">Seleccionar carrera</option>
            {carreras.map(c => (
              <option key={c.id} value={c.id} style={{ background: '#1e293b' }}>{c.nombre}</option>
            ))}
          </select>

          <select
            value={estado}
            onChange={e => setEstado(e.target.value as EstadoJustificacion | '')}
            className="px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-1"
            style={{ ...inputStyle, minWidth: 160 }}
          >
            {ESTADOS.map(e => (
              <option key={e.value} value={e.value} style={{ background: '#1e293b' }}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabla */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#0f172a', border: '1px solid #1e293b' }}
      >
        {!tieneRol('ESTUDIANTE') && !carreraId ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#475569' }}>
              Selecciona una carrera para ver las justificaciones.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#475569' }}>Cargando...</p>
          </div>
        ) : justificaciones.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#475569' }}>
              No hay justificaciones registradas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['Estudiante', 'Motivo', 'Fechas', 'Estado', 'Presentada', ''].map(col => (
                    <th
                      key={col}
                      className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-left"
                      style={{ color: '#475569' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {justificaciones.map((j, i) => (
                  <tr
                    key={j.id}
                    style={{
                      borderBottom: i < justificaciones.length - 1 ? '1px solid #1e293b' : 'none',
                      cursor: 'pointer',
                    }}
                    className="transition hover:bg-white/5"
                    onClick={() => navigate(`/justificaciones/${j.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p style={{ color: '#cbd5e1' }}>{j.estudianteNombre}</p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: '#475569' }}>
                        {j.estudianteNumeroCarne}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                      {j.motivoNombre}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ background: 'rgba(244,233,205,0.08)', color: '#F4E9CD' }}
                      >
                        {j.totalFechas} día{j.totalFechas !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado estado={j.estado} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#475569' }}>
                      {format(new Date(j.fechaPresentacion), 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#475569' }}>
                      Ver →
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}