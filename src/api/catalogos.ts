import api from './axios'
import type {
  CatalogoRequest,
  CatalogoResponse,
  CarreraRequest,
  CarreraResponse,
} from '@/types'


/**
 * Obtiene todos los registros de un catálogo simple.
 */
export async function listarCatalogo(ruta: string): Promise<CatalogoResponse[]> {
  const { data } = await api.get<CatalogoResponse[]>(`/catalogos/${ruta}`)
  return data
}

/**
 * Crea un nuevo registro en un catálogo simple.
 */
export async function crearCatalogo(ruta: string, dto: CatalogoRequest): Promise<CatalogoResponse> {
  const { data } = await api.post<CatalogoResponse>(`/catalogos/${ruta}`, dto)
  return data
}

/**
 * Actualiza un registro existente en un catálogo simple.
 */
export async function actualizarCatalogo(ruta: string, id: number, dto: CatalogoRequest): Promise<CatalogoResponse> {
  const { data } = await api.put<CatalogoResponse>(`/catalogos/${ruta}/${id}`, dto)
  return data
}

/**
 * Elimina un registro de un catálogo simple.
 */
export async function eliminarCatalogo(ruta: string, id: number): Promise<void> {
  await api.delete(`/catalogos/${ruta}/${id}`)
}

// ─── Carreras ─────────────────────────────────────────────────────────────────

/**
 * Obtiene todas las carreras.
 */
export async function listarCarreras(): Promise<CarreraResponse[]> {
  const { data } = await api.get<CarreraResponse[]>('/catalogos/carreras')
  return data
}

/**
 * Obtiene una carrera por ID.
 */
export async function obtenerCarrera(id: number): Promise<CarreraResponse> {
  const { data } = await api.get<CarreraResponse>(`/catalogos/carreras/${id}`)
  return data
}

/**
 * Crea una nueva carrera.
 */
export async function crearCarrera(dto: CarreraRequest): Promise<CarreraResponse> {
  const { data } = await api.post<CarreraResponse>('/catalogos/carreras', dto)
  return data
}

/**
 * Actualiza una carrera existente.
 */
export async function actualizarCarrera(id: number, dto: CarreraRequest): Promise<CarreraResponse> {
  const { data } = await api.put<CarreraResponse>(`/catalogos/carreras/${id}`, dto)
  return data
}

/**
 * Elimina una carrera.
 */
export async function eliminarCarrera(id: number): Promise<void> {
  await api.delete(`/catalogos/carreras/${id}`)
}