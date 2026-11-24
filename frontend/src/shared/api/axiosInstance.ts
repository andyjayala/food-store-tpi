import axios from "axios";
import { useAuthStore } from "@/store/authStore";

// URL base de la API. Se toma de la variable de entorno VITE_API_URL (archivo .env) y, si no está definida,
// se utiliza el valor por defecto de desarrollo.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

const DETALLE_CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

/**
 * Instancia única de Axios utilizada por toda la aplicación.
 *
 * ``withCredentials: true`` indica al navegador que debe adjuntar la cookie HttpOnly en cada petición y aceptar la que
 * envía el backend en el login. El frontend nunca lee ni almacena el token JWT.
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/**
 * Interceptor de respuesta. Se limpia el estado de sesión (authStore) en dos situaciones:
 *  - 401 fuera de /auth/token y /auth/me: la sesión venció o no es válida. En esas dos rutas un 401 es esperable
 *    (credenciales incorrectas o ausencia de sesión) y no indica un vencimiento.
 *  - 400 con el detalle «Cuenta de usuario desactivada»: el administrador dio de baja la cuenta durante la sesión.
 * Al quedar sin usuario, ProtectedRoute redirige a /login.
 */
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const estado = error.response?.status;
      const url = error.config?.url ?? "";
      const detalle = (error.response?.data as { detail?: unknown } | undefined)?.detail;

      const esLoginOMe = url.includes("/auth/token") || url.includes("/auth/me");
      const sesionVencida = estado === 401 && !esLoginOMe;
      const cuentaDesactivada = estado === 400 && detalle === DETALLE_CUENTA_DESACTIVADA;

      if (sesionVencida || cuentaDesactivada) {
        useAuthStore.getState().limpiarSesion();
      }
    }
    return Promise.reject(error);
  }
);
