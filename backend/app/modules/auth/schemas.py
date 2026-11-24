"""Schemas del módulo de autenticación."""

from sqlmodel import SQLModel


class MensajeRespuesta(SQLModel):
    """Cuerpo de las respuestas de login y logout. El token nunca se incluye en el cuerpo."""

    message: str
