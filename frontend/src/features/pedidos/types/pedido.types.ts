// Tipos del dominio de pedidos (coinciden con los schemas PedidoRead, PedidoCreate y ResumenPedidos del backend).

export type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

export interface ItemPedidoCreate {
  producto_id: number;
  cantidad: number;
}

export interface PedidoCreate {
  items: ItemPedidoCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}

export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

export interface FiltrosPedidos {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}

export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}

export const ESTADOS: EstadoPedido[] = ["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"];

/**
 * Máquina de estados del pedido: para cada estado, los estados a los que puede pasar. Replica la del backend y se usa
 * únicamente para decidir qué botones mostrar; la validación efectiva se realiza siempre en el servidor.
 */
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};
