import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { Producto, ProductoStockPayload } from "@/features/productos/types/producto.types";
import { handleApiError } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import { primerError } from "@/shared/utils/formato";

interface StockModalProps {
  producto: Producto;
  onGuardar: (datos: ProductoStockPayload) => Promise<void>;
  onCerrar: () => void;
}

/** Modal para modificar únicamente el stock y la disponibilidad de un producto (PATCH /productos/{id}/stock). */
function StockModal({ producto, onGuardar, onCerrar }: StockModalProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await onGuardar({ stock: Number(value.stock), disponible: value.disponible });
      } catch (error) {
        setErrorServidor(handleApiError(error));
      }
    },
  });

  return (
    <Modal titulo={`Stock de ${producto.nombre}`} onCerrar={onCerrar}>
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          evento.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              if (value.trim() === "") return "El stock es obligatorio";
              const numero = Number(value);
              if (!Number.isInteger(numero)) return "Debe ser un número entero";
              if (numero < 0) return "No puede ser negativo";
              return undefined;
            },
          }}
        >
          {(field) => (
            <Input
              id="stock-valor"
              etiqueta="Stock"
              tipo="number"
              valor={field.state.value}
              onCambio={field.handleChange}
              onBlur={field.handleBlur}
              error={primerError(field.state.meta.errors)}
              autoFocus
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(evento) => field.handleChange(evento.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Disponible para la venta
            </label>
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

export default StockModal;
