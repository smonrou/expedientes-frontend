import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { obtenerMiExpediente } from "@/api/estudiantes";
import {
  actualizarTelefonos,
  actualizarCondicionesMedicas,
  actualizarAlergias,
  actualizarDiscapacidades,
  actualizarContactosEmergencia,
} from "@/api/estudiantes";
import { listarCatalogo } from "@/api/catalogos";
import { useAuth } from "@/hooks/useAuth";
import type {
  AlergiaRequest,
  DiscapacidadRequest,
  ContactoEmergenciaRequest,
} from "@/types";

// ─── Tipos de input ───────────────────────────────────────────────────────────
type TipoTelefono = "CASA" | "CELULAR" | "TRABAJO";
interface TelefonoInput {
  numero: string;
  tipo: TipoTelefono;
}
interface CondicionInput {
  descripcion: string;
}

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const inputSt: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
};
const inputCls =
  "w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1";

// ─── Página principal ─────────────────────────────────────────────────────────

/**
 * Página de expediente propio para el rol ESTUDIANTE.
 * Carga el expediente usando GET /api/estudiantes/mi-expediente?usuarioId=
 * y permite editar todas las subentidades mediante modales.
 */
export default function MiExpedientePage() {
  const { sesion } = useAuth();

  type ModalId =
    | "telefonos"
    | "condiciones"
    | "alergias"
    | "discapacidades"
    | "contactos"
    | null;
  const [modal, setModal] = useState<ModalId>(null);

  const { data: est, isLoading } = useQuery({
    queryKey: ["mi-expediente", sesion?.usuarioId],
    queryFn: () => obtenerMiExpediente(sesion!.usuarioId),
    enabled: !!sesion?.usuarioId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "#475569" }}>
          Cargando expediente...
        </p>
      </div>
    );
  }

  if (!est) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        {" "}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full overflow-hidden shrink-0"
            style={{
              width: 128,
              height: 128,
              background: "rgba(244,233,205,0.1)",
              border: "1px solid #1e293b",
            }}
          >
            {est.rutaFotografia ? (
              <img
                src={est.rutaFotografia}
                alt={`${est.nombres} ${est.apellidos}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  el.parentElement!.innerHTML = `<span style="color:#F4E9CD;font-size:64px;font-weight:600">${est.nombres[0]}${est.apellidos[0]}</span>`;
                }}
              />
            ) : (
              <span style={{ color: "#F4E9CD", fontSize: 20, fontWeight: 600 }}>
                {est.nombres[0]}
                {est.apellidos[0]}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "#F4E9CD" }}>
              Mi expediente
            </h1>
            <p
              className="text-xs mt-0.5 font-mono"
              style={{ color: "#475569" }}
            >
              {est.numeroCarne}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de secciones */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Datos personales — solo lectura */}
        <Seccion titulo="Datos personales">
          <Campo label="Nombres" valor={`${est.nombres} ${est.apellidos}`} />
          <Campo label="CUI" valor={est.cui} mono />
          <Campo label="Fecha de nacimiento" valor={est.fechaNacimiento} />
          <Campo label="Género" valor={est.genero} />
          <Campo label="Dirección" valor={est.direccion} />
        </Seccion>

        {/* Datos académicos — solo lectura */}
        <Seccion titulo="Datos académicos">
          <Campo label="Carné" valor={est.numeroCarne} mono />
          <Campo label="Carrera" valor={est.carreraNombre} />
          <Campo label="Año de ingreso" valor={String(est.anioIngreso)} />
          <Campo label="Inscrito" valor={est.inscrito ? "Sí" : "No"} />
          <Campo
            label="Pensum cerrado"
            valor={est.pensumCerrado ? "Sí" : "No"}
          />
          {est.fechaCierrePensum && (
            <Campo label="Fecha cierre pensum" valor={est.fechaCierrePensum} />
          )}
        </Seccion>

        {/* Contacto — editable (teléfonos) */}
        <Seccion titulo="Contacto" onEditar={() => setModal("telefonos")}>
          <Campo label="Correo institucional" valor={est.correoInstitucional} />
          {est.correoPersonal && (
            <Campo label="Correo personal" valor={est.correoPersonal} />
          )}
          {est.tipoSangreNombre && (
            <Campo label="Tipo de sangre" valor={est.tipoSangreNombre} badge />
          )}
          {est.telefonos.length === 0 ? (
            <p className="text-xs" style={{ color: "#475569" }}>
              Sin teléfonos registrados.
            </p>
          ) : (
            est.telefonos.map((t) => (
              <Campo key={t.id} label={t.tipo} valor={t.numero} mono />
            ))
          )}
        </Seccion>

        {/* Información médica — editable */}
        <Seccion
          titulo="Información médica"
          onEditar={() => setModal("condiciones")}
        >
          {est.condicionesMedicas.length === 0 &&
          est.alergias.length === 0 &&
          est.discapacidades.length === 0 ? (
            <p className="text-xs" style={{ color: "#475569" }}>
              Sin registros médicos.
            </p>
          ) : (
            <>
              {est.condicionesMedicas.map((c) => (
                <Campo key={c.id} label="Condición" valor={c.descripcion} />
              ))}
              {est.alergias.map((a) => (
                <Campo
                  key={a.alergiaId}
                  label="Alergia"
                  valor={
                    a.observaciones
                      ? `${a.nombre} — ${a.observaciones}`
                      : a.nombre
                  }
                />
              ))}
              {est.discapacidades.map((d) => (
                <Campo
                  key={d.tipoDiscapacidadId}
                  label="Discapacidad"
                  valor={
                    d.observaciones
                      ? `${d.nombre} — ${d.observaciones}`
                      : d.nombre
                  }
                />
              ))}
            </>
          )}
          <div className="flex gap-2 pt-1">
            <BtnSecundario onClick={() => setModal("alergias")}>
              Editar alergias
            </BtnSecundario>
            <BtnSecundario onClick={() => setModal("discapacidades")}>
              Editar discapacidades
            </BtnSecundario>
          </div>
        </Seccion>
      </div>

      {/* Contactos de emergencia — ancho completo, editable */}
      <Seccion
        titulo="Contactos de emergencia"
        onEditar={() => setModal("contactos")}
      >
        {est.contactosEmergencia.length === 0 ? (
          <p className="text-xs" style={{ color: "#475569" }}>
            Sin contactos de emergencia registrados.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {est.contactosEmergencia.map((c) => (
              <div
                key={c.id}
                className="rounded-lg p-3 space-y-1"
                style={{ background: "#1e293b", border: "1px solid #334155" }}
              >
                <p className="text-sm font-medium" style={{ color: "#cbd5e1" }}>
                  {c.nombreCompleto}
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  {c.parentesco}
                </p>
                {c.direccion && (
                  <p className="text-xs" style={{ color: "#475569" }}>
                    {c.direccion}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Seccion>

      {/* ── Modales ── */}
      {modal === "telefonos" && (
        <ModalTelefonos
          estudianteId={est.id}
          actuales={est.telefonos.map((t) => ({
            numero: t.numero,
            tipo: t.tipo as TipoTelefono,
          }))}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "condiciones" && (
        <ModalCondiciones
          estudianteId={est.id}
          actuales={est.condicionesMedicas.map((c) => ({
            descripcion: c.descripcion,
          }))}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "alergias" && (
        <ModalAlergias
          estudianteId={est.id}
          actuales={est.alergias.map((a) => ({
            alergiaId: a.alergiaId,
            observaciones: a.observaciones ?? undefined,
          }))}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "discapacidades" && (
        <ModalDiscapacidades
          estudianteId={est.id}
          actuales={est.discapacidades.map((d) => ({
            tipoDiscapacidadId: d.tipoDiscapacidadId,
            observaciones: d.observaciones ?? undefined,
          }))}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "contactos" && (
        <ModalContactos
          estudianteId={est.id}
          actuales={est.contactosEmergencia.map((c) => ({
            nombreCompleto: c.nombreCompleto,
            parentesco: c.parentesco,
            direccion: c.direccion ?? undefined,
          }))}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ─── Sub-componentes de layout ────────────────────────────────────────────────

function Seccion({
  titulo,
  children,
  onEditar,
}: {
  titulo: string;
  children: React.ReactNode;
  onEditar?: () => void;
}) {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ background: "#0f172a", border: "1px solid #1e293b" }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "#475569", fontSize: 10 }}
        >
          {titulo}
        </p>
        {onEditar && (
          <button
            onClick={onEditar}
            className="text-xs px-2.5 py-1 rounded-md transition hover:opacity-80"
            style={{
              color: "#F4E9CD",
              border: "1px solid rgba(244,233,205,0.2)",
              background: "rgba(244,233,205,0.04)",
            }}
          >
            Editar
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Campo({
  label,
  valor,
  mono,
  badge,
}: {
  label: string;
  valor: string;
  mono?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs shrink-0" style={{ color: "#475569" }}>
        {label}
      </p>
      {badge ? (
        <span
          className="px-2 py-0.5 rounded-md text-xs font-medium"
          style={{ background: "rgba(244,233,205,0.08)", color: "#F4E9CD" }}
        >
          {valor}
        </span>
      ) : (
        <p
          className={`text-xs text-right ${mono ? "font-mono" : ""}`}
          style={{ color: "#cbd5e1" }}
        >
          {valor}
        </p>
      )}
    </div>
  );
}

function BtnSecundario({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2.5 py-1 rounded-md transition hover:opacity-80"
      style={{
        color: "#94a3b8",
        border: "1px solid #1e293b",
        background: "transparent",
      }}
    >
      {children}
    </button>
  );
}

// ─── Shell reutilizable de modal ──────────────────────────────────────────────

function ModalShell({
  titulo,
  onClose,
  onGuardar,
  guardando,
  children,
}: {
  titulo: string;
  onClose: () => void;
  onGuardar: () => void;
  guardando: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ background: "rgba(2,6,23,0.8)" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ background: "#1e293b", border: "1px solid #334155" }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
      >
        <div
          style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}
          className="px-5 py-4 flex items-center justify-between"
        >
          <h2 className="text-sm font-semibold" style={{ color: "#F4E9CD" }}>
            {titulo}
          </h2>
          <button
            onClick={onClose}
            style={{ color: "#475569" }}
            className="text-xl leading-none hover:text-slate-300 transition"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-3 max-h-104 overflow-y-auto">
          {children}
        </div>
        <div
          style={{ borderTop: "1px solid #1e293b" }}
          className="px-5 py-4 flex justify-end gap-3"
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
            Cancelar
          </button>
          <button
            onClick={onGuardar}
            disabled={guardando}
            style={{
              background: guardando ? "#c9c0a8" : "#F4E9CD",
              color: "#0f172a",
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BtnAgregar({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{ color: "#94a3b8", border: "1px dashed #334155" }}
      className="w-full py-2 rounded-lg text-sm hover:border-slate-400 transition"
    >
      + {label}
    </button>
  );
}

// ─── Modal: Teléfonos ─────────────────────────────────────────────────────────

/**
 * Modal para editar los teléfonos del estudiante.
 * Envía la lista completa con PUT /api/estudiantes/{id}/telefonos.
 */
function ModalTelefonos({
  estudianteId,
  actuales,
  onClose,
}: {
  estudianteId: number;
  actuales: TelefonoInput[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [lista, setLista] = useState<TelefonoInput[]>(
    actuales.length > 0 ? actuales : [{ numero: "", tipo: "CELULAR" }],
  );

  const mut = useMutation({
    mutationFn: () => actualizarTelefonos(estudianteId, lista),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mi-expediente"] });
      toast.success("Teléfonos actualizados");
      onClose();
    },
    onError: () => toast.error("Error al actualizar teléfonos"),
  });

  const set = (i: number, campo: keyof TelefonoInput, val: string) =>
    setLista((p) =>
      p.map((t, idx) => (idx === i ? { ...t, [campo]: val } : t)),
    );

  const guardar = () => {
    const limpios = lista.filter((t) => t.numero.trim() !== "");
    if (limpios.length === 0) {
      toast.error("Agrega al menos un número");
      return;
    }
    mut.mutate();
  };

  return (
    <ModalShell
      titulo="Teléfonos"
      onClose={onClose}
      onGuardar={guardar}
      guardando={mut.isPending}
    >
      {lista.map((t, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Número"
            value={t.numero}
            onChange={(e) => set(i, "numero", e.target.value)}
            style={inputSt}
            className={inputCls}
          />
          <select
            value={t.tipo}
            onChange={(e) => set(i, "tipo", e.target.value)}
            style={inputSt}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          >
            {(["CELULAR", "CASA", "TRABAJO"] as TipoTelefono[]).map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          <button
            onClick={() => setLista((p) => p.filter((_, idx) => idx !== i))}
            style={{ color: "#f87171" }}
            className="px-2 text-sm hover:opacity-70 transition"
          >
            ✕
          </button>
        </div>
      ))}
      <BtnAgregar
        onClick={() => setLista((p) => [...p, { numero: "", tipo: "CELULAR" }])}
        label="Agregar teléfono"
      />
    </ModalShell>
  );
}

// ─── Modal: Condiciones médicas ───────────────────────────────────────────────

/**
 * Modal para editar condiciones médicas preexistentes.
 * Envía la lista completa con PUT /api/estudiantes/{id}/condiciones-medicas.
 */
function ModalCondiciones({
  estudianteId,
  actuales,
  onClose,
}: {
  estudianteId: number;
  actuales: CondicionInput[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [lista, setLista] = useState<CondicionInput[]>(
    actuales.length > 0 ? actuales : [{ descripcion: "" }],
  );

  const mut = useMutation({
    mutationFn: () =>
      actualizarCondicionesMedicas(
        estudianteId,
        lista.filter((c) => c.descripcion.trim() !== ""),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mi-expediente"] });
      toast.success("Condiciones médicas actualizadas");
      onClose();
    },
    onError: () => toast.error("Error al actualizar condiciones médicas"),
  });

  return (
    <ModalShell
      titulo="Condiciones médicas"
      onClose={onClose}
      onGuardar={() => mut.mutate()}
      guardando={mut.isPending}
    >
      {lista.map((c, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Ej: Asma leve, Diabetes tipo 2..."
            value={c.descripcion}
            onChange={(e) =>
              setLista((p) =>
                p.map((x, idx) =>
                  idx === i ? { descripcion: e.target.value } : x,
                ),
              )
            }
            style={inputSt}
            className={inputCls}
          />
          <button
            onClick={() => setLista((p) => p.filter((_, idx) => idx !== i))}
            style={{ color: "#f87171" }}
            className="px-2 text-sm hover:opacity-70 transition"
          >
            ✕
          </button>
        </div>
      ))}
      <BtnAgregar
        onClick={() => setLista((p) => [...p, { descripcion: "" }])}
        label="Agregar condición"
      />
    </ModalShell>
  );
}

// ─── Modal: Alergias ──────────────────────────────────────────────────────────

/**
 * Modal para editar alergias del estudiante.
 * Carga catálogo de alergias. Envía lista completa con PUT /api/estudiantes/{id}/alergias.
 */
function ModalAlergias({
  estudianteId,
  actuales,
  onClose,
}: {
  estudianteId: number;
  actuales: AlergiaRequest[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [lista, setLista] = useState<AlergiaRequest[]>(actuales);

  const { data: catalogo = [] } = useQuery<{ id: number; nombre: string }[]>({
    queryKey: ["catalogo", "alergias"],
    queryFn: () => listarCatalogo("alergias"),
  });

  const mut = useMutation({
    mutationFn: () => actualizarAlergias(estudianteId, lista),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mi-expediente"] });
      toast.success("Alergias actualizadas");
      onClose();
    },
    onError: () => toast.error("Error al actualizar alergias"),
  });

  const agregar = () => {
    const usados = new Set(lista.map((l) => l.alergiaId));
    const libre = catalogo.find((c) => !usados.has(c.id));
    if (!libre) {
      toast.error("Ya están todas las alergias disponibles");
      return;
    }
    setLista((p) => [...p, { alergiaId: libre.id }]);
  };

  return (
    <ModalShell
      titulo="Alergias"
      onClose={onClose}
      onGuardar={() => mut.mutate()}
      guardando={mut.isPending}
    >
      {lista.length === 0 && (
        <p className="text-xs text-center py-2" style={{ color: "#475569" }}>
          Sin alergias registradas.
        </p>
      )}
      {lista.map((a, i) => (
        <div key={i} className="space-y-2">
          <div className="flex gap-2 items-center">
            <select
              value={a.alergiaId}
              onChange={(e) =>
                setLista((p) =>
                  p.map((x, idx) =>
                    idx === i ? { ...x, alergiaId: Number(e.target.value) } : x,
                  ),
                )
              }
              style={inputSt}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            >
              {catalogo.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={() => setLista((p) => p.filter((_, idx) => idx !== i))}
              style={{ color: "#f87171" }}
              className="px-2 text-sm hover:opacity-70 transition"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder="Observaciones (opcional)"
            value={a.observaciones ?? ""}
            onChange={(e) =>
              setLista((p) =>
                p.map((x, idx) =>
                  idx === i
                    ? { ...x, observaciones: e.target.value || undefined }
                    : x,
                ),
              )
            }
            style={{ ...inputSt, border: "1px solid #1e293b", fontSize: 12 }}
            className="w-full px-3 py-1.5 rounded-lg outline-none focus:ring-1"
          />
        </div>
      ))}
      <BtnAgregar onClick={agregar} label="Agregar alergia" />
    </ModalShell>
  );
}

// ─── Modal: Discapacidades ────────────────────────────────────────────────────

/**
 * Modal para editar discapacidades del estudiante.
 * Carga catálogo de tipos. Envía lista completa con PUT /api/estudiantes/{id}/discapacidades.
 */
function ModalDiscapacidades({
  estudianteId,
  actuales,
  onClose,
}: {
  estudianteId: number;
  actuales: DiscapacidadRequest[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [lista, setLista] = useState<DiscapacidadRequest[]>(actuales);

  const { data: catalogo = [] } = useQuery<{ id: number; nombre: string }[]>({
    queryKey: ["catalogo", "tipo-discapacidad"],
    queryFn: () => listarCatalogo("tipo-discapacidad"),
  });

  const mut = useMutation({
    mutationFn: () => actualizarDiscapacidades(estudianteId, lista),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mi-expediente"] });
      toast.success("Discapacidades actualizadas");
      onClose();
    },
    onError: () => toast.error("Error al actualizar discapacidades"),
  });

  const agregar = () => {
    const usados = new Set(lista.map((l) => l.tipoDiscapacidadId));
    const libre = catalogo.find((c) => !usados.has(c.id));
    if (!libre) {
      toast.error("Ya están todos los tipos disponibles");
      return;
    }
    setLista((p) => [...p, { tipoDiscapacidadId: libre.id }]);
  };

  return (
    <ModalShell
      titulo="Discapacidades"
      onClose={onClose}
      onGuardar={() => mut.mutate()}
      guardando={mut.isPending}
    >
      {lista.length === 0 && (
        <p className="text-xs text-center py-2" style={{ color: "#475569" }}>
          Sin discapacidades registradas.
        </p>
      )}
      {lista.map((d, i) => (
        <div key={i} className="space-y-2">
          <div className="flex gap-2 items-center">
            <select
              value={d.tipoDiscapacidadId}
              onChange={(e) =>
                setLista((p) =>
                  p.map((x, idx) =>
                    idx === i
                      ? { ...x, tipoDiscapacidadId: Number(e.target.value) }
                      : x,
                  ),
                )
              }
              style={inputSt}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            >
              {catalogo.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={() => setLista((p) => p.filter((_, idx) => idx !== i))}
              style={{ color: "#f87171" }}
              className="px-2 text-sm hover:opacity-70 transition"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder="Observaciones (opcional)"
            value={d.observaciones ?? ""}
            onChange={(e) =>
              setLista((p) =>
                p.map((x, idx) =>
                  idx === i
                    ? { ...x, observaciones: e.target.value || undefined }
                    : x,
                ),
              )
            }
            style={{ ...inputSt, border: "1px solid #1e293b", fontSize: 12 }}
            className="w-full px-3 py-1.5 rounded-lg outline-none focus:ring-1"
          />
        </div>
      ))}
      <BtnAgregar onClick={agregar} label="Agregar discapacidad" />
    </ModalShell>
  );
}

// ─── Modal: Contactos de emergencia ──────────────────────────────────────────

/**
 * Modal para editar contactos de emergencia del estudiante.
 * Envía lista completa con PUT /api/estudiantes/{id}/contactos-emergencia.
 */
function ModalContactos({
  estudianteId,
  actuales,
  onClose,
}: {
  estudianteId: number;
  actuales: ContactoEmergenciaRequest[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [lista, setLista] = useState<ContactoEmergenciaRequest[]>(
    actuales.length > 0 ? actuales : [{ nombreCompleto: "", parentesco: "" }],
  );

  const mut = useMutation({
    mutationFn: () => actualizarContactosEmergencia(estudianteId, lista),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mi-expediente"] });
      toast.success("Contactos de emergencia actualizados");
      onClose();
    },
    onError: () => toast.error("Error al actualizar contactos"),
  });

  const set = (
    i: number,
    campo: keyof ContactoEmergenciaRequest,
    val: string,
  ) =>
    setLista((p) =>
      p.map((c, idx) =>
        idx === i
          ? {
              ...c,
              [campo]: campo === "direccion" && val === "" ? undefined : val,
            }
          : c,
      ),
    );

  const guardar = () => {
    const invalidos = lista.filter(
      (c) => !c.nombreCompleto.trim() || !c.parentesco.trim(),
    );
    if (invalidos.length > 0) {
      toast.error("Nombre y parentesco son requeridos en todos los contactos");
      return;
    }
    mut.mutate();
  };

  return (
    <ModalShell
      titulo="Contactos de emergencia"
      onClose={onClose}
      onGuardar={guardar}
      guardando={mut.isPending}
    >
      {lista.map((c, i) => (
        <div
          key={i}
          className="rounded-xl p-4 space-y-2 relative"
          style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        >
          <button
            onClick={() => setLista((p) => p.filter((_, idx) => idx !== i))}
            style={{ color: "#f87171" }}
            className="absolute top-3 right-3 text-sm hover:opacity-70 transition"
          >
            ✕
          </button>

          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "#475569" }}
          >
            Contacto {i + 1}
          </p>

          <div className="space-y-2 pr-4">
            <div>
              <label
                className="block text-xs mb-1"
                style={{ color: "#94a3b8" }}
              >
                Nombre completo *
              </label>
              <input
                type="text"
                placeholder="Nombre completo"
                value={c.nombreCompleto}
                onChange={(e) => set(i, "nombreCompleto", e.target.value)}
                style={inputSt}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: "#94a3b8" }}
                >
                  Parentesco *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Madre"
                  value={c.parentesco}
                  onChange={(e) => set(i, "parentesco", e.target.value)}
                  style={inputSt}
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: "#94a3b8" }}
                >
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={c.direccion ?? ""}
                  onChange={(e) => set(i, "direccion", e.target.value)}
                  style={inputSt}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <BtnAgregar
        onClick={() =>
          setLista((p) => [...p, { nombreCompleto: "", parentesco: "" }])
        }
        label="Agregar contacto"
      />
    </ModalShell>
  );
}
