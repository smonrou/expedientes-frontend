import { Pencil, Trash2 } from 'lucide-react'
import type { CarreraResponse } from '@/types'

interface Props {
  items: CarreraResponse[]
  onEditar: (item: CarreraResponse) => void
  onEliminar: (item: CarreraResponse) => void
}

/**
 * Tabla específica para el catálogo de carreras.
 * Muestra nombre, código y coordinador.
 */
export default function TablaCarreras({ items, onEditar, onEliminar }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: '#475569' }}>No hay carreras registradas.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #1e293b' }}>
            {['ID', 'Nombre', 'Código', 'Coordinador', 'Acciones'].map(col => (
              <th
                key={col}
                className={`px-4 py-3 text-xs font-medium uppercase tracking-wider ${col === 'Acciones' ? 'text-right' : 'text-left'}`}
                style={{ color: '#475569' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              style={{ borderBottom: i < items.length - 1 ? '1px solid #1e293b' : 'none' }}
              className="transition hover:bg-white/5"
            >
              <td className="px-4 py-3 text-xs" style={{ color: '#475569' }}>{item.id}</td>
              <td className="px-4 py-3 font-medium" style={{ color: '#cbd5e1' }}>{item.nombre}</td>
              <td className="px-4 py-3">
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{ background: 'rgba(244,233,205,0.08)', color: '#F4E9CD' }}
                >
                  {item.codigo}
                </span>
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{item.nombreCoordinador}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditar(item)}
                    className="flex items-center justify-center rounded-lg transition hover:opacity-70"
                    style={{ width: 30, height: 30, background: '#1e293b' }}
                    title="Editar"
                  >
                    <Pencil size={13} style={{ color: '#94a3b8' }} />
                  </button>
                  <button
                    onClick={() => onEliminar(item)}
                    className="flex items-center justify-center rounded-lg transition hover:opacity-70"
                    style={{ width: 30, height: 30, background: '#1e293b' }}
                    title="Eliminar"
                  >
                    <Trash2 size={13} style={{ color: '#f87171' }} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}