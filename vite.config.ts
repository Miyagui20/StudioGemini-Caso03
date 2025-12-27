import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde el sistema (Vercel) o archivos .env
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Reemplazo estático de process.env.API_KEY para que funcione en el navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      emptyOutDir: true
    }
  };
});