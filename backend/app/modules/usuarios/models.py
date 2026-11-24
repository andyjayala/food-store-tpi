"""Modelo de la entidad Usuario (dominio «Usuarios» del diagrama UML)."""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, String
from sqlmodel import Field, Relationship, SQLModel

from app.core.database import utc_now

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(sa_column=Column(String(50), unique=True, index=True, nullable=False))
    full_name: str = Field(max_length=120)
    email: str = Field(sa_column=Column(String(254), unique=True, index=True, nullable=False))
    hashed_password: str
    # Valores permitidos: "user" o "admin". El registro público siempre crea usuarios con rol "user".
    role: str = Field(default="user", max_length=20)
    # Baja lógica: un usuario desactivado conserva su registro pero no puede iniciar sesión.
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)

    # Relación 1:N con Pedido (un usuario realiza muchos pedidos).
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
