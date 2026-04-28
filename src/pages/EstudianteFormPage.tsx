import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { obtenerEstudiante, crearEstudiante, actualizarEstudiante } from '@/api/estudiantes'
import { listarCarreras, listarCatalogo } from '@/api/catalogos'
import type { Genero } from '@/types'

const schemaCrear = z.object({
  nombreUsuario: z.string().min(1, 'Requerido'),
  contrasena: z.string().min(8, 'Mínimo 8 caracteres'),
  numeroCarne: z.string().min(1, 'Requerido'),
  carreraId: z.coerce.number().min(1, 'Selecciona una carrera'),
  anioIngreso: z.coerce.number().min(2000).max(new Date().getFullYear()),
  tipoSangreId: z.coerce.number().optional(),
  nombres: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  cui: z.string().min(13, 'El CUI debe tener 13 dígitos').max(13),
  fechaNacimiento: z.string().min(1, 'Requerido'),
  genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO']),
  correoInstitucional: z.string().email('Correo inválido'),
  correoPersonal: z.string().email('Correo inválido').optional().or(z.literal('')),
  direccion: z.string().min(1, 'Requerido'),
})

const schemaEditar = schemaCrear.omit({ nombreUsuario: true, contrasena: true, numeroCarne: true, cui: true }).extend({
  inscrito: z.boolean(),
  pensumCerrado: z.boolean(),
  fechaCierrePensum: z.string().optional(),
})

type FormCrear = z.infer<typeof schemaCrear>
type FormEditar = z.infer<typeof schemaEditar>

const GENEROS: { value: Genero; label: string }[] = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
  { value: 'OTRO', label: 'Otro' },
]

/**
 * Página de formulario para crear o editar un estudiante.
 */
