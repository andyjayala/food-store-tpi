import { useQuery } from "@tanstack/react-query";
import { obtenerResumen } from "@/features/pedidos/api/pedidos";

/** Consulta de los indicadores del panel de administración. */
export function useResumenPedidos() {
  return useQuery({ queryKey: ["pedidos", "resumen"], queryFn: obtenerResumen });
}
