/** Hébergements — hôtels & maisons d’hôtes uniquement */

import { TAGHIT_PACKAGES } from './taghitPackages';
import { HOTELS, hotelToStay } from './hotels';

export const STAY_TYPES = [
  { key: 'all', icon: 'Compass', fr: 'Tout', en: 'All', ar: 'الكل' },
  { key: 'hotel', icon: 'Hotel', fr: 'Hôtels', en: 'Hotels', ar: 'فنادق' },
  { key: 'guesthouse', icon: 'House', fr: 'Maisons d’hôtes', en: 'Guest houses', ar: 'بيوت الضيافة' },
];

export const STAY_PLACE_FILTERS = [
  { key: 'all', fr: 'Toutes les destinations', en: 'All destinations', ar: 'كل الوجهات' },
  { key: 'bejaia', fr: 'Béjaïa', en: 'Bejaia', ar: 'بجاية' },
  { key: 'djanet', fr: 'Djanet', en: 'Djanet', ar: 'جانت' },
  { key: 'ghardaia', fr: 'Ghardaïa', en: 'Ghardaia', ar: 'غرداية' },
  { key: 'hoggar', fr: 'Hoggar', en: 'Hoggar', ar: 'الهقار' },
  { key: 'oran', fr: 'Oran', en: 'Oran', ar: 'وهران' },
  { key: 'taghit', fr: 'Taghit', en: 'Taghit', ar: 'تاغيت' },
  { key: 'timimoun', fr: 'Timimoun', en: 'Timimoun', ar: 'تيميمون' },
];

const GUESTHOUSES = [
  {
    id: 'gh-taghit',
    type: 'guesthouse',
    placeId: 'taghit',
    name: TAGHIT_PACKAGES.guesthouse.title,
    name_en: TAGHIT_PACKAGES.guesthouse.title_en,
    name_ar: TAGHIT_PACKAGES.guesthouse.title_ar,
    location: 'Taghit, Béchar',
    location_en: 'Taghit, Béchar',
    location_ar: 'تاغيت، بشار',
    desc: TAGHIT_PACKAGES.guesthouse.includes.map((i) => i.fr).join('. ') + '.',
    desc_en: TAGHIT_PACKAGES.guesthouse.includes.map((i) => i.en).join('. ') + '.',
    desc_ar: TAGHIT_PACKAGES.guesthouse.includes.map((i) => i.ar).join('. ') + '.',
    image: '/images/maison-hote-sud-1.png',
    gallery: [
      '/images/maison-hote-sud-1.png',
      '/images/maison-hote-sud-2.png',
      '/images/maison-hote-sud-3.png.jpeg',
      '/images/maison-hote-sud-4.png.jpeg',
      '/images/maison-hote-sud-5.png.jpeg',
      '/images/maison-hote-sud-6.png.jpeg',
      '/images/maison-hote-sud-7.png.jpeg',
    ],
    price: TAGHIT_PACKAGES.guesthouse.price,
    pricePerPerson: true,
    rating: 4.9,
    reviews: 142,
    amenities: {
      fr: TAGHIT_PACKAGES.guesthouse.includes.map((i) => i.fr),
      en: TAGHIT_PACKAGES.guesthouse.includes.map((i) => i.en),
      ar: TAGHIT_PACKAGES.guesthouse.includes.map((i) => i.ar),
    },
  },
];

export const STAYS = [...HOTELS.map(hotelToStay), ...GUESTHOUSES];

export const getStayById = (id) => STAYS.find((s) => s.id === id);

export const filterStays = ({ type = 'all', place = 'all' } = {}) =>
  STAYS.filter((s) => {
    const typeOk = type === 'all' || s.type === type;
    const placeOk = place === 'all' || s.placeId === place;
    return typeOk && placeOk;
  });
