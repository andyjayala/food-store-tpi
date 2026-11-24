import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { registerRequest } from "@/features/auth/api/auth";
import { handleApiError } from "@/shared/api/handleApiError";
import { primerError } from "@/shared/utils/formato";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";
import type { RegistroPayload } from "@/features/auth/types/auth.types";

const VALORES_INICIALES: RegistroPayload = { username: "", full_name: "", email: "", password: "" };
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Pantalla de registro de nuevos clientes (rol "user"). Valida los datos con TanStack Form antes de enviarlos. */
function RegisterPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((estado) => estado.usuario);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      setErrorRegistro(null);
      try {
        await registerRequest({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        // Al completarse el registro se redirige al login con un aviso.
        navigate("/login", { replace: true, state: { registrado: true } });
      } catch (error) {
        setErrorRegistro(handleApiError(error));
      }
    },
  });

  if (usuario !== null) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto w-full max-w-md py-8">
      <h1 className="text-2xl font-extrabold">Crear cuenta</h1>

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
            name="full_name"
            validators={{ onChange: ({ value }) => (value.trim().length === 0 ? "El nombre completo es obligatorio" : undefined) }}
          >
            {(field) => (
              <Input
                id="full_name"
                etiqueta="Nombre completo"
                valor={field.state.value}
                onCambio={field.handleChange}
                onBlur={field.handleBlur}
                error={primerError(field.state.meta.errors)}
                autoComplete="name"
                autoFocus
              />
            )}
          </form.Field>

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => {
                const largo = value.trim().length;
                if (largo < 3) return "El nombre de usuario debe tener al menos 3 caracteres";
                if (largo > 50) return "El nombre de usuario no puede superar los 50 caracteres";
                return undefined;
              },
            }}
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
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (PATRON_EMAIL.test(value.trim()) ? undefined : "Ingrese un correo electrónico válido") }}
          >
            {(field) => (
              <Input
                id="email"
                etiqueta="Correo electrónico"
                tipo="email"
                valor={field.state.value}
                onCambio={field.handleChange}
                onBlur={field.handleBlur}
                error={primerError(field.state.meta.errors)}
                autoComplete="email"
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
                if (value.length > 72) return "La contraseña no puede superar los 72 caracteres";
                return undefined;
              },
            }}
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
                autoComplete="new-password"
              />
            )}
          </form.Field>

          {errorRegistro !== null && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorRegistro}
            </p>
          )}

          <form.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Creando cuenta..." : "Registrarse"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-slate-600">
        ¿Ya tiene una cuenta?{" "}
        <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
