import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import Paginacion from "@/shared/components/Paginacion";

interface TablaDatosProps<T> {
  table: Table<T>;
  /** Identificador de la columna sobre la que busca el cuadro de texto. Si se omite, no se muestra el buscador. */
  columnaBusqueda?: string;
  placeholderBusqueda?: string;
}

/**
 * Tabla genérica del panel de administración. TanStack Table calcula el ordenamiento, el filtro y la paginación del
 * lado del cliente (el panel solicita hasta 100 registros al servidor); este componente solo define el marcado.
 */
function TablaDatos<T>({ table, columnaBusqueda, placeholderBusqueda }: TablaDatosProps<T>) {
  const columnaBuscada = columnaBusqueda !== undefined ? table.getColumn(columnaBusqueda) : undefined;
  const textoBuscado = (columnaBuscada?.getFilterValue() as string | undefined) ?? "";
  const filas = table.getRowModel().rows;

  return (
    <div>
      {columnaBuscada !== undefined && (
        <input
          type="search"
          value={textoBuscado}
          onChange={(evento) => columnaBuscada.setFilterValue(evento.target.value)}
          placeholder={placeholderBusqueda}
          aria-label={placeholderBusqueda}
          className="mb-3 w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((encabezado) => {
                  const columna = encabezado.column;
                  const orden = columna.getIsSorted();
                  const contenido = flexRender(columna.columnDef.header, encabezado.getContext());
                  return (
                    <th key={encabezado.id} className="px-4 py-3 font-semibold">
                      {columna.getCanSort() ? (
                        <button type="button" onClick={columna.getToggleSortingHandler()} className="uppercase tracking-wide hover:text-slate-800">
                          {contenido}
                          <span className="text-slate-400">{orden === "asc" ? " ▲" : orden === "desc" ? " ▼" : " ↕"}</span>
                        </button>
                      ) : (
                        contenido
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={table.getAllColumns().length} className="px-4 py-8 text-center text-slate-500">
                  No hay resultados para mostrar.
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="border-t border-slate-100">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 text-slate-700">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
        <span>{table.getFilteredRowModel().rows.length} registros</span>
        <Paginacion
          pagina={table.getState().pagination.pageIndex + 1}
          totalPaginas={table.getPageCount()}
          onCambiar={(pagina) => table.setPageIndex(pagina - 1)}
        />
      </div>
    </div>
  );
}

export default TablaDatos;
