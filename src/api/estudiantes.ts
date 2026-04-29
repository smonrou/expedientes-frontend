import api from './axios'
import type {
  EstudianteResumenResponse,
  EstudianteResponse,
  EstudianteCreateRequest,
  EstudianteUpdateRequest,
  TelefonoRequest,
  CondicionMedicaRequest,
  AlergiaRequest,
  DiscapacidadRequest,
  ContactoEmergenciaRequest,
} from '@/types'

/**
 * Obtiene el listado completo de estudiantes (resumen).
 */
export async function listarEstudiantes(): Promise<EstudianteResumenResponse[]> {
  const { data } = await api.get<EstudianteResumenResponse[]>('/estudiantes')
  return data
}

/**
 * Busca estudiantes por término y opcionalmente por carrera.
 */
export async function buscarEstudiantes(
  termino: string,
  carreraId?: number
): Promise<EstudianteResumenResponse[]> {
  const { data } = await api.get<EstudianteResumenResponse[]>('/estudiantes/buscar', {
    params: { termino, ...(carreraId ? { carreraId } : {}) },
  })
  return data
}

/**
 * Obtiene el expediente completo de un estudiante por ID.
 */
export async function obtenerEstudiante(id: number): Promise<EstudianteResponse> {
  const { data } = await api.get<EstudianteResponse>(`/estudiantes/${id}`)
  return data
}

/**
 * Obtiene el expediente del estudiante autenticado.
 */
export async function obtenerMiExpediente(usuarioId: number): Promise<EstudianteResponse> {
  const { data } = await api.get<EstudianteResponse>('/estudiantes/mi-expediente', {
    params: { usuarioId },
  })
  return data
}

/**
 * Crea un nuevo estudiante con su usuario y datos completos.
 */
export async function crearEstudiante(dto: EstudianteCreateRequest): Promise<EstudianteResponse> {
  const { data } = await api.post<EstudianteResponse>('/estudiantes', dto)
  return data
}

/**
 * Actualiza los datos académicos y personales de un estudiante.
 */
export async function actualizarEstudiante(
  id: number,
  dto: EstudianteUpdateRequest
): Promise<EstudianteResponse> {
  const { data } = await api.put<EstudianteResponse>(`/estudiantes/${id}`, dto)
  return data
}

/**
 * Reemplaza la lista de teléfonos del estudiante.
 */
export async function actualizarTelefonos(
  id: number,
  telefonos: TelefonoRequest[]
): Promise<EstudianteResponse> {
  const { data } = await api.put<EstudianteResponse>(`/estudiantes/${id}/telefonos`, telefonos)
  return data
}

/**
 * Reemplaza la lista de condiciones médicas del estudiante.
 */
export async function actualizarCondicionesMedicas(
  id: number,
  condiciones: CondicionMedicaRequest[]
): Promise<EstudianteResponse> {
  const { data } = await api.put<EstudianteResponse>(`/estudiantes/${id}/condiciones-medicas`, condiciones)
  return data
}

/**
 * Reemplaza la lista de alergias del estudiante.
 */
export async function actualizarAlergias(
  id: number,
  alergias: AlergiaRequest[]
): Promise<EstudianteResponse> {
  const { data } = await api.put<EstudianteResponse>(`/estudiantes/${id}/alergias`, alergias)
  return data
}

/**
 * Reemplaza la lista de discapacidades del estudiante.
 */
export async function actualizarDiscapacidades(
  id: number,
  discapacidades: DiscapacidadRequest[]
): Promise<EstudianteResponse> {
  const { data } = await api.put<EstudianteResponse>(`/estudiantes/${id}/discapacidades`, discapacidades)
  return data
}

/**
 * Reemplaza la lista de contactos de emergencia del estudiante.
 */
export async function actualizarContactosEmergencia(
  id: number,
  contactos: ContactoEmergenciaRequest[]
): Promise<EstudianteResponse> {
  const { data } = await api.put<EstudianteResponse>(`/estudiantes/${id}/contactos-emergencia`, contactos)
  return data
}

export interface TelefonoInput {
  numero: string
  tipo: 'CASA' | 'CELULAR' | 'TRABAJO'
}

export interface CondicionMedicaInput {
  descripcion: string
}

export interface AlergiaInput {
  alergiaId: number
  observaciones?: string | null
}

export interface DiscapacidadInput {
  tipoDiscapacidadId: number
  observaciones?: string | null
}

export interface ContactoEmergenciaInput {
  nombreCompleto: string
  parentesco: string
  direccion?: string
}