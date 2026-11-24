import Card from "@/shared/ui/Card";

interface ResumenCardProps {
  titulo: string;
  valor: string;
  /** Clase de color del valor (por ejemplo, "text-green-700"). */
  colorValor?: string;
}

/** Tarjeta con un indicador del panel de resumen. */
function ResumenCard({ titulo, valor, colorValor = "text-slate-900" }: ResumenCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className={`mt-2 text-3xl font-extrabold ${colorValor}`}>{valor}</p>
    </Card>
  );
}

export default ResumenCard;
