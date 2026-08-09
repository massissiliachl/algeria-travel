import { TAGHIT_PACKAGES } from './taghitPackages';

export const GUEST_HOUSE_BENEFITS = [
  { id: 'welcome', icon: 'Heart' },
  { id: 'food', icon: 'ChefHat' },
  { id: 'nature', icon: 'Trees' },
  { id: 'comfort', icon: 'Bed' },
  { id: 'authentic', icon: 'Sparkles' },
];

export const MAISON_HOTE_IMAGES = [
  '/images/maison-hote-sud-1.png',
  '/images/maison-hote-sud-2.png',
  '/images/maison-hote-sud-3.png.jpeg',
  '/images/maison-hote-sud-4.png.jpeg',
  '/images/maison-hote-sud-5.png.jpeg',
  '/images/maison-hote-sud-6.png.jpeg',
  '/images/maison-hote-sud-7.png.jpeg',
];

const guest = TAGHIT_PACKAGES.guesthouse;

/** Une seule maison d’hôte — même forfait Taghit partout */
export const GUEST_HOUSES = [
  {
    id: 1,
    name: guest.title,
    name_en: guest.title_en,
    name_ar: guest.title_ar,
    location: 'Taghit, Béchar',
    location_en: 'Taghit, Béchar',
    location_ar: 'تاغيت، بشار',
    desc: guest.includes.map((i) => i.fr).join(' · '),
    desc_en: guest.includes.map((i) => i.en).join(' · '),
    desc_ar: guest.includes.map((i) => i.ar).join(' · '),
    image: MAISON_HOTE_IMAGES[0],
    gallery: MAISON_HOTE_IMAGES,
    price: guest.price,
    pricePerPerson: true,
    rating: 4.9,
  },
];
