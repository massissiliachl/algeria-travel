const { query } = require('../config/db');

const TABLE_BY_TYPE = {
  place: 'places',
  tour: 'tours',
  activity: 'activities',
  stay: 'stays',
};

async function validateReservationItem(itemType, itemId) {
  const table = TABLE_BY_TYPE[itemType];
  if (!table) return false;

  const idColumn = itemType === 'tour' ? 'id' : 'id';
  const result = await query(
    `select 1 from public.${table} where ${idColumn} = $1 and coalesce(published, true) = true limit 1`,
    [itemType === 'tour' ? Number(itemId) : itemId]
  );

  return result.rows.length > 0;
}

module.exports = { validateReservationItem };
