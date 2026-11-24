import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Línea del carrito. Se conservan el nombre y el precio con los que el cliente vio el producto. */
export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

/** Datos mínimos de un producto necesarios para agregarlo al carrito. */
interface ProductoParaCarrito {
  id: number;
  nombre: string;
  precio_base: number;
}

interface CartState {
  items: ItemCarrito[];
  agregar: (producto: ProductoParaCarrito, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

/**
 * Estado global del carrito (Zustand con persist). Se guarda en el navegador para que sobreviva a una recarga.
 * El precio definitivo lo fija el backend al crear el pedido; el del carrito es solo informativo.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Si el producto ya está en el carrito se suma la cantidad; si no, se agrega una línea nueva.
      agregar: (producto, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((item) => item.producto_id === producto.id);
          if (existente !== undefined) {
            return {
              items: estado.items.map((item) =>
                item.producto_id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
              ),
            };
          }
          return {
            items: [
              ...estado.items,
              { producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base, cantidad },
            ],
          };
        }),

      quitar: (productoId) => set((estado) => ({ items: estado.items.filter((item) => item.producto_id !== productoId) })),

      // Una cantidad menor a 1 elimina la línea.
      cambiarCantidad: (productoId, cantidad) =>
        set((estado) => ({
          items:
            cantidad < 1
              ? estado.items.filter((item) => item.producto_id !== productoId)
              : estado.items.map((item) => (item.producto_id === productoId ? { ...item, cantidad } : item)),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((suma, item) => suma + item.precio_unitario * item.cantidad, 0),
    }),
    {
      name: "cart-storage",
      partialize: (estado) => ({ items: estado.items }),
    }
  )
);
