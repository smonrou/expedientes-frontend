// ============================================================
// src/types/index.ts
// Tipos globales del proyecto SEEC — generados desde DTOs Java
// ============================================================

// ─────────────────────────────────────────────────────────────
// ENUMS (mapeados como union types)
// ─────────────────────────────────────────────────────────────

export type Rol = 'ADMIN' | 'COORDINADOR' | 'ESTUDIANTE';

export type Genero = 'MASCULINO' | 'FEMENINO' | 'OTRO';

export type TipoTelefono = 'CASA' | 'CELULAR' | 'TRABAJO';

export type EstadoJustificacion =
  | 'PRESENTADA'
  | 'EN_REVISION'
  | 'APROBADA'
  | 'RECHAZADA';

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  correo: string;
  nombreUsuario: string;
  rol: Rol;
  usuarioId: number;
}

// ─────────────────────────────────────────────────────────────
// CATÁLOGOS SIMPLES
// TipoSangre · Alergia · TipoDiscapacidad · TipoActividad · MotivoInasistencia
// ─────────────────────────────────────────────────────────────

export interface CatalogoRequest {
  nombre: string;
}

export interface CatalogoResponse {
  id: number;
  nombre: string;
}

// ─────────────────────────────────────────────────────────────
// CARRERA
// ─────────────────────────────────────────────────────────────

export interface CarreraRequest {
  nombre: string;
  codigo: string;
  nombreCoordinador: string;
}

export interface CarreraResponse {
  id: number;
  nombre: string;
  codigo: string;
  nombreCoordinador: string;
}

// ─────────────────────────────────────────────────────────────
// USUARIO
// ─────────────────────────────────────────────────────────────

export interface UsuarioCreateRequest {
  nombreUsuario: string;
  contrasena: string;
  correo: string;
  rol: Rol;
}

