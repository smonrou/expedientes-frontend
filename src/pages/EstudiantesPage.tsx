import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { listarEstudiantes, buscarEstudiantes } from '@/api/estudiantes'
import { listarCarreras } from '@/api/catalogos'
import { useAuth } from '@/hooks/useAuth'
import type { EstudianteResumenResponse } from '@/types'

/**
 * Página de listado de estudiantes con búsqueda y filtro por carrera.
 */
export default function EstudiantesPage() {
  const navigate = useNavigate()
  const { tieneRol } = useAuth()
  const [termino, setTermino] = useState('')
  const [carreraId, setCarreraId] = useState<number | undefined>()
  const [busquedaActiva, setBusquedaActiva] = useState(false)

  const { data: carreras = [] } = useQuery({
    queryKey: ['catalogo', 'carreras'],
    queryFn: listarCarreras,
  })

  const { data: estudiantes = [], isLoading } = useQuery({
    queryKey: ['estudiantes', busquedaActiva, termino, carreraId],
    queryFn: () =>
      busquedaActiva && termino.trim()
        ? buscarEstudiantes(termino.trim(), carreraId)
        : listarEstudiantes(),
  })

  function handleBuscar() {
    if (termino.trim()) setBusquedaActiva(true)
  }

  function handleLimpiar() {
    setTermino('')
    setCarreraId(undefined)
    setBusquedaActiva(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleBuscar()
  }

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: '#F4E9CD' }}>Estudiantes</h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            {estudiantes.length} registro{estudiantes.length !== 1 ? 's' : ''}
          </p>
        </div>
        {tieneRol('ADMIN') && (
          <button
            onClick={() => navigate('/estudiantes/nuevo')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
            style={{ background: '#F4E9CD', color: '#0f172a' }}
          >
            <Plus size={15} />
            Nuevo estudiante
          </button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div
        className="flex gap-3 p-4 rounded-xl"
        style={{ background: '#0f172a', border: '1px solid #1e293b' }}
      >
        {/* Input búsqueda */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#475569' }}
          />
          <input
            type="text"
            value={termino}
            onChange={e => setTermino(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre, carné o correo..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1"
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f1f5f9',
              ['--tw-ring-color' as string]: '#F4E9CD',
            }}
          />
        </div>

        {/* Filtro carrera */}
        <select
          value={carreraId ?? ''}
          onChange={e => setCarreraId(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1"
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            color: carreraId ? '#f1f5f9' : '#475569',
            ['--tw-ring-color' as string]: '#F4E9CD',
            minWidth: 160,
          }}
        >
          <option value="">Todas las carreras</option>
          {carreras.map(c => (
            <option key={c.id} value={c.id} style={{ background: '#1e293b' }}>
              {c.nombre}
            </option>
          ))}
        </select>

        {/* Botón buscar */}
        <button
          onClick={handleBuscar}
          className="px-4 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90"
          style={{ background: '#F4E9CD', color: '#0f172a' }}
        >
          Buscar
        </button>

        {/* Limpiar */}
        {busquedaActiva && (
          <button
            onClick={handleLimpiar}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm transition hover:opacity-70"
            style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#0f172a', border: '1px solid #1e293b' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#475569' }}>Cargando...</p>
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#475569' }}>
              {busquedaActiva ? 'Sin resultados para la búsqueda.' : 'No hay estudiantes registrados.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['Carné', 'Nombre', 'Carrera', 'Correo', 'Año ingreso', 'Estado', ''].map(col => (
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
                {estudiantes.map((e, i) => (
                  <FilaEstudiante
                    key={e.id}
                    estudiante={e}
                    ultimo={i === estudiantes.length - 1}
                    onClick={() => navigate(`/estudiantes/${e.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-componente fila ──────────────────────────────────────────────────────
function FilaEstudiante({
  estudiante: e,
  ultimo,
  onClick,
}: {
  estudiante: EstudianteResumenResponse
  ultimo: boolean
  onClick: () => void
}) {
  return (
    <tr
      style={{ borderBottom: ultimo ? 'none' : '1px solid #1e293b', cursor: 'pointer' }}
      className="transition hover:bg-white/5"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <span
          className="px-2 py-0.5 rounded-md text-xs font-mono font-medium"
          style={{ background: 'rgba(244,233,205,0.08)', color: '#F4E9CD' }}
        >
          {e.numeroCarne}
        </span>
      </td>
      <td className="px-4 py-3 font-medium" style={{ color: '#cbd5e1' }}>
        {e.nombres} {e.apellidos}
      </td>
      <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{e.carreraNombre}</td>
      <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{e.correoInstitucional}</td>
      <td className="px-4 py-3 text-xs" style={{ color: '#475569' }}>{e.anioIngreso}</td>
      <td className="px-4 py-3">
        <span
          className="px-2 py-0.5 rounded-md text-xs font-medium"
          style={{
            background: e.inscrito ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
            color: e.inscrito ? '#22c55e' : '#f87171',
          }}
        >
          {e.inscrito ? 'Inscrito' : 'No inscrito'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs" style={{ color: '#475569' }}>
        Ver →
      </td>
    </tr>
  )
}