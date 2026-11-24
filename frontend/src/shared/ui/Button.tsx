import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";
type Tamano = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
}

const ESTILOS_VARIANTE: Record<Variante, string> = {
  primario: "bg-orange-600 text-white hover:bg-orange-700",
  secundario: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  peligro: "bg-red-600 text-white hover:bg-red-700",
  fantasma: "text-slate-600 hover:bg-slate-100",
};

const ESTILOS_TAMANO: Record<Tamano, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

/** Botón base de la aplicación, con variantes de color y dos tamaños. Por defecto es de tipo "button". */
function Button({ variante = "primario", tamano = "md", type = "button", className = "", ...resto }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS_VARIANTE[variante]} ${ESTILOS_TAMANO[tamano]} ${className}`}
      {...resto}
    />
  );
}

export default Button;
