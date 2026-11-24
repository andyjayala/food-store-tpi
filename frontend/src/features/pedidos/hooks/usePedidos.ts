import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarPedidos } from "@/features/pedidos/api/pedidos";
import type { FiltrosPedidos } from "@/features/pedidos/types/pedido.types";

/** Consulta de pedidos paginada. La clave incluye los filtros para cachear cada combinación por separado. */
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}
