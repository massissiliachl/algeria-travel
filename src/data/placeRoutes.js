/** Liaison circuits (tours) → pages /tours/:id et destinations /place/:slug */

export const TOUR_TO_PLACE = {
  1: 'timimoun',
  2: 'djanet',
  3: 'ghardaia',
  4: 'bejaia',
  5: 'hoggar',
  6: 'constantine',
  7: 'taghit',
  8: 'taghit',
};

export const getPlaceSlugFromTourId = (tourId) =>
  TOUR_TO_PLACE[Number(tourId)] || null;

/** Page détail d’un circuit */
export const getTourPath = (tour) => {
  if (!tour || tour.id == null || tour.id === '') return '/tours';
  return `/tours/${tour.id}`;
};

export const getTourPathFromId = (tourId) => {
  if (tourId == null || tourId === '') return '/tours';
  return `/tours/${tourId}`;
};

/** Lien vers la fiche destination associée (optionnel) */
export const getTourDestinationPath = (tour) => {
  if (!tour) return null;
  if (tour.pkg === 'guesthouse') return '/guesthouses';
  if (tour.pkg === 'hotel' && (tour.placeSlug === 'taghit' || tour.id === 7)) {
    return '/place/taghit?pkg=hotel';
  }
  const slug = tour.placeSlug || getPlaceSlugFromTourId(tour.id);
  if (!slug) return null;
  const base = `/place/${slug}`;
  return tour.pkg ? `${base}?pkg=${tour.pkg}` : base;
};

/** Clic sur une carte circuit → fiche circuit (plus de redirection vers /destinations) */
export const getPlacePathFromTour = (tour) => {
  if (!tour) return '/tours';
  if (tour.pkg === 'guesthouse') return '/guesthouses';
  return getTourPath(tour);
};

export const getPlacePathFromTourId = (tourId) => getTourPathFromId(tourId);
