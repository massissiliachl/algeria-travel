/** Images vignettes wilayas — page hôtels */

export const WILAYA_IMAGES = {
  alger: '/images/home/dest-alger.jpg',
  oran: '/images/home/dest-oran.jpg',
  bejaia: '/images/home/acc-hotel.jpg',
  constantine: '/images/home/exp-culture.jpg',
  annaba: '/images/home/hero-coast.jpg',
  ghardaia: '/images/home/dest-ghardaia.jpg',
  tamanrasset: '/images/home/dest-djanet.jpg',
  illizi: '/images/home/dest-djanet.jpg',
  bechar: '/images/home/hero-coast.jpg',
  timimoun: '/images/home/hero-coast.jpg',
  biskra: '/images/home/hero-coast.jpg',
};

export const WILAYA_FALLBACK_IMAGE = '/images/home/acc-hotel.jpg';

export const AMENITY_FILTERS = [
  { key: 'wifi', match: ['wifi', 'wi-fi', 'wi fi'], icon: 'Globe', labelKey: 'hotels_amenity_wifi' },
  { key: 'pool', match: ['piscine', 'pool'], icon: 'Waves', labelKey: 'hotels_amenity_pool' },
  { key: 'spa', match: ['spa'], icon: 'Sparkles', labelKey: 'hotels_amenity_spa' },
  { key: 'restaurant', match: ['restaurant'], icon: 'UtensilsCrossed', labelKey: 'hotels_amenity_restaurant' },
  { key: 'parking', match: ['parking'], icon: 'Car', labelKey: 'hotels_amenity_parking' },
  { key: 'ac', match: ['climatisation', 'clim', 'ac', 'air'], icon: 'ThermometerSun', labelKey: 'hotels_amenity_ac' },
];

export const PRICE_MIN = 1000;
export const PRICE_MAX = 50000;
export const PRICE_STEP = 500;
