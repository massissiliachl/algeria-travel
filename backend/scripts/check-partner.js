require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query } = require('../config/db');

async function main() {
  const hotels = await query(
    `select id, name from public.stays where type = 'hotel' order by name limit 10`
  );
  const users = await query(`select email, hotel_id, active from public.hotel_users`);
  const avail = await query(
    `select to_regclass('public.hotel_daily_availability') as tbl`
  );
  console.log(JSON.stringify({ hotels: hotels.rows, partnerAccounts: users.rows, availabilityTable: avail.rows[0]?.tbl }, null, 2));
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => process.exit());
