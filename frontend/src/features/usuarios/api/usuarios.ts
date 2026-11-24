import { api } from "@/shared/api/axiosInstance";
import type { Usuario } from "@/features/auth";

/** GET /admin/usuarios (admin): todos los usuarios, incluidos los desactivados. */
export async function listarUsuarios(): Promise<Usuario[]> {
  const respuesta = await api.get<Usuario[]>("/admin/usuarios");
  return respuesta.data;
}

/** POST /admin/usuarios/{id}/activar (admin): operación idempotente. */
export async function activarUsuario(id: number): Promise<Usuario> {
  const respuesta = await api.post<Usuario>(`/admin/usuarios/${id}/activar`);
  return respuesta.data;
}

/** POST /admin/usuarios/{id}/desactivar (admin): operación idempotente; el backend rechaza la auto-desactivación. */
export async function desactivarUsuario(id: number): Promise<Usuario> {
  const respuesta = await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`);
  return respuesta.data;
}
