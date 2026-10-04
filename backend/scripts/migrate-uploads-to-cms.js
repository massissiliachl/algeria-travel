/**
 * Copie public/uploads → public/images/cms et met à jour les chemins en base.
 * Usage : node backend/scripts/migrate-uploads-to-cms.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { query, closePool } = require('../config/db');
const { CMS_DIR, LEGACY_UPLOAD_DIR, ensureDir } = require('../lib/mediaPaths');

async function copyUploadFiles() {
  ensureDir(CMS_DIR);
  if (!fs.existsSync(LEGACY_UPLOAD_DIR)) return 0;
  let copied = 0;
  for (const name of fs.readdirSync(LEGACY_UPLOAD_DIR)) {
    if (name === '.gitkeep') continue;
    const src = path.join(LEGACY_UPLOAD_DIR, name);
    if (!fs.statSync(src).isFile()) continue;
    const dest = path.join(CMS_DIR, name);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      copied += 1;
    }
  }
  return copied;
}

async function migrateDbPaths() {
  const tables = [
    { table: 'places', cols: ['image'] },
    { table: 'tours', cols: ['image'] },
    { table: 'activities', cols: ['image'] },
    { table: 'stays', cols: ['image'] },
    { table: 'blog_posts', cols: ['image'] },
    { table: 'gallery_items', cols: ['src'] },
  ];

  for (const { table, cols } of tables) {
    for (const col of cols) {
      const result = await query(
        `update public.${table}
         set ${col} = replace(${col}, '/uploads/', '/images/cms/')
         where ${col} like '/uploads/%'`
      );
      console.log(`[migrate-uploads] ${table}.${col} → ${result.rowCount} ligne(s)`);
    }
  }

  const jsonTables = [
    { table: 'places', col: 'gallery' },
    { table: 'activities', col: 'gallery' },
    { table: 'stays', col: 'gallery' },
  ];

  for (const { table, col } of jsonTables) {
    const result = await query(
      `update public.${table}
       set ${col} = replace(${col}::text, '/uploads/', '/images/cms/')::jsonb
       where ${col}::text like '%/uploads/%'`
    );
    console.log(`[migrate-uploads] ${table}.${col} (json) → ${result.rowCount} ligne(s)`);
  }
}

async function main() {
  const copied = await copyUploadFiles();
  console.log(`[migrate-uploads] ${copied} fichier(s) copié(s) vers public/images/cms/`);
  await migrateDbPaths();
  console.log('[migrate-uploads] Terminé.');
}

main()
  .catch((err) => {
    console.error('[migrate-uploads] Erreur:', err.message);
    process.exit(1);
  })
  .finally(() => closePool());
