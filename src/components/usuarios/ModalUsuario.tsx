import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { UsuarioResponse, Rol } from '@/types'

const schemaCrear = z.object({
  nombreUsuario: z.string().min(1, 'El nombre es requerido'),
  correo: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
  rol: z.enum(['ADMIN', 'COORDINADOR', 'ESTUDIANTE']),
})

const schemaEditar = z.object({
  nombreUsuario: z.string().min(1, 'El nombre es requerido'),
  correo: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  rol: z.enum(['ADMIN', 'COORDINADOR', 'ESTUDIANTE']),
  activo: z.boolean(),
})

type FormCrear = z.infer<typeof schemaCrear>
type FormEditar = z.infer<typeof schemaEditar>
type FormData = FormCrear | FormEditar

const ROLES: Rol[] = ['ADMIN', 'COORDINADOR', 'ESTUDIANTE']

interface Props {
  usuario?: UsuarioResponse | null
  onGuardar: (data: FormData) => Promise<void>
  onCerrar: () => void
  cargando?: boolean
}

/**
 * Modal para crear o editar un usuario del sistema.
 */
export default function ModalUsuario({ usuario, onGuardar, onCerrar, cargando }: Props) {
  const esEdicion = !!usuario

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(esEdicion ? schemaEditar : schemaCrear),
  })

  useEffect(() => {
    if (usuario) {
      reset({
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        rol: usuario.rol,
        activo: usuario.activo,
      })
    } else {
      reset({ nombreUsuario: '', correo: '', contrasena: '', rol: 'ESTUDIANTE' })
    }
  }, [usuario, reset])

  const inputStyle = (hasError: boolean) => ({
    background: '#0f172a',
    border: hasError ? '1px solid #f87171' : '1px solid #334155',
    color: '#f1f5f9',
    ['--tw-ring-color' as string]: '#F4E9CD',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.8)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #334155' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#F4E9CD' }}>
            {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
          </p>
          <button onClick={onCerrar} className="hover:opacity-70 transition">
            <X size={16} style={{ color: '#475569' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onGuardar)} className="px-6 py-5 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Nombre de usuario
            </label>
            <input
              type="text"
              placeholder="Juan García"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1"
              style={inputStyle(!!(errors as Record<string, unknown>).nombreUsuario)}
              {...register('nombreUsuario')}
            />
            {(errors as Record<string, { message?: string }>).nombreUsuario && (
              <p className="text-xs mt-1" style={{ color: '#f87171' }}>
                {(errors as Record<string, { message?: string }>).nombreUsuario?.message}
              </p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="usuario@cunori.edu.gt"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1"
              style={inputStyle(!!(errors as Record<string, unknown>).correo)}
              {...register('correo')}
            />
            {(errors as Record<string, { message?: string }>).correo && (
              <p className="text-xs mt-1" style={{ color: '#f87171' }}>
                {(errors as Record<string, { message?: string }>).correo?.message}
              </p>
            )}
          </div>

          {/* Contraseña — solo en creación */}
          {!esEdicion && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1"
                style={inputStyle(!!(errors as Record<string, unknown>).contrasena)}
                {...register('contrasena')}
              />
              {(errors as Record<string, { message?: string }>).contrasena && (
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>
                  {(errors as Record<string, { message?: string }>).contrasena?.message}
                </p>
              )}
            </div>
          )}

          {/* Rol */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              Rol
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition focus:ring-1"
              style={inputStyle(false)}
              {...register('rol')}
            >
              {ROLES.map(r => (
                <option key={r} value={r} style={{ background: '#0f172a' }}>{r}</option>
              ))}
            </select>
          </div>

          {/* Activo — solo en edición */}
          {esEdicion && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="activo"
                className="w-4 h-4 rounded"
                style={{ accentColor: '#F4E9CD' }}
                {...register('activo')}
              />
              <label htmlFor="activo" className="text-sm" style={{ color: '#94a3b8' }}>
                Usuario activo
              </label>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCerrar}
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
              {cargando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}