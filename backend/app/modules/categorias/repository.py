"""Consultas propias del módulo de categorías."""

from collections.abc import Sequence
from typing import Optional

from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca por nombre sin distinguir mayúsculas e incluyendo las categorías dadas de baja."""
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        return self.session.exec(consulta).first()

    def list_activas(self) -> Sequence[Categoria]:
        consulta = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        return self.session.exec(consulta).all()
