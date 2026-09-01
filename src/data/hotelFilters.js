/** Images vignettes wilayas — page hôtels */

export const WILAYA_IMAGES = {
  alger: '/images/hotels/tahat-1.jpg',
  oran: '/images/hotels/sheraton-oran.jpg',
  bejaia: '/images/hotels/royal-bejaia-1.jpg',
  constantine: '/images/hotels/constantine-bridge.png',
  annaba: '/images/home/hero-coast.jpg',
  ghardaia: '/images/hotels/le-rym-ghardaia.jpg',
  tamanrasset: '/images/hotels/zeriba-djanet-1.jpg',
  illizi: '/images/hotels/zeriba-djanet-1.jpg',
  bechar: '/images/sahara5.jpeg',
  timimoun: '/images/sahara4.jpeg',
  biskra: '/images/sahara3.jpeg',
};

export const WILAYA_FALLBACK_IMAGE = '/images/hotels/hotel.avif';

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
