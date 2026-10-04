require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, closePool } = require('../config/db');

async function migrate() {
  const sqlDir = path.join(__dirname, '..', 'sql');
  const files = fs
    .readdirSync(sqlDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('[migrate] Aucun fichier SQL trouvé.');
    return;
  }

  for (const file of files) {
    const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
    console.log(`[migrate] Exécution de ${file}…`);
    await query(sql);
    console.log(`[migrate] OK — ${file}`);
  }

  console.log('[migrate] Terminé.');
}

migrate()
  .catch((err) => {
    console.error('[migrate] Erreur:', err.message);
    process.exit(1);
  })
  .finally(() => closePool());
