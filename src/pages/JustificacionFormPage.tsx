import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, X, Plus } from 'lucide-react'
import { crearJustificacion } from '@/api/justificaciones'
import { listarCatalogo } from '@/api/catalogos'
import { listarEstudiantes } from '@/api/estudiantes'
import { useAuth } from '@/hooks/useAuth'
import type { Resolver } from 'react-hook-form'

const schema = z.object({
  estudianteId: z.coerce.number().min(1, 'Selecciona un estudiante'),
  motivoId: z.coerce.number().min(1, 'Selecciona un motivo'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
})

type FormData = z.infer<typeof schema>

/**
 * Página para crear una nueva justificación de inasistencia.
 */
export default function JustificacionFormPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { sesion, tieneRol } = useAuth()
  const [fechas, setFechas] = useState<string[]>([])
  const [nuevaFecha, setNuevaFecha] = useState('')

  const { data: motivos = [] } = useQuery({
    queryKey: ['catalogo', 'motivos-inasistencia'],
    queryFn: () => listarCatalogo('motivos-inasistencia'),
  })

  const { data: estudiantes = [] } = useQuery({
    queryKey: ['estudiantes'],
    queryFn: listarEstudiantes,
    enabled: tieneRol('ADMIN'),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema) as Resolver<FormData>,
  defaultValues: {
    estudianteId: tieneRol('ESTUDIANTE') ? sesion?.usuarioId : 0,
    motivoId: 0,
    descripcion: '',
  },
})

  const crearMut = useMutation({
    mutationFn: (data: FormData) =>
      crearJustificacion(data.estudianteId, {
        motivoId: data.motivoId,
        descripcion: data.descripcion,
        fechas,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['justificaciones'] })
      toast.success('Justificación presentada correctamente')
      navigate(`/justificaciones/${data.id}`)
    },
    onError: (error: { response?: { status: number } }) => {
      if (error.response?.status === 409) {
        toast.error('Una o más fechas ya están cubiertas por otra justificación')
      } else {
        toast.error('Error al presentar la justificación')
      }
    },
  })

  function agregarFecha() {
    if (!nuevaFecha) return
    if (fechas.includes(nuevaFecha)) {
      toast.error('Esa fecha ya fue agregada')
      return
    }
    setFechas(prev => [...prev, nuevaFecha].sort())
    setNuevaFecha('')
  }

  function quitarFecha(fecha: string) {
    setFechas(prev => prev.filter(f => f !== fecha))
  }

  function onSubmit(data: FormData) {
    if (fechas.length === 0) {
      toast.error('Agrega al menos una fecha de inasistencia')
      return
    }
    crearMut.mutate(data)
  }

  const inputStyle = (hasError: boolean) => ({
    background: '#0f172a',
    border: hasError ? '1px solid #f87171' : '1px solid #334155',
    color: '#f1f5f9',
    ['--tw-ring-color' as string]: '#F4E9CD',
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/justificaciones')}
          className="flex items-center justify-center rounded-lg transition hover:opacity-70"
          style={{ width: 32, height: 32, background: '#1e293b' }}
        >
          <ArrowLeft size={15} style={{ color: '#94a3b8' }} />
        </button>
        <div>
          <h1 className="text-lg font-semibold" style={{ color: '#F4E9CD' }}>
            Nueva justificación
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            Completa los datos para presentar la justificación
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}>

        {/* Estudiante — solo ADMIN */}
        {tieneRol('ADMIN') && (
          <FormSeccion titulo="Estudiante">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Estudiante
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1"
                style={inputStyle(!!errors.estudianteId)}
                {...register('estudianteId')}
              >
                <option value="">Seleccionar estudiante</option>
                {estudiantes.map(e => (
                  <option key={e.id} value={e.id} style={{ background: '#0f172a' }}>
                    {e.nombres} {e.apellidos} — {e.numeroCarne}
                  </option>
                ))}
              </select>
              {errors.estudianteId && (
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>
                  {errors.estudianteId.message}
                </p>
              )}
            </div>
          </FormSeccion>
        )}

        {/* Motivo y descripción */}
        <FormSeccion titulo="Justificación">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Motivo
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1"
              style={inputStyle(!!errors.motivoId)}
              {...register('motivoId')}
            >
              <option value="">Seleccionar motivo</option>
              {motivos.map(m => (
                <option key={m.id} value={m.id} style={{ background: '#0f172a' }}>{m.nombre}</option>
              ))}
            </select>
            {errors.motivoId && (
              <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.motivoId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Descripción
            </label>
            <textarea
              rows={4}
              placeholder="Describe el motivo de la inasistencia..."
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1 resize-none"
              style={inputStyle(!!errors.descripcion)}
              {...register('descripcion')}
            />
            {errors.descripcion && (
              <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.descripcion.message}</p>
            )}
          </div>
        </FormSeccion>

        {/* Fechas de inasistencia */}
        <FormSeccion titulo="Fechas de inasistencia">
          <div className="flex gap-2">
            <input
              type="date"
              value={nuevaFecha}
              onChange={e => setNuevaFecha(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1"
              style={inputStyle(false)}
            />
            <button
              type="button"
              onClick={agregarFecha}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90"
              style={{ background: '#F4E9CD', color: '#0f172a' }}
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>

          {fechas.length === 0 ? (
            <p className="text-xs" style={{ color: '#475569' }}>
              Agrega al menos una fecha de inasistencia.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {fechas.map(f => (
                <span
                  key={f}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono"
                  style={{ background: '#1e293b', color: '#F4E9CD', border: '1px solid #334155' }}
                >
                  {f}
                  <button
                    type="button"
                    onClick={() => quitarFecha(f)}
                    className="hover:opacity-70 transition"
                  >
                    <X size={11} style={{ color: '#94a3b8' }} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </FormSeccion>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/justificaciones')}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ background: '#0f172a', color: '#94a3b8', border: '1px solid #334155' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={crearMut.isPending}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
            style={{
              background: crearMut.isPending ? '#c9c0a8' : '#F4E9CD',
              color: '#0f172a',
              cursor: crearMut.isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {crearMut.isPending ? 'Presentando...' : 'Presentar justificación'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormSeccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: '#0f172a', border: '1px solid #1e293b' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#475569', fontSize: 10 }}>
        {titulo}
      </p>
      {children}
    </div>
  )
}