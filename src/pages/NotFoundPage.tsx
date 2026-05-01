import { useNavigate } from "react-router-dom";

/**
 * Página 404 — ruta no encontrada.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "#020617" }}
    >
      <div className="text-center space-y-4">
        <p
          className="text-8xl font-bold tracking-tighter"
          style={{ color: "rgba(244,233,205,0.08)" }}
        >
          404
        </p>
        <div className="space-y-1">
          <h1 className="text-base font-semibold" style={{ color: "#F4E9CD" }}>
            Página no encontrada
          </h1>
          <p className="text-sm" style={{ color: "#475569" }}>
            La ruta que buscas no existe o fue movida.
          </p>
        </div>
        <button
          onClick={() => navigate("/estudiantes")}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
          style={{ background: "#F4E9CD", color: "#0f172a" }}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
