import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Se corrige el alias '@' para que apunte a la carpeta /src, que es la convención estándar.
      "@": path.resolve(__dirname, "./src"),
    },
  },
});