import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { Usuario } from "@/features/auth";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "@/features/usuarios/hooks/useUsuarios";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Skeleton from "@/shared/components/Skeleton";
import TablaDatos from "@/shared/components/TablaDatos";
import Button from "@/shared/ui/Button";
import { formatearFecha } from "@/shared/utils/formato";
import { useAuthStore } from "@/store/authStore";

const SIN_USUARIOS: Usuario[] = [];

/** Gestión de usuarios (administrador): listado con su estado y acciones para activar y desactivar cuentas. */
function AdminUsuariosPage() {
  const miId = useAuthStore((estado) => estado.usuario?.id);
  const consulta = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const ocupado = activar.isPending || desactivar.isPending;

  function handleDesactivar(usuario: Usuario) {
    if (window.confirm(`¿Desea desactivar la cuenta de ${usuario.username}?`)) {
      desactivar.mutate(usuario.id);
    }
  }

  const columnas: ColumnDef<Usuario>[] = [
    { accessorKey: "id", header: "N.º", enableSorting: false },
    { accessorKey: "username", header: "Usuario" },
    { accessorKey: "full_name", header: "Nombre" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{row.original.role}</span>
      ),
    },
    {
      accessorKey: "disabled",
      header: "Estado",
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Desactivado</span>
        ) : (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Activo</span>
        ),
    },
    {
      accessorKey: "created_at",
      header: "Alta",
      cell: ({ row }) => formatearFecha(row.original.created_at),
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        const usuario = row.original;
        // Opción 1: la cuenta está desactivada -> «Activar».
        // Opción 2: la cuenta está activa -> «Desactivar», salvo en la fila del usuario de la sesión (no puede desactivarse a sí mismo).
        if (usuario.disabled) {
          return (
            <Button tamano="sm" variante="secundario" disabled={ocupado} onClick={() => activar.mutate(usuario.id)}>
              Activar
            </Button>
          );
        }
        if (usuario.id === miId) {
          return <span className="text-xs text-slate-400">Cuenta actual</span>;
        }
        return (
          <Button tamano="sm" variante="peligro" disabled={ocupado} onClick={() => handleDesactivar(usuario)}>
            Desactivar
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: consulta.data ?? SIN_USUARIOS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const errorDeEstado = activar.error ?? desactivar.error;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Usuarios</h1>

      {errorDeEstado !== null && (
        <div className="mt-4">
          <EstadoError mensaje={handleApiError(errorDeEstado)} />
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
          <EstadoVacio mensaje="No hay usuarios registrados." />
        ) : (
          <TablaDatos table={table} columnaBusqueda="username" placeholderBusqueda="Buscar por nombre de usuario..." />
        )}
      </section>
    </div>
  );
}

export default AdminUsuariosPage;
