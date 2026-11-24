import { useState } from "react";
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useCategorias } from "@/features/categorias";
import ProductoFormModal from "@/features/productos/components/ProductoFormModal";
import StockModal from "@/features/productos/components/StockModal";
import {
  useActualizarProducto,
  useCambiarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "@/features/productos/hooks/useProductos";
import type { Producto, ProductoPayload, ProductoStockPayload } from "@/features/productos/types/producto.types";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Skeleton from "@/shared/components/Skeleton";
import TablaDatos from "@/shared/components/TablaDatos";
import Button from "@/shared/ui/Button";
import { formatearPrecio } from "@/shared/utils/formato";

const SIN_PRODUCTOS: Producto[] = [];

/** ABM de productos (administrador): TanStack Table, formulario con TanStack Form y cambio de stock y disponibilidad. */
function AdminProductosPage() {
  // El panel solicita hasta 100 productos y la tabla pagina, ordena y filtra del lado del cliente.
  const consulta = useProductos({ skip: 0, limit: 100 });
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const cambiarStock = useCambiarStock();
  const eliminar = useEliminarProducto();

  // Estado de la interfaz: qué modal está abierto y sobre qué producto.
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [paraEditar, setParaEditar] = useState<Producto | null>(null);
  const [paraStock, setParaStock] = useState<Producto | null>(null);

  function abrirAlta() {
    setParaEditar(null);
    setFormularioAbierto(true);
  }

  function abrirEdicion(producto: Producto) {
    setParaEditar(producto);
    setFormularioAbierto(true);
  }

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setParaEditar(null);
  }

  async function guardar(datos: ProductoPayload): Promise<void> {
    if (paraEditar === null) {
      await crear.mutateAsync(datos);
    } else {
      await actualizar.mutateAsync({ id: paraEditar.id, datos });
    }
    cerrarFormulario();
  }

  async function guardarStock(datos: ProductoStockPayload): Promise<void> {
    if (paraStock === null) return;
    await cambiarStock.mutateAsync({ id: paraStock.id, datos });
    setParaStock(null);
  }

  function handleEliminar(producto: Producto) {
    if (window.confirm(`¿Desea dar de baja el producto "${producto.nombre}"?`)) {
      eliminar.mutate(producto.id);
    }
  }

  const columnas: ColumnDef<Producto>[] = [
    { accessorKey: "id", header: "N.º", enableSorting: false },
    { accessorKey: "nombre", header: "Nombre" },
    { id: "categoria", header: "Categoría", accessorFn: (producto) => producto.categoria.nombre },
    { accessorKey: "precio_base", header: "Precio", cell: ({ row }) => formatearPrecio(row.original.precio_base) },
    { accessorKey: "stock", header: "Stock" },
    {
      accessorKey: "disponible",
      header: "Disponible",
      cell: ({ row }) =>
        row.original.disponible ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Sí</span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">No</span>
        ),
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button tamano="sm" variante="secundario" onClick={() => abrirEdicion(row.original)}>
            Editar
          </Button>
          <Button tamano="sm" variante="secundario" onClick={() => setParaStock(row.original)}>
            Stock
          </Button>
          <Button tamano="sm" variante="peligro" disabled={eliminar.isPending} onClick={() => handleEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: consulta.data?.items ?? SIN_PRODUCTOS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Productos</h1>
        <Button onClick={abrirAlta}>+ Nuevo producto</Button>
      </div>

      {eliminar.isError && (
        <div className="mt-4">
          <EstadoError mensaje={handleApiError(eliminar.error)} />
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
          <EstadoVacio mensaje="Todavía no hay productos." detalle='Cree el primero con el botón "Nuevo producto".' />
        ) : (
          <TablaDatos table={table} columnaBusqueda="nombre" placeholderBusqueda="Buscar producto por nombre..." />
        )}
      </section>

      {formularioAbierto && (
        <ProductoFormModal producto={paraEditar} categorias={categorias.data ?? []} onGuardar={guardar} onCerrar={cerrarFormulario} />
      )}
      {paraStock !== null && <StockModal producto={paraStock} onGuardar={guardarStock} onCerrar={() => setParaStock(null)} />}
    </div>
  );
}

export default AdminProductosPage;
