import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import {
  listarCatalogo, crearCatalogo, actualizarCatalogo, eliminarCatalogo,
  listarCarreras, crearCarrera, actualizarCarrera, eliminarCarrera,
} from '@/api/catalogos'
import TablaCatalogo from '@/components/catalogos/TablaCatalogo'
import ModalCatalogo from '@/components/catalogos/ModalCatalogo'
import ModalCarrera from '@/components/catalogos/ModalCarerra'
import type { CatalogoResponse, CarreraResponse, CarreraRequest } from '@/types'


const TABS = [
  { key: 'carreras',            label: 'Carreras' },
  { key: 'tipo-sangre',         label: 'Tipos de sangre' },
  { key: 'alergias',            label: 'Alergias' },
  { key: 'tipo-discapacidad',   label: 'Discapacidades' },
  { key: 'tipo-actividad',      label: 'Tipos de actividad' },
  { key: 'motivos-inasistencia',label: 'Motivos de inasistencia' },
] as const

type TabKey = typeof TABS[number]['key']

/**
 * Página de administración de catálogos del sistema.
 * Solo accesible para el rol ADMIN.
 */
export default function CatalogosPage() {
  const qc = useQueryClient()
  const [tabActiva, setTabActiva] = useState<TabKey>('carreras')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [itemEditando, setItemEditando] = useState<CatalogoResponse | CarreraResponse | null>(null)

  const esCarreras = tabActiva === 'carreras'
  const tabLabel = TABS.find(t => t.key === tabActiva)?.label ?? ''

  // ─── Queries ───────────────────────────────────────────────
  const { data: itemsSimples = [], isLoading: cargandoSimples } = useQuery({
    queryKey: ['catalogo', tabActiva],
    queryFn: () => listarCatalogo(tabActiva),
    enabled: !esCarreras,
  })

  const { data: carreras = [], isLoading: cargandoCarreras } = useQuery({
    queryKey: ['catalogo', 'carreras'],
    queryFn: listarCarreras,
    enabled: esCarreras,
  })

  const cargando = esCarreras ? cargandoCarreras : cargandoSimples
  const items = esCarreras ? carreras : itemsSimples

  // ─── Mutations catálogo simple ─────────────────────────────
  const crearMut = useMutation({
    mutationFn: (nombre: string) => crearCatalogo(tabActiva, { nombre }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalogo', tabActiva] }); cerrarModal(); toast.success('Registro creado') },
    onError: () => toast.error('Error al crear el registro'),
  })

  const actualizarMut = useMutation({
    mutationFn: ({ id, nombre }: { id: number; nombre: string }) =>
      actualizarCatalogo(tabActiva, id, { nombre }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalogo', tabActiva] }); cerrarModal(); toast.success('Registro actualizado') },
    onError: () => toast.error('Error al actualizar el registro'),
  })

  const eliminarMut = useMutation({
    mutationFn: (id: number) => eliminarCatalogo(tabActiva, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalogo', tabActiva] }); toast.success('Registro eliminado') },
    onError: () => toast.error('No se puede eliminar — puede estar en uso'),
  })

  // ─── Mutations carreras ────────────────────────────────────
  const crearCarreraMut = useMutation({
    mutationFn: (dto: CarreraRequest) => crearCarrera(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalogo', 'carreras'] }); cerrarModal(); toast.success('Carrera creada') },
    onError: () => toast.error('Error al crear la carrera'),
  })

  const actualizarCarreraMut = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CarreraRequest }) => actualizarCarrera(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalogo', 'carreras'] }); cerrarModal(); toast.success('Carrera actualizada') },
    onError: () => toast.error('Error al actualizar la carrera'),
  })

  const eliminarCarreraMut = useMutation({
    mutationFn: (id: number) => eliminarCarrera(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalogo', 'carreras'] }); toast.success('Carrera eliminada') },
    onError: () => toast.error('No se puede eliminar — puede estar en uso'),
  })

  // ─── Handlers ──────────────────────────────────────────────
  function cerrarModal() {
    setModalAbierto(false)
    setItemEditando(null)
  }

  function abrirCrear() {
    setItemEditando(null)
    setModalAbierto(true)
  }

  function abrirEditar(item: CatalogoResponse | CarreraResponse) {
    setItemEditando(item)
    setModalAbierto(true)
  }

  function confirmarEliminar(item: CatalogoResponse | CarreraResponse) {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return
    if (esCarreras) {
      eliminarCarreraMut.mutate(item.id)
    } else {
      eliminarMut.mutate(item.id)
    }
  }

  async function handleGuardarSimple(nombre: string) {
    if (itemEditando) {
      await actualizarMut.mutateAsync({ id: itemEditando.id, nombre })
    } else {
      await crearMut.mutateAsync(nombre)
    }
  }

  async function handleGuardarCarrera(dto: CarreraRequest) {
    if (itemEditando) {
      await actualizarCarreraMut.mutateAsync({ id: itemEditando.id, dto })
    } else {
      await crearCarreraMut.mutateAsync(dto)
    }
  }

  const mutCargando = crearMut.isPending || actualizarMut.isPending ||
    crearCarreraMut.isPending || actualizarCarreraMut.isPending

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: '#F4E9CD' }}>Catálogos</h1>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            Administración de tablas maestras del sistema
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
          style={{ background: '#F4E9CD', color: '#0f172a' }}
        >
          <Plus size={15} />
          Nuevo
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto"
        style={{ background: '#0f172a', border: '1px solid #1e293b' }}
      >
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setTabActiva(tab.key)}
            className="px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap"
            style={{
              background: tabActiva === tab.key ? '#1e293b' : 'transparent',
              color: tabActiva === tab.key ? '#F4E9CD' : '#475569',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#0f172a', border: '1px solid #1e293b' }}
      >
        {cargando ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: '#475569' }}>Cargando...</p>
          </div>
        ) : (
          <TablaCatalogo
            items={items as CatalogoResponse[]}
            onEditar={abrirEditar}
            onEliminar={confirmarEliminar}
          />
        )}
      </div>

      {/* Modales */}
      {modalAbierto && !esCarreras && (
        <ModalCatalogo
          titulo={tabLabel}
          item={itemEditando as CatalogoResponse | null}
          onGuardar={handleGuardarSimple}
          onCerrar={cerrarModal}
          cargando={mutCargando}
        />
      )}

      {modalAbierto && esCarreras && (
        <ModalCarrera
          item={itemEditando as CarreraResponse | null}
          onGuardar={handleGuardarCarrera}
          onCerrar={cerrarModal}
          cargando={mutCargando}
        />
      )}
    </div>
  )
}