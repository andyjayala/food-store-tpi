import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const ENLACES_ADMIN = [
  { to: "/admin/resumen", etiqueta: "Resumen" },
  { to: "/admin/categorias", etiqueta: "Categorías" },
  { to: "/admin/productos", etiqueta: "Productos" },
  { to: "/admin/pedidos", etiqueta: "Pedidos" },
  { to: "/admin/usuarios", etiqueta: "Usuarios" },
];

// Estilo de los enlaces de navegación: el de la ruta activa se resalta.
function claseEnlace({ isActive }: { isActive: boolean }): string {
  return `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-orange-100 text-orange-800" : "text-slate-600 hover:bg-slate-100"}`;
}

/**
 * Barra de navegación. Muestra el nombre y el rol del usuario con el botón «Cerrar sesión», la cantidad de ítems del
 * carrito y, únicamente para el rol admin, el acceso al panel de administración.
 */
function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const usuario = useAuthStore((estado) => estado.usuario);
  const cargando = useAuthStore((estado) => estado.cargando);
  const logout = useAuthStore((estado) => estado.logout);
  const cantidadCarrito = useCartStore((estado) => estado.items.reduce((suma, item) => suma + item.cantidad, 0));

  const esAdmin = usuario?.role === "admin";

  // Cierra la sesión (POST /auth/logout), limpia el authStore, vacía la caché de consultas y redirige a /login.
  async function handleCerrarSesion() {
    await logout();
    queryClient.clear();
    navigate("/login", { replace: true });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <span className="text-lg font-extrabold text-orange-600">🍕 Food Store</span>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseEnlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseEnlace}>
            Carrito
            {cantidadCarrito > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs font-bold text-white">{cantidadCarrito}</span>
            )}
          </NavLink>
          {usuario !== null && (
            <NavLink to="/mis-pedidos" className={claseEnlace}>
              Mis pedidos
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          {usuario !== null ? (
            <>
              <span className="text-slate-700">
                <span className="font-semibold">{usuario.full_name}</span>{" "}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{usuario.role}</span>
              </span>
              <Button variante="secundario" tamano="sm" onClick={() => void handleCerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            !cargando && (
              <>
                <NavLink to="/login" className={claseEnlace}>
                  Iniciar sesión
                </NavLink>
                <NavLink to="/register" className={claseEnlace}>
                  Registrarse
                </NavLink>
              </>
            )
          )}
        </div>
      </nav>

      {/* Acceso al panel de administración: solo se muestra al rol admin (la protección real es la del backend). */}
      {esAdmin && (
        <div className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Panel de administración</span>
            {ENLACES_ADMIN.map((enlace) => (
              <NavLink key={enlace.to} to={enlace.to} className={claseEnlace}>
                {enlace.etiqueta}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
