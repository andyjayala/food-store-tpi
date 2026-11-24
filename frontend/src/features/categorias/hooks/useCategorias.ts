import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarCategoria, crearCategoria, eliminarCategoria, listarCategorias } from "@/features/categorias/api/categorias";
import type { CategoriaPayload } from "@/features/categorias/types/categoria.types";

/** Consulta de las categorías activas. */
export function useCategorias() {
  return useQuery({ queryKey: ["categorias"], queryFn: listarCategorias });
}

// Cada mutación invalida la consulta de categorías (y la de productos, que incluye la categoría de cada uno)
// para que la interfaz se actualice con los datos del servidor.
function useInvalidarCategorias() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["categorias"] }),
      queryClient.invalidateQueries({ queryKey: ["productos"] }),
    ]);
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({ mutationFn: (datos: CategoriaPayload) => crearCategoria(datos), onSuccess: invalidar });
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({
    mutationFn: (parametros: { id: number; datos: CategoriaPayload }) => actualizarCategoria(parametros.id, parametros.datos),
    onSuccess: invalidar,
  });
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({ mutationFn: (id: number) => eliminarCategoria(id), onSuccess: invalidar });
}
