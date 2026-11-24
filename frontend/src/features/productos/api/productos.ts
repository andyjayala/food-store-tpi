import { api } from "@/shared/api/axiosInstance";
import type {
  FiltrosProductos,
  Producto,
  ProductoPayload,
  ProductosPaginados,
  ProductoStockPayload,
} from "@/features/productos/types/producto.types";

/** GET /productos: listado público paginado en el servidor, con búsqueda y filtros opcionales. */
export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  // Los parámetros indefinidos o vacíos no se envían en la URL.
  const params: Record<string, string | number | boolean> = { skip: filtros.skip, limit: filtros.limit };
  if (filtros.search !== undefined && filtros.search !== "") params.search = filtros.search;
  if (filtros.categoria_id !== undefined) params.categoria_id = filtros.categoria_id;
  if (filtros.disponible !== undefined) params.disponible = filtros.disponible;

  const respuesta = await api.get<ProductosPaginados>("/productos", { params });
  return respuesta.data;
}

/** POST /productos (admin). */
export async function crearProducto(datos: ProductoPayload): Promise<Producto> {
  const respuesta = await api.post<Producto>("/productos", datos);
  return respuesta.data;
}

/** PUT /productos/{id} (admin): actualización parcial. */
export async function actualizarProducto(id: number, datos: ProductoPayload): Promise<Producto> {
  const respuesta = await api.put<Producto>(`/productos/${id}`, datos);
  return respuesta.data;
}

/** PATCH /productos/{id}/stock (admin): modifica el stock y la disponibilidad. */
export async function cambiarStockProducto(id: number, datos: ProductoStockPayload): Promise<Producto> {
  const respuesta = await api.patch<Producto>(`/productos/${id}/stock`, datos);
  return respuesta.data;
}

/** DELETE /productos/{id} (admin): baja lógica, responde 204 sin cuerpo. */
export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
