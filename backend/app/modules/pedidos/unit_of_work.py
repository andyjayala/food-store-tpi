from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Unit of Work de pedidos: los repositorios de pedidos y de productos comparten la misma sesión.

    Gracias a ello, el descuento de stock y la creación del pedido se confirman (o se revierten) en conjunto.
    """

    pedidos: PedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        assert self.session is not None
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
