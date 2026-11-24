"""Endpoints de pedidos. El router solo traduce las excepciones de dominio a respuestas HTTP."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocioError,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _no_encontrado(pedido_id: int) -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, f"No se encontró el pedido con id {pedido_id}")


def _ajeno() -> HTTPException:
    return HTTPException(status.HTTP_403_FORBIDDEN, "El pedido pertenece a otro usuario")


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED, summary="Crear un pedido desde el carrito")
def crear_pedido(
    datos: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.crear(datos, usuario.id)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Alguno de los productos no existe o está dado de baja")
    except ReglaDeNegocioError as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error))


@router.get("", response_model=PedidosPaginados, summary="Listar pedidos (propios o todos, según el rol)")
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[EstadoPedido] = Query(None),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.listar(usuario.id, usuario.role == "admin", estado, skip, limit)


# Esta ruta debe declararse antes de "/{pedido_id}"; de lo contrario "resumen" se interpretaría como un identificador.
@router.get("/resumen", response_model=ResumenPedidos, summary="Indicadores del panel (admin)")
def resumen_pedidos(
    _admin: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead, summary="Detalle de un pedido (dueño o admin)")
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.obtener(pedido_id, usuario.id, usuario.role == "admin")
    except PedidoNoEncontrado:
        raise _no_encontrado(pedido_id)
    except PedidoAjeno:
        raise _ajeno()


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, summary="Avanzar o cancelar un pedido (admin)")
def cambiar_estado(
    pedido_id: int,
    datos: CambioEstado,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cambiar_estado(pedido_id, datos)
    except PedidoNoEncontrado:
        raise _no_encontrado(pedido_id)
    except ReglaDeNegocioError as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error))


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead, summary="Cancelar un pedido propio en PENDIENTE")
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cancelar_propio(pedido_id, usuario.id)
    except PedidoNoEncontrado:
        raise _no_encontrado(pedido_id)
    except PedidoAjeno:
        raise _ajeno()
    except ReglaDeNegocioError as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error))
