import { QueryClient } from "@tanstack/react-query";

/**
 * Instancia única de TanStack Query, que mantiene la caché de los datos del servidor.
 * Se reintenta una sola vez ante un fallo y no se recarga automáticamente al volver a enfocar la ventana.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
