import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

/** Ventana modal con fondo oscuro. Se cierra con la tecla Escape. */
function Modal({ titulo, onCerrar, children }: ModalProps) {
  // Se registra un escuchador del teclado mientras el modal está montado; la función devuelta lo elimina al desmontarse.
  useEffect(() => {
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onCerrar();
      }
    }
    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
      <div role="dialog" aria-modal="true" aria-label={titulo} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">{titulo}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
