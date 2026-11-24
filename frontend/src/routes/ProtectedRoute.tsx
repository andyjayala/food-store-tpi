import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/auth";
import Skeleton from "@/shared/components/Skeleton";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  /** Roles que pueden acceder. Si se omite, alcanza con tener una sesión activa. */
  roles?: Rol[];
}

/**
 * Ruta contenedora que protege a sus rutas hijas (se muestran mediante ``<Outlet />``):
 *  1. Mientras ``checkSession`` confirma la sesión, muestra un indicador de carga y no redirige.
 *  2. Sin sesión, redirige a /login (recordando la ruta solicitada para volver a ella después del login).
 *  3. Con sesión pero sin el rol permitido, redirige a /unauthorized.
 * Esto organiza la navegación, pero no reemplaza al backend, que valida la sesión y el rol en cada petición.
 */
function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation();
  const usuario = useAuthStore((estado) => estado.usuario);
  const cargando = useAuthStore((estado) => estado.cargando);

  if (cargando) {
    return (
      <div role="status" aria-label="Verificando la sesión" className="flex flex-col gap-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (usuario === null) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles !== undefined && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
