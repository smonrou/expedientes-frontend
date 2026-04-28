import api from './axios'
import type { NotificacionResponse, ConteoNoLeidasResponse } from '@/types'

/**
 * Obtiene todas las notificaciones de un usuario.
 * No leídas primero, luego por fecha descendente.
 */
export async function listarNotificaciones(destinatarioId: number): Promise<NotificacionResponse[]> {
  const { data } = await api.get<NotificacionResponse[]>(
    `/notificaciones/usuario/${destinatarioId}`
  )
  return data
}

/**
 * Obtiene solo las notificaciones no leídas de un usuario.
 */
export async function listarNoLeidas(destinatarioId: number): Promise<NotificacionResponse[]> {
  const { data } = await api.get<NotificacionResponse[]>(
    `/notificaciones/usuario/${destinatarioId}/no-leidas`
  )
  return data
}

/**
 * Obtiene el conteo de notificaciones no leídas. Usado para el badge.
 */
export async function conteoNoLeidas(destinatarioId: number): Promise<ConteoNoLeidasResponse> {
  const { data } = await api.get<ConteoNoLeidasResponse>(
    `/notificaciones/usuario/${destinatarioId}/conteo`
  )
  return data
}

/**
 * Marca una notificación específica como leída.
 */
export async function marcarLeida(id: number): Promise<void> {
  await api.patch(`/notificaciones/${id}/leida`)
}

/**
 * Marca todas las notificaciones del usuario como leídas.
 */
export async function marcarTodasLeidas(destinatarioId: number): Promise<void> {
  await api.patch(`/notificaciones/usuario/${destinatarioId}/marcar-todas-leidas`)
}