interface InputProps {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  onBlur?: () => void;
  error?: string;
  tipo?: "text" | "number" | "email" | "password" | "url";
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  min?: number;
  step?: number | string;
}

/** Campo de texto controlado con etiqueta y mensaje de error. No conoce la librería de formularios: recibe y emite valores. */
function Input({
  id,
  etiqueta,
  valor,
  onCambio,
  onBlur,
  error,
  tipo = "text",
  placeholder,
  autoComplete,
  autoFocus,
  min,
  step,
}: InputProps) {
  const hayError = error !== undefined && error !== "";
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {etiqueta}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        min={min}
        step={step}
        aria-invalid={hayError}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 ${
          hayError ? "border-red-400" : "border-slate-300 focus:border-orange-500"
        }`}
      />
      {hayError && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default Input;
