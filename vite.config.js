import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Charger les variables d’environnement à partir de .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      // S’assurer que les variables d’environnement sont accessibles
      'process.env': env,
    },
    server: {
      port: 5176,
    },
  };
});
