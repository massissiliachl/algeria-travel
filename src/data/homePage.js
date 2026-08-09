/** Données Accueil — alignées sur le mockup Algeria Travel */

import { TAGHIT_PACKAGES } from './taghitPackages';

export const HOME_HERO = {
  image: '/images/hero.jpeg',
  fallback: '/images/heroaccueil.png',
};

const hotel = TAGHIT_PACKAGES.hotel;
const guest = TAGHIT_PACKAGES.guesthouse;

export const HOME_COUP_TAGHIT = {
  image: '/images/taghit.jpeg',
  fallback: '/images/sahara5.jpeg',
  link: '/place/taghit',
  packages: [
    {
      id: hotel.id,
      price: hotel.price,
      icon: hotel.icon,
      titleKey: 'home_v2_coup_pkg_hotel_title',
      transportKey: 'home_v2_coup_pkg_hotel_transport',
      includes: [
        'home_v2_coup_pkg_hotel_inc_1',
        'home_v2_coup_pkg_hotel_inc_2',
        'home_v2_coup_pkg_hotel_inc_3',
        'home_v2_coup_pkg_hotel_inc_4',
      ],
      extraKey: 'home_v2_coup_pkg_hotel_extra',
      ctaPath: hotel.path,
    },
    {
      id: guest.id,
      price: guest.price,
      icon: guest.icon,
      titleKey: 'home_v2_coup_pkg_guest_title',
      transportKey: 'home_v2_coup_pkg_guest_transport',
      includes: [
        'home_v2_coup_pkg_guest_inc_1',
        'home_v2_coup_pkg_guest_inc_2',
        'home_v2_coup_pkg_guest_inc_3',
        'home_v2_coup_pkg_guest_inc_4',
      ],
      extraKey: null,
      ctaPath: guest.path,
    },
  ],
};

export const HOME_DESTINATIONS = [
  {
    id: 'bejaia',
    name: 'Béjaïa',
    name_en: 'Bejaia',
    name_ar: 'بجاية',
    tagline: 'Perle de la Kabylie',
    tagline_en: 'Pearl of Kabylie',
    tagline_ar: 'لؤلؤة القبائل',
    rating: 4.9,
    temp: '22°C',
    image: '/images/bejaia.jpeg',
    link: '/place/bejaia',
  },
  {
    id: 'djanet',
    name: 'Djanet',
    name_en: 'Djanet',
    name_ar: 'جانت',
    tagline: 'Porte du Tassili',
    tagline_en: 'Gateway to Tassili',
    tagline_ar: 'بوابة تاسيلي',
    rating: 4.9,
    temp: '28°C',
    image: '/images/djanet.jpeg',
    link: '/place/djanet',
  },
  {
    id: 'ghardaia',
    name: 'Ghardaïa',
    name_en: 'Ghardaia',
    name_ar: 'غرداية',
    tagline: 'Vallée du M’Zab',
    tagline_en: 'M’Zab Valley',
    tagline_ar: 'وادي مزاب',
    rating: 4.8,
    temp: '26°C',
    image: '/images/ghardaia.jpeg',
    link: '/place/ghardaia',
  },
  {
    id: 'hoggar',
    name: 'Hoggar',
    name_en: 'Hoggar',
    name_ar: 'الهقار',
    tagline: 'Montagnes du Sahara',
    tagline_en: 'Sahara mountains',
    tagline_ar: 'جبال الصحراء',
    rating: 5.0,
    temp: '24°C',
    image: '/images/hogar.jpeg',
    link: '/place/hoggar',
  },
];

export const HOME_ACCOMMODATIONS = [
  {
    key: 'hotels',
    fr: 'Hôtels',
    en: 'Hotels',
    ar: 'فنادق',
    cta: { fr: 'Voir les hôtels', en: 'See hotels', ar: 'عرض الفنادق' },
    image: '/images/home/acc-hotel.jpg',
    link: '/stays?type=hotels',
  },
  {
    key: 'guesthouses',
    fr: 'Maisons d’hôtes',
    en: 'Guest houses',
    ar: 'بيوت الضيافة',
    cta: { fr: 'Voir les maisons d’hôtes', en: 'See guest houses', ar: 'عرض بيوت الضيافة' },
    image: '/images/maison-hote-sud-1.png',
    link: '/stays?type=guesthouses',
  },
];

export const HOME_CIRCUITS_BANNER = {
  image: '/images/home/circuits-4x4.png',
};
