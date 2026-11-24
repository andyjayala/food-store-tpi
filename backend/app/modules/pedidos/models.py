"""Modelos de Pedido y DetallePedido (dominio «Pedidos» del diagrama UML)."""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.database import utc_now

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    # Estados: PENDIENTE, EN_PREPARACION, ENTREGADO y CANCELADO (máquina de estados definida en el servicio).
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: Optional[str] = Field(default=None)
    # total = suma de los subtotales de las líneas. Se calcula al crear el pedido y no vuelve a modificarse (RN-05).
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    # Relaciones: Usuario 1:N Pedido y Pedido 1:N DetallePedido.
    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int
    # Copia del nombre y del precio del producto al momento de la compra: si el producto cambia después,
    # el pedido conserva los valores originales (línea inmutable, RN-05).
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float

    # Relaciones: Pedido 1:N DetallePedido y Producto 1:N DetallePedido.
    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")
