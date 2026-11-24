import axios from "axios";

interface ErrorDeValidacion {
  loc?: Array<string | number>;
  msg?: string;
}

/**
 * Convierte un error de Axios en un mensaje legible para mostrar en pantalla.
 *
 * La API responde siempre con un cuerpo ``{ "detail": ... }``: una cadena en los errores 400, 401, 403, 404 y 409,
 * y una lista de errores de validación en el 422.
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Sin respuesta: la petición no llegó al servidor (backend apagado o sin conexión).
    if (error.response === undefined) {
      return "No se pudo establecer comunicación con el servidor. Verifique que el backend esté en ejecución.";
    }

    const detalle = (error.response.data as { detail?: unknown } | undefined)?.detail;

    if (typeof detalle === "string") {
      return detalle;
    }
    if (Array.isArray(detalle) && detalle.length > 0) {
      const primero = detalle[0] as ErrorDeValidacion;
      const campo = primero.loc?.[primero.loc.length - 1];
      return campo !== undefined ? `${String(campo)}: ${primero.msg ?? "valor inválido"}` : (primero.msg ?? "Datos inválidos");
    }
    return `Error ${error.response.status} al comunicarse con el servidor`;
  }

  if (error instanceof Error) {
    return error.message;
  }
  return "Ocurrió un error inesperado";
}
