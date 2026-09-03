const { Pool } = require('pg');

let pool = null;

function buildConnectionString(url) {
  if (!url) return url;
  // Pooler Supabase (6543) : mode transaction + pas de prepared statements
  if (url.includes(':6543') && !/[?&]pgbouncer=/.test(url)) {
    return `${url}${url.includes('?') ? '&' : '?'}pgbouncer=true`;
  }
  return url;
}

function isRetriableDbError(err) {
  const msg = err?.message || '';
  return (
    /connection timeout/i.test(msg) ||
    /connection terminated/i.test(msg) ||
    /ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(msg) ||
    err?.code === '57P01'
  );
}

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL manquant dans backend/.env');
  }

  pool = new Pool({
    connectionString: buildConnectionString(connectionString),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 20_000,
    max: 5,
    keepAlive: true,
  });

  pool.on('error', (err) => {
    console.error('[PostgreSQL]', err.message);
  });

  return pool;
}

async function query(text, params, attempt = 0) {
  try {
    const client = await getPool().connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  } catch (err) {
    if (isRetriableDbError(err) && attempt < 2) {
      console.warn(`[DB] Reconnexion (tentative ${attempt + 1}) :`, err.message);
      await closePool();
      return query(text, params, attempt + 1);
    }
    throw err;
  }
}

async function testConnection() {
  const result = await query(
    'select now() as server_time, current_database() as database, version() as version'
  );
  return result.rows[0];
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getPool, query, testConnection, closePool };
