const { createProxyMiddleware } = require('http-proxy-middleware');

const target = process.env.REACT_APP_API_URL || 'http://localhost:5000';

module.exports = function proxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );

  app.use(
    ['/uploads', '/images'],
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
