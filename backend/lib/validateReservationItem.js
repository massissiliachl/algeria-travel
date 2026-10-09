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

function staticPlaceBookingOpen(itemId) {
  const id = String(itemId || '').trim();
  if (!id) return false;
  if (id === 'taghit') return true;
  try {
    const { PLACES } = require('../scripts/data/places.cjs');
    const place = PLACES.find((p) => String(p.id) === id);
    if (place) return Boolean(place.bookingOpen);
  } catch (err) {
    console.warn('[validateReservationItem] catalogue statique places:', err.message);
  }
  return false;
}

async function validateReservationItem(itemType, itemId) {
  const table = TABLE_BY_TYPE[itemType];
  if (!table) return false;

  const normalizedId = itemType === 'tour' ? Number(itemId) : String(itemId || '').trim();
  if (!normalizedId || (itemType === 'tour' && Number.isNaN(normalizedId))) return false;

  try {
    const selectCols = itemType === 'place' || itemType === 'tour' ? 'booking_open' : '1';
    const result = await query(
      `select ${selectCols} from public.${table} where id = $1 and coalesce(published, true) = true limit 1`,
      [normalizedId]
    );
    if (result.rows.length > 0) {
      if (itemType === 'place') return Boolean(result.rows[0].booking_open);
      if (itemType === 'tour') return result.rows[0].booking_open !== false;
      return true;
    }
  } catch (err) {
    console.warn('[validateReservationItem] DB:', err.message);
  }

  if (itemType === 'place') {
    return matchesStaticCatalog(itemType, itemId) && staticPlaceBookingOpen(itemId);
  }

  return matchesStaticCatalog(itemType, itemId);
}

/** @returns {true|false|null} true = réservable, false = fermé, null = introuvable */
async function placeReservationAllowed(itemId) {
  const id = String(itemId || '').trim();
  if (!id) return null;

  try {
    const result = await query(
      `select booking_open from public.places where id = $1 and coalesce(published, true) = true limit 1`,
      [id]
    );
    if (result.rows.length > 0) return Boolean(result.rows[0].booking_open);
  } catch (err) {
    console.warn('[placeReservationAllowed] DB:', err.message);
  }

  if (!matchesStaticCatalog('place', id)) return null;
  return staticPlaceBookingOpen(id);
}

/** Circuits d’origine sans place_slug : même correspondance que client/js/data/placeRoutes.js */
const TOUR_TO_PLACE = { 1: 'timimoun', 2: 'djanet', 3: 'ghardaia', 4: 'bejaia', 5: 'hoggar', 6: 'constantine', 7: 'taghit', 8: 'taghit', 9: 'taghit', 10: 'tadrart' };

/** false si l’admin a fermé les réservations du circuit qui mène à cette fiche (destination + formule) */
async function circuitReservationAllowed(placeId, pkg) {
  const id = String(placeId || '').trim();
  if (!id) return true;
  const legacyIds = Object.entries(TOUR_TO_PLACE)
    .filter(([, slug]) => slug === id)
    .map(([tourId]) => Number(tourId));
  try {
    const result = await query(
      `select 1 from public.tours
       where booking_open = false
         and coalesce(published, true) = true
         and coalesce(pkg, '') = $2
         and (place_slug = $1 or (coalesce(place_slug, '') = '' and id = any($3::int[])))
       limit 1`,
      [id, String(pkg || '').trim(), legacyIds]
    );
    return result.rows.length === 0;
  } catch (err) {
    console.warn('[circuitReservationAllowed] DB:', err.message);
    return true;
  }
}

module.exports = {
  validateReservationItem,
  matchesStaticCatalog,
  staticPlaceBookingOpen,
  placeReservationAllowed,
  circuitReservationAllowed,
};
