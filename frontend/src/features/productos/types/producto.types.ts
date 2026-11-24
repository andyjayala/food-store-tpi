// Tipos del dominio de productos (coinciden con los schemas ProductoRead, ProductoCreate y ProductosPaginados).

import type { Categoria } from "@/features/categorias";

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: Categoria;
}

/** Cuerpo de las altas y ediciones de un producto. */
export interface ProductoPayload {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

/** Cuerpo del PATCH /productos/{id}/stock. */
export interface ProductoStockPayload {
  stock: number;
  disponible: boolean;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

/** Parámetros de consulta del listado de productos. */
export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
