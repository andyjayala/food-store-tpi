"""Carga de datos iniciales. Se ejecuta con ``python -m app.db.seed`` y es idempotente.

Crea el usuario administrador, las categorías y los productos del catálogo (con imagen de ejemplo). Si un registro ya existe (se identifica
por su nombre de usuario o por su nombre), no se vuelve a crear, por lo que el script puede ejecutarse varias veces.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"

CATEGORIAS: list[tuple[str, str]] = [
    ("Pizzas", "Pizzas artesanales con masa de fermentación lenta"),
    ("Pastas", "Pastas frescas con rellenos y salsas caseras"),
    ("Platos caseros", "Guisos y comidas de olla preparados todos los días"),
    ("Sándwiches", "Sándwiches de miga y bocadillos para compartir"),
    ("Bebidas", "Gaseosas y bebidas frías para acompañar"),
    ("Postres", "Postres caseros y helados"),
]

# (nombre, categoría, descripción, precio, stock)
PRODUCTOS: list[tuple[str, str, str, float, int]] = [
    ("Pizza Funghi", "Pizzas", "Salsa de tomate, mozzarella y champiñones salteados", 11500, 25),
    ("Pizza de roquefort y nueces", "Pizzas", "Mozzarella, queso roquefort y nueces tostadas", 12800, 20),
    ("Canelones de verdura", "Pastas", "Rellenos de acelga y ricota, gratinados con salsa blanca", 9800, 30),
    ("Ravioles de ricota", "Pastas", "Ravioles caseros de ricota con salsa fileto", 9200, 30),
    ("Guiso de lentejas", "Platos caseros", "Lentejas, verduras y chorizo colorado, cocción lenta", 8500, 40),
    ("Milanesa con puré", "Platos caseros", "Milanesa de carne al horno con puré de papas", 10500, 25),
    ("Sándwiches de miga x12", "Sándwiches", "Docena surtida de jamón y queso, y lechuga y tomate", 7800, 50),
    ("Sándwiches de miga x24", "Sándwiches", "Dos docenas surtidas para reuniones", 14500, 35),
    ("Coca-Cola", "Bebidas", "Gaseosa cola bien fría, botella familiar", 3800, 80),
    ("7UP Zero", "Bebidas", "Gaseosa lima-limón sin azúcar, bien fría, botella familiar", 3800, 80),
    ("Tiramisú", "Postres", "Clásico postre italiano con café, mascarpone y cacao", 5200, 30),
    ("Helado artesanal (2 bochas)", "Postres", "Dos bochas de helado artesanal de canela", 4800, 40),
    ("Brownie con nueces", "Postres", "Brownie húmedo de chocolate con nueces", 4500, 35),
]


# Imágenes de los productos: fotos propias guardadas en frontend/public/img (el frontend las sirve como /img/...).
# El campo imagen_url también se puede editar desde el panel de administración.
IMAGENES: dict[str, str] = {
    "Pizza Funghi": "/img/pizza-funghi.jpg",
    "Pizza de roquefort y nueces": "/img/pizza-roquefort.jpg",
    "Canelones de verdura": "/img/canelones-de-verdura.jpg",
    "Ravioles de ricota": "/img/ravioles-de-ricota.jpg",
    "Guiso de lentejas": "/img/guiso-de-lentejas.jpg",
    "Milanesa con puré": "/img/milanesa-con-pure.jpg",
    "Sándwiches de miga x12": "/img/sandwiches-de-miga.jpg",
    "Sándwiches de miga x24": "/img/sandwiches-de-miga.jpg",
    "Coca-Cola": "/img/coca-cola.jpg",
    "7UP Zero": "/img/7up-zero.jpg",
    "Tiramisú": "/img/tiramisu.jpg",
    "Helado artesanal (2 bochas)": "/img/helado-artesanal.jpg",
    "Brownie con nueces": "/img/brownie-con-nueces.jpg",
}


# Nombres anteriores de productos que se renombraron para coincidir con su foto.
RENOMBRES: dict[str, str] = {"Coca-Cola 500 ml": "Coca-Cola", "7UP 500 ml": "7UP Zero"}


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        # Usuario administrador
        if session.exec(select(Usuario).where(Usuario.username == ADMIN_USERNAME)).first() is None:
            session.add(
                Usuario(
                    username=ADMIN_USERNAME,
                    full_name="Administrador",
                    email="admin@foodstore.com",
                    hashed_password=hash_password(ADMIN_PASSWORD),
                    role="admin",
                )
            )
            print(f"Usuario administrador creado: {ADMIN_USERNAME}")

        # Categorías
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                print(f"Categoría creada: {nombre}")
            categorias[nombre] = categoria
        session.flush()  # asigna los identificadores de las categorías nuevas

        # Productos que cambiaron de nombre respecto de una carga anterior del seed (se renombran, no se duplican)
        for nombre_viejo, nombre_nuevo in RENOMBRES.items():
            viejo = session.exec(select(Producto).where(Producto.nombre == nombre_viejo)).first()
            if viejo is not None and session.exec(select(Producto).where(Producto.nombre == nombre_nuevo)).first() is None:
                viejo.nombre = nombre_nuevo
                session.add(viejo)
        session.flush()

        # Productos
        for nombre, nombre_categoria, descripcion, precio, stock in PRODUCTOS:
            producto = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if producto is not None:
                # Si el producto ya existía sin imagen, o con un enlace de una carga anterior, se le asigna la imagen actual.
                if nombre in IMAGENES and (producto.imagen_url == "" or "wikimedia" in producto.imagen_url):
                    producto.imagen_url = IMAGENES[nombre]
                    if nombre in RENOMBRES.values() or nombre == "Helado artesanal (2 bochas)":
                        producto.descripcion = descripcion
                    session.add(producto)
            else:
                session.add(
                    Producto(
                        categoria_id=categorias[nombre_categoria].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=IMAGENES.get(nombre, ""),
                        stock=stock,
                    )
                )
                print(f"Producto creado: {nombre}")

        session.commit()
    print("Seed finalizado.")


if __name__ == "__main__":
    seed()
