interface SkeletonProps {
  className?: string;
}

/** Bloque gris animado que se muestra mientras cargan los datos (estado de carga). */
function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

export default Skeleton;
