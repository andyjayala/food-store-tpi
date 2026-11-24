import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarProducto,
  cambiarStockProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from "@/features/productos/api/productos";
import type { FiltrosProductos, ProductoPayload, ProductoStockPayload } from "@/features/productos/types/producto.types";

/**
 * Consulta del listado de productos. La clave incluye los filtros, de modo que cada combinación de búsqueda, categoría y
 * página tiene su propia entrada en la caché. ``keepPreviousData`` conserva la página anterior mientras llega la nueva.
 */
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData,
  });
}

// Toda mutación sobre productos invalida las consultas cuya clave comienza con "productos".
function useInvalidarProductos() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({ mutationFn: (datos: ProductoPayload) => crearProducto(datos), onSuccess: invalidar });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (parametros: { id: number; datos: ProductoPayload }) => actualizarProducto(parametros.id, parametros.datos),
    onSuccess: invalidar,
  });
}

export function useCambiarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (parametros: { id: number; datos: ProductoStockPayload }) => cambiarStockProducto(parametros.id, parametros.datos),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({ mutationFn: (id: number) => eliminarProducto(id), onSuccess: invalidar });
}
