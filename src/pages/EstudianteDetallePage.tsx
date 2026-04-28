import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'
import { obtenerEstudiante } from '@/api/estudiantes'
import { useAuth } from '@/hooks/useAuth'

/**
 * Página de detalle/expediente completo de un estudiante.
 */
export default function EstudianteDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tieneRol } = useAuth()

  const { data: est, isLoading } = useQuery({
    queryKey: ['estudiante', id],
    queryFn: () => obtenerEstudiante(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: '#475569' }}>Cargando expediente...</p>
      </div>
    )
  }

  if (!est) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/estudiantes')}
            className="flex items-center justify-center rounded-lg transition hover:opacity-70"
            style={{ width: 32, height: 32, background: '#1e293b' }}
          >
            <ArrowLeft size={15} style={{ color: '#94a3b8' }} />
          </button>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: '#F4E9CD' }}>
              {est.nombres} {est.apellidos}
            </h1>
            <p className="text-xs mt-0.5 font-mono" style={{ color: '#475569' }}>
              {est.numeroCarne}
            </p>
          </div>
        </div>
        {tieneRol('ADMIN') && (
          <button
            onClick={() => navigate(`/estudiantes/${id}/editar`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
            style={{ background: '#F4E9CD', color: '#0f172a' }}
          >
            <Pencil size={14} />
            Editar
          </button>
        )}
      </div>

      {/* Grid de secciones */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Datos personales */}
        <Seccion titulo="Datos personales">
          <Campo label="Nombres" valor={`${est.nombres} ${est.apellidos}`} />
          <Campo label="CUI" valor={est.cui} mono />
          <Campo label="Fecha de nacimiento" valor={est.fechaNacimiento} />
          <Campo label="Género" valor={est.genero} />
          <Campo label="Dirección" valor={est.direccion} />
        </Seccion>

        {/* Datos académicos */}
        <Seccion titulo="Datos académicos">
          <Campo label="Carné" valor={est.numeroCarne} mono />
          <Campo label="Carrera" valor={est.carreraNombre} />
          <Campo label="Año de ingreso" valor={String(est.anioIngreso)} />
          <Campo label="Inscrito" valor={est.inscrito ? 'Sí' : 'No'} />
          <Campo label="Pensum cerrado" valor={est.pensumCerrado ? 'Sí' : 'No'} />
          {est.fechaCierrePensum && (
            <Campo label="Fecha cierre pensum" valor={est.fechaCierrePensum} />
          )}
        </Seccion>

        {/* Contacto */}
        <Seccion titulo="Contacto">
          <Campo label="Correo institucional" valor={est.correoInstitucional} />
          {est.correoPersonal && <Campo label="Correo personal" valor={est.correoPersonal} />}
          {est.tipoSangreNombre && <Campo label="Tipo de sangre" valor={est.tipoSangreNombre} badge />}
          {est.telefonos.map(t => (
            <Campo key={t.id} label={t.tipo} valor={t.numero} mono />
          ))}
        </Seccion>

        {/* Información médica */}
        <Seccion titulo="Información médica">
          {est.condicionesMedicas.length === 0 && est.alergias.length === 0 && est.discapacidades.length === 0 ? (
            <p className="text-xs" style={{ color: '#475569' }}>Sin registros médicos.</p>
          ) : (
            <>
              {est.condicionesMedicas.map(c => (
                <Campo key={c.id} label="Condición" valor={c.descripcion} />
              ))}
              {est.alergias.map(a => (
                <Campo key={a.alergiaId} label="Alergia" valor={a.observaciones ? `${a.nombre} — ${a.observaciones}` : a.nombre} />
              ))}
              {est.discapacidades.map(d => (
                <Campo key={d.tipoDiscapacidadId} label="Discapacidad" valor={d.observaciones ? `${d.nombre} — ${d.observaciones}` : d.nombre} />
              ))}
            </>
          )}
        </Seccion>

      </div>

      {/* Contactos de emergencia — ancho completo */}
      {est.contactosEmergencia.length > 0 && (
        <Seccion titulo="Contactos de emergencia">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {est.contactosEmergencia.map(c => (
              <div
                key={c.id}
                className="rounded-lg p-3 space-y-1"
                style={{ background: '#0f172a', border: '1px solid #1e293b' }}
              >
                <p className="text-sm font-medium" style={{ color: '#cbd5e1' }}>{c.nombreCompleto}</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{c.parentesco}</p>
                {c.direccion && <p className="text-xs" style={{ color: '#475569' }}>{c.direccion}</p>}
              </div>
            ))}
          </div>
        </Seccion>
      )}
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ background: '#0f172a', border: '1px solid #1e293b' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#475569', fontSize: 10 }}>
        {titulo}
      </p>
      {children}
    </div>
  )
}

function Campo({ label, valor, mono, badge }: { label: string; valor: string; mono?: boolean; badge?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs shrink-0" style={{ color: '#475569' }}>{label}</p>
      {badge ? (
        <span
          className="px-2 py-0.5 rounded-md text-xs font-medium"
          style={{ background: 'rgba(244,233,205,0.08)', color: '#F4E9CD' }}
        >
          {valor}
        </span>
      ) : (
        <p
          className={`text-xs text-right ${mono ? 'font-mono' : ''}`}
          style={{ color: '#cbd5e1' }}
        >
          {valor}
        </p>
      )}
    </div>
  )
}