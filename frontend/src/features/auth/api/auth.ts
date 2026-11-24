import { api } from "@/shared/api/axiosInstance";
import type { LoginCredenciales, MensajeRespuesta, RegistroPayload, Usuario } from "@/features/auth/types/auth.types";

/** POST /auth/register: crea un usuario con rol "user". */
export async function registerRequest(datos: RegistroPayload): Promise<Usuario> {
  const respuesta = await api.post<Usuario>("/auth/register", datos);
  return respuesta.data;
}

/**
 * POST /auth/token: inicia sesión. El estándar OAuth2 exige un formulario (application/x-www-form-urlencoded) con los
 * campos "username" y "password". El backend responde con la cookie HttpOnly; el cuerpo no incluye el token.
 */
export async function loginRequest(credenciales: LoginCredenciales): Promise<MensajeRespuesta> {
  const formulario = new URLSearchParams();
  formulario.append("username", credenciales.username);
  formulario.append("password", credenciales.password);
  const respuesta = await api.post<MensajeRespuesta>("/auth/token", formulario);
  return respuesta.data;
}

/** POST /auth/logout: el backend borra la cookie de sesión. */
export async function logoutRequest(): Promise<MensajeRespuesta> {
  const respuesta = await api.post<MensajeRespuesta>("/auth/logout");
  return respuesta.data;
}

/** GET /auth/me: devuelve el usuario de la sesión actual (requiere cookie válida). */
export async function meRequest(): Promise<Usuario> {
  const respuesta = await api.get<Usuario>("/auth/me");
  return respuesta.data;
}
