"""Repositorio genérico: operaciones básicas de acceso a datos comunes a todas las entidades."""

from collections.abc import Sequence
from typing import Generic, Optional, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Encapsula el acceso a la base de datos de una entidad.

    No contiene reglas de negocio y nunca confirma la transacción: el commit corresponde al Unit of Work.
    """

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int, for_update: bool = False) -> Optional[T]:
        """Obtiene un registro por clave primaria. Con ``for_update`` bloquea la fila hasta el fin de la transacción."""
        return self.session.get(self.model, id, with_for_update=for_update)

    def get_all(self) -> Sequence[T]:
        return self.session.exec(select(self.model)).all()

    def add(self, entity: T) -> T:
        """Agrega la entidad a la sesión y ejecuta ``flush`` para que la base le asigne su clave primaria."""
        self.session.add(entity)
        self.session.flush()
        return entity

    def flush(self) -> None:
        """Envía a la base los cambios pendientes de la sesión sin confirmar la transacción."""
        self.session.flush()

    def refresh(self, entity: T) -> None:
        """Recarga la entidad desde la base (por ejemplo, para cargar sus relaciones después de un cambio)."""
        self.session.refresh(entity)

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
