const { query } = require('../config/db');

async function tableExists() {
  const result = await query(
    `select exists (
       select 1 from information_schema.tables
       where table_schema = 'public' and table_name = 'favorites'
     ) as ok`
  );
  return Boolean(result.rows[0]?.ok);
}

async function topByType(itemType, joinSql, nameColumn) {
  const result = await query(
    `select f.item_id,
            count(*)::int as count,
            ${nameColumn} as name
     from public.favorites f
     ${joinSql}
     where f.item_type = $1
     group by f.item_id, ${nameColumn}
     order by count desc, f.item_id asc
     limit 10`,
    [itemType]
  );
  return result.rows.map((row) => ({
    itemId: row.item_id,
    count: row.count,
    name: row.name || row.item_id,
  }));
}

async function getFavoriteStats() {
  if (!(await tableExists())) {
    return {
      ready: false,
      message: 'Table favorites absente — lancez npm run migrate dans backend/',
      totals: { favorites: 0, uniqueVisitors: 0 },
      byType: {},
      topActivities: [],
      topHotels: [],
      topTours: [],
    };
  }

  const [totals, byType, topActivities, topHotels, topTours] = await Promise.all([
    query(
      `select count(*)::int as favorites,
              count(distinct client_id)::int as unique_visitors
       from public.favorites`
    ),
    query(
      `select item_type, count(*)::int as count
       from public.favorites
       group by item_type
       order by count desc`
    ),
    topByType(
      'activity',
      'left join public.activities a on a.id = f.item_id',
      'a.name'
    ),
    topByType(
      'hotel',
      "left join public.stays s on s.id = f.item_id and s.type = 'hotel'",
      's.name'
    ),
    topByType(
      'tour',
      'left join public.tours t on t.id::text = f.item_id',
      't.name'
    ),
  ]);

  const typeMap = Object.fromEntries(byType.rows.map((row) => [row.item_type, row.count]));

  return {
    ready: true,
    totals: {
      favorites: totals.rows[0]?.favorites || 0,
      uniqueVisitors: totals.rows[0]?.unique_visitors || 0,
    },
    byType: typeMap,
    topActivities,
    topHotels,
    topTours,
  };
}

module.exports = { getFavoriteStats };
