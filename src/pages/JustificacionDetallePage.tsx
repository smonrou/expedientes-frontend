import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Upload, Download, Trash2 } from "lucide-react";
import { useRef } from "react";
import {
  obtenerJustificacion,
  cambiarEstado,
  subirDocumento,
  descargarDocumento,
  eliminarDocumento,
} from "@/api/justificaciones";
import { useAuth } from "@/hooks/useAuth";
import BadgeEstado from "@/components/justificaciones/BadgeEstado";
import type { EstadoJustificacion } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TRANSICIONES: Record<EstadoJustificacion, EstadoJustificacion[]> = {
  PRESENTADA: ["EN_REVISION"],
  EN_REVISION: ["APROBADA", "RECHAZADA"],
  APROBADA: [],
  RECHAZADA: [],
};

const LABEL_ACCION: Record<EstadoJustificacion, string> = {
  EN_REVISION: "Marcar en revisión",
  APROBADA: "Aprobar",
  RECHAZADA: "Rechazar",
  PRESENTADA: "",
};

/**
 * Página de detalle de una justificación con cambio de estado y gestión de documentos.
 */
export default function JustificacionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { sesion, tieneRol } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: just, isLoading } = useQuery({
    queryKey: ["justificacion", id],
    queryFn: () => obtenerJustificacion(Number(id)),
    enabled: !!id,
  });

  const estadoMut = useMutation({
    mutationFn: (nuevoEstado: EstadoJustificacion) =>
      cambiarEstado(Number(id), sesion!.usuarioId, { nuevoEstado }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["justificacion", id] });
      qc.invalidateQueries({ queryKey: ["justificaciones"] });
      toast.success("Estado actualizado");
    },
    onError: () => toast.error("Transición de estado no válida"),
  });

  const subirMut = useMutation({
    mutationFn: (archivo: File) => subirDocumento(Number(id), archivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["justificacion", id] });
      toast.success("Documento subido");
    },
    onError: (error: { response?: { status: number } }) => {
      if (error.response?.status === 409) {
        toast.error("No se puede subir documentos en este estado");
      } else {
        toast.error("Error al subir el documento");
      }
    },
  });

  const eliminarDocMut = useMutation({
    mutationFn: (documentoId: number) =>
      eliminarDocumento(Number(id), documentoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["justificacion", id] });
      toast.success("Documento eliminado");
    },
    onError: () => toast.error("No se puede eliminar el documento"),
  });

  function handleArchivoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    subirMut.mutate(archivo);
    e.target.value = "";
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "#475569" }}>
          Cargando...
        </p>
      </div>
    );
  }

  if (!just) return null;

  const transicionesPosibles = TRANSICIONES[just.estado];
  const puedeSubirDoc =
    !["APROBADA", "RECHAZADA"].includes(just.estado) &&
    tieneRol("ADMIN", "ESTUDIANTE");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/justificaciones")}
            className="flex items-center justify-center rounded-lg transition hover:opacity-70"
            style={{ width: 32, height: 32, background: "#1e293b" }}
          >
            <ArrowLeft size={15} style={{ color: "#94a3b8" }} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-lg font-semibold"
                style={{ color: "#F4E9CD" }}
              >
                Justificación #{just.id}
              </h1>
              <BadgeEstado estado={just.estado} />
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              {just.estudianteNombre} — {just.estudianteNumeroCarne}
            </p>
          </div>
        </div>

        {/* Botones de cambio de estado */}
        {tieneRol("ADMIN", "COORDINADOR") &&
          transicionesPosibles.length > 0 && (
            <div className="flex gap-2">
              {transicionesPosibles.map((nuevoEstado) => (
                <button
                  key={nuevoEstado}
                  onClick={() => estadoMut.mutate(nuevoEstado)}
                  disabled={estadoMut.isPending}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition hover:opacity-90"
                  style={{
                    background:
                      nuevoEstado === "RECHAZADA"
                        ? "rgba(248,113,113,0.15)"
                        : nuevoEstado === "APROBADA"
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(244,233,205,0.1)",
                    color:
                      nuevoEstado === "RECHAZADA"
                        ? "#f87171"
                        : nuevoEstado === "APROBADA"
                          ? "#22c55e"
                          : "#F4E9CD",
                    border: `1px solid ${nuevoEstado === "RECHAZADA" ? "#f87171" : nuevoEstado === "APROBADA" ? "#22c55e" : "#334155"}`,
                  }}
                >
                  {LABEL_ACCION[nuevoEstado]}
                </button>
              ))}
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Datos de la justificación */}
        <Seccion titulo="Detalle">
          <Campo label="Motivo" valor={just.motivoNombre} />
          <Campo
            label="Presentada"
            valor={format(
              new Date(just.fechaPresentacion),
              "dd 'de' MMMM yyyy, HH:mm",
              { locale: es },
            )}
          />
          {just.fechaRevision && (
            <Campo
              label="Revisada"
              valor={format(
                new Date(just.fechaRevision),
                "dd 'de' MMMM yyyy, HH:mm",
                { locale: es },
              )}
            />
          )}
          {just.revisadoPorNombre && (
            <Campo label="Revisado por" valor={just.revisadoPorNombre} />
          )}
          <div>
            <p className="text-xs mb-1" style={{ color: "#475569" }}>
              Descripción
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#cbd5e1" }}>
              {just.descripcion}
            </p>
          </div>
        </Seccion>

        {/* Fechas de inasistencia */}
        <Seccion titulo={`Fechas de inasistencia (${just.fechas.length})`}>
          <div className="flex flex-wrap gap-2">
            {just.fechas.map((f) => (
              <span
                key={f.id}
                className="px-2.5 py-1 rounded-lg text-xs font-mono"
                style={{ background: "#1e293b", color: "#F4E9CD" }}
              >
                {format(new Date(f.fecha), "dd MMM yyyy", { locale: es })}
              </span>
            ))}
          </div>
        </Seccion>
      </div>

      {/* Documentos */}
      <Seccion titulo="Documentos adjuntos">
        <div className="space-y-2">
          {just.documentos.length === 0 && (
            <p className="text-xs" style={{ color: "#475569" }}>
              Sin documentos adjuntos.
            </p>
          )}
          {just.documentos.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ background: "#1e293b", border: "1px solid #334155" }}
            >
              <div>
                <p className="text-xs font-medium" style={{ color: "#cbd5e1" }}>
                  {doc.nombreOriginal}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                  {format(new Date(doc.subidoEn), "dd MMM yyyy, HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => descargarDocumento(doc.id, doc.nombreOriginal)}
                  className="flex items-center justify-center rounded-lg transition hover:opacity-70"
                  style={{ width: 30, height: 30, background: "#0f172a" }}
                  title="Descargar"
                >
                  <Download size={13} style={{ color: "#94a3b8" }} />
                </button>
                {puedeSubirDoc && (
                  <button
                    onClick={() => {
                      if (!confirm(`¿Eliminar "${doc.nombreOriginal}"?`))
                        return;
                      eliminarDocMut.mutate(doc.id);
                    }}
                    className="flex items-center justify-center rounded-lg transition hover:opacity-70"
                    style={{ width: 30, height: 30, background: "#0f172a" }}
                    title="Eliminar"
                  >
                    <Trash2 size={13} style={{ color: "#f87171" }} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Botón subir documento */}
          {puedeSubirDoc && (
            <>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleArchivoSeleccionado}
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={subirMut.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition hover:opacity-90 mt-2"
                style={{ background: "#F4E9CD", color: "#0f172a" }}
              >
                <Upload size={13} />
                {subirMut.isPending ? "Subiendo..." : "Subir documento"}
              </button>
            </>
          )}
        </div>
      </Seccion>
    </div>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ background: "#0f172a", border: "1px solid #1e293b" }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: "#475569", fontSize: 10 }}
      >
        {titulo}
      </p>
      {children}
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs shrink-0" style={{ color: "#475569" }}>
        {label}
      </p>
      <p className="text-xs text-right" style={{ color: "#cbd5e1" }}>
        {valor}
      </p>
    </div>
  );
}
