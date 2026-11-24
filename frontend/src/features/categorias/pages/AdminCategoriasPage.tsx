import { useState } from "react";
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import CategoriaFormModal from "@/features/categorias/components/CategoriaFormModal";
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from "@/features/categorias/hooks/useCategorias";
import type { Categoria, CategoriaPayload } from "@/features/categorias/types/categoria.types";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Skeleton from "@/shared/components/Skeleton";
import TablaDatos from "@/shared/components/TablaDatos";
import Button from "@/shared/ui/Button";

const SIN_CATEGORIAS: Categoria[] = [];

/** ABM de categorías (administrador): tabla con TanStack Table y formulario de alta y edición con TanStack Form. */
function AdminCategoriasPage() {
  const consulta = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  // Estado de la interfaz: si el modal está abierto y qué categoría se edita (null = alta).
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null);

  function abrirAlta() {
    setSeleccionada(null);
    setModalAbierto(true);
  }

  function abrirEdicion(categoria: Categoria) {
    setSeleccionada(categoria);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setSeleccionada(null);
  }

  // Alta o edición según haya una categoría seleccionada. Si falla, la excepción llega al modal, que la muestra.
  async function guardar(datos: CategoriaPayload): Promise<void> {
    if (seleccionada === null) {
      await crear.mutateAsync(datos);
    } else {
      await actualizar.mutateAsync({ id: seleccionada.id, datos });
    }
    cerrarModal();
  }

  function handleEliminar(categoria: Categoria) {
    if (window.confirm(`¿Desea dar de baja la categoría "${categoria.nombre}"?`)) {
      eliminar.mutate(categoria.id);
    }
  }

  const columnas: ColumnDef<Categoria>[] = [
    { accessorKey: "id", header: "N.º", enableSorting: false },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripción" },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button tamano="sm" variante="secundario" onClick={() => abrirEdicion(row.original)}>
            Editar
          </Button>
          <Button tamano="sm" variante="peligro" disabled={eliminar.isPending} onClick={() => handleEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: consulta.data ?? SIN_CATEGORIAS,
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
        <h1 className="text-2xl font-extrabold">Categorías</h1>
        <Button onClick={abrirAlta}>+ Nueva categoría</Button>
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
        ) : (consulta.data ?? []).length === 0 ? (
          <EstadoVacio mensaje="Todavía no hay categorías." detalle='Cree la primera con el botón "Nueva categoría".' />
        ) : (
          <TablaDatos table={table} columnaBusqueda="nombre" placeholderBusqueda="Buscar categoría por nombre..." />
        )}
      </section>

      {modalAbierto && <CategoriaFormModal categoria={seleccionada} onGuardar={guardar} onCerrar={cerrarModal} />}
    </div>
  );
}

export default AdminCategoriasPage;
