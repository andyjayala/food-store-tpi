"""Consultas propias del módulo de pedidos."""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        """Registra una línea del pedido. Las líneas solo se insertan: nunca se modifican ni se eliminan."""
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def get_con_items(self, pedido_id: int, for_update: bool = False) -> Optional[Pedido]:
        """Obtiene un pedido con sus líneas. Con ``for_update`` bloquea la fila durante la transacción."""
        consulta = select(Pedido).where(Pedido.id == pedido_id).options(selectinload(Pedido.items))  # type: ignore[arg-type]
        if for_update:
            consulta = consulta.with_for_update()
        return self.session.exec(consulta).first()

    def list_by_usuario(
        self,
        usuario_id: Optional[int],
        estado: Optional[str],
        skip: int,
        limit: int,
    ) -> tuple[list[Pedido], int]:
        """Lista pedidos paginados, del más reciente al más antiguo, y devuelve ``(items, total)``.

        Con ``usuario_id`` se limita a los pedidos de ese usuario; con ``None`` se listan todos (uso del administrador).
        """
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*condiciones)).one()
        consulta = (
            select(Pedido)
            .where(*condiciones)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())  # type: ignore[union-attr]
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(consulta).all()), total

    def count_by_estado(self) -> dict[str, int]:
        """Cantidad de pedidos por estado, calculada con ``func.count``."""
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        """Cantidad de pedidos creados a partir de la fecha indicada."""
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)).one()

    def suma_total_por_estado(self, estado: str) -> float:
        """Suma del campo ``total`` de los pedidos en el estado indicado."""
        suma = self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)).one()
        return float(suma)
