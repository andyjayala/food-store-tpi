"""Endpoints de categorías. Lectura pública; escritura exclusiva del rol ``admin``."""

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["categorias"])

SOLO_ADMIN = Depends(require_role(["admin"]))


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


def _no_encontrada(categoria_id: int) -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, f"No se encontró la categoría con id {categoria_id}")


@router.get("", response_model=list[CategoriaRead], summary="Listar las categorías activas")
def listar_categorias(service: CategoriaService = Depends(get_categoria_service)):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead, summary="Detalle de una categoría")
def obtener_categoria(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada:
        raise _no_encontrada(categoria_id)


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una categoría (admin)",
)
def crear_categoria(
    datos: CategoriaCreate,
    _admin: Usuario = SOLO_ADMIN,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.crear(datos)
    except NombreDuplicado:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Ya existe una categoría con el nombre '{datos.nombre}'")


@router.put("/{categoria_id}", response_model=CategoriaRead, summary="Actualizar una categoría (admin)")
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    _admin: Usuario = SOLO_ADMIN,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada:
        raise _no_encontrada(categoria_id)
    except NombreDuplicado:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Ya existe una categoría con el nombre '{datos.nombre}'")


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Baja lógica de una categoría (admin)",
)
def eliminar_categoria(
    categoria_id: int,
    _admin: Usuario = SOLO_ADMIN,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada:
        raise _no_encontrada(categoria_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
