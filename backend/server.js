require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { testConnection, closePool } = require('./config/db');
const { resolveSiteUrl, resolveFrontendUrl, resolveAdminUrl } = require('./lib/siteUrl');
const reservationsRoutes = require('./routes/reservations');
const adminReservationsRoutes = require('./routes/admin/reservations');

const app = express();
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: [
          "'self'",
          'https://*.googleapis.com',
          'https://*.firebaseio.com',
          'https://fcmregistrations.googleapis.com',
          'https://firebaseinstallations.googleapis.com',
          'https://firebase.googleapis.com',
          'wss://*.firebaseio.com',
        ],
        frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
        workerSrc: ["'self'", 'blob:'],
        manifestSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = resolveFrontendUrl();
const ADMIN_URL = resolveAdminUrl();
const SITE_URL = resolveSiteUrl();

const corsOrigins = [
  FRONTEND_URL,
  ADMIN_URL,
  SITE_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
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
    allowedHeaders: ['Content-Type', 'x-favorite-client', 'x-admin-key', 'Authorization'],
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.use('/api/reservations', reservationsRoutes);
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin/reservations', adminReservationsRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin/favorites', require('./routes/admin/favorites'));
app.use('/api/admin', require('./routes/admin/media'));
app.use('/api/admin', require('./routes/admin/content'));
app.use('/api/admin/hotel-users', require('./routes/admin/hotelUsers'));
app.use('/api/admin/hotels/:hotelId/availability', require('./routes/admin/hotelAvailability'));
app.use('/api/partner', require('./routes/partner'));
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
const partnerPath = path.join(__dirname, '../partner/dist');
const serveFrontend =
  process.env.SERVE_FRONTEND === 'true' ||
  (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(buildPath, 'index.html')));
const serveAdmin =
  process.env.SERVE_ADMIN !== 'false' &&
  (serveFrontend || process.env.SERVE_ADMIN === 'true') &&
  fs.existsSync(path.join(adminPath, 'index.html'));
const servePartner =
  process.env.SERVE_PARTNER !== 'false' &&
  (serveFrontend || process.env.SERVE_PARTNER === 'true') &&
  fs.existsSync(path.join(partnerPath, 'index.html'));

if (servePartner) {
  app.use('/partner', express.static(partnerPath, { index: 'index.html' }));
  app.get(/^\/partner(\/.*)?$/, (req, res, next) => {
    if (req.path.includes('.')) return next();
    res.sendFile(path.join(partnerPath, 'index.html'), (err) => { if (err) next(err); });
  });
}

if (serveAdmin) {
  app.use('/admin', express.static(adminPath, { index: 'index.html' }));
  app.get(/^\/admin(\/.*)?$/, (req, res, next) => {
    if (req.path.includes('.')) return next();
    res.sendFile(path.join(adminPath, 'index.html'), (err) => { if (err) next(err); });
  });
}

if (serveFrontend) {
  app.use(express.static(buildPath));
  app.get(/^(?!\/api\/|\/admin|\/partner).*/, (req, res, next) => {
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
  console.error('[API]', req.method, req.path, err.message);
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

const server = app.listen(PORT, async () => {
  console.log(`Algeria Travel API → port ${PORT}`);
  if (process.env.DATABASE_URL) {
    try {
      const db = await testConnection();
      console.log(`[DB] Connecté à ${db.database}`);
      console.log(`[API] Serveur actif — http://localhost:${PORT}/api/health (Ctrl+C pour arrêter)`);
    } catch (err) {
      console.error('[DB]', err.message);
      console.log(`[API] Serveur actif sans DB — http://localhost:${PORT}/api/health (Ctrl+C pour arrêter)`);
    }
  } else {
    console.log(`[API] Serveur actif — http://localhost:${PORT}/api/health (Ctrl+C pour arrêter)`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[API] Le port ${PORT} est déjà utilisé par une autre instance.`);
    console.error('[API] Dans backend/, exécutez : npm run stop');
    console.error('[API] Puis relancez : npm start\n');
  } else {
    console.error('[API] Impossible de démarrer :', err.message);
  }
  process.exit(1);
});

if (process.stdin.isTTY) {
  process.stdin.resume();
}

async function shutdown(signal) {
  console.log(`\n[API] Arrêt (${signal})…`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
