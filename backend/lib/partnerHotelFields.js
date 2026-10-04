/** Champs modifiables par le partenaire hôtel (sans id, wilaya, type…) */
const PARTNER_HOTEL_FIELDS = [
  'name', 'nameEn', 'nameAr',
  'location', 'locationEn', 'locationAr',
  'desc', 'descEn', 'descAr',
  'address', 'addressEn', 'addressAr',
  'lat', 'lng', 'phone',
  'price', 'oldPrice', 'rating',
  'stars', 'availability', 'roomsAvailable',
  'checkIn', 'checkOut',
  'image', 'gallery', 'amenities',
  'published',
];

function pickPartnerPayload(body) {
  const out = {};
  for (const key of PARTNER_HOTEL_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

module.exports = { PARTNER_HOTEL_FIELDS, pickPartnerPayload };
