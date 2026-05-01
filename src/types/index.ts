export type Rol = "ADMIN" | "COORDINADOR" | "ESTUDIANTE";

export type Genero = "MASCULINO" | "FEMENINO" | "OTRO";

export type TipoTelefono = "CASA" | "CELULAR" | "TRABAJO";

export type EstadoJustificacion =
  | "PRESENTADA"
  | "EN_REVISION"
  | "APROBADA"
  | "RECHAZADA";

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

export interface CatalogoRequest {
  nombre: string;
}

export interface CatalogoResponse {
  id: number;
  nombre: string;
}

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
  creadoEn: string;
}

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

export interface EstudianteCreateRequest {
  nombreUsuario: string;
  contrasena: string;
  numeroCarne: string;
  carreraId: number;
  anioIngreso: number;
  tipoSangreId?: number;
  nombres: string;
  apellidos: string;
  cui: string;
  fechaNacimiento: string;
  genero: Genero;
  correoInstitucional: string;
  correoPersonal?: string;
  direccion: string;
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
  fechaNacimiento: string;
  genero: Genero;
  correoInstitucional: string;
  correoPersonal?: string;
  direccion: string;
  inscrito: boolean;
  pensumCerrado: boolean;
  fechaCierrePensum?: string;
  rutaFotografia?: string;
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
  fechaNacimiento: string;
  genero: Genero;
  correoInstitucional: string;
  correoPersonal?: string;
  anioIngreso: number;
  inscrito: boolean;
  pensumCerrado: boolean;
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

export interface ActividadRequest {
  tipoActividadId: number;
  nombre: string;
  institucion?: string;
  fechaInicio: string;
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
  fechaInicio: string;
  fechaFin?: string;
  observaciones?: string;
}

export interface JustificacionRequest {
  motivoId: number;
  descripcion: string;
  fechas: string[];
}

export interface CambioEstadoRequest {
  nuevoEstado: EstadoJustificacion;
}

export interface FechaInasistenciaResponse {
  id: number;
  fecha: string;
}

export interface DocumentoResponse {
  id: number;
  nombreOriginal: string;
  tipoMime: string;
  subidoEn: string;
}

export interface JustificacionResumenResponse {
  id: number;
  estudianteId: number;
  estudianteNombre: string;
  estudianteNumeroCarne: string;
  motivoNombre: string;
  estado: EstadoJustificacion;
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
  fechaPresentacion: string;
  fechaRevision?: string;
  revisadoPorId?: number;
  revisadoPorNombre?: string;
  fechas: FechaInasistenciaResponse[];
  documentos: DocumentoResponse[];
}

export interface NotificacionResponse {
  id: number;
  destinatarioId: number;
  justificacionId: number;
  mensaje: string;
  leida: boolean;
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
