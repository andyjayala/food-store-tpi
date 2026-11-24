import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { primerError } from "@/shared/utils/formato";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredenciales } from "@/features/auth/types/auth.types";

interface EstadoDeNavegacion {
  from?: { pathname: string };
  registrado?: boolean;
}

const VALORES_INICIALES: LoginCredenciales = { username: "", password: "" };

/** Pantalla de inicio de sesión. El formulario se gestiona con TanStack Form y la sesión con el authStore. */
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((estado) => estado.login);
  const usuario = useAuthStore((estado) => estado.usuario);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  // Si el usuario llegó desde una ruta protegida, tras el login se lo devuelve a ella; si no, al catálogo.
  const estadoNavegacion = location.state as EstadoDeNavegacion | null;
  const destino = estadoNavegacion?.from?.pathname ?? "/";

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      setErrorLogin(null);
      try {
        await login({ username: value.username.trim(), password: value.password });
        navigate(destino, { replace: true });
      } catch (error) {
        setErrorLogin(handleApiError(error));
      }
    },
  });

  if (usuario !== null) {
    return <Navigate to={destino} replace />;
  }

  return (
    <div className="mx-auto w-full max-w-md py-8">
      <h1 className="text-2xl font-extrabold">Iniciar sesión</h1>

      {estadoNavegacion?.registrado === true && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          La cuenta se creó correctamente. Ya puede iniciar sesión.
        </p>
      )}

      <Card className="mt-6">
        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            evento.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim().length === 0 ? "El nombre de usuario es obligatorio" : undefined) }}
          >
            {(field) => (
              <Input
                id="username"
                etiqueta="Nombre de usuario"
                valor={field.state.value}
                onCambio={field.handleChange}
                onBlur={field.handleBlur}
                error={primerError(field.state.meta.errors)}
                autoComplete="username"
                autoFocus
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value.length === 0 ? "La contraseña es obligatoria" : undefined) }}
          >
            {(field) => (
              <Input
                id="password"
                etiqueta="Contraseña"
                tipo="password"
                valor={field.state.value}
                onCambio={field.handleChange}
                onBlur={field.handleBlur}
                error={primerError(field.state.meta.errors)}
                autoComplete="current-password"
              />
            )}
          </form.Field>

          {errorLogin !== null && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorLogin}
            </p>
          )}

          <form.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-slate-600">
        ¿Todavía no tiene cuenta?{" "}
        <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700">
          Registrarse
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
