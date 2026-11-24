import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearPedido } from "@/features/pedidos/api/pedidos";
import type { PedidoCreate } from "@/features/pedidos/types/pedido.types";

/** Crea un pedido. Al terminar se invalidan los pedidos y los productos, porque el stock cambió. */
export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["productos"] }),
      ]),
  });
}
