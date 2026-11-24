"""Acceso a la base de datos: motor, fábrica de sesiones y creación de tablas."""

from collections.abc import Iterator
from datetime import datetime, timezone

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite exige desactivar la verificación de hilo porque FastAPI atiende cada petición en un hilo distinto.
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def utc_now() -> datetime:
    """Fecha y hora actuales en UTC, con zona horaria, para los campos de auditoría.

    SQLModel mapea ``datetime`` a ``TIMESTAMP WITH TIME ZONE`` y exige valores con zona horaria.
    """
    return datetime.now(timezone.utc)


def session_factory() -> Session:
    """Crea una sesión nueva. Cada Unit of Work abre y cierra la suya."""
    return Session(engine)


def get_session() -> Iterator[Session]:
    """Dependencia de FastAPI para las consultas de solo lectura de las dependencias de seguridad."""
    with Session(engine) as session:
        yield session


def create_all_tables() -> None:
    """Crea las tablas que no existan. Los modelos deben estar importados para quedar registrados."""
    # Importación diferida: evita ciclos y garantiza que todas las tablas estén registradas en el metadata.
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)
