/** Données Accueil — alignées sur le mockup Algeria Travel */

import { TAGHIT_PACKAGES } from './taghitPackages';

export const HOME_HERO = {
  image: '/images/hero.jpeg',
  fallback: '/images/heroaccueil.png',
};

/** Destinations rondes — bulles accueil */
export const HOME_SPOT_DESTINATIONS = [
  {
    id: 'taghit',
    name: 'Taghit',
    name_en: 'Taghit',
    name_ar: 'تاغيت',
    image: '/images/home/taghit.webp',
    fallback: '/images/sahara5.jpeg',
    link: '/place/taghit',
  },
  {
    id: 'djanet',
    name: 'Djanet',
    name_en: 'Djanet',
    name_ar: 'جانت',
    image: '/images/djanet.jpeg',
    link: '/place/djanet',
  },
  {
    id: 'alger',
    name: 'Alger',
    name_en: 'Algiers',
    name_ar: 'الجزائر',
    image: '/images/home/dest-alger.jpg',
    fallback: '/images/alger.jpeg',
    link: '/place/alger',
  },
  {
    id: 'ghardaia',
    name: 'Ghardaïa',
    name_en: 'Ghardaia',
    name_ar: 'غرداية',
    image: '/images/ghardaia.jpeg',
    link: '/place/ghardaia',
  },
  {
    id: 'beni-isguen',
    name: 'Beni Isguen',
    name_en: 'Beni Isguen',
    name_ar: 'بني يزقن',
    image: '/images/ghardaia.jpeg',
    link: '/place/ghardaia',
  },
  {
    id: 'el-atteuf',
    name: 'El Atteuf',
    name_en: 'El Atteuf',
    name_ar: 'العطوف',
    image: '/images/ghardaia.jpeg',
    link: '/place/ghardaia',
  },
  {
    id: 'timimoun',
    name: 'Timimoun',
    name_en: 'Timimoun',
    name_ar: 'تيميمون',
    image: '/images/sahara1.jpeg',
    link: '/place/timimoun',
  },
];

const hotel = TAGHIT_PACKAGES.hotel;
const guest = TAGHIT_PACKAGES.guesthouse;

export const HOME_COUP_TAGHIT = {
  image: '/images/home/taghit.webp',
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

/** Cartes Hôtels / Expériences — bandeau accueil (mockup) */
export const HOME_SHOWCASE_CARDS = [
  {
    key: 'hotels',
    featured: true,
    badgeKey: 'home_showcase_badge',
    fr: 'Hôtels',
    en: 'Hotels',
    ar: 'فنادق',
    descKey: 'home_showcase_hotels_desc',
    ctaKey: 'home_showcase_hotels_cta',
    image: '/images/home/acc-hotel.jpg',
    fallback: '/images/bejaia.jpeg',
    link: '/hotels',
  },
  {
    key: 'experiences',
    fr: 'Expériences',
    en: 'Experiences',
    ar: 'تجارب',
    descKey: 'home_showcase_exp_desc',
    ctaKey: 'home_showcase_exp_cta',
    image: '/images/sahara5.jpeg',
    fallback: '/images/home/circuits-4x4.png',
    link: '/activities',
  },
];

export const HOME_CIRCUITS_BANNER = {
  image: '/images/home/circuits-4x4.png',
};
