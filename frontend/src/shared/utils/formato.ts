/** Formatea un monto en pesos argentinos, por ejemplo 11500 -> "$ 11.500,00". */
export function formatearPrecio(monto: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(monto);
}

/** Formatea una fecha ISO como "21/11/2026 14:30" en la zona horaria del navegador. */
export function formatearFecha(fechaIso: string): string {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(fechaIso));
}

/** Devuelve el primer mensaje de error de validación de un campo de TanStack Form, si lo hay. */
export function primerError(errores: unknown[]): string | undefined {
  for (const error of errores) {
    if (typeof error === "string" && error !== "") {
      return error;
    }
  }
  return undefined;
}
