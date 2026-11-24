import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { Categoria } from "@/features/categorias";
import type { Producto, ProductoPayload } from "@/features/productos/types/producto.types";
import { handleApiError } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import Select from "@/shared/ui/Select";
import { primerError } from "@/shared/utils/formato";

interface ProductoFormModalProps {
  /** Producto a editar, o ``null`` si se está creando uno nuevo. */
  producto: Producto | null;
  categorias: Categoria[];
  onGuardar: (datos: ProductoPayload) => Promise<void>;
  onCerrar: () => void;
}

/** Valores del formulario. Los campos numéricos se manejan como texto (un <input> siempre entrega texto) y se convierten al enviar. */
interface ValoresFormulario {
  nombre: string;
  descripcion: string;
  categoria_id: string;
  precio_base: string;
  stock: string;
  imagen_url: string;
  disponible: boolean;
}

/** Formulario de alta y edición de productos (TanStack Form) dentro de un modal. */
function ProductoFormModal({ producto, categorias, onGuardar, onCerrar }: ProductoFormModalProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const valoresIniciales: ValoresFormulario = {
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    categoria_id: producto !== null ? String(producto.categoria_id) : "",
    precio_base: producto !== null ? String(producto.precio_base) : "",
    stock: producto !== null ? String(producto.stock) : "0",
    imagen_url: producto?.imagen_url ?? "",
    disponible: producto?.disponible ?? true,
  };

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await onGuardar({
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim(),
          categoria_id: Number(value.categoria_id),
          precio_base: Number(value.precio_base),
          stock: Number(value.stock),
          imagen_url: value.imagen_url.trim(),
          disponible: value.disponible,
        });
      } catch (error) {
        setErrorServidor(handleApiError(error));
      }
    },
  });

  return (
    <Modal titulo={producto === null ? "Nuevo producto" : "Editar producto"} onCerrar={onCerrar}>
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
              if (largo === 0) return "El nombre es obligatorio";
              if (largo > 150) return "El nombre no puede superar los 150 caracteres";
              return undefined;
            },
          }}
        >
          {(field) => (
            <Input
              id="producto-nombre"
              etiqueta="Nombre"
              valor={field.state.value}
              onCambio={field.handleChange}
              onBlur={field.handleBlur}
              error={primerError(field.state.meta.errors)}
              placeholder="Ej.: Pizza Funghi"
              autoFocus
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <Input
              id="producto-descripcion"
              etiqueta="Descripción (opcional)"
              valor={field.state.value}
              onCambio={field.handleChange}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{ onChange: ({ value }) => (value === "" ? "Seleccione una categoría" : undefined) }}
        >
          {(field) => (
            <Select
              id="producto-categoria"
              etiqueta="Categoría"
              valor={field.state.value}
              onCambio={field.handleChange}
              onBlur={field.handleBlur}
              error={primerError(field.state.meta.errors)}
              opcionVacia="Seleccione una categoría"
              opciones={categorias.map((categoria) => ({ valor: String(categoria.id), etiqueta: categoria.nombre }))}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          {/* El precio base no puede ser negativo (la misma regla se valida en el schema del backend). */}
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => {
                if (value.trim() === "") return "El precio es obligatorio";
                const numero = Number(value);
                if (Number.isNaN(numero)) return "Debe ser un número";
                if (numero < 0) return "No puede ser negativo";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                id="producto-precio"
                etiqueta="Precio base ($)"
                tipo="number"
                step="0.01"
                valor={field.state.value}
                onCambio={field.handleChange}
                onBlur={field.handleBlur}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>

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
                id="producto-stock"
                etiqueta="Stock"
                tipo="number"
                valor={field.state.value}
                onCambio={field.handleChange}
                onBlur={field.handleBlur}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              id="producto-imagen"
              etiqueta="URL de la imagen (opcional)"
              tipo="url"
              valor={field.state.value}
              onCambio={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="https://..."
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

export default ProductoFormModal;
