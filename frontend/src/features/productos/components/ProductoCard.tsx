import { useState } from "react";
import type { Producto } from "@/features/productos/types/producto.types";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore } from "@/store/cartStore";

interface ProductoCardProps {
  producto: Producto;
}

/** Tarjeta de un producto del catálogo, con el botón «Agregar al carrito». Lee y modifica el cartStore. */
function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((estado) => estado.agregar);
  const [agregado, setAgregado] = useState(false);
  // Si la imagen no se puede cargar (sin conexión o enlace roto) se muestra el ícono de reemplazo.
  const [imagenRota, setImagenRota] = useState(false);

  // Un producto solo se puede comprar si está disponible y tiene stock.
  const sinStock = producto.stock <= 0;
  const comprable = producto.disponible && !sinStock;

  function handleAgregar() {
    agregar({ id: producto.id, nombre: producto.nombre, precio_base: producto.precio_base });
    // Confirmación visual breve (1,2 segundos).
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  }

  return (
    <Card className="flex flex-col overflow-hidden !p-0">
      {producto.imagen_url !== "" && !imagenRota ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          loading="lazy"
          onError={() => setImagenRota(true)}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-orange-50 text-5xl" aria-hidden="true">
          🍽️
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">{producto.categoria.nombre}</span>
        <h3 className="text-base font-bold">{producto.nombre}</h3>
        <p className="flex-1 text-sm text-slate-600">{producto.descripcion}</p>
        <div className="flex items-end justify-between">
          <span className="text-lg font-extrabold">{formatearPrecio(producto.precio_base)}</span>
          <span className={`text-xs ${comprable ? "text-slate-500" : "font-semibold text-red-600"}`}>
            {!producto.disponible ? "No disponible" : sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
          </span>
        </div>
        <Button disabled={!comprable} onClick={handleAgregar}>
          {agregado ? "✓ Agregado" : "Agregar al carrito"}
        </Button>
      </div>
    </Card>
  );
}

export default ProductoCard;
