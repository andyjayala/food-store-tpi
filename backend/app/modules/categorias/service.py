"""Reglas de negocio del módulo de categorías."""

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """La categoría no existe o está dada de baja (404)."""


class NombreDuplicado(Exception):
    """Ya existe otra categoría con el mismo nombre (409)."""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(datos.nombre) is not None:
                raise NombreDuplicado()
            categoria = uow.categorias.add(Categoria(nombre=datos.nombre, descripcion=datos.descripcion))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            cambios = datos.model_dump(exclude_unset=True)

            # El nuevo nombre no puede coincidir con el de otra categoría (la propia categoría queda excluida).
            nombre = cambios.get("nombre")
            if nombre is not None:
                existente = uow.categorias.get_by_nombre(nombre)
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado()

            for campo, valor in cambios.items():
                if valor is not None:
                    setattr(categoria, campo, valor)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica. No libera el nombre único ni oculta los productos de la categoría."""
        with self.uow as uow:
            self._activa(uow, categoria_id).activo = False

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada()
        return categoria