export default function EstudianteFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const esEdicion = !!id

  const { data: carreras = [] } = useQuery({ queryKey: ['catalogo', 'carreras'], queryFn: listarCarreras })
  const { data: tiposSangre = [] } = useQuery({ queryKey: ['catalogo', 'tipo-sangre'], queryFn: () => listarCatalogo('tipo-sangre') })
  const { data: estudiante } = useQuery({
    queryKey: ['estudiante', id],
    queryFn: () => obtenerEstudiante(Number(id)),
    enabled: esEdicion,
  })

  const schema = esEdicion ? schemaEditar : schemaCrear
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (esEdicion && estudiante) {
      reset({
        nombres: estudiante.nombres,
        apellidos: estudiante.apellidos,
        fechaNacimiento: estudiante.fechaNacimiento,
        genero: estudiante.genero,
        correoInstitucional: estudiante.correoInstitucional,
        correoPersonal: estudiante.correoPersonal ?? '',
        direccion: estudiante.direccion,
        carreraId: estudiante.carreraId,
        tipoSangreId: estudiante.tipoSangreId ?? undefined,
        anioIngreso: estudiante.anioIngreso,
        inscrito: estudiante.inscrito,
        pensumCerrado: estudiante.pensumCerrado,
        fechaCierrePensum: estudiante.fechaCierrePensum ?? '',
      })
    }
  }, [estudiante, esEdicion, reset])

  const crearMut = useMutation({
    mutationFn: crearEstudiante,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['estudiantes'] })
      toast.success('Estudiante creado correctamente')
      navigate(`/estudiantes/${data.id}`)
    },
    onError: (error: { response?: { status: number } }) => {
      if (error.response?.status === 409) {
        toast.error('El carné, CUI, correo o usuario ya está en uso')
      } else {
        toast.error('Error al crear el estudiante')
      }
    },
  })

  const editarMut = useMutation({
    mutationFn: (dto: FormEditar) => actualizarEstudiante(Number(id), {
      ...dto,
      tipoSangreId: dto.tipoSangreId || undefined,
      correoPersonal: dto.correoPersonal || undefined,
      fechaCierrePensum: dto.fechaCierrePensum || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estudiante', id] })
      qc.invalidateQueries({ queryKey: ['estudiantes'] })
      toast.success('Estudiante actualizado')
      navigate(`/estudiantes/${id}`)
    },
    onError: () => toast.error('Error al actualizar el estudiante'),
  })

  function onSubmit(data: Record<string, unknown>) {
    if (esEdicion) {
      editarMut.mutate(data as unknown as FormEditar)
    } else {
      crearMut.mutate({
        ...data as unknown as FormCrear,
        telefonos: [],
        condicionesMedicas: [],
        alergias: [],
        discapacidades: [],
        contactosEmergencia: [],
      })
    }
  }

  const cargando = crearMut.isPending || editarMut.isPending

  const inputStyle = (hasError: boolean) => ({
    background: '#0f172a',
    border: hasError ? '1px solid #f87171' : '1px solid #334155',
    color: '#f1f5f9',
    ['--tw-ring-color' as string]: '#F4E9CD',
  })

  const pensumCerrado = watch('pensumCerrado')

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(esEdicion ? `/estudiantes/${id}` : '/estudiantes')}
          className="flex items-center justify-center rounded-lg transition hover:opacity-70"
          style={{ width: 32, height: 32, background: '#1e293b' }}
        >
          <ArrowLeft size={15} style={{ color: '#94a3b8' }} />
        </button>
        <div>
          <h1 className="text-lg font-semibold" style={{ color: '#F4E9CD' }}>
            {esEdicion ? 'Editar estudiante' : 'Nuevo estudiante'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            {esEdicion ? 'Modifica los datos del expediente' : 'Completa los datos para registrar al estudiante'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Sección: Acceso — solo creación */}
        {!esEdicion && (
          <FormSeccion titulo="Credenciales de acceso">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Nombre de usuario" error={(errors as Record<string, { message?: string }>).nombreUsuario?.message}>
                <input type="text" placeholder="jperez" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).nombreUsuario)} {...register('nombreUsuario')} />
              </FormField>
              <FormField label="Contraseña" error={(errors as Record<string, { message?: string }>).contrasena?.message}>
                <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).contrasena)} {...register('contrasena')} />
              </FormField>
            </div>
          </FormSeccion>
        )}

        {/* Sección: Académico */}
        <FormSeccion titulo="Datos académicos">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!esEdicion && (
              <FormField label="Número de carné" error={(errors as Record<string, { message?: string }>).numeroCarne?.message}>
                <input type="text" placeholder="202012345" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 font-mono" style={inputStyle(!!(errors as Record<string, unknown>).numeroCarne)} {...register('numeroCarne')} />
              </FormField>
            )}
            <FormField label="Carrera" error={(errors as Record<string, { message?: string }>).carreraId?.message}>
              <select className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).carreraId)} {...register('carreraId')}>
                <option value="">Seleccionar carrera</option>
                {carreras.map(c => <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.nombre}</option>)}
              </select>
            </FormField>
            <FormField label="Año de ingreso" error={(errors as Record<string, { message?: string }>).anioIngreso?.message}>
              <input type="number" placeholder="2024" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).anioIngreso)} {...register('anioIngreso')} />
            </FormField>
            <FormField label="Tipo de sangre" error={undefined}>
              <select className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(false)} {...register('tipoSangreId')}>
                <option value="">Sin especificar</option>
                {tiposSangre.map(t => <option key={t.id} value={t.id} style={{ background: '#0f172a' }}>{t.nombre}</option>)}
              </select>
            </FormField>
          </div>
          {esEdicion && (
            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#94a3b8' }}>
                <input type="checkbox" style={{ accentColor: '#F4E9CD' }} {...register('inscrito')} />
                Inscrito
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#94a3b8' }}>
                <input type="checkbox" style={{ accentColor: '#F4E9CD' }} {...register('pensumCerrado')} />
                Pensum cerrado
              </label>
            </div>
          )}
          {esEdicion && pensumCerrado && (
            <FormField label="Fecha de cierre de pensum" error={undefined}>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(false)} {...register('fechaCierrePensum')} />
            </FormField>
          )}
        </FormSeccion>

        {/* Sección: Personal */}
        <FormSeccion titulo="Datos personales">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nombres" error={(errors as Record<string, { message?: string }>).nombres?.message}>
              <input type="text" placeholder="Juan Carlos" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).nombres)} {...register('nombres')} />
            </FormField>
            <FormField label="Apellidos" error={(errors as Record<string, { message?: string }>).apellidos?.message}>
              <input type="text" placeholder="Pérez López" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).apellidos)} {...register('apellidos')} />
            </FormField>
            {!esEdicion && (
              <FormField label="CUI" error={(errors as Record<string, { message?: string }>).cui?.message}>
                <input type="text" placeholder="1234567890101" maxLength={13} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 font-mono" style={inputStyle(!!(errors as Record<string, unknown>).cui)} {...register('cui')} />
              </FormField>
            )}
            <FormField label="Fecha de nacimiento" error={(errors as Record<string, { message?: string }>).fechaNacimiento?.message}>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).fechaNacimiento)} {...register('fechaNacimiento')} />
            </FormField>
            <FormField label="Género" error={(errors as Record<string, { message?: string }>).genero?.message}>
              <select className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).genero)} {...register('genero')}>
                <option value="">Seleccionar</option>
                {GENEROS.map(g => <option key={g.value} value={g.value} style={{ background: '#0f172a' }}>{g.label}</option>)}
              </select>
            </FormField>
            <FormField label="Dirección" error={(errors as Record<string, { message?: string }>).direccion?.message}>
              <input type="text" placeholder="Zona 1, Chiquimula" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).direccion)} {...register('direccion')} />
            </FormField>
          </div>
        </FormSeccion>

        {/* Sección: Contacto */}
        <FormSeccion titulo="Correos">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Correo institucional" error={(errors as Record<string, { message?: string }>).correoInstitucional?.message}>
              <input type="email" placeholder="juan@cunori.edu.gt" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).correoInstitucional)} {...register('correoInstitucional')} />
            </FormField>
            <FormField label="Correo personal (opcional)" error={(errors as Record<string, { message?: string }>).correoPersonal?.message}>
              <input type="email" placeholder="juan@gmail.com" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1" style={inputStyle(!!(errors as Record<string, unknown>).correoPersonal)} {...register('correoPersonal')} />
            </FormField>
          </div>
        </FormSeccion>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(esEdicion ? `/estudiantes/${id}` : '/estudiantes')}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{ background: '#0f172a', color: '#94a3b8', border: '1px solid #334155' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition"
            style={{
              background: cargando ? '#c9c0a8' : '#F4E9CD',
              color: '#0f172a',
              cursor: cargando ? 'not-allowed' : 'pointer',
            }}
          >
            {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear estudiante'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Sub-componentes del formulario ──────────────────────────────────────────
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

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  )
}