"""Reglas de negocio del módulo de pedidos (RN-01 a RN-06).

Cada caso de uso se ejecuta dentro de un Unit of Work: si se lanza una excepción, la transacción completa se revierte
(incluido el descuento de stock), y si el bloque termina sin errores se confirma en conjunto.
"""

from datetime import datetime
from typing import Optional

from app.core.database import utc_now
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

# RN-02: mapa de transiciones válidas. Los estados terminales no admiten ningún cambio.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


# ----------------------------- Excepciones de dominio -----------------------------


class PedidoNoEncontrado(Exception):
    """El pedido no existe (404)."""


class PedidoAjeno(Exception):
    """El pedido pertenece a otro usuario (403)."""


class ReglaDeNegocioError(Exception):
    """Clase base de las reglas de negocio incumplidas; el router las traduce a 400."""


class StockInsuficiente(ReglaDeNegocioError):
    pass


class ProductoNoDisponible(ReglaDeNegocioError):
    pass


class ProductoRepetido(ReglaDeNegocioError):
    pass


class TransicionInvalida(ReglaDeNegocioError):
    pass


# ----------------------------- Servicio -----------------------------


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        """RN-01: crea el pedido, descuenta el stock y registra las líneas en una única transacción."""
        with self.uow as uow:
            # Un mismo producto no puede aparecer dos veces entre los ítems.
            ids = [item.producto_id for item in datos.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no puede repetirse entre los ítems del pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega,
                    notas=datos.notas,
                    total=0,
                )
            )

            total = 0.0
            # Los ítems se procesan en orden de producto_id para que dos pedidos simultáneos bloqueen las filas
            # de productos siempre en el mismo orden y no se produzcan interbloqueos.
            for item in sorted(datos.items, key=lambda i: i.producto_id):
                producto = uow.productos.get_by_id(item.producto_id, for_update=True)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado()
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': disponible {producto.stock}, solicitado {item.cantidad}"
                    )

                # En la misma iteración se descuenta el stock y se crea la línea copiando nombre y precio.
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido=pedido,
                        producto=producto,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.flush()
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        usuario_id: int,
        es_admin: bool,
        estado: Optional[str],
        skip: int,
        limit: int,
    ) -> PedidosPaginados:
        """RN-04: el administrador ve todos los pedidos y el cliente solo los propios."""
        with self.uow as uow:
            items, total = uow.pedidos.list_by_usuario(None if es_admin else usuario_id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_con_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, datos: CambioEstado) -> PedidoRead:
        """RN-02 y RN-03: el administrador avanza o cancela el pedido según la máquina de estados."""
        with self.uow as uow:
            pedido = uow.pedidos.get_con_items(pedido_id, for_update=True)
            if pedido is None:
                raise PedidoNoEncontrado()
            return self._aplicar_transicion(uow, pedido, datos.estado)

    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """RN-03 y RN-04: el cliente cancela un pedido propio, y solo mientras esté en PENDIENTE."""
        with self.uow as uow:
            pedido = uow.pedidos.get_con_items(pedido_id, for_update=True)
            if pedido is None:
                raise PedidoNoEncontrado()
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se pueden cancelar los pedidos en estado PENDIENTE")
            return self._aplicar_transicion(uow, pedido, "CANCELADO")

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            inicio_del_dia = utc_now().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia),
                ingresos_entregados=uow.pedidos.suma_total_por_estado("ENTREGADO"),
            )

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> PedidoRead:
        """Valida la transición antes de modificar el pedido y, si es una cancelación, restituye el stock."""
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")

        if nuevo_estado == "CANCELADO":
            # RN-03: el stock de cada línea se restituye en la misma transacción que cambia el estado.
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id, for_update=True)
                if producto is not None:
                    producto.stock += linea.cantidad

        pedido.estado = nuevo_estado
        pedido.updated_at = utc_now()
        uow.pedidos.flush()
        return PedidoRead.model_validate(pedido)
