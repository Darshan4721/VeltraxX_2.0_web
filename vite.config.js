import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  define: {
    __VERCEL_ENV__: JSON.stringify(process.env.VERCEL_ENV || ''),
    __VERCEL_GIT_COMMIT_REF__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_REF || '')
  },
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 5173,
    host: true
  }
});
