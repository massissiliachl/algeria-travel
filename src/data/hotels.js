/** Hôtels — filtrés par wilaya */

export const HOTELS = [
  {
    id: 'hotel-royal-bejaia',
    wilaya: '06',
    wilayaKey: 'bejaia',
    stars: 4,
    availability: 'available',
    roomsAvailable: 12,
    name: 'Hôtel Royal Béjaïa',
    name_en: 'Royal Bejaia Hotel',
    name_ar: 'فندق رويال بجاية',
    address: 'Route de la Corniche, Béjaïa 06000',
    address_en: 'Corniche Road, Bejaia 06000',
    address_ar: 'طريق الكورniche، بجاية 06000',
    location: 'Béjaïa',
    location_en: 'Bejaia',
    location_ar: 'بجاية',
    lat: 36.7525,
    lng: 5.0553,
    checkIn: '14:00',
    checkOut: '12:00',
    phone: '+213 34 21 00 00',
    desc: 'Hôtel au cœur de Béjaïa : piscine, restaurant méditerranéen et base idéale pour Cap Carbon et Gouraya.',
    desc_en: 'Hotel in the heart of Bejaia: pool, Mediterranean restaurant and ideal base for Cap Carbon and Gouraya.',
    desc_ar: 'فندق في قلب بجاية: مسبح ومطعم متوسطي وقاعدة مثالية لكاب كاربون وغوراية.',
    image: '/images/hotels/royal-bejaia-1.jpg',
    gallery: ['/images/hotels/royal-bejaia-1.jpg', '/images/hotels/royal-bejaia-2.jpg', '/images/hotels/royal-bejaia-3.jpg'],
    price: 14500,
    oldPrice: 17000,
    rating: 4.6,
    reviews: 128,
    amenities: { fr: ['Wifi', 'Piscine', 'Restaurant', 'Parking', 'Climatisation'], en: ['Wifi', 'Pool', 'Restaurant', 'Parking', 'AC'], ar: ['واي فاي', 'مسبح', 'مطعم', 'موقف', 'تكييف'] },
  },
];

export const getHotelById = (id) => HOTELS.find((h) => h.id === id);

export const filterHotels = ({ wilaya = 'all', source = HOTELS } = {}) => {
  if (wilaya === 'all') return source;
  return source.filter((h) => h.wilayaKey === wilaya || h.wilaya === wilaya);
};

export const countHotelsByWilaya = (source = HOTELS) => {
  const counts = {};
  source.forEach((h) => {
    counts[h.wilayaKey] = (counts[h.wilayaKey] || 0) + 1;
  });
  return counts;
};

/** Convertit un hôtel au format stays (compatibilité + seed DB) */
export const hotelToStay = (h) => ({
  id: h.id,
  type: 'hotel',
  placeId: h.wilayaKey,
  wilaya: h.wilaya,
  wilayaKey: h.wilayaKey,
  stars: h.stars,
  availability: h.availability,
  roomsAvailable: h.roomsAvailable,
  name: h.name,
  name_en: h.name_en,
  name_ar: h.name_ar,
  address: h.address,
  address_en: h.address_en,
  address_ar: h.address_ar,
  location: h.location,
  location_en: h.location_en,
  location_ar: h.location_ar,
  lat: h.lat,
  lng: h.lng,
  checkIn: h.checkIn,
  checkOut: h.checkOut,
  phone: h.phone,
  desc: h.desc,
  desc_en: h.desc_en,
  desc_ar: h.desc_ar,
  image: h.image,
  gallery: h.gallery,
  price: h.price,
  oldPrice: h.oldPrice,
  pricePerPerson: false,
  rating: h.rating,
  reviews: h.reviews,
  amenities: h.amenities,
  published: true,
});
