import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CondicionMedicaInput } from '@/api/estudiantes'
import { actualizarCondicionesMedicas } from '@/api/estudiantes'

interface Props {
  estudianteId: number
  condicionesActuales: { descripcion: string }[]
  onClose: () => void
}

const inputStyle = {
  background: '#0f172a',
  border: '1px solid #334155',
  color: '#f1f5f9',
} as const

export default function ModalCondicionesMedicas({ estudianteId, condicionesActuales, onClose }: Props) {
  const qc = useQueryClient()
  const [lista, setLista] = useState<CondicionMedicaInput[]>(
    condicionesActuales.length > 0 ? condicionesActuales : [{ descripcion: '' }]
  )

  const mut = useMutation({
    mutationFn: (data: CondicionMedicaInput[]) => actualizarCondicionesMedicas(estudianteId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estudiante', estudianteId] })
      toast.success('Condiciones médicas actualizadas')
      onClose()
    },
    onError: () => toast.error('Error al actualizar condiciones médicas'),
  })

  const agregar = () => setLista(p => [...p, { descripcion: '' }])
  const quitar = (i: number) => setLista(p => p.filter((_, idx) => idx !== i))
  const cambiar = (i: number, val: string) =>
    setLista(p => p.map((c, idx) => idx === i ? { descripcion: val } : c))

  const guardar = () => {
    const limpios = lista.filter(c => c.descripcion.trim() !== '')
    // Lista vacía es válida — el PUT vacía la lista en el backend
    mut.mutate(limpios)
  }

  return (
    <div
      style={{ background: 'rgba(2,6,23,0.8)' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ background: '#1e293b', border: '1px solid #334155' }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
      >
        <div
          style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}
          className="px-5 py-4 flex items-center justify-between"
        >
          <h2 style={{ color: '#F4E9CD' }} className="text-sm font-semibold">
            Condiciones médicas preexistentes
          </h2>
          <button onClick={onClose} style={{ color: '#475569' }} className="text-lg leading-none hover:text-slate-300 transition">×</button>
        </div>

        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
          {lista.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Ej: Asma leve, Diabetes tipo 2..."
                value={c.descripcion}
                onChange={e => cambiar(i, e.target.value)}
                style={inputStyle}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
              />
              <button onClick={() => quitar(i)} style={{ color: '#f87171' }} className="text-sm px-2 py-2 hover:opacity-70 transition">✕</button>
            </div>
          ))}
          <button
            onClick={agregar}
            style={{ color: '#94a3b8', border: '1px dashed #334155' }}
            className="w-full py-2 rounded-lg text-sm hover:border-slate-400 transition"
          >
            + Agregar condición
          </button>
        </div>

        <div style={{ borderTop: '1px solid #1e293b' }} className="px-5 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            style={{ background: '#0f172a', color: '#94a3b8', border: '1px solid #334155' }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={mut.isPending}
            style={{ background: mut.isPending ? '#c9c0a8' : '#F4E9CD', color: '#0f172a' }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            {mut.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}