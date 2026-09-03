const { createProxyMiddleware } = require('http-proxy-middleware');

const target = process.env.REACT_APP_API_URL || 'http://localhost:5000';

module.exports = function proxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      proxyTimeout: 60_000,
      timeout: 60_000,
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
