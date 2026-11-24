"""Configuración de la aplicación.

Las variables se leen del archivo ``.env`` (o del entorno del sistema) mediante pydantic-settings. De esta forma
los valores sensibles, como la clave de firma del JWT y las credenciales de la base, no se incluyen en el código.
"""

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str
    # La clave de firma debe tener al menos 32 caracteres para que el HMAC del JWT sea robusto.
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    @field_validator("DATABASE_URL")
    @classmethod
    def usar_driver_psycopg2(cls, url: str) -> str:
        """Fuerza el driver ``psycopg2`` para las URL de PostgreSQL escritas en forma abreviada.

        SQLAlchemy 2.1 usa por defecto ``psycopg`` (versión 3) cuando la URL comienza con ``postgresql://``. Como el
        proyecto instala ``psycopg2-binary``, se completa el esquema con ``+psycopg2`` para que la URL del ejemplo
        (``postgresql://usuario:clave@host:5432/base``) funcione sin modificaciones.
        """
        for prefijo in ("postgresql://", "postgres://"):
            if url.startswith(prefijo):
                return "postgresql+psycopg2://" + url[len(prefijo):]
        return url


# Instancia única, importada por el resto de los módulos.
settings = Settings()
