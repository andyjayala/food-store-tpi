import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { FormaPago } from "@/features/pedidos/types/pedido.types";
import { handleApiError } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import { primerError } from "@/shared/utils/formato";

export interface DatosCheckout {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface CheckoutFormProps {
  onConfirmar: (datos: DatosCheckout) => Promise<void>;
}

/** Formulario de confirmación del pedido (TanStack Form): dirección de entrega, forma de pago y notas opcionales. */
function CheckoutForm({ onConfirmar }: CheckoutFormProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { direccion_entrega: "", forma_pago: "EFECTIVO" as FormaPago, notas: "" },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await onConfirmar({
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim(),
        });
      } catch (error) {
        // Por ejemplo, un 400 por stock insuficiente: se informa y el carrito se conserva.
        setErrorServidor(handleApiError(error));
      }
    },
  });

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        evento.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {/* RN-06: la dirección de entrega debe tener entre 5 y 200 caracteres. */}
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
            if (largo > 200) return "La dirección no puede superar los 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            id="direccion-entrega"
            etiqueta="Dirección de entrega"
            valor={field.state.value}
            onCambio={field.handleChange}
            onBlur={field.handleBlur}
            error={primerError(field.state.meta.errors)}
            placeholder="Calle, número y localidad"
            autoComplete="street-address"
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            id="forma-pago"
            etiqueta="Forma de pago"
            valor={field.state.value}
            onCambio={(valor) => field.handleChange(valor === "TRANSFERENCIA" ? "TRANSFERENCIA" : "EFECTIVO")}
            onBlur={field.handleBlur}
            opciones={[
              { valor: "EFECTIVO", etiqueta: "Efectivo" },
              { valor: "TRANSFERENCIA", etiqueta: "Transferencia" },
            ]}
          />
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? "Las notas no pueden superar los 500 caracteres" : undefined) }}
      >
        {(field) => (
          <Input
            id="notas"
            etiqueta="Notas (opcional)"
            valor={field.state.value}
            onCambio={field.handleChange}
            onBlur={field.handleBlur}
            error={primerError(field.state.meta.errors)}
            placeholder="Ej.: timbre 2B, sin cebolla"
          />
        )}
      </form.Field>

      {errorServidor !== null && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorServidor}
        </p>
      )}

      <form.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default CheckoutForm;
