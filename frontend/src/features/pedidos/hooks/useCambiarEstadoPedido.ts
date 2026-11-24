import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cambiarEstadoPedido } from "@/features/pedidos/api/pedidos";
import type { EstadoPedido } from "@/features/pedidos/types/pedido.types";

/** Cambia el estado de un pedido (administrador). Una cancelación restituye stock, por eso se invalidan también los productos. */
export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (parametros: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(parametros.id, parametros.estado),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["productos"] }),
      ]),
  });
}
