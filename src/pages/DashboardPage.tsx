import { useAuth } from '@/hooks/useAuth'

/**
 * Página principal del dashboard. Muestra resumen según el rol del usuario.
 */
export default function DashboardPage() {
  const { sesion } = useAuth()

  return (
    <div className="space-y-6">

      {/* Saludo */}
      <div>
        <h1 className="text-lg font-semibold" style={{ color: '#F4E9CD' }}>
          Bienvenido, {sesion?.nombreUsuario}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#475569' }}>
          {sesion?.rol === 'ADMIN' && 'Tienes acceso total al sistema.'}
          {sesion?.rol === 'COORDINADOR' && 'Gestiona las justificaciones de tu carrera.'}
          {sesion?.rol === 'ESTUDIANTE' && 'Consulta y gestiona tu expediente.'}
        </p>
      </div>

      {/* Cards de stats — placeholder, se conectan al backend después */}
      {(sesion?.rol === 'ADMIN' || sesion?.rol === 'COORDINADOR') && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Estudiantes', valor: '—' },
            { label: 'Justificaciones', valor: '—' },
            { label: 'Carreras', valor: '—' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-xl p-5"
              style={{ background: '#0f172a', border: '1px solid #1e293b' }}
            >
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: '#475569', fontSize: 10 }}
              >
                {stat.label}
              </p>
              <p className="text-2xl font-semibold" style={{ color: '#F4E9CD' }}>
                {stat.valor}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}