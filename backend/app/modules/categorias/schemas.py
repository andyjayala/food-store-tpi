"""Schemas de entrada y salida del módulo de categorías."""

from typing import Annotated, Optional

from pydantic import StringConstraints
from sqlmodel import SQLModel

NombreCategoria = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria
    descripcion: str = ""


class CategoriaUpdate(SQLModel):
    """Actualización parcial: solo se modifican los campos enviados."""

    nombre: Optional[NombreCategoria] = None
    descripcion: Optional[str] = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool
