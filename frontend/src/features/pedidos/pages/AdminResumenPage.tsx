import { useResumenPedidos } from "@/features/pedidos/hooks/useResumenPedidos";
import ResumenCard from "@/features/pedidos/components/ResumenCard";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import Skeleton from "@/shared/components/Skeleton";
import { formatearPrecio } from "@/shared/utils/formato";

/** Panel de resumen (administrador): tarjetas con los indicadores de ResumenPedidos. */
function AdminResumenPage() {
  const consulta = useResumenPedidos();
  const resumen = consulta.data;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Resumen</h1>

      <section className="mt-6">
        {consulta.isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, indice) => (
              <Skeleton key={indice} className="h-24 w-full" />
            ))}
          </div>
        ) : consulta.isError || resumen === undefined ? (
          <EstadoError mensaje={handleApiError(consulta.error)} onReintentar={() => void consulta.refetch()} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ResumenCard titulo="Pedidos pendientes" valor={String(resumen.pendientes)} colorValor="text-amber-600" />
            <ResumenCard titulo="En preparación" valor={String(resumen.en_preparacion)} colorValor="text-blue-600" />
            <ResumenCard titulo="Entregados" valor={String(resumen.entregados)} colorValor="text-green-600" />
            <ResumenCard titulo="Cancelados" valor={String(resumen.cancelados)} colorValor="text-red-600" />
            <ResumenCard titulo="Pedidos de hoy" valor={String(resumen.pedidos_hoy)} />
            <ResumenCard titulo="Ingresos (pedidos entregados)" valor={formatearPrecio(resumen.ingresos_entregados)} colorValor="text-green-700" />
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminResumenPage;
