const { createProxyMiddleware } = require('http-proxy-middleware');

const target = process.env.REACT_APP_API_URL || 'http://localhost:5000';

module.exports = function proxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      proxyTimeout: 45_000,
      timeout: 45_000,
      onError(err, req, res) {
        console.warn('[proxy]', req.method, req.url, err.code || err.message);
        if (!res.headersSent) {
          res.status(503).json({
            error: 'API backend indisponible. Lancez le serveur : cd backend && npm start',
          });
        }
      },
    })
  );

  app.use(
    '/uploads',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      proxyTimeout: 60_000,
      timeout: 60_000,
    })
  );
};
