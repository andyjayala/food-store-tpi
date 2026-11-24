import Button from "@/shared/ui/Button";

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

/** Estado de error: muestra el mensaje y, si se indica una función, un botón para reintentar. */
function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      <p>{mensaje}</p>
      {onReintentar !== undefined && (
        <Button variante="secundario" tamano="sm" className="mt-2" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export default EstadoError;
