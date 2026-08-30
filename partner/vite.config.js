import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const base = process.env.VITE_BASE || '/partner/';

function redirectRootToBase() {
  const basePath = base.replace(/\/$/, '') || '/partner';
  return {
    name: 'redirect-root-to-partner-base',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '/').split('?')[0];
        const qs = (req.url || '').includes('?') ? req.url.slice(req.url.indexOf('?')) : '';

        if (
          path.startsWith('/api') ||
          path.startsWith('/uploads') ||
          path.startsWith('/@') ||
          path.startsWith('/__')
        ) {
          next();
          return;
        }

        if (path === basePath || path.startsWith(`${basePath}/`)) {
          next();
          return;
        }

        if (path === '/' || path === '') {
          res.writeHead(302, { Location: `${basePath}/${qs}` });
          res.end();
          return;
        }

        if (path === basePath.slice(1)) {
          res.writeHead(302, { Location: `${basePath}/${qs}` });
          res.end();
          return;
        }

        const sub = path.startsWith('/') ? path : `/${path}`;
        res.writeHead(302, { Location: `${basePath}${sub}${qs}` });
        res.end();
      });
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), redirectRootToBase()],
  server: {
    port: 5175,
    strictPort: true,
    open: '/partner/',
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
