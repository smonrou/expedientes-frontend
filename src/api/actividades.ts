import api from "./axios";
import type { ActividadRequest, ActividadResponse } from "@/types";

/**
 * Lista todas las actividades extracurriculares de un estudiante.
 */
export async function listarActividades(
  estudianteId: number,
): Promise<ActividadResponse[]> {
  const { data } = await api.get<ActividadResponse[]>(
    `/estudiantes/${estudianteId}/actividades`,
  );
  return data;
}

/**
 * Obtiene el detalle de una actividad extracurricular por su ID.
 */
export async function obtenerActividad(
  estudianteId: number,
  id: number,
): Promise<ActividadResponse> {
  const { data } = await api.get<ActividadResponse>(
    `/estudiantes/${estudianteId}/actividades/${id}`,
  );
  return data;
}

/**
 * Crea una nueva actividad extracurricular para un estudiante.
 */
export async function crearActividad(
  estudianteId: number,
  dto: ActividadRequest,
): Promise<ActividadResponse> {
  const { data } = await api.post<ActividadResponse>(
    `/estudiantes/${estudianteId}/actividades`,
    dto,
  );
  return data;
}

/**
 * Actualiza los datos de una actividad extracurricular existente.
 */
export async function actualizarActividad(
  estudianteId: number,
  id: number,
  dto: ActividadRequest,
): Promise<ActividadResponse> {
  const { data } = await api.put<ActividadResponse>(
    `/estudiantes/${estudianteId}/actividades/${id}`,
    dto,
  );
  return data;
}

/**
 * Elimina una actividad extracurricular de un estudiante.
 */
export async function eliminarActividad(
  estudianteId: number,
  id: number,
): Promise<void> {
  await api.delete(`/estudiantes/${estudianteId}/actividades/${id}`);
}
