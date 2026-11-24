import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { Categoria, CategoriaPayload } from "@/features/categorias/types/categoria.types";
import { handleApiError } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import { primerError } from "@/shared/utils/formato";

interface CategoriaFormModalProps {
  /** Categoría a editar, o ``null`` si se está creando una nueva. */
  categoria: Categoria | null;
  onGuardar: (datos: CategoriaPayload) => Promise<void>;
  onCerrar: () => void;
}

/**
 * Formulario de alta y edición de categorías dentro de un modal. Se monta únicamente mientras el modal está abierto,
 * por lo que sus valores iniciales siempre corresponden a la categoría seleccionada (o a un formulario vacío).
 */
function CategoriaFormModal({ categoria, onGuardar, onCerrar }: CategoriaFormModalProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? "", descripcion: categoria?.descripcion ?? "" } satisfies CategoriaPayload,
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() });
      } catch (error) {
        // Por ejemplo, un 409 por nombre duplicado: se informa sin cerrar el modal.
        setErrorServidor(handleApiError(error));
      }
    },
  });

  return (
    <Modal titulo={categoria === null ? "Nueva categoría" : "Editar categoría"} onCerrar={onCerrar}>
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          evento.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const largo = value.trim().length;
              if (largo < 2) return "El nombre debe tener al menos 2 caracteres";
              if (largo > 100) return "El nombre no puede superar los 100 caracteres";
              return undefined;
            },
          }}
        >
          {(field) => (
            <Input
              id="categoria-nombre"
              etiqueta="Nombre"
              valor={field.state.value}
              onCambio={field.handleChange}
              onBlur={field.handleBlur}
              error={primerError(field.state.meta.errors)}
              placeholder="Ej.: Pizzas"
              autoFocus
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <Input
              id="categoria-descripcion"
              etiqueta="Descripción (opcional)"
              valor={field.state.value}
              onCambio={field.handleChange}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>

        {errorServidor !== null && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorServidor}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <form.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}

export default CategoriaFormModal;
