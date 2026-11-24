import type { DetallePedido } from "@/features/pedidos/types/pedido.types";
import { formatearPrecio } from "@/shared/utils/formato";

interface DetallePedidoListaProps {
  items: DetallePedido[];
  total: number;
}

/** Líneas de un pedido (nombre, cantidad, precio unitario y subtotal) y su total. Los valores son los copiados al crearlo. */
function DetallePedidoLista({ items, total }: DetallePedidoListaProps) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="py-2 font-semibold">Producto</th>
          <th className="py-2 text-right font-semibold">Cant.</th>
          <th className="py-2 text-right font-semibold">Precio</th>
          <th className="py-2 text-right font-semibold">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.producto_id} className="border-t border-slate-100">
            <td className="py-2">{item.nombre_producto}</td>
            <td className="py-2 text-right">{item.cantidad}</td>
            <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
            <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-slate-200 font-bold">
          <td className="py-2" colSpan={3}>
            Total
          </td>
          <td className="py-2 text-right">{formatearPrecio(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

export default DetallePedidoLista;
