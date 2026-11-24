import { Link, useNavigate } from "react-router-dom";
import CheckoutForm from "@/features/pedidos/components/CheckoutForm";
import type { DatosCheckout } from "@/features/pedidos/components/CheckoutForm";
import { useCrearPedido } from "@/features/pedidos/hooks/useCrearPedido";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Card from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore } from "@/store/cartStore";

/** Confirmación del pedido: resumen del carrito y formulario con dirección, forma de pago y notas. Requiere sesión. */
function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((estado) => estado.items);
  const total = useCartStore((estado) => estado.total());
  const vaciar = useCartStore((estado) => estado.vaciar);
  const crearPedido = useCrearPedido();

  // Se envía POST /pedidos. Si sale bien, se vacía el carrito y se redirige a «Mis pedidos»; si el backend rechaza
  // el pedido (por ejemplo, por stock insuficiente), la excepción llega al formulario, que muestra el motivo.
  async function confirmar(datos: DatosCheckout): Promise<void> {
    await crearPedido.mutateAsync({
      items: items.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })),
      forma_pago: datos.forma_pago,
      direccion_entrega: datos.direccion_entrega,
      notas: datos.notas === "" ? null : datos.notas,
    });
    vaciar();
    navigate("/mis-pedidos");
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        mensaje="No hay productos en el carrito."
        accion={
          <Link to="/" className="font-semibold text-orange-600 hover:text-orange-700">
            Ir al catálogo
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-extrabold">Confirmar pedido</h1>
        <Card className="mt-6">
          <CheckoutForm onConfirmar={confirmar} />
        </Card>
      </div>

      <aside className="lg:col-span-2">
        <h2 className="text-lg font-bold">Resumen</h2>
        <Card className="mt-6">
          <ul className="divide-y divide-slate-100 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-3 py-2">
                <span>
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </p>
        </Card>
      </aside>
    </div>
  );
}

export default CheckoutPage;