export interface UsuarioUpdateRequest {
  nombreUsuario: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export interface CambioContrasenaRequest {
  nuevaContrasena: string;
}

export interface UsuarioResponse {
  id: number;
  nombreUsuario: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  /** ISO 8601 — LocalDateTime serializado por Jackson */
  creadoEn: string;
}

// ─────────────────────────────────────────────────────────────
// ESTUDIANTE — Sub-DTOs
// ─────────────────────────────────────────────────────────────

export interface TelefonoRequest {
  numero: string;
  tipo: TipoTelefono;
}

export interface TelefonoResponse {
  id: number;
  numero: string;
  tipo: TipoTelefono;
}

export interface CondicionMedicaRequest {
  descripcion: string;
}

export interface CondicionMedicaResponse {
  id: number;
  descripcion: string;
}

export interface AlergiaRequest {
  alergiaId: number;
  observaciones?: string;
}

export interface AlergiaResponse {
  alergiaId: number;
  nombre: string;
  observaciones?: string;
}

export interface DiscapacidadRequest {
  tipoDiscapacidadId: number;
  observaciones?: string;
}

export interface DiscapacidadResponse {
  tipoDiscapacidadId: number;
  nombre: string;
  observaciones?: string;
}

export interface ContactoEmergenciaRequest {
  nombreCompleto: string;
  parentesco: string;
  direccion?: string;
}

export interface ContactoEmergenciaResponse {
  id: number;
  nombreCompleto: string;
  parentesco: string;
  direccion?: string;
}

// ─────────────────────────────────────────────────────────────
// ESTUDIANTE
// ─────────────────────────────────────────────────────────────

export interface EstudianteCreateRequest {
  // Acceso
  nombreUsuario: string;
  contrasena: string;
  // Académico
  numeroCarne: string;
  carreraId: number;
  anioIngreso: number;
  tipoSangreId?: number;
  // Personal
  nombres: string;
  apellidos: string;
  cui: string;
  /** ISO 8601 — LocalDate */
  fechaNacimiento: string;
  genero: Genero;
  correoInstitucional: string;
  correoPersonal?: string;
  direccion: string;
  // Sub-entidades opcionales
  telefonos?: TelefonoRequest[];
  condicionesMedicas?: CondicionMedicaRequest[];
  alergias?: AlergiaRequest[];
  discapacidades?: DiscapacidadRequest[];
  contactosEmergencia?: ContactoEmergenciaRequest[];
}

export interface EstudianteUpdateRequest {
  carreraId: number;
  tipoSangreId?: number;
  nombres: string;
  apellidos: string;
  /** ISO 8601 — LocalDate */
  fechaNacimiento: string;
  genero: Genero;
  correoInstitucional: string;
  correoPersonal?: string;
  direccion: string;
  inscrito: boolean;
  pensumCerrado: boolean;
  /** ISO 8601 — LocalDate */
  fechaCierrePensum?: string;
}

export interface EstudianteResumenResponse {
  id: number;
  numeroCarne: string;
  nombres: string;
  apellidos: string;
  correoInstitucional: string;
  carreraNombre: string;
  inscrito: boolean;
  anioIngreso: number;
}

export interface EstudianteResponse {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  correoUsuario: string;
  numeroCarne: string;
  nombres: string;
  apellidos: string;
  cui: string;
  /** ISO 8601 — LocalDate */
  fechaNacimiento: string;
  genero: Genero;
  correoInstitucional: string;
  correoPersonal?: string;
  anioIngreso: number;
  inscrito: boolean;
  pensumCerrado: boolean;
  /** ISO 8601 — LocalDate */
  fechaCierrePensum?: string;
  direccion: string;
  rutaFotografia?: string;
  carreraId: number;
  carreraNombre: string;
  tipoSangreId?: number;
  tipoSangreNombre?: string;
  telefonos: TelefonoResponse[];
  condicionesMedicas: CondicionMedicaResponse[];
  alergias: AlergiaResponse[];
  discapacidades: DiscapacidadResponse[];
  contactosEmergencia: ContactoEmergenciaResponse[];
}

// ─────────────────────────────────────────────────────────────
// ACTIVIDAD EXTRACURRICULAR
// ─────────────────────────────────────────────────────────────

export interface ActividadRequest {
  tipoActividadId: number;
  nombre: string;
  institucion?: string;
  /** ISO 8601 — LocalDate */
  fechaInicio: string;
  /** ISO 8601 — LocalDate */
  fechaFin?: string;
  observaciones?: string;
}

export interface ActividadResponse {
  id: number;
  estudianteId: number;
  tipoActividadId: number;
  tipoActividadNombre: string;
  nombre: string;
  institucion?: string;
  /** ISO 8601 — LocalDate */
  fechaInicio: string;
  /** ISO 8601 — LocalDate */
  fechaFin?: string;
  observaciones?: string;
}

// ─────────────────────────────────────────────────────────────
// JUSTIFICACIONES DE INASISTENCIA
// ─────────────────────────────────────────────────────────────

export interface JustificacionRequest {
  motivoId: number;
  descripcion: string;
  /** ISO 8601 — LocalDate[] */
  fechas: string[];
}

export interface CambioEstadoRequest {
  nuevoEstado: EstadoJustificacion;
}

export interface FechaInasistenciaResponse {
  id: number;
  /** ISO 8601 — LocalDate */
  fecha: string;
}

export interface DocumentoResponse {
  id: number;
  nombreOriginal: string;
  tipoMime: string;
  /** ISO 8601 — LocalDateTime */
  subidoEn: string;
}

export interface JustificacionResumenResponse {
  id: number;
  estudianteId: number;
  estudianteNombre: string;
  estudianteNumeroCarne: string;
  motivoNombre: string;
  estado: EstadoJustificacion;
  /** ISO 8601 — LocalDateTime */
  fechaPresentacion: string;
  totalFechas: number;
}

export interface JustificacionResponse {
  id: number;
  estudianteId: number;
  estudianteNombre: string;
  estudianteNumeroCarne: string;
  motivoId: number;
  motivoNombre: string;
  descripcion: string;
  estado: EstadoJustificacion;
  /** ISO 8601 — LocalDateTime */
  fechaPresentacion: string;
  /** ISO 8601 — LocalDateTime */
  fechaRevision?: string;
  revisadoPorId?: number;
  revisadoPorNombre?: string;
  fechas: FechaInasistenciaResponse[];
  documentos: DocumentoResponse[];
}

// ─────────────────────────────────────────────────────────────
// NOTIFICACIONES
// ─────────────────────────────────────────────────────────────

export interface NotificacionResponse {
  id: number;
  destinatarioId: number;
  justificacionId: number;
  mensaje: string;
  leida: boolean;
  /** ISO 8601 — LocalDateTime */
  creadaEn: string;
}

export interface ConteoNoLeidasResponse {
  total: number;
}

export interface SesionUsuario {
  token: string;
  correo: string;
  nombreUsuario: string;
  rol: Rol;
  usuarioId: number;
}