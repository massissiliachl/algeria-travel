/**
 * Crée les notifications partenaire pour les réservations hôtel déjà existantes.
 * Usage: node scripts/backfill-partner-notifications.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query, closePool } = require('../config/db');

async function main() {
  const result = await query(
    `insert into public.partner_notifications (hotel_id, reservation_id)
     select r.item_id, r.id
     from public.reservations r
     join public.stays s on s.id = r.item_id and s.type = 'hotel'
     where r.item_type = 'stay'
       and coalesce(r.stay_type, 'hotel') = 'hotel'
     on conflict (hotel_id, reservation_id) do nothing
     returning id`
  );

  console.log(`[backfill-partner] ${result.rowCount} notification(s) créée(s).`);
}

main()
  .catch((err) => {
    console.error('[backfill-partner]', err.message);
    process.exit(1);
  })
  .finally(() => closePool());
