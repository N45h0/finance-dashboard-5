import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Para desarrollo local, sigue leyendo de .env.local
    const env = loadEnv(mode, '.', '');
    
    return {
      define: {
        // Mantenemos la definición para la API del backend
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});