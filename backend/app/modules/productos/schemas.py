"""Schemas de entrada y salida del módulo de productos."""

from typing import Annotated, Optional

from pydantic import StringConstraints, model_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=150)]


class ProductoCreate(SQLModel):
    nombre: NombreProducto
    descripcion: str = ""
    precio_base: float = Field(ge=0)
    imagen_url: str = ""
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(SQLModel):
    """Actualización parcial: solo se modifican los campos enviados."""

    nombre: Optional[NombreProducto] = None
    descripcion: Optional[str] = None
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    categoria_id: Optional[int] = None


class ProductoStockUpdate(SQLModel):
    """Cuerpo del PATCH de stock y disponibilidad. Debe enviarse al menos uno de los dos campos."""

    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None

    @model_validator(mode="after")
    def exigir_algun_campo(self) -> "ProductoStockUpdate":
        if self.stock is None and self.disponible is None:
            raise ValueError("Debe enviarse al menos 'stock' o 'disponible'")
        return self


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
