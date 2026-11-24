import { api } from "@/shared/api/axiosInstance";
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from "@/features/pedidos/types/pedido.types";

/** POST /pedidos: crea el pedido a partir del carrito. */
export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const respuesta = await api.post<Pedido>("/pedidos", datos);
  return respuesta.data;
}

/** GET /pedidos: los pedidos propios (usuario) o todos (administrador), paginados y con filtro por estado. */
export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const params: Record<string, string | number> = { skip: filtros.skip, limit: filtros.limit };
  if (filtros.estado !== undefined) params.estado = filtros.estado;
  const respuesta = await api.get<PedidosPaginados>("/pedidos", { params });
  return respuesta.data;
}

/** GET /pedidos/resumen (admin): indicadores del panel. */
export async function obtenerResumen(): Promise<ResumenPedidos> {
  const respuesta = await api.get<ResumenPedidos>("/pedidos/resumen");
  return respuesta.data;
}

/** PATCH /pedidos/{id}/estado (admin): avanza o cancela según la máquina de estados. */
export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const respuesta = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return respuesta.data;
}

/** PATCH /pedidos/{id}/cancelar: el dueño cancela su pedido mientras esté en PENDIENTE. */
export async function cancelarPedido(id: number): Promise<Pedido> {
  const respuesta = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return respuesta.data;
}
