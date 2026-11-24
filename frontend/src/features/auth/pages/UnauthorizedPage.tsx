import { Link } from "react-router-dom";

/** Pantalla que se muestra cuando el usuario tiene sesión pero no el rol necesario para la ruta solicitada. */
function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-3xl font-extrabold">Acceso denegado</h1>
      <p className="mt-3 text-slate-600">No cuenta con los permisos necesarios para acceder a esta pantalla.</p>
      <Link to="/" className="mt-6 inline-block font-semibold text-orange-600 hover:text-orange-700">
        Volver al inicio
      </Link>
    </div>
  );
}

export default UnauthorizedPage;
