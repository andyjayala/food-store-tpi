import { useEffect } from "react";
import AppRouter from "@/routes/AppRouter";
import { useAuthStore } from "@/store/authStore";

/**
 * Componente raíz. Al montarse confirma la sesión con el backend (checkSession llama a GET /auth/me); mientras tanto,
 * ProtectedRoute muestra un indicador de carga. Es la única llamada a la API que se realiza dentro de un useEffect.
 */
function App() {
  const checkSession = useAuthStore((estado) => estado.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
}

export default App;
