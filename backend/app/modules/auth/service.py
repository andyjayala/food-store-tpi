"""Reglas de negocio de la autenticación: registro y validación de credenciales."""

from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class CredencialesIncorrectas(Exception):
    """Usuario inexistente o contraseña incorrecta (401)."""


class CuentaDesactivada(Exception):
    """Las credenciales son correctas pero la cuenta está dada de baja (400)."""


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        """Registro público: crea siempre un usuario con rol ``user`` y contraseña almacenada como hash bcrypt."""
        try:
            with self.uow as uow:
                if uow.usuarios.get_by_username(datos.username) or uow.usuarios.get_by_email(datos.email):
                    raise UsuarioDuplicado()
                usuario = uow.usuarios.add(
                    Usuario(
                        username=datos.username,
                        full_name=datos.full_name,
                        email=datos.email,
                        hashed_password=hash_password(datos.password),
                        role="user",
                    )
                )
                return UserPublic.model_validate(usuario)
        except IntegrityError:
            # Registro simultáneo con el mismo dato: la restricción UNIQUE de la base lo detecta.
            raise UsuarioDuplicado()

    def autenticar(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el nombre de usuario para emitir el token.

        La contraseña se verifica antes de informar que la cuenta está desactivada, de modo que no se revele
        qué cuentas existen a quien no conoce la contraseña.
        """
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesIncorrectas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return usuario.username
