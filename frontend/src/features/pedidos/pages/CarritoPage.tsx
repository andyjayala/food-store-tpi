import { Link } from "react-router-dom";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore } from "@/store/cartStore";

/** Carrito de compras. Es público y persiste al recargar la página (cartStore con persist). */
function CarritoPage() {
  const items = useCartStore((estado) => estado.items);
  const total = useCartStore((estado) => estado.total());
  const cambiarCantidad = useCartStore((estado) => estado.cambiarCantidad);
  const quitar = useCartStore((estado) => estado.quitar);
  const vaciar = useCartStore((estado) => estado.vaciar);

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold">Carrito</h1>
        <div className="mt-6">
          <EstadoVacio
            mensaje="El carrito está vacío."
            detalle="Agregue productos desde el catálogo para armar su pedido."
            accion={
              <Link to="/" className="font-semibold text-orange-600 hover:text-orange-700">
                Ir al catálogo
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Carrito</h1>
        <Button variante="fantasma" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 font-semibold">Producto</th>
              <th className="py-2 text-right font-semibold">Precio</th>
              <th className="py-2 text-center font-semibold">Cantidad</th>
              <th className="py-2 text-right font-semibold">Subtotal</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.producto_id} className="border-t border-slate-100">
                <td className="py-3 font-medium">{item.nombre}</td>
                <td className="py-3 text-right">{formatearPrecio(item.precio_unitario)}</td>
                <td className="py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button tamano="sm" variante="secundario" aria-label={`Quitar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>
                      −
                    </Button>
                    <span className="w-8 text-center font-semibold" aria-label={`Cantidad de ${item.nombre}`}>
                      {item.cantidad}
                    </span>
                    <Button tamano="sm" variante="secundario" aria-label={`Agregar una unidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}>
                      +
                    </Button>
                  </div>
                </td>
                <td className="py-3 text-right font-semibold">{formatearPrecio(item.precio_unitario * item.cantidad)}</td>
                <td className="py-3 text-right">
                  <Button tamano="sm" variante="fantasma" onClick={() => quitar(item.producto_id)}>
                    Quitar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 text-base font-extrabold">
              <td className="py-3" colSpan={3}>
                Total
              </td>
              <td className="py-3 text-right">{formatearPrecio(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Link to="/" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Seguir comprando
        </Link>
        <Link to="/checkout" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
          Confirmar pedido
        </Link>
      </div>
    </div>
  );
}

export default CarritoPage;
