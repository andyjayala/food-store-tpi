"""Endpoints de autenticación: registro, login con cookie HttpOnly, logout y perfil."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import MensajeRespuesta
from app.modules.auth.service import AuthService, CredencialesIncorrectas, CuentaDesactivada
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED, summary="Registrar un usuario")
def register(datos: UserCreate, service: AuthService = Depends(get_auth_service)):
    try:
        return service.registrar(datos)
    except UsuarioDuplicado:
        raise HTTPException(status.HTTP_409_CONFLICT, "El nombre de usuario o el email ya están registrados")


@router.post("/token", response_model=MensajeRespuesta, summary="Iniciar sesión (cookie HttpOnly)")
def login(
    response: Response,
    formulario: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    # El estándar OAuth2 denomina «username» al campo del formulario; en este sistema contiene el nombre de usuario.
    try:
        username = service.autenticar(formulario.username, formulario.password)
    except CredencialesIncorrectas:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except CuentaDesactivada:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")

    # El JWT viaja únicamente en una cookie HttpOnly (inaccesible para JavaScript, lo que mitiga el robo por XSS).
    # SameSite=Lax limita su envío en peticiones originadas en otros sitios. El cuerpo de la respuesta no incluye el token.
    response.set_cookie(
        key=COOKIE_NAME,
        value=create_access_token(username),
        httponly=True,
        samesite="lax",
        secure=False,  # En producción con HTTPS debe ser True.
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post("/logout", response_model=MensajeRespuesta, summary="Cerrar sesión (borra la cookie)")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, samesite="lax")
    return MensajeRespuesta(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic, summary="Usuario autenticado")
def me(usuario: Usuario = Depends(get_current_active_user)):
    return UserPublic.model_validate(usuario)
