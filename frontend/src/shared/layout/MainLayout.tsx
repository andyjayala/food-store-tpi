import { Outlet } from "react-router-dom";
import Navbar from "@/shared/layout/Navbar";

/** Estructura común de todas las pantallas: la barra de navegación y, debajo, el contenido de la ruta activa. */
function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
