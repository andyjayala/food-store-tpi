import type { ReactNode } from "react";

interface EstadoVacioProps {
  mensaje: string;
  detalle?: string;
  accion?: ReactNode;
}

/** Estado vacío: la consulta fue exitosa pero no hay registros para mostrar. */
function EstadoVacio({ mensaje, detalle, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
      <p className="font-medium text-slate-700">{mensaje}</p>
      {detalle !== undefined && <p className="mt-1 text-sm text-slate-500">{detalle}</p>}
      {accion !== undefined && <div className="mt-4">{accion}</div>}
    </div>
  );
}

export default EstadoVacio;
