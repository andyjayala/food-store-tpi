import Button from "@/shared/ui/Button";

interface PaginacionProps {
  /** Página actual, numerada desde 1. */
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

/** Controles «Anterior» y «Siguiente» con el número de página actual. */
function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  const total = Math.max(totalPaginas, 1);
  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3 text-sm text-slate-600">
      <Button variante="secundario" tamano="sm" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span>
        Página {pagina} de {total}
      </span>
      <Button variante="secundario" tamano="sm" disabled={pagina >= total} onClick={() => onCambiar(pagina + 1)}>
        Siguiente
      </Button>
    </nav>
  );
}

export default Paginacion;
