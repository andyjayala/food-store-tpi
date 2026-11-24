"""Dependencias de FastAPI para autenticación y autorización.

Forman una cadena en la que cada una se apoya en la anterior:

* ``get_current_user``: exige un JWT válido en la cookie (401 si falta, es inválido o venció).
* ``get_current_active_user``: además exige que la cuenta no esté desactivada (400).
* ``require_role``: además exige que el usuario tenga alguno de los roles indicados (403).
"""

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

COOKIE_NAME = "access_token"
API_PREFIX = "/api/v1"


class OAuth2PasswordBearerCookie(OAuth2PasswordBearer):
    """Variante de ``OAuth2PasswordBearer`` que lee el token de la cookie HttpOnly.

    Si la cookie no existe se intenta el encabezado ``Authorization``, que es el que utiliza el botón
    «Authorize» de la documentación interactiva (/docs).
    """

    def __init__(self, tokenUrl: str) -> None:
        super().__init__(tokenUrl=tokenUrl, auto_error=False)

    async def __call__(self, request: Request) -> str:
        token = request.cookies.get(COOKIE_NAME) or await super().__call__(request)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No autenticado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return token


oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl=f"{API_PREFIX}/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Usuario:
    """Valida el JWT de la cookie y carga el usuario asociado."""
    username = decode_access_token(token)
    usuario = None
    if username is not None:
        usuario = session.exec(select(Usuario).where(Usuario.username == username)).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o vencido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    """Rechaza a los usuarios dados de baja lógica (``disabled = True``)."""
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[str]):
    """Fábrica de dependencias que exige alguno de los roles indicados (por ejemplo ``require_role(["admin"])``)."""

    def verificar_rol(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta acción",
            )
        return usuario

    return verificar_rol
