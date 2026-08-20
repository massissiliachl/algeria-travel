require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { testConnection, closePool } = require('./config/db');
const { resolveSiteUrl, resolveFrontendUrl, resolveAdminUrl } = require('./lib/siteUrl');
const reservationsRoutes = require('./routes/reservations');
const adminReservationsRoutes = require('./routes/admin/reservations');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = resolveFrontendUrl();
const ADMIN_URL = resolveAdminUrl();
const SITE_URL = resolveSiteUrl();

const corsOrigins = [
  FRONTEND_URL,
  ADMIN_URL,
  SITE_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;
  if (/^https:\/\/[\w-]+\.onrender\.com$/i.test(origin)) return true;
  if (/^https:\/\/(www\.)?algeriatravel\.com$/i.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.use('/api/reservations', reservationsRoutes);
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin/reservations', adminReservationsRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin/media'));
app.use('/api/admin', require('./routes/admin/content'));
app.use('/api', require('./routes/content'));

app.get('/api/health', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ status: 'error', message: 'DATABASE_URL non configuré' });
  }
  try {
    const db = await testConnection();
    res.json({ status: 'ok', database: db.database, server_time: db.server_time });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

const buildPath = path.join(__dirname, '../build');
const adminPath = path.join(__dirname, '../admin/dist');
const serveFrontend =
  process.env.SERVE_FRONTEND === 'true' ||
  (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(buildPath, 'index.html')));
const serveAdmin =
  process.env.SERVE_ADMIN !== 'false' &&
  (serveFrontend || process.env.SERVE_ADMIN === 'true') &&
  fs.existsSync(path.join(adminPath, 'index.html'));

if (serveAdmin) {
  app.use('/admin', express.static(adminPath, { index: 'index.html' }));
  app.get(/^\/admin(\/.*)?$/, (req, res, next) => {
    if (req.path.includes('.')) return next();
    res.sendFile(path.join(adminPath, 'index.html'), (err) => { if (err) next(err); });
  });
}

if (serveFrontend) {
  app.use(express.static(buildPath));
  app.get(/^(?!\/api\/|\/admin).*/, (req, res, next) => {
    if (req.path.startsWith('/uploads/') || req.path.startsWith('/images/')) return next();
    res.sendFile(path.join(buildPath, 'index.html'), (err) => { if (err) next(err); });
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Algeria Travel API', status: 'ok', site: SITE_URL });
  });
}

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Route introuvable' });
  res.status(404).send('Not found');
});

app.use((err, req, res, next) => {
  console.error('[API]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

const server = app.listen(PORT, async () => {
  console.log(`Algeria Travel API → port ${PORT}`);
  if (process.env.DATABASE_URL) {
    try {
      const db = await testConnection();
      console.log(`[DB] Connecté à ${db.database}`);
    } catch (err) {
      console.error('[DB]', err.message);
    }
  }
});

async function shutdown(signal) {
  server.close(async () => { await closePool(); process.exit(0); });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
