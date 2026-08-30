/** Normalise une réponse API (camelCase) vers le format hôtel front */

export function normalizeHotel(row) {
  if (!row) return null;

  const amenities = row.amenities || {};
  const gallery = Array.isArray(row.gallery) ? row.gallery : [];

  return {
    id: row.id,
    wilaya: row.wilaya,
    wilayaKey: row.wilayaKey || row.placeId,
    stars: row.stars ?? 3,
    availability: row.availability || 'available',
    roomsAvailable: row.roomsAvailable ?? 0,
    name: row.name,
    name_en: row.nameEn || row.name_en,
    name_ar: row.nameAr || row.name_ar,
    address: row.address,
    address_en: row.addressEn || row.address_en,
    address_ar: row.addressAr || row.address_ar,
    location: row.location,
    location_en: row.locationEn || row.location_en,
    location_ar: row.locationAr || row.location_ar,
    lat: row.lat,
    lng: row.lng,
    checkIn: row.checkIn || '14:00',
    checkOut: row.checkOut || '12:00',
    phone: row.phone,
    desc: row.desc,
    desc_en: row.descEn || row.desc_en,
    desc_ar: row.descAr || row.desc_ar,
    image: row.image,
    gallery: gallery.length ? gallery : row.image ? [row.image] : [],
    price: row.price,
    oldPrice: row.oldPrice || row.old_price,
    rating: row.rating,
    reviews: row.reviews,
    amenities: {
      fr: amenities.fr || [],
      en: amenities.en || [],
      ar: amenities.ar || [],
    },
  };
}

export function normalizeHotels(rows) {
  return (rows || []).map(normalizeHotel).filter(Boolean);
}
