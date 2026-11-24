import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { loginRequest, logoutRequest, meRequest } from "@/features/auth";
import type { LoginCredenciales, Usuario, UsuarioSesion } from "@/features/auth";

/**
 * Estado global de la sesión (Zustand).
 *
 * Guarda los datos básicos del usuario autenticado y un indicador de carga. El token JWT no forma parte del estado:
 * viaja en una cookie HttpOnly que JavaScript no puede leer.
 */
interface AuthState {
  usuario: UsuarioSesion | null;
  /** Verdadero mientras ``checkSession`` confirma la sesión con el backend. */
  cargando: boolean;
  login: (credenciales: LoginCredenciales) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  /** Elimina el usuario del estado sin llamar al backend (la usa el interceptor de Axios ante un 401). */
  limpiarSesion: () => void;
}

function aUsuarioSesion(usuario: Usuario): UsuarioSesion {
  return {
    id: usuario.id,
    username: usuario.username,
    full_name: usuario.full_name,
    email: usuario.email,
    role: usuario.role,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      // Inicia sesión (el backend deja la cookie) y obtiene el perfil con GET /auth/me.
      login: async (credenciales) => {
        await loginRequest(credenciales);
        const perfil = await meRequest();
        set({ usuario: aUsuarioSesion(perfil), cargando: false });
      },

      // Cierra la sesión: el backend borra la cookie y el estado local se limpia aunque la petición falle.
      logout: async () => {
        try {
          await logoutRequest();
        } finally {
          set({ usuario: null });
        }
      },

      // Se ejecuta al montar la aplicación: confirma con GET /auth/me que la cookie corresponde a una sesión válida.
      checkSession: async () => {
        set({ cargando: true });
        try {
          const perfil = await meRequest();
          set({ usuario: aUsuarioSesion(perfil), cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      // partialize define qué parte del estado se persiste: solamente el usuario.
      partialize: (estado) => ({ usuario: estado.usuario }),
    }
  )
);
