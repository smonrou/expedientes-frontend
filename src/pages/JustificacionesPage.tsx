import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { listarPorCarrera, listarPorEstudiante } from '@/api/justificaciones'
import { listarCarreras } from '@/api/catalogos'
import { buscarEstudiantes } from '@/api/estudiantes'
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
 * ADMIN/COORDINADOR ven por carrera con filtros, y pueden buscar por estudiante específico.
 * ESTUDIANTE ve sus propias justificaciones.
 */
export default function JustificacionesPage() {
  const navigate = useNavigate()
  const { sesion, tieneRol } = useAuth()

  // Filtros para ADMIN/COORDINADOR
  const [carreraId, setCarreraId] = useState<number | undefined>()
  const [estado, setEstado] = useState<EstadoJustificacion | ''>('')

  // Búsqueda de estudiante específico
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [estudianteFiltro, setEstudianteFiltro] = useState<{ id: number; nombre: string; carne: string } | null>(null)
  const [mostrarDropdown, setMostrarDropdown] = useState(false)

  // Para ESTUDIANTE autenticado
  const estudianteIdPropio = tieneRol('ESTUDIANTE') ? sesion?.usuarioId : undefined

  const inputStyle = {
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#f1f5f9',
    ['--tw-ring-color' as string]: '#F4E9CD',
  }

  // Carreras
  const { data: carreras = [] } = useQuery({
    queryKey: ['catalogo', 'carreras'],
    queryFn: listarCarreras,
    enabled: tieneRol('ADMIN', 'COORDINADOR'),
  })

  // Búsqueda de estudiantes (solo cuando hay término y rol correcto)
  const { data: resultadosBusqueda = [] } = useQuery({
    queryKey: ['estudiantes-busqueda', terminoBusqueda, carreraId],
    queryFn: () => buscarEstudiantes(terminoBusqueda, carreraId),
    enabled: tieneRol('ADMIN', 'COORDINADOR') && terminoBusqueda.trim().length >= 2,
  })

  // Justificaciones
  const { data: justificaciones = [], isLoading } = useQuery({
    queryKey: ['justificaciones', carreraId, estado, estudianteIdPropio, estudianteFiltro?.id],
    queryFn: () => {
      // Rol ESTUDIANTE → sus propias
      if (tieneRol('ESTUDIANTE') && estudianteIdPropio) {
        return listarPorEstudiante(estudianteIdPropio)
      }
      // Filtro por estudiante específico seleccionado
      if (estudianteFiltro) {
        return listarPorEstudiante(estudianteFiltro.id)
      }
      // Filtro por carrera
      if (carreraId) {
        return listarPorCarrera(carreraId, estado || undefined)
      }
      return Promise.resolve<JustificacionResumenResponse[]>([])
    },
    enabled: tieneRol('ESTUDIANTE')
      ? !!estudianteIdPropio
      : !!estudianteFiltro || !!carreraId,
  })

  const limpiarEstudiante = () => {
    setEstudianteFiltro(null)
    setTerminoBusqueda('')
    setMostrarDropdown(false)
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
          {/* Selector de carrera — se desactiva si hay estudiante seleccionado */}
          <select
            value={carreraId ?? ''}
            onChange={e => {
              setCarreraId(e.target.value ? Number(e.target.value) : undefined)
              limpiarEstudiante()
            }}
            disabled={!!estudianteFiltro}
            className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-1 disabled:opacity-40"
            style={{ ...inputStyle, minWidth: 180 }}
          >
            <option value="">Seleccionar carrera</option>
            {carreras.map(c => (
              <option key={c.id} value={c.id} style={{ background: '#1e293b' }}>{c.nombre}</option>
            ))}
          </select>

          {/* Selector de estado — se desactiva si hay estudiante seleccionado */}
          <select
            value={estado}
            onChange={e => setEstado(e.target.value as EstadoJustificacion | '')}
            disabled={!!estudianteFiltro}
            className="px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-1 disabled:opacity-40"
            style={{ ...inputStyle, minWidth: 160 }}
          >
            {ESTADOS.map(e => (
              <option key={e.value} value={e.value} style={{ background: '#1e293b' }}>
                {e.label}
              </option>
            ))}
          </select>

          {/* Buscador de estudiante */}
          <div className="relative" style={{ minWidth: 220 }}>
            {estudianteFiltro ? (
              /* Estudiante seleccionado — chip */
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ ...inputStyle, border: '1px solid rgba(244,233,205,0.3)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#F4E9CD' }}>
                    {estudianteFiltro.nombre}
                  </p>
                  <p className="text-xs font-mono" style={{ color: '#475569' }}>
                    {estudianteFiltro.carne}
                  </p>
                </div>
                <button
                  onClick={limpiarEstudiante}
                  style={{ color: '#475569' }}
                  className="hover:text-slate-300 transition shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Campo de búsqueda */
              <>
                <input
                  type="text"
                  placeholder="Buscar por Carnet"
                  value={terminoBusqueda}
                  onChange={e => {
                    setTerminoBusqueda(e.target.value)
                    setMostrarDropdown(true)
                  }}
                  onFocus={() => setMostrarDropdown(true)}
                  onBlur={() => setTimeout(() => setMostrarDropdown(false), 150)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-1"
                  style={inputStyle}
                />
                {/* Dropdown de resultados */}
                {mostrarDropdown && resultadosBusqueda.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-20"
                    style={{ background: '#1e293b', border: '1px solid #334155' }}
                  >
                    {resultadosBusqueda.slice(0, 6).map(est => (
                      <button
                        key={est.id}
                        onMouseDown={() => {
                          setEstudianteFiltro({
                            id: est.id,
                            nombre: `${est.nombres} ${est.apellidos}`,
                            carne: est.numeroCarne,
                          })
                          setTerminoBusqueda('')
                          setMostrarDropdown(false)
                          setCarreraId(undefined)
                          setEstado('')
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-white/5 transition"
                      >
                        <p className="text-xs font-medium" style={{ color: '#cbd5e1' }}>
                          {est.nombres} {est.apellidos}
                        </p>
                        <p className="text-xs font-mono" style={{ color: '#475569' }}>
                          {est.numeroCarne}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {mostrarDropdown && terminoBusqueda.trim().length >= 2 && resultadosBusqueda.length === 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg px-3 py-3 z-20"
                    style={{ background: '#1e293b', border: '1px solid #334155' }}
                  >
                    <p className="text-xs" style={{ color: '#475569' }}>Sin resultados</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#0f172a', border: '1px solid #1e293b' }}
      >
        {!tieneRol('ESTUDIANTE') && !carreraId && !estudianteFiltro ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#475569' }}>
              Selecciona una carrera o busca un estudiante.
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