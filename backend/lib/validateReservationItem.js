const { query } = require('../config/db');

const TABLE_BY_TYPE = {
  place: 'places',
  tour: 'tours',
  activity: 'activities',
  stay: 'stays',
};

function staticIds(itemType) {
  try {
    if (itemType === 'place') {
      const { PLACES } = require('../scripts/data/places.cjs');
      const { TAGHIT_PLACE } = require('../scripts/data/taghitPackages.cjs');
      return [...PLACES.map((p) => String(p.id)), String(TAGHIT_PLACE?.id || 'taghit')];
    }
    if (itemType === 'tour') {
      const { FEATURED_TOURS } = require('../scripts/data/tours.cjs');
      return FEATURED_TOURS.map((t) => String(t.id));
    }
    if (itemType === 'activity') {
      const { ACTIVITIES } = require('../scripts/data/activities.cjs');
      return ACTIVITIES.map((a) => String(a.id));
    }
    if (itemType === 'stay') {
      const { STAYS } = require('../scripts/data/stays.cjs');
      return STAYS.map((s) => String(s.id));
    }
  } catch (err) {
    console.warn('[validateReservationItem] catalogue statique:', err.message);
  }
  return [];
}

function matchesStaticCatalog(itemType, itemId) {
  const id = itemType === 'tour' ? String(Number(itemId)) : String(itemId || '').trim();
  if (!id || id === 'NaN') return false;
  return staticIds(itemType).includes(id);
}

async function validateReservationItem(itemType, itemId) {
  const table = TABLE_BY_TYPE[itemType];
  if (!table) return false;

  const normalizedId = itemType === 'tour' ? Number(itemId) : String(itemId || '').trim();
  if (!normalizedId || (itemType === 'tour' && Number.isNaN(normalizedId))) return false;

  try {
    const result = await query(
      `select 1 from public.${table} where id = $1 and coalesce(published, true) = true limit 1`,
      [normalizedId]
    );
    if (result.rows.length > 0) return true;
  } catch (err) {
    console.warn('[validateReservationItem] DB:', err.message);
  }

  return matchesStaticCatalog(itemType, itemId);
}

module.exports = { validateReservationItem, matchesStaticCatalog };
