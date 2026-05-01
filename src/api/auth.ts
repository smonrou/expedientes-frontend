import api from "./axios";
import type { LoginRequest, LoginResponse } from "@/types";

/**
 * Realiza el login contra el backend y retorna los datos de sesión con el JWT.
 */
export async function login(datos: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", datos);
  return data;
}
