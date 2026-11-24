/// <reference types="vite/client" />

// Tipado de las variables de entorno expuestas por Vite (deben comenzar con VITE_).
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
