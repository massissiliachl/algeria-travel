/**
 * Une destination et son circuit (formule par défaut) sont la même fiche :
 * nom, accroche, image, description, prix, publication et réservations restent alignés.
 */
const { query } = require('../config/db');

/** Circuits d’origine sans place_slug en base (même table que client/js/data/placeRoutes.js) */
const TOUR_TO_PLACE = {
  1: 'timimoun', 2: 'djanet', 3: 'ghardaia', 4: 'bejaia', 5: 'hoggar',
  6: 'constantine', 7: 'taghit', 8: 'taghit', 9: 'taghit', 10: 'tadrart', 12: 'taghit',
};

/** Formule affichée par défaut sur la fiche destination */
const DEFAULT_PKG = { taghit: 'hotel' };

const placeOfTour = (tour) => String(tour.place_slug || TOUR_TO_PLACE[Number(tour.id)] || '').trim() || null;
const pkgOf = (value) => String(value || '').trim().toLowerCase();
const defaultPkg = (placeId) => DEFAULT_PKG[placeId] || '';
const isOpen = (value) => value !== false;
const isPublished = (value) => value !== false;

async function linkedTours(placeId, pkg) {
  const r = await query(
    'select id, place_slug, pkg, name, subtitle, location, description, image, price, booking_open, published from public.tours order by id'
  );
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

/** Destination modifiée → circuit de sa formule par défaut (crée le circuit si besoin) */
async function syncFromPlace(place) {
  if (!place?.id) return;
  const placeId = place.id;
  const price = Number(place.price);
  const open = isOpen(place.booking_open);
  const published = isPublished(place.published);
  const name = place.name || placeId;
  const subtitle = place.tagline || '';
  const description = place.description || '';
  const image = place.image || '';
  const tours = await linkedTours(placeId, defaultPkg(placeId));

  if (!tours.length) {
    await query(
      `insert into public.tours
        (name, subtitle, location, description, image, price, category, place_slug, pkg, published, booking_open)
       values ($1, $2, $3, $4, $5, $6, 'desert', $7, $8, $9, $10)`,
      [
        name,
        subtitle,
        name,
        description,
        image || null,
        price > 0 ? price : null,
        placeId,
        defaultPkg(placeId) || null,
        published,
        open,
      ]
    );
    return;
  }

  for (const t of tours) {
    await query(
      `update public.tours set
         name = $1,
         subtitle = coalesce(nullif($2, ''), subtitle),
         location = coalesce(nullif($3, ''), location),
         description = coalesce(nullif($4, ''), description),
         image = coalesce(nullif($5, ''), image),
         price = coalesce($6, price),
         booking_open = $7,
         published = $8,
         place_slug = $9
       where id = $10`,
      [
        name,
        subtitle,
        name,
        description,
        image,
        price > 0 ? price : null,
        open,
        published,
        placeId,
        t.id,
      ]
    );
  }
}

/** Circuit modifié → destination, si c’est sa formule par défaut (crée la destination si besoin) */
async function syncFromTour(tour) {
  const placeId = tour && placeOfTour(tour);
  if (!placeId || pkgOf(tour.pkg) !== defaultPkg(placeId)) return;

  const price = Number(tour.price);
  const open = isOpen(tour.booking_open);
  const published = isPublished(tour.published);
  const name = tour.name || placeId;
  const tagline = tour.subtitle || '';
  const description = tour.description || '';
  const image = tour.image || '';

  const existing = await query('select id from public.places where id = $1', [placeId]);
  if (!existing.rows.length) {
    await query(
      `insert into public.places
        (id, name, tagline, description, image, price, published, booking_open)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [placeId, name, tagline, description, image || null, price > 0 ? price : null, published, open]
    );
    return;
  }

  await query(
    `update public.places set
       name = $1,
       tagline = coalesce(nullif($2, ''), tagline),
       description = coalesce(nullif($3, ''), description),
       image = coalesce(nullif($4, ''), image),
       price = coalesce($5, price),
       booking_open = $6,
       published = $7
     where id = $8`,
    [name, tagline, description, image, price > 0 ? price : null, open, published, placeId]
  );
}

module.exports = { circuitPrice, syncFromPlace, syncFromTour };
