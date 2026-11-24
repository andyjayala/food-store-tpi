import { useState } from "react";
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import DetallePedidoLista from "@/features/pedidos/components/DetallePedidoLista";
import { useCambiarEstadoPedido } from "@/features/pedidos/hooks/useCambiarEstadoPedido";
import { usePedidos } from "@/features/pedidos/hooks/usePedidos";
import { ESTADOS, TRANSICIONES } from "@/features/pedidos/types/pedido.types";
import type { EstadoPedido, Pedido } from "@/features/pedidos/types/pedido.types";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Skeleton from "@/shared/components/Skeleton";
import TablaDatos from "@/shared/components/TablaDatos";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Modal from "@/shared/ui/Modal";
import Select from "@/shared/ui/Select";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";

const SIN_PEDIDOS: Pedido[] = [];

const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Gestión de pedidos (administrador): filtro por estado y botones para avanzar o cancelar según la máquina de estados. */
function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | "">("");
  const [detalle, setDetalle] = useState<Pedido | null>(null);

  // El filtro por estado se aplica en el servidor; la tabla pagina del lado del cliente (se piden hasta 100 pedidos).
  const consulta = usePedidos({ skip: 0, limit: 100, estado: estado === "" ? undefined : estado });
  const cambiarEstado = useCambiarEstadoPedido();

  function handleCancelar(pedido: Pedido) {
    if (window.confirm(`¿Desea cancelar el pedido N.º ${pedido.id}? El stock de sus productos será restituido.`)) {
      cambiarEstado.mutate({ id: pedido.id, estado: "CANCELADO" });
    }
  }

  const columnas: ColumnDef<Pedido>[] = [
    { accessorKey: "id", header: "N.º" },
    { accessorKey: "usuario_id", header: "Cliente (id)" },
    { accessorKey: "created_at", header: "Fecha", cell: ({ row }) => formatearFecha(row.original.created_at) },
    { accessorKey: "forma_pago", header: "Pago", cell: ({ row }) => (row.original.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia") },
    { accessorKey: "total", header: "Total", cell: ({ row }) => formatearPrecio(row.original.total) },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        const pedido = row.original;
        const siguientes = TRANSICIONES[pedido.estado];
        // El «avance» es la transición válida distinta de la cancelación; la cancelación se ofrece aparte.
        const avance = siguientes.find((destino) => destino !== "CANCELADO");
        return (
          <div className="flex flex-wrap gap-2">
            <Button tamano="sm" variante="secundario" onClick={() => setDetalle(pedido)}>
              Detalle
            </Button>
            {avance !== undefined && (
              <Button tamano="sm" disabled={cambiarEstado.isPending} onClick={() => cambiarEstado.mutate({ id: pedido.id, estado: avance })}>
                Pasar a {ETIQUETAS_ESTADO[avance]}
              </Button>
            )}
            {siguientes.includes("CANCELADO") && (
              <Button tamano="sm" variante="peligro" disabled={cambiarEstado.isPending} onClick={() => handleCancelar(pedido)}>
                Cancelar
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: consulta.data?.items ?? SIN_PEDIDOS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Pedidos</h1>

      <Card className="mt-5 max-w-xs">
        <Select
          id="admin-filtro-estado"
          etiqueta="Filtrar por estado"
          valor={estado}
          onCambio={(valor) => setEstado(ESTADOS.find((e) => e === valor) ?? "")}
          opcionVacia="Todos los estados"
          opciones={ESTADOS.map((e) => ({ valor: e, etiqueta: ETIQUETAS_ESTADO[e] }))}
        />
      </Card>

      {cambiarEstado.isError && (
        <div className="mt-4">
          <EstadoError mensaje={handleApiError(cambiarEstado.error)} />
        </div>
      )}

      <section className="mt-6">
        {consulta.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : consulta.isError ? (
          <EstadoError mensaje={handleApiError(consulta.error)} onReintentar={() => void consulta.refetch()} />
        ) : (consulta.data?.items ?? []).length === 0 ? (
          <EstadoVacio mensaje="No hay pedidos para mostrar." detalle={estado !== "" ? "Pruebe con otro estado." : undefined} />
        ) : (
          <TablaDatos table={table} />
        )}
      </section>

      {detalle !== null && (
        <Modal titulo={`Pedido N.º ${detalle.id}`} onCerrar={() => setDetalle(null)}>
          <dl className="mb-4 flex flex-col gap-1 text-sm text-slate-600">
            <div>
              <dt className="inline font-semibold">Cliente (id): </dt>
              <dd className="inline">{detalle.usuario_id}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Dirección: </dt>
              <dd className="inline">{detalle.direccion_entrega}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Estado: </dt>
              <dd className="inline">
                <BadgeEstado estado={detalle.estado} />
              </dd>
            </div>
            {detalle.notas !== null && detalle.notas !== "" && (
              <div>
                <dt className="inline font-semibold">Notas: </dt>
                <dd className="inline">{detalle.notas}</dd>
              </div>
            )}
          </dl>
          <DetallePedidoLista items={detalle.items} total={detalle.total} />
          <div className="mt-4 flex justify-end">
            <Button variante="secundario" onClick={() => setDetalle(null)}>
              Cerrar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminPedidosPage;
