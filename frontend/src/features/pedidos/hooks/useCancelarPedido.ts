import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelarPedido } from "@/features/pedidos/api/pedidos";

/** Cancela un pedido propio en PENDIENTE (cliente). Se invalidan pedidos y productos porque se restituye el stock. */
export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
        queryClient.invalidateQueries({ queryKey: ["productos"] }),
      ]),
  });
}
