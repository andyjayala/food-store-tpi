"""Modelo de la entidad Categoria (dominio «Catálogo» del diagrama UML)."""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, String
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    # El nombre es único incluso entre categorías dadas de baja: la baja lógica no lo libera.
    nombre: str = Field(sa_column=Column(String(100), unique=True, index=True, nullable=False))
    descripcion: str = Field(default="")
    # Baja lógica: ``activo = False`` oculta la categoría de los listados públicos sin borrar el registro.
    activo: bool = Field(default=True)

    # Relación 1:N con Producto (una categoría agrupa muchos productos).
    productos: list["Producto"] = Relationship(back_populates="categoria")
