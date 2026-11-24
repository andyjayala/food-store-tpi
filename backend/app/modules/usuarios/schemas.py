"""Schemas de entrada y salida del módulo de usuarios (SQLModel sin ``table=True``)."""

from datetime import datetime
from typing import Annotated

from pydantic import EmailStr, StringConstraints, field_validator
from sqlmodel import Field, SQLModel

Texto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class UserCreate(SQLModel):
    """Datos del registro público."""

    username: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=50)]
    full_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
    email: EmailStr
    # bcrypt procesa como máximo 72 bytes; se limita el largo para evitar contraseñas truncadas silenciosamente.
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, valor: str) -> str:
        return valor.lower()


class UserPublic(SQLModel):
    """Usuario expuesto por la API. Nunca incluye ``hashed_password``."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
