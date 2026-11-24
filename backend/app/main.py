"""Punto de entrada de la API de Food Store."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Al iniciar el servidor se crean las tablas que todavía no existan.
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description=(
        "API REST de un sistema de pedidos de comida: autenticación con JWT en cookie HttpOnly, autorización por roles, "
        "catálogo de categorías y productos, y pedidos con descuento y restitución de stock."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: para que el navegador acepte y envíe la cookie de sesión es necesario habilitar
# ``allow_credentials`` e indicar el origen exacto del frontend (no se admite el comodín «*»).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(router, prefix=API_PREFIX)
