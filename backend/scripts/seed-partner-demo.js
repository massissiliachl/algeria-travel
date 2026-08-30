/**
 * Crée un compte partenaire de démonstration si aucun n'existe.
 * Usage: node scripts/seed-partner-demo.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query } = require('../config/db');
const { hashPassword } = require('../lib/password');

const DEMO = {
  hotelId: 'hotel-royal-bejaia',
  email: 'partenaire@hotel.dz',
  password: 'Partner123!',
};

async function main() {
  const count = await query('select count(*)::int as c from public.hotel_users');
  if (count.rows[0].c > 0) {
    const users = await query('select email, hotel_id from public.hotel_users');
    console.log('[seed-partner] Comptes existants :');
    users.rows.forEach((u) => console.log(`  - ${u.email} → ${u.hotel_id}`));
    return;
  }

  const hotel = await query(
    `select id, name from public.stays where id = $1 and type = 'hotel'`,
    [DEMO.hotelId]
  );
  if (!hotel.rows.length) {
    throw new Error(`Hôtel ${DEMO.hotelId} introuvable.`);
  }

  const passwordHash = await hashPassword(DEMO.password);
  await query(
    `insert into public.hotel_users (hotel_id, email, password_hash) values ($1, $2, $3)`,
    [DEMO.hotelId, DEMO.email, passwordHash]
  );

  console.log('[seed-partner] Compte démo créé :');
  console.log(`  Hôtel : ${hotel.rows[0].name}`);
  console.log(`  URL   : http://localhost:5175/partner/login`);
  console.log(`  Email : ${DEMO.email}`);
  console.log(`  Mot de passe : ${DEMO.password}`);
}

main()
  .catch((e) => {
    console.error('[seed-partner]', e.message);
    process.exit(1);
  })
  .finally(() => process.exit());
