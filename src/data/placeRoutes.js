/** Liaison circuits (tours numériques) → fiches unifiées /place/:slug */

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

export const getPlacePathFromTourId = (tourId) => {
  const slug = getPlaceSlugFromTourId(tourId);
  return slug ? `/place/${slug}` : '/destinations';
};

export const getPlacePathFromTour = (tour) => {
  if (!tour) return '/destinations';
  if (tour.pkg === 'guesthouse') return '/guesthouses';
  if (tour.pkg === 'hotel' && (tour.placeSlug === 'taghit' || tour.id === 7)) {
    return '/place/taghit?pkg=hotel';
  }
  const slug = tour.placeSlug || getPlaceSlugFromTourId(tour.id);
  if (!slug) return '/destinations';
  const base = `/place/${slug}`;
  return tour.pkg ? `${base}?pkg=${tour.pkg}` : base;
};
