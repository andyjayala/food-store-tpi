"""Modelo de la entidad Producto (dominio «Catálogo» del diagrama UML)."""

from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id")
    nombre: str = Field(max_length=150, index=True)
    descripcion: str = Field(default="")
    precio_base: float
    imagen_url: str = Field(default="")
    stock: int = Field(default=0)
    disponible: bool = Field(default=True)
    # Baja lógica: ``activo = False`` oculta el producto del catálogo sin borrar el registro (los pedidos lo referencian).
    activo: bool = Field(default=True)

    # Relaciones: Categoria 1:N Producto y Producto 1:N DetallePedido.
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
