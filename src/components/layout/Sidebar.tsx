import { NavLink } from "react-router-dom";
import {
  Users,
  FileText,
  Bell,
  Settings,
  UserCog,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Rol } from "@/types";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Rol[];
}

const navItems: NavItem[] = [
  {
    label: "Estudiantes",
    path: "/estudiantes",
    icon: <Users size={15} />,
    roles: ["ADMIN", "COORDINADOR"],
  },
  {
    label: "Justificaciones",
    path: "/justificaciones",
    icon: <FileText size={15} />,
    roles: ["ADMIN", "COORDINADOR", "ESTUDIANTE"],
  },
  {
    label: "Mi expediente",
    path: "/mi-expediente",
    icon: <GraduationCap size={15} />,
    roles: ["ESTUDIANTE"],
  },
  {
    label: "Notificaciones",
    path: "/notificaciones",
    icon: <Bell size={15} />,
    roles: ["ADMIN", "COORDINADOR", "ESTUDIANTE"],
  },
  {
    label: "Catálogos",
    path: "/catalogos",
    icon: <Settings size={15} />,
    roles: ["ADMIN"],
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    icon: <UserCog size={15} />,
    roles: ["ADMIN"],
  },
];

/**
 * Sidebar fijo con navegación filtrada por rol del usuario autenticado.
 */
export default function Sidebar() {
  const { sesion, logout } = useAuth();

  if (!sesion) return null;

  const itemsVisibles = navItems.filter((item) =>
    item.roles.includes(sesion.rol),
  );

  const itemsAdmin = itemsVisibles.filter((item) =>
    ["/catalogos", "/usuarios"].includes(item.path),
  );

  const iniciales = sesion.nombreUsuario
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  return (
    <aside
      className="flex flex-col shrink-0 h-screen"
      style={{
        width: 220,
        background: "#0f172a",
        borderRight: "1px solid #1e293b",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: "1px solid #1e293b" }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 32, height: 32, background: "rgba(244,233,205,0.1)" }}
        >
          <GraduationCap size={16} style={{ color: "#F4E9CD" }} />
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "#F4E9CD" }}>
            SEEC
          </p>
          <p className="text-xs" style={{ color: "#475569" }}>
            CUNORI
          </p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {/* Sección principal */}
        <p
          className="text-xs font-medium uppercase tracking-widest px-2 mb-1"
          style={{ color: "#475569", fontSize: 9 }}
        >
          Principal
        </p>

        {itemsVisibles
          .filter((item) => !["/catalogos", "/usuarios"].includes(item.path))
          .map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

        {/* Sección admin */}
        {itemsAdmin.length > 0 && (
          <>
            <p
              className="text-xs font-medium uppercase tracking-widest px-2 mt-4 mb-1"
              style={{ color: "#475569", fontSize: 9 }}
            >
              Administración
            </p>
            {itemsAdmin.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* Usuario + logout */}
      <div
        className="flex items-center gap-2 px-3 py-3"
        style={{ borderTop: "1px solid #1e293b" }}
      >
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 28, height: 28, background: "rgba(244,233,205,0.1)" }}
        >
          <span className="text-xs font-medium" style={{ color: "#F4E9CD" }}>
            {iniciales}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium truncate"
            style={{ color: "#cbd5e1" }}
          >
            {sesion.nombreUsuario}
          </p>
          <p className="text-xs" style={{ color: "#475569", fontSize: 9 }}>
            {sesion.rol}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="transition hover:opacity-70"
          title="Cerrar sesión"
        >
          <LogOut size={13} style={{ color: "#475569" }} />
        </button>
      </div>
    </aside>
  );
}

// ─── Sub-componente NavItem ───────────────────────────────────────────────────
function NavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.path}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition w-full"
      style={({ isActive }) => ({
        background: isActive ? "rgba(244,233,205,0.08)" : "transparent",
        color: isActive ? "#F4E9CD" : "#64748b",
      })}
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );
}
