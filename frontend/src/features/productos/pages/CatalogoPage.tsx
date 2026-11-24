import { useState } from "react";
import type { FormEvent } from "react";
import { useCategorias } from "@/features/categorias";
import ProductoCard from "@/features/productos/components/ProductoCard";
import { useProductos } from "@/features/productos/hooks/useProductos";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import Skeleton from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Select from "@/shared/ui/Select";

// Cantidad de productos por página (la paginación se realiza en el servidor con skip y limit).
const PRODUCTOS_POR_PAGINA = 8;

/** Catálogo público: búsqueda por nombre, filtro por categoría y paginación del lado del servidor. */
function CatalogoPage() {
  const [pagina, setPagina] = useState(1);
  const [borrador, setBorrador] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const categorias = useCategorias();
  const productos = useProductos({
    skip: (pagina - 1) * PRODUCTOS_POR_PAGINA,
    limit: PRODUCTOS_POR_PAGINA,
    search: busqueda,
    categoria_id: categoriaId === "" ? undefined : Number(categoriaId),
  });

  // La búsqueda se aplica al enviar el formulario. Cada cambio de filtro vuelve a la primera página.
  function handleBuscar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setBusqueda(borrador.trim());
    setPagina(1);
  }

  function handleCategoria(valor: string) {
    setCategoriaId(valor);
    setPagina(1);
  }

  function limpiarFiltros() {
    setBorrador("");
    setBusqueda("");
    setCategoriaId("");
    setPagina(1);
  }

  const total = productos.data?.total ?? 0;
  const totalPaginas = Math.ceil(total / PRODUCTOS_POR_PAGINA);
  const hayFiltros = busqueda !== "" || categoriaId !== "";

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Catálogo</h1>
      <p className="mt-1 text-sm text-slate-600">Elija sus platos y agréguelos al carrito.</p>

      <Card className="mt-5">
        <form onSubmit={handleBuscar} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="busqueda" className="block text-sm font-medium text-slate-700">
              Buscar por nombre
            </label>
            <input
              id="busqueda"
              type="search"
              value={borrador}
              onChange={(evento) => setBorrador(evento.target.value)}
              placeholder="Ej.: pizza"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div className="w-56">
            <Select
              id="filtro-categoria"
              etiqueta="Categoría"
              valor={categoriaId}
              onCambio={handleCategoria}
              opcionVacia="Todas las categorías"
              opciones={(categorias.data ?? []).map((categoria) => ({ valor: String(categoria.id), etiqueta: categoria.nombre }))}
            />
          </div>
          <Button type="submit">Buscar</Button>
          {hayFiltros && (
            <Button variante="fantasma" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </form>
      </Card>

      <section className="mt-6" aria-live="polite">
        {productos.isLoading ? (
          // Estado de carga: se muestran tarjetas esqueleto.
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cargando productos">
            {Array.from({ length: PRODUCTOS_POR_PAGINA }, (_, indice) => (
              <Card key={indice} className="flex flex-col gap-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        ) : productos.isError ? (
          <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
        ) : (productos.data?.items ?? []).length === 0 ? (
          <EstadoVacio
            mensaje="No se encontraron productos."
            detalle={hayFiltros ? "Pruebe con otra búsqueda o quite los filtros." : "Por el momento el catálogo está vacío."}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(productos.data?.items ?? []).map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
            <div className="mt-6">
              <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default CatalogoPage;
