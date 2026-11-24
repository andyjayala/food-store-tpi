// Barrel de la feature auth: reexporta con nombre los elementos públicos. El resto de la aplicación importa
// únicamente desde "@/features/auth", nunca desde sus subcarpetas internas.

export { default as LoginPage } from "./pages/LoginPage";
export { default as RegisterPage } from "./pages/RegisterPage";
export { default as UnauthorizedPage } from "./pages/UnauthorizedPage";
export { loginRequest, logoutRequest, meRequest, registerRequest } from "./api/auth";
export type { LoginCredenciales, MensajeRespuesta, RegistroPayload, Rol, Usuario, UsuarioSesion } from "./types/auth.types";
