/**
 * Une destination et son circuit sont la même offre : un seul prix (par personne, tout le séjour).
 * Le circuit (destination + formule) fait foi ; la fiche destination porte le prix de sa formule par défaut.
 */
const { query } = require('../config/db');

/** Circuits d’origine sans place_slug en base (même table que client/js/data/placeRoutes.js) */
const TOUR_TO_PLACE = {
  1: 'timimoun', 2: 'djanet', 3: 'ghardaia', 4: 'bejaia', 5: 'hoggar',
  6: 'constantine', 7: 'taghit', 8: 'taghit', 9: 'taghit', 10: 'tadrart',
};

/** Formule affichée par défaut sur la fiche destination */
const DEFAULT_PKG = { taghit: 'hotel' };

const placeOfTour = (tour) => String(tour.place_slug || TOUR_TO_PLACE[Number(tour.id)] || '').trim() || null;
const pkgOf = (value) => String(value || '').trim().toLowerCase();
const defaultPkg = (placeId) => DEFAULT_PKG[placeId] || '';

async function linkedTours(placeId, pkg) {
  const r = await query('select id, place_slug, pkg, price from public.tours where coalesce(published, true) = true order by id');
  return r.rows.filter((t) => placeOfTour(t) === placeId && pkgOf(t.pkg) === pkg);
}

/** Prix du circuit correspondant à la destination + formule, ou null */
async function circuitPrice(placeId, pkg) {
  try {
    const want = pkgOf(pkg) || defaultPkg(placeId);
    const [tour] = await linkedTours(placeId, want);
    const price = Number(tour?.price);
    return price > 0 ? price : null;
  } catch {
    return null;
  }
}

/** Prix modifié sur la destination → circuit de sa formule par défaut */
async function syncFromPlace(place) {
  const price = Number(place?.price);
  if (!place?.id || !(price > 0)) return;
  const tours = await linkedTours(place.id, defaultPkg(place.id));
  const ids = tours.filter((t) => Number(t.price) !== price).map((t) => t.id);
  if (ids.length) await query('update public.tours set price = $1 where id = any($2)', [price, ids]);
}

/** Prix modifié sur le circuit → destination, si c’est sa formule par défaut */
async function syncFromTour(tour) {
  const price = Number(tour?.price);
  const placeId = tour && placeOfTour(tour);
  if (!placeId || !(price > 0) || pkgOf(tour.pkg) !== defaultPkg(placeId)) return;
  await query('update public.places set price = $1 where id = $2 and price is distinct from $1', [price, placeId]);
}

module.exports = { circuitPrice, syncFromPlace, syncFromTour };
