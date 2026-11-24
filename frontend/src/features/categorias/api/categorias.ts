import { api } from "@/shared/api/axiosInstance";
import type { Categoria, CategoriaPayload } from "@/features/categorias/types/categoria.types";

/** GET /categorias: lista pública de las categorías activas. */
export async function listarCategorias(): Promise<Categoria[]> {
  const respuesta = await api.get<Categoria[]>("/categorias");
  return respuesta.data;
}

/** POST /categorias (admin). */
export async function crearCategoria(datos: CategoriaPayload): Promise<Categoria> {
  const respuesta = await api.post<Categoria>("/categorias", datos);
  return respuesta.data;
}

/** PUT /categorias/{id} (admin): actualización parcial. */
export async function actualizarCategoria(id: number, datos: CategoriaPayload): Promise<Categoria> {
  const respuesta = await api.put<Categoria>(`/categorias/${id}`, datos);
  return respuesta.data;
}

/** DELETE /categorias/{id} (admin): baja lógica, responde 204 sin cuerpo. */
export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
