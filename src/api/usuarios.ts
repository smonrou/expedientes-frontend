import api from "./axios";
import type {
  UsuarioResponse,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  CambioContrasenaRequest,
} from "@/types";

/**
 * Obtiene la lista completa de usuarios del sistema.
 */
export async function listarUsuarios(): Promise<UsuarioResponse[]> {
  const { data } = await api.get<UsuarioResponse[]>("/usuarios");
  return data;
}

/**
 * Obtiene un usuario por su ID.
 */
export async function obtenerUsuario(id: number): Promise<UsuarioResponse> {
  const { data } = await api.get<UsuarioResponse>(`/usuarios/${id}`);
  return data;
}

/**
 * Crea un nuevo usuario en el sistema.
 */
export async function crearUsuario(
  dto: UsuarioCreateRequest,
): Promise<UsuarioResponse> {
  const { data } = await api.post<UsuarioResponse>("/usuarios", dto);
  return data;
}

/**
 * Actualiza los datos de un usuario existente.
 */
export async function actualizarUsuario(
  id: number,
  dto: UsuarioUpdateRequest,
): Promise<UsuarioResponse> {
  const { data } = await api.put<UsuarioResponse>(`/usuarios/${id}`, dto);
  return data;
}

/**
 * Cambia la contraseña de un usuario.
 */
export async function cambiarContrasena(
  id: number,
  dto: CambioContrasenaRequest,
): Promise<void> {
  await api.patch(`/usuarios/${id}/contrasena`, dto);
}

/**
 * Reactiva un usuario desactivado.
 */
export async function activarUsuario(id: number): Promise<void> {
  await api.patch(`/usuarios/${id}/activar`);
}

/**
 * Desactiva un usuario activo.
 */
export async function desactivarUsuario(id: number): Promise<void> {
  await api.patch(`/usuarios/${id}/desactivar`);
}
