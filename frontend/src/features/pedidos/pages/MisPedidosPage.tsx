import { useState } from "react";
import PedidoCard from "@/features/pedidos/components/PedidoCard";
import { useCancelarPedido } from "@/features/pedidos/hooks/useCancelarPedido";
import { usePedidos } from "@/features/pedidos/hooks/usePedidos";
import { ESTADOS } from "@/features/pedidos/types/pedido.types";
import type { EstadoPedido, Pedido } from "@/features/pedidos/types/pedido.types";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import Skeleton from "@/shared/components/Skeleton";
import Card from "@/shared/ui/Card";
import Select from "@/shared/ui/Select";

const PEDIDOS_POR_PAGINA = 10;

const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Listado de los pedidos del usuario con su detalle y la cancelación de los que están en PENDIENTE. */
function MisPedidosPage() {
  const [pagina, setPagina] = useState(1);
  const [estado, setEstado] = useState<EstadoPedido | "">("");

  const consulta = usePedidos({
    skip: (pagina - 1) * PEDIDOS_POR_PAGINA,
    limit: PEDIDOS_POR_PAGINA,
    estado: estado === "" ? undefined : estado,
  });
  const cancelar = useCancelarPedido();

  function handleCancelar(pedido: Pedido) {
    if (window.confirm(`¿Desea cancelar el pedido N.º ${pedido.id}? El stock de sus productos será restituido.`)) {
      cancelar.mutate(pedido.id);
    }
  }

  function handleEstado(valor: string) {
    setEstado(ESTADOS.find((e) => e === valor) ?? "");
    setPagina(1);
  }

  const totalPaginas = Math.ceil((consulta.data?.total ?? 0) / PEDIDOS_POR_PAGINA);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Mis pedidos</h1>

      <Card className="mt-5 max-w-xs">
        <Select
          id="filtro-estado"
          etiqueta="Filtrar por estado"
          valor={estado}
          onCambio={handleEstado}
          opcionVacia="Todos los estados"
          opciones={ESTADOS.map((e) => ({ valor: e, etiqueta: ETIQUETAS_ESTADO[e] }))}
        />
      </Card>

      {cancelar.isError && (
        <div className="mt-4">
          <EstadoError mensaje={handleApiError(cancelar.error)} />
        </div>
      )}

      <section className="mt-6 flex flex-col gap-4">
        {consulta.isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : consulta.isError ? (
          <EstadoError mensaje={handleApiError(consulta.error)} onReintentar={() => void consulta.refetch()} />
        ) : (consulta.data?.items ?? []).length === 0 ? (
          <EstadoVacio mensaje="Todavía no realizó pedidos." detalle="Cuando confirme un pedido, aparecerá en esta lista." />
        ) : (
          <>
            {(consulta.data?.items ?? []).map((pedido) => (
              <PedidoCard key={pedido.id} pedido={pedido} onCancelar={handleCancelar} cancelando={cancelar.isPending} />
            ))}
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
          </>
        )}
      </section>
    </div>
  );
}

export default MisPedidosPage;
