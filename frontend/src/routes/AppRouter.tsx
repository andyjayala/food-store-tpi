import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, RegisterPage, UnauthorizedPage } from "@/features/auth";
import { AdminCategoriasPage } from "@/features/categorias";
import { AdminPedidosPage, AdminResumenPage, CarritoPage, CheckoutPage, MisPedidosPage } from "@/features/pedidos";
import { AdminProductosPage, CatalogoPage } from "@/features/productos";
import { AdminUsuariosPage } from "@/features/usuarios";
import MainLayout from "@/shared/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

/** Tabla de rutas de la aplicación. Todas comparten el MainLayout (barra de navegación + contenido). */
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Rutas públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rutas que requieren sesión (cualquier rol) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Rutas del panel de administración: requieren el rol admin */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<Navigate to="/admin/resumen" replace />} />
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          {/* Cualquier otra dirección vuelve al catálogo */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
