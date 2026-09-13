const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');
const dir = path.join(__dirname, 'data');

function extractExportArray(src, exportName) {
  const normalized = src.replace(/\r\n/g, '\n');
  const marker = `export const ${exportName} =`;
  const start = normalized.indexOf(marker);
  if (start < 0) throw new Error(`Export ${exportName} introuvable`);

  let i = start + marker.length;
  while (normalized[i] === ' ') i += 1;
  if (normalized[i] !== '[') throw new Error(`Export ${exportName} n'est pas un tableau`);

  let depth = 0;
  let inString = false;
  let quote = '';

  for (; i < normalized.length; i += 1) {
    const ch = normalized[i];
    const prev = normalized[i - 1];

    if (inString) {
      if (ch === quote && prev !== '\\') inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        return normalized.slice(normalized.indexOf('[', start), i + 1);
      }
    }
  }

  throw new Error(`Fin de tableau introuvable pour ${exportName}`);
}

function hotelToStay(h) {
  return {
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
  };
}

const hotelsSrc = fs.readFileSync(path.join(root, 'src/data/hotels.js'), 'utf8');
const hotelsLiteral = extractExportArray(hotelsSrc, 'HOTELS');
const HOTELS = new Function(`return ${hotelsLiteral}`)();

const { TAGHIT_PACKAGES } = require('./data/taghitPackages.cjs');
const guesthouse = {
  id: 'gh-taghit',
  type: 'guesthouse',
  placeId: 'taghit',
  name: TAGHIT_PACKAGES.guesthouse.title,
  name_en: TAGHIT_PACKAGES.guesthouse.title_en,
  name_ar: TAGHIT_PACKAGES.guesthouse.title_ar,
  location: 'Taghit, Béchar',
  location_en: 'Taghit, Béchar',
  location_ar: 'تاغيت، بشار',
  desc: `${TAGHIT_PACKAGES.guesthouse.includes.map((i) => i.fr).join('. ')}.`,
  desc_en: `${TAGHIT_PACKAGES.guesthouse.includes.map((i) => i.en).join('. ')}.`,
  desc_ar: `${TAGHIT_PACKAGES.guesthouse.includes.map((i) => i.ar).join('. ')}.`,
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
  published: true,
};

const STAYS = [...HOTELS.map(hotelToStay), guesthouse];

fs.writeFileSync(path.join(dir, 'stays.cjs'), `exports.STAYS = ${JSON.stringify(STAYS, null, 2)};\n`);
console.log(`[sync-stays] ${STAYS.length} hébergements → stays.cjs (${HOTELS.length} hôtels + 1 maison d'hôte)`);
