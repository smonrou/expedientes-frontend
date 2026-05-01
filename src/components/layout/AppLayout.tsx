import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * Layout principal de la aplicación.
 * Sidebar fijo a la izquierda, topbar en la parte superior, contenido en el centro.
 */
export default function AppLayout() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#020617" }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
