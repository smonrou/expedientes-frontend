import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  listarActividades,
  crearActividad,
  actualizarActividad,
  eliminarActividad,
} from "@/api/actividades";
import { listarCatalogo } from "@/api/catalogos";
import type { ActividadRequest, ActividadResponse } from "@/types";

// ─── Esquema de validación ────────────────────────────────────────────────────

const schema = z.object({
  tipoActividadId: z.coerce.number().min(1, "Selecciona un tipo de actividad"),
  nombre: z.string().min(1, "El nombre es requerido").max(200),
  institucion: z.string().max(200).optional().or(z.literal("")),
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  fechaFin: z.string().optional().or(z.literal("")),
  observaciones: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

// ─── Estilos compartidos ──────────────────────────────────────────────────────

const inputSt: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
};
const inputErrSt: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #f87171",
  color: "#f1f5f9",
};
const inputCls =
  "w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(fecha: string): string {
  try {
    return format(new Date(fecha + "T00:00:00"), "dd MMM yyyy", { locale: es });
  } catch {
    return fecha;
  }
}

// ─── Formulario inline de actividad ──────────────────────────────────────────

/**
 * Formulario para crear o editar una actividad extracurricular.
 * Se muestra expandido dentro del modal principal.
 */
function FormActividad({
  estudianteId,
  actividad,
  queryKey,
  onCancelar,
}: {
  estudianteId: number;
  actividad: ActividadResponse | null;
  queryKey: (string | number)[];
  onCancelar: () => void;
}) {
  const qc = useQueryClient();

  const { data: tiposActividad = [] } = useQuery<
    { id: number; nombre: string }[]
  >({
    queryKey: ["catalogo", "tipo-actividad"],
    queryFn: () => listarCatalogo("tipo-actividad"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: actividad
      ? {
          tipoActividadId: actividad.tipoActividadId,
          nombre: actividad.nombre,
          institucion: actividad.institucion ?? "",
          fechaInicio: actividad.fechaInicio,
          fechaFin: actividad.fechaFin ?? "",
          observaciones: actividad.observaciones ?? "",
        }
      : {
          tipoActividadId: 0,
          nombre: "",
          institucion: "",
          fechaInicio: "",
          fechaFin: "",
          observaciones: "",
        },
  });

  const crearMut = useMutation({
    mutationFn: (dto: ActividadRequest) => crearActividad(estudianteId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Actividad registrada");
      onCancelar();
    },
    onError: (error: { response?: { status: number } }) => {
      if (error.response?.status === 409) toast.error("Error de validación");
      else toast.error("Error al guardar la actividad");
    },
  });

  const actualizarMut = useMutation({
    mutationFn: (dto: ActividadRequest) =>
      actualizarActividad(estudianteId, actividad!.id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Actividad actualizada");
      onCancelar();
    },
    onError: (error: { response?: { status: number } }) => {
      if (error.response?.status === 409) toast.error("Error de validación");
      else toast.error("Error al actualizar la actividad");
    },
  });

  const isPending = crearMut.isPending || actualizarMut.isPending;

  const onSubmit = (data: FormData) => {
    if (data.fechaFin && data.fechaFin < data.fechaInicio) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }

    const dto: ActividadRequest = {
      tipoActividadId: data.tipoActividadId,
      nombre: data.nombre,
      institucion: data.institucion || undefined,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin || undefined,
      observaciones: data.observaciones || undefined,
    };

    if (actividad) {
      actualizarMut.mutate(dto);
    } else {
      crearMut.mutate(dto);
    }
  };

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: "#0f172a", border: "1px solid #334155" }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: "#475569" }}
      >
        {actividad ? "Editar actividad" : "Nueva actividad"}
      </p>

      {/* Tipo de actividad */}
      <div>
        <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>
          Tipo de actividad *
        </label>
        <select
          {...register("tipoActividadId")}
          style={errors.tipoActividadId ? inputErrSt : inputSt}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        >
          <option value={0} disabled>
            Selecciona un tipo
          </option>
          {tiposActividad.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        {errors.tipoActividadId && (
          <p className="text-xs mt-1" style={{ color: "#f87171" }}>
            {errors.tipoActividadId.message}
          </p>
        )}
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>
          Nombre *
        </label>
        <input
          type="text"
          placeholder="Ej: Curso de inglés avanzado"
          {...register("nombre")}
          style={errors.nombre ? inputErrSt : inputSt}
          className={inputCls}
        />
        {errors.nombre && (
          <p className="text-xs mt-1" style={{ color: "#f87171" }}>
            {errors.nombre.message}
          </p>
        )}
      </div>

      {/* Institución */}
      <div>
        <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>
          Institución
        </label>
        <input
          type="text"
          placeholder="Ej: Instituto Americano"
          {...register("institucion")}
          style={inputSt}
          className={inputCls}
        />
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>
            Fecha de inicio *
          </label>
          <input
            type="date"
            {...register("fechaInicio")}
            style={errors.fechaInicio ? inputErrSt : inputSt}
            className={inputCls}
          />
          {errors.fechaInicio && (
            <p className="text-xs mt-1" style={{ color: "#f87171" }}>
              {errors.fechaInicio.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>
            Fecha de fin
          </label>
          <input
            type="date"
            {...register("fechaFin")}
            style={inputSt}
            className={inputCls}
          />
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-xs mb-1" style={{ color: "#94a3b8" }}>
          Observaciones
        </label>
        <textarea
          rows={2}
          placeholder="Observaciones adicionales (opcional)"
          {...register("observaciones")}
          style={{ ...inputSt, resize: "none" }}
          className={inputCls}
        />
      </div>

      {/* Botones del formulario */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancelar}
          style={{
            background: "#0f172a",
            color: "#94a3b8",
            border: "1px solid #334155",
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          style={{
            background: isPending ? "#c9c0a8" : "#F4E9CD",
            color: "#0f172a",
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

// ─── Tarjeta de actividad ─────────────────────────────────────────────────────

function TarjetaActividad({
  actividad,
  puedeEditar,
  onEditar,
  onEliminar,
}: {
  actividad: ActividadResponse;
  puedeEditar: boolean;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <div
      className="rounded-lg p-3 space-y-1"
      style={{ background: "#0f172a", border: "1px solid #1e293b" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "#cbd5e1" }}
          >
            {actividad.nombre}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ background: "rgba(244,233,205,0.08)", color: "#F4E9CD" }}
            >
              {actividad.tipoActividadNombre}
            </span>
            {actividad.institucion && (
              <span className="text-xs" style={{ color: "#94a3b8" }}>
                {actividad.institucion}
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: "#475569" }}>
            {formatFecha(actividad.fechaInicio)}
            {" → "}
            {actividad.fechaFin ? formatFecha(actividad.fechaFin) : "En curso"}
          </p>
          {actividad.observaciones && (
            <p className="text-xs" style={{ color: "#475569" }}>
              {actividad.observaciones}
            </p>
          )}
        </div>
        {puedeEditar && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEditar}
              className="p-1.5 rounded-md transition hover:opacity-70"
              style={{ color: "#94a3b8" }}
              title="Editar"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onEliminar}
              className="p-1.5 rounded-md transition hover:opacity-70"
              style={{ color: "#f87171" }}
              title="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal de confirmación de eliminación ─────────────────────────────────────

function ModalConfirmarEliminar({
  actividad,
  estudianteId,
  queryKey,
  onClose,
}: {
  actividad: ActividadResponse;
  estudianteId: number;
  queryKey: (string | number)[];
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const eliminarMut = useMutation({
    mutationFn: () => eliminarActividad(estudianteId, actividad.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Actividad eliminada");
      onClose();
    },
    onError: () => toast.error("Error al eliminar la actividad"),
  });

  return (
    <div
      style={{ background: "rgba(2,6,23,0.85)" }}
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ background: "#1e293b", border: "1px solid #334155" }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-4">
          <h3
            className="text-sm font-semibold mb-1"
            style={{ color: "#F4E9CD" }}
          >
            ¿Eliminar actividad?
          </h3>
          <p className="text-xs" style={{ color: "#94a3b8" }}>
            Se eliminará{" "}
            <span style={{ color: "#cbd5e1" }}>"{actividad.nombre}"</span>. Esta
            acción no se puede deshacer.
          </p>
        </div>
        <div
          style={{ borderTop: "1px solid #1e293b" }}
          className="px-5 py-3 flex justify-end gap-2"
        >
          <button
            onClick={onClose}
            style={{
              background: "#0f172a",
              color: "#94a3b8",
              border: "1px solid #334155",
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => eliminarMut.mutate()}
            disabled={eliminarMut.isPending}
            style={{
              background: eliminarMut.isPending ? "#c9c0a8" : "#f87171",
              color: "#0f172a",
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition"
          >
            {eliminarMut.isPending ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal principal de actividades ──────────────────────────────────────────

/**
 * Modal de gestión de actividades extracurriculares.
 * Permite listar, crear, editar y eliminar actividades de un estudiante.
 * Usa CRUD individual (POST/PUT/DELETE) a diferencia de otros modales que usan PUT total.
 */
export default function ModalActividades({
  estudianteId,
  puedeEditar,
  onClose,
}: {
  estudianteId: number;
  puedeEditar: boolean;
  queryKey: (string | number)[];
  onClose: () => void;
}) {
  // null = sin formulario, 'nueva' = crear, number = id a editar
  const [formulario, setFormulario] = useState<null | "nueva" | number>(null);
  const [confirmando, setConfirmando] = useState<ActividadResponse | null>(
    null,
  );

  const actividadesQK = ["actividades", estudianteId] as (string | number)[];

  const { data: actividades = [], isLoading } = useQuery<ActividadResponse[]>({
    queryKey: actividadesQK,
    queryFn: () => listarActividades(estudianteId),
  });

  const actividadEditando =
    typeof formulario === "number"
      ? (actividades.find((a) => a.id === formulario) ?? null)
      : null;

  return (
    <>
      <div
        style={{ background: "rgba(2,6,23,0.8)" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            maxHeight: "90vh",
          }}
          className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div
            style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}
            className="px-5 py-4 flex items-center justify-between shrink-0"
          >
            <h2 className="text-sm font-semibold" style={{ color: "#F4E9CD" }}>
              Actividades extracurriculares
            </h2>
            <button
              onClick={onClose}
              style={{ color: "#475569" }}
              className="text-xl leading-none hover:text-slate-300 transition"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3 overflow-y-auto flex-1">
            {/* Botón agregar */}
            {puedeEditar && formulario === null && (
              <button
                onClick={() => setFormulario("nueva")}
                style={{ color: "#94a3b8", border: "1px dashed #334155" }}
                className="w-full py-2 rounded-lg text-sm hover:border-slate-400 transition"
              >
                + Agregar actividad
              </button>
            )}

            {/* Formulario nueva actividad */}
            {formulario === "nueva" && (
              <FormActividad
                estudianteId={estudianteId}
                actividad={null}
                queryKey={actividadesQK}
                onCancelar={() => setFormulario(null)}
              />
            )}

            {/* Lista de actividades */}
            {isLoading ? (
              <p
                className="text-xs text-center py-4"
                style={{ color: "#475569" }}
              >
                Cargando actividades...
              </p>
            ) : actividades.length === 0 ? (
              <p
                className="text-xs text-center py-4"
                style={{ color: "#475569" }}
              >
                Sin actividades extracurriculares registradas.
              </p>
            ) : (
              actividades.map((act) => (
                <div key={act.id}>
                  {formulario === act.id ? (
                    <FormActividad
                      estudianteId={estudianteId}
                      actividad={actividadEditando}
                      queryKey={actividadesQK}
                      onCancelar={() => setFormulario(null)}
                    />
                  ) : (
                    <TarjetaActividad
                      actividad={act}
                      puedeEditar={puedeEditar}
                      onEditar={() => setFormulario(act.id)}
                      onEliminar={() => setConfirmando(act)}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{ borderTop: "1px solid #1e293b" }}
            className="px-5 py-4 flex justify-end shrink-0"
          >
            <button
              onClick={onClose}
              style={{
                background: "#0f172a",
                color: "#94a3b8",
                border: "1px solid #334155",
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmando && (
        <ModalConfirmarEliminar
          actividad={confirmando}
          estudianteId={estudianteId}
          queryKey={actividadesQK}
          onClose={() => setConfirmando(null)}
        />
      )}
    </>
  );
}
