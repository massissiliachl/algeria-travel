/**
 * Supprime tous les hôtels sauf hotel-royal-bejaia.
 * Usage: node scripts/prune-hotels.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query, closePool } = require('../config/db');

const KEEP_HOTEL_ID = 'hotel-royal-bejaia';

async function main() {
  const before = await query(
    `select id, name from public.stays where type = 'hotel' order by name`
  );
  console.log('[prune-hotels] Avant :', before.rows.map((r) => r.id).join(', ') || '(aucun)');

  const removed = await query(
    `delete from public.stays
     where type = 'hotel' and id <> $1
     returning id, name`,
    [KEEP_HOTEL_ID]
  );

  const after = await query(
    `select id, name from public.stays where type = 'hotel' order by name`
  );

  console.log(`[prune-hotels] ${removed.rowCount} hôtel(s) supprimé(s).`);
  removed.rows.forEach((r) => console.log(`  - ${r.id} (${r.name})`));
  console.log('[prune-hotels] Restants :', after.rows.map((r) => `${r.id} (${r.name})`).join(', '));
}

main()
  .catch((err) => {
    console.error('[prune-hotels]', err.message);
    process.exit(1);
  })
  .finally(() => closePool());
