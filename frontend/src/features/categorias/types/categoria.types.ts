// Tipos del dominio de categorías (coinciden con los schemas CategoriaRead y CategoriaCreate del backend).

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface CategoriaPayload {
  nombre: string;
  descripcion: string;
}
