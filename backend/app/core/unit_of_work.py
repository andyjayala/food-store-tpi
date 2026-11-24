"""Unit of Work base: agrupa las operaciones de un caso de uso en una única transacción."""

from collections.abc import Callable
from types import TracebackType
from typing import Optional

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Gestor de contexto que administra el ciclo de vida de la sesión.

    * ``__enter__`` abre la sesión.
    * ``__exit__`` confirma (commit) si el bloque terminó sin excepciones o revierte (rollback) si hubo alguna,
      y en ambos casos cierra la sesión.

    Los servicios nunca invocan ``session.commit()``: la confirmación ocurre exclusivamente aquí.
    """

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self.session: Optional[Session] = None

    def __enter__(self) -> "UnitOfWork":
        self.session = self._factory()
        return self

    def __exit__(
        self,
        exc_type: Optional[type[BaseException]],
        exc: Optional[BaseException],
        tb: Optional[TracebackType],
    ) -> None:
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
