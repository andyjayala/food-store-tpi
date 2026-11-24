"""Endpoints de administración de usuarios (solo rol ``admin``)."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic], summary="Listar todos los usuarios")
def listar_usuarios(
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic, summary="Activar un usuario")
def activar_usuario(
    usuario_id: int,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No se encontró el usuario con id {usuario_id}")


@router.post("/{usuario_id}/desactivar", response_model=UserPublic, summary="Desactivar un usuario")
def desactivar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    try:
        return service.desactivar(usuario_id, admin.id)
    except UsuarioNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No se encontró el usuario con id {usuario_id}")
    except AutoDesactivacion:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Un administrador no puede desactivar su propia cuenta")
