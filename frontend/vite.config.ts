import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Configuración de Vite: plugin de React, plugin de Tailwind CSS y el alias "@/" que apunta a la carpeta src/.
// El mismo alias se declara en tsconfig.app.json (opción "paths") para que TypeScript resuelva los imports.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 700 },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
