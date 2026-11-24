"""Endpoints de productos. Lectura pública; escritura exclusiva del rol ``admin``."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])

SOLO_ADMIN = Depends(require_role(["admin"]))


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


def _producto_no_encontrado(producto_id: int) -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, f"No se encontró el producto con id {producto_id}")


def _categoria_no_encontrada() -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, "La categoría indicada no existe o está dada de baja")


@router.get("", response_model=ProductosPaginados, summary="Listar productos activos (paginado, con filtros)")
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Texto a buscar en el nombre (sin distinguir mayúsculas)"),
    categoria_id: Optional[int] = Query(None),
    disponible: Optional[bool] = Query(None),
    service: ProductoService = Depends(get_producto_service),
):
    return service.listar(search, categoria_id, disponible, skip, limit)


@router.get("/{producto_id}", response_model=ProductoRead, summary="Detalle de un producto con su categoría")
def obtener_producto(producto_id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado:
        raise _producto_no_encontrado(producto_id)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, summary="Crear un producto (admin)")
def crear_producto(
    datos: ProductoCreate,
    _admin: Usuario = SOLO_ADMIN,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada:
        raise _categoria_no_encontrada()


@router.put("/{producto_id}", response_model=ProductoRead, summary="Actualizar un producto (admin)")
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    _admin: Usuario = SOLO_ADMIN,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar(producto_id, datos)
    except ProductoNoEncontrado:
        raise _producto_no_encontrado(producto_id)
    except CategoriaNoEncontrada:
        raise _categoria_no_encontrada()


@router.patch("/{producto_id}/stock", response_model=ProductoRead, summary="Actualizar stock y disponibilidad (admin)")
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    _admin: Usuario = SOLO_ADMIN,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.cambiar_stock(producto_id, datos)
    except ProductoNoEncontrado:
        raise _producto_no_encontrado(producto_id)


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Baja lógica de un producto (admin)",
)
def eliminar_producto(
    producto_id: int,
    _admin: Usuario = SOLO_ADMIN,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado:
        raise _producto_no_encontrado(producto_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
