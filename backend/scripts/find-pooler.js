require('dotenv').config();
const { Client } = require('pg');

const ref = 'rckowdxurjkovmkvgdlm';
const regions = [
  'eu-west-3',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-north-1',
  'us-east-1',
  'us-west-1',
  'ap-southeast-1',
];
const prefixes = ['aws-0', 'aws-1'];

function buildUrl(region, port, prefix) {
  const url = new URL(process.env.DATABASE_URL);
  const password = decodeURIComponent(url.password);
  const user = `postgres.${ref}`;
  const host = `${prefix}-${region}.pooler.supabase.com`;
  return { host, port, user, password, region, prefix };
}

async function tryConnect({ host, port, user, password }) {
  const client = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });

  try {
    await client.connect();
    await client.query('select 1');
    await client.end();
    return true;
  } catch (err) {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
    return err.message;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL manquant dans .env');
    process.exit(1);
  }

  console.log('Recherche du pooler Supabase compatible…\n');

  for (const prefix of prefixes) {
    for (const region of regions) {
      for (const port of [6543, 5432]) {
        const cfg = buildUrl(region, port, prefix);
        const result = await tryConnect(cfg);
        if (result === true) {
          const uri = `postgresql://${cfg.user}:${encodeURIComponent(cfg.password)}@${cfg.host}:${port}/postgres`;
          console.log('Pooler trouvé !');
          console.log(`Host   : ${cfg.host}`);
          console.log(`Port   : ${port}`);
          console.log(`\nCopiez dans backend/.env :\n`);
          console.log(`DATABASE_URL=${uri}`);
          process.exit(0);
        }
        console.log(`✗ ${cfg.host}:${port} — ${String(result).split('\n')[0]}`);
      }
    }
  }

  console.error('\nAucun pooler trouvé. Vérifiez le mot de passe dans Supabase → Settings → Database');
  process.exit(1);
}

main();
