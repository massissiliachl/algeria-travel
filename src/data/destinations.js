import { FEATURED_TOURS } from './tours';

/** Destinations homepage — mêmes données et images que Featured Tours */
export const POPULAR_DESTINATIONS = FEATURED_TOURS.map((tour) => ({
  id: tour.id,
  name: tour.name,
  name_en: tour.name_en,
  name_ar: tour.name_ar,
  region: tour.location,
  region_en: tour.location_en || tour.location,
  region_ar: tour.location_ar || tour.location,
  desc: tour.subtitle,
  desc_en: tour.subtitle_en,
  desc_ar: tour.subtitle_ar,
  season: tour.bestTime,
  season_en: tour.bestTime_en || tour.bestTime,
  season_ar: tour.bestTime_ar,
  duration: tour.duration,
  duration_en: tour.duration_en,
  duration_ar: tour.duration_ar,
  rating: tour.rating,
  image: tour.image,
  price: tour.price,
  category: tour.category,
}));
