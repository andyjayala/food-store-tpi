# Food Store

Trabajo Práctico Integrador de Programación 4 (Tecnicatura Universitaria en Programación a Distancia).
Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y
confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

**Autora:** Andrea Ayala 

- **Repositorio público:** https://github.com/andyjayala/food-store-tpi
- **Video de demostración:** https://drive.google.com/file/d/1prZ8oUjhlEowAkgO36OI3bnGMjQxqKKj/view?usp=sharing

## Estructura del proyecto

```
backend/    API REST con FastAPI + SQLModel (arquitectura en capas con Unit of Work)
frontend/   Aplicación React + TypeScript + Vite (arquitectura por features)
README.md   Este archivo
```

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel no funciona con 3.14) |
| PostgreSQL | 15 o superior (para desarrollo local también se acepta SQLite) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

## Backend

Desde la carpeta `backend/`:

1. Crear y activar un entorno virtual.
   - Windows: `python -m venv venv` y luego `venv\Scripts\activate`
   - Linux / macOS: `python3 -m venv venv` y luego `source venv/bin/activate`
2. Instalar las dependencias: `pip install -r requirements.txt`
3. Crear la base de datos en PostgreSQL (por ejemplo `foodstore_db`).
4. Copiar `.env.example` como `.env` y completar los valores (ver la tabla de variables).
5. Cargar los datos iniciales: `python -m app.db.seed`
6. Iniciar el servidor: `uvicorn app.main:app --reload`

La API queda disponible en `http://localhost:8000/api/v1`. La documentación interactiva está en
`http://localhost:8000/docs` y `http://localhost:8000/redoc`.

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base de datos | `postgresql://usuario:clave@localhost:5432/foodstore_db` (o `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Clave de firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

### Datos iniciales (seed)

`python -m app.db.seed` es idempotente (puede ejecutarse varias veces sin duplicar datos). Crea:

- El usuario administrador: **usuario `admin`**, **contraseña `Admin1234!`** (rol `admin`).
- 6 categorías: Pizzas, Pastas, Platos caseros, Sándwiches, Bebidas y Postres.
- 13 productos con stock e imagen (Pizza Funghi, Canelones de verdura, Guiso de lentejas, Coca-Cola, 7UP Zero, Tiramisú, helado y brownie, entre otros). Todas las fotos son propias y están en `frontend/public/img/`.

## Frontend

Desde la carpeta `frontend/`:

1. Copiar `.env.example` como `.env`.
2. Instalar las dependencias: `pnpm install`
3. Verificar tipos y compilar: `pnpm build`
4. Iniciar el servidor de desarrollo: `pnpm dev`

La aplicación queda disponible en `http://localhost:5173`. El backend debe estar en ejecución.

### Variables de entorno del frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

## Uso rápido

1. Registrarse desde `/register` (el registro público crea usuarios con rol `user`).
2. Recorrer el catálogo en `/`, agregar productos al carrito y confirmar el pedido en `/checkout`.
3. Consultar y cancelar (solo en estado PENDIENTE) los pedidos propios en `/mis-pedidos`.
4. Ingresar como `admin` para acceder al panel (`/admin/resumen`, `/admin/categorias`, `/admin/productos`,
   `/admin/pedidos` y `/admin/usuarios`).

## Decisiones de diseño

- **Capas:** `router` → `service` → `unit_of_work` → `repository` → `models`. Ningún service ni router llama a
  `session.commit()`: el commit o el rollback ocurren en el `__exit__` del Unit of Work.
- **Reglas de negocio de pedidos (RN-01 a RN-06):** el pedido se crea con el descuento de stock en una única
  transacción (con bloqueo de filas `SELECT ... FOR UPDATE`), la máquina de estados se valida con un diccionario de
  transiciones, la cancelación restituye el stock en la misma transacción y las líneas conservan una copia del
  nombre y del precio del producto.
- **Sesión:** el JWT viaja en la cookie `access_token` (HttpOnly, SameSite=Lax); el frontend nunca lo lee ni lo guarda.
- **Estado del frontend:** TanStack Query para el estado del servidor y Zustand (con `persist`) para la sesión y el carrito.
