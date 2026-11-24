"""Reglas de negocio del módulo de productos."""

from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    """El producto no existe o está dado de baja (404)."""


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        search: Optional[str],
        categoria_id: Optional[int],
        disponible: Optional[bool],
        skip: int,
        limit: int,
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(search, categoria_id, disponible, skip, limit)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, producto_id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._categoria_activa(uow, datos.categoria_id)
            producto = uow.productos.add(Producto(**datos.model_dump()))
            uow.productos.refresh(producto)  # carga la relación ``categoria`` para el schema de lectura
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            cambios = datos.model_dump(exclude_unset=True)

            # Si se cambia de categoría, la nueva debe existir y estar activa.
            if cambios.get("categoria_id") is not None:
                self._categoria_activa(uow, cambios["categoria_id"])

            for campo, valor in cambios.items():
                if valor is not None:
                    setattr(producto, campo, valor)
            uow.productos.flush()
            uow.productos.refresh(producto)
            return ProductoRead.model_validate(producto)

    def cambiar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            # Se bloquea la fila para no pisar un descuento de stock concurrente de otro pedido.
            producto = uow.productos.get_by_id(producto_id, for_update=True)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado()
            if datos.stock is not None:
                producto.stock = datos.stock
            if datos.disponible is not None:
                producto.disponible = datos.disponible
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: el registro se conserva porque las líneas de pedidos anteriores lo referencian."""
        with self.uow as uow:
            self._activo(uow, producto_id).activo = False

    @staticmethod
    def _activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado()
        return producto

    @staticmethod
    def _categoria_activa(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada()
