require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection, closePool } = require('./config/db');
const reservationsRoutes = require('./routes/reservations');
const adminReservationsRoutes = require('./routes/admin/reservations');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: [FRONTEND_URL, ADMIN_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());

app.use('/api/reservations', reservationsRoutes);
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin/reservations', adminReservationsRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin/content'));
app.use('/api', require('./routes/content'));

app.get('/', (req, res) => {
  res.json({ message: 'Algeria Travel API', status: 'ok' });
});

app.get('/api/health', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({
      status: 'error',
      message: 'DATABASE_URL non configuré dans .env',
    });
  }

  try {
    const db = await testConnection();
    res.json({
      status: 'ok',
      database: db.database,
      server_time: db.server_time,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: 'Connexion PostgreSQL impossible',
      detail: err.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.use((err, req, res, next) => {
  console.error('[API]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur',
  });
});

const server = app.listen(PORT, async () => {
  console.log(`Algeria Travel API → http://localhost:${PORT}`);

  if (!process.env.DATABASE_URL) {
    console.warn('[DB] DATABASE_URL manquant — ajoutez-le dans backend/.env');
    return;
  }

  try {
    const db = await testConnection();
    console.log(`[DB] Connecté à ${db.database} — ${db.server_time}`);
  } catch (err) {
    console.error('[DB] Échec connexion:', err.message);
    if (process.env.DATABASE_URL?.includes('db.') && process.env.DATABASE_URL.includes('.supabase.co:5432')) {
      console.error('[DB] Cause probable : connexion directe IPv6 bloquée sur votre réseau.');
      console.error('[DB] Solution : npm run find:pooler  puis mettez à jour DATABASE_URL');
    }
  }
});

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
