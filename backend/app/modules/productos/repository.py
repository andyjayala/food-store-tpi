"""Consultas propias del módulo de productos."""

from typing import Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        nombre: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        """Lista los productos activos aplicando los filtros opcionales y devuelve ``(items, total)``.

        La búsqueda por nombre no distingue mayúsculas. El total corresponde a la cantidad de registros que cumplen
        los filtros, sin considerar la paginación.
        """
        condiciones = [Producto.activo == True]  # noqa: E712
        if nombre:
            condiciones.append(func.lower(Producto.nombre).contains(nombre.strip().lower()))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*condiciones)).one()
        consulta = (
            select(Producto)
            .where(*condiciones)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(Producto.nombre)
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(consulta).all()), total
