export interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

interface SelectProps {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  opciones: OpcionSelect[];
  onBlur?: () => void;
  error?: string;
  /** Texto de la opción vacía inicial (por ejemplo, «Todas las categorías»). Si se omite, no se agrega. */
  opcionVacia?: string;
}

/** Lista desplegable controlada con etiqueta y mensaje de error. */
function Select({ id, etiqueta, valor, onCambio, opciones, onBlur, error, opcionVacia }: SelectProps) {
  const hayError = error !== undefined && error !== "";
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        onBlur={onBlur}
        aria-invalid={hayError}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 ${
          hayError ? "border-red-400" : "border-slate-300 focus:border-orange-500"
        }`}
      >
        {opcionVacia !== undefined && <option value="">{opcionVacia}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {hayError && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default Select;
