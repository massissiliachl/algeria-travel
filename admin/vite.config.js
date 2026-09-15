import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.VITE_BASE || '/admin/';

export default defineConfig({
  base,
  // Images du site (public/images) disponibles en preview admin local
  publicDir: path.resolve(root, '../public'),
  plugins: [react()],
  server: {
    fs: {
      allow: [path.resolve(root, '..')],
    },
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
