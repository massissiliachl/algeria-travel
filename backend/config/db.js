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
    console.error('[PostgreSQL] Connexion idle perdue :', err.message);
    closePool().catch(() => {});
  });

  return pool;
}

async function query(text, params, attempt = 0) {
  try {
    return await getPool().query(text, params);
  } catch (err) {
    if (isRetriableDbError(err) && attempt < 3) {
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
  if (!pool) return;
  const current = pool;
  pool = null;
  try {
    await current.end();
  } catch (err) {
    if (!/more than once/i.test(err.message || '')) {
      console.error('[DB] closePool:', err.message);
    }
  }
}

async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query('begin');
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (err) {
    await client.query('rollback').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getPool, query, withTransaction, testConnection, closePool };
