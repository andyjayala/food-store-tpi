import { useState } from "react";
import DetallePedidoLista from "@/features/pedidos/components/DetallePedidoLista";
import type { Pedido } from "@/features/pedidos/types/pedido.types";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";

interface PedidoCardProps {
  pedido: Pedido;
  onCancelar: (pedido: Pedido) => void;
  cancelando: boolean;
}

/** Tarjeta de un pedido propio, con su detalle desplegable y el botón de cancelación (solo en PENDIENTE). */
function PedidoCard({ pedido, onCancelar, cancelando }: PedidoCardProps) {
  const [detalleAbierto, setDetalleAbierto] = useState(false);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Pedido N.º {pedido.id}</h3>
          <p className="text-xs text-slate-500">{formatearFecha(pedido.created_at)}</p>
        </div>
        <BadgeEstado estado={pedido.estado} />
        <span className="text-lg font-extrabold">{formatearPrecio(pedido.total)}</span>
        <div className="flex gap-2">
          <Button tamano="sm" variante="secundario" onClick={() => setDetalleAbierto(!detalleAbierto)}>
            {detalleAbierto ? "Ocultar detalle" : "Ver detalle"}
          </Button>
          {/* Un cliente solo puede cancelar su pedido mientras esté en PENDIENTE (RN-04). */}
          {pedido.estado === "PENDIENTE" && (
            <Button tamano="sm" variante="peligro" disabled={cancelando} onClick={() => onCancelar(pedido)}>
              Cancelar pedido
            </Button>
          )}
        </div>
      </div>

      {detalleAbierto && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <dl className="mb-4 grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="inline font-semibold">Dirección: </dt>
              <dd className="inline">{pedido.direccion_entrega}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Forma de pago: </dt>
              <dd className="inline">{pedido.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}</dd>
            </div>
            {pedido.notas !== null && pedido.notas !== "" && (
              <div className="sm:col-span-2">
                <dt className="inline font-semibold">Notas: </dt>
                <dd className="inline">{pedido.notas}</dd>
              </div>
            )}
          </dl>
          <DetallePedidoLista items={pedido.items} total={pedido.total} />
        </div>
      )}
    </Card>
  );
}

export default PedidoCard;
