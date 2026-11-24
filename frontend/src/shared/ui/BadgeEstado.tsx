interface BadgeEstadoProps {
  estado: string;
}

const ESTILOS: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  EN_PREPARACION: "bg-blue-100 text-blue-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

const ETIQUETAS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Etiqueta de color para cada uno de los cuatro estados de un pedido. */
function BadgeEstado({ estado }: BadgeEstadoProps) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTILOS[estado] ?? "bg-slate-100 text-slate-700"}`}>
      {ETIQUETAS[estado] ?? estado}
    </span>
  );
}

export default BadgeEstado;
