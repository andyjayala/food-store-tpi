// Tipos del dominio de autenticación. Los nombres de campo coinciden con los schemas del backend.

export type Rol = "user" | "admin";

/** Usuario tal como lo devuelve la API (UserPublic). Nunca incluye la contraseña ni su hash. */
export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

/** Datos del usuario que se conservan en el authStore: nombre, email y rol (jamás el token). */
export type UsuarioSesion = Pick<Usuario, "id" | "username" | "full_name" | "email" | "role">;

export interface LoginCredenciales {
  username: string;
  password: string;
}

export interface RegistroPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface MensajeRespuesta {
  message: string;
}
