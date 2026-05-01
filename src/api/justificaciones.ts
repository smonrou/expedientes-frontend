import api from "./axios";
import type {
  JustificacionResumenResponse,
  JustificacionResponse,
  JustificacionRequest,
  CambioEstadoRequest,
  EstadoJustificacion,
} from "@/types";

/**
 * Obtiene las justificaciones de un estudiante específico.
 */
export async function listarPorEstudiante(
  estudianteId: number,
): Promise<JustificacionResumenResponse[]> {
  const { data } = await api.get<JustificacionResumenResponse[]>(
    `/justificaciones/estudiante/${estudianteId}`,
  );
  return data;
}

/**
 * Obtiene las justificaciones de una carrera, con filtro opcional por estado.
 */
export async function listarPorCarrera(
  carreraId: number,
  estado?: EstadoJustificacion,
): Promise<JustificacionResumenResponse[]> {
  const { data } = await api.get<JustificacionResumenResponse[]>(
    `/justificaciones/carrera/${carreraId}`,
    { params: estado ? { estado } : {} },
  );
  return data;
}

/**
 * Obtiene el detalle completo de una justificación.
 */
export async function obtenerJustificacion(
  id: number,
): Promise<JustificacionResponse> {
  const { data } = await api.get<JustificacionResponse>(
    `/justificaciones/${id}`,
  );
  return data;
}

/**
 * Crea una nueva justificación para un estudiante.
 */
export async function crearJustificacion(
  estudianteId: number,
  dto: JustificacionRequest,
): Promise<JustificacionResponse> {
  const { data } = await api.post<JustificacionResponse>(
    `/justificaciones/estudiante/${estudianteId}`,
    dto,
  );
  return data;
}

/**
 * Cambia el estado de una justificación (solo ADMIN y COORDINADOR).
 */
export async function cambiarEstado(
  id: number,
  revisadoPorId: number,
  dto: CambioEstadoRequest,
): Promise<JustificacionResponse> {
  const { data } = await api.patch<JustificacionResponse>(
    `/justificaciones/${id}/estado`,
    dto,
    { params: { revisadoPorId } },
  );
  return data;
}

/**
 * Sube un documento adjunto a una justificación.
 */
export async function subirDocumento(
  justificacionId: number,
  archivo: File,
): Promise<JustificacionResponse> {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const { data } = await api.post<JustificacionResponse>(
    `/justificaciones/${justificacionId}/documentos`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/**
 * Descarga un documento adjunto y lo abre como descarga en el navegador.
 */
export async function descargarDocumento(
  documentoId: number,
  nombreOriginal: string,
): Promise<void> {
  const response = await api.get(
    `/justificaciones/documentos/${documentoId}/descargar`,
    { responseType: "blob" },
  );
  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreOriginal;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Elimina un documento adjunto de una justificación.
 */
export async function eliminarDocumento(
  justificacionId: number,
  documentoId: number,
): Promise<void> {
  await api.delete(
    `/justificaciones/${justificacionId}/documentos/${documentoId}`,
  );
}
