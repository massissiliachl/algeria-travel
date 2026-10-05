/**
 * Tests de bout en bout : propriétaires, biens, chambres, tarifs, disponibilités, réservations, sécurité.
 * Usage : node scripts/test-owners.js [http://localhost:5055]
 * Les données créées sont supprimées à la fin.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { query, closePool } = require('../config/db');

const BASE = (process.argv[2] || `http://localhost:${process.env.PORT || 5000}`) + '/api';
const ADMIN = { 'x-admin-key': process.env.ADMIN_API_KEY };
const stamp = Date.now().toString(36);
const created = { owners: [], properties: [] };
let passed = 0;
let failed = 0;

async function call(method, path, { body, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data };
}

function check(label, condition, info) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.log(`  ✗ ${label}`, info !== undefined ? JSON.stringify(info).slice(0, 300) : '');
  }
}

const bearer = (token) => ({ Authorization: `Bearer ${token}` });
const day = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

async function main() {
  console.log(`API : ${BASE}\n`);

  console.log('Admin — propriétaires');
  const ownerBody = (n) => ({
    firstName: `Test${n}`,
    lastName: 'Proprio',
    email: `test-owner-${n}-${stamp}@example.com`,
    phone: '0555 12 34 56',
    password: 'Secret123',
    confirmPassword: 'Secret123',
  });
  check('route admin sans clé = 401', (await call('GET', '/admin/owners')).status === 401);
  let r = await call('POST', '/admin/owners', { body: ownerBody('a'), headers: ADMIN });
  check('créer propriétaire A', r.status === 201 && r.data.success, r.data);
  const ownerA = r.data.data;
  created.owners.push(ownerA.id);
  check('passwordHash jamais renvoyé', !JSON.stringify(r.data).includes('password'));
  r = await call('POST', '/admin/owners', { body: ownerBody('b'), headers: ADMIN });
  const ownerB = r.data.data;
  created.owners.push(ownerB.id);
  check('créer propriétaire B', r.status === 201);
  r = await call('POST', '/admin/owners', { body: ownerBody('a'), headers: ADMIN });
  check('email unique (409)', r.status === 409, r.data);
  r = await call('POST', '/admin/owners', { body: { ...ownerBody('c'), password: 'abc' }, headers: ADMIN });
  check('mot de passe faible refusé (400)', r.status === 400, r.data);
  r = await call('POST', '/admin/owners', { body: { ...ownerBody('d'), email: 'pas-un-email' }, headers: ADMIN });
  check('email invalide refusé (400)', r.status === 400, r.data);
  r = await call('PUT', `/admin/owners/${ownerA.id}`, { body: { phone: '0666 00 00 00', whatsapp: '0666 00 00 01' }, headers: ADMIN });
  check('modifier propriétaire', r.status === 200 && r.data.data.phone === '0666 00 00 00', r.data);
  r = await call('GET', `/admin/owners?q=test-owner-a-${stamp}`, { headers: ADMIN });
  check('recherche propriétaire + pagination', r.status === 200 && r.data.data.length === 1 && r.data.pagination.total === 1, r.data);

  console.log('\nPropriétaire — connexion');
  r = await call('POST', '/owner/login', { body: { email: ownerBody('a').email, password: 'mauvais' } });
  check('mauvais mot de passe = 401', r.status === 401);
  r = await call('POST', '/owner/login', { body: { email: ownerBody('a').email, password: 'Secret123' } });
  check('login A', r.status === 200 && r.data.data.token, r.data);
  const tokenA = r.data.data.token;
  r = await call('POST', '/owner/login', { body: { email: ownerBody('b').email, password: 'Secret123' } });
  const tokenB = r.data.data.token;
  check('login B', Boolean(tokenB));
  r = await call('GET', '/owner/me', { headers: bearer(tokenA) });
  check('GET /owner/me', r.status === 200 && r.data.data.email === ownerBody('a').email, r.data);
  r = await call('GET', '/admin/owners', { headers: bearer(tokenA) });
  check('Owner → route admin = refusé', r.status === 401 || r.status === 403, r.status);
  r = await call('GET', '/owner/properties');
  check('route owner sans jeton = 401', r.status === 401);

  console.log('\nPropriétaire — biens');
  const propBody = {
    name: `Hôtel Test ${stamp}`,
    propertyType: 'HOTEL',
    description: 'Hôtel de test automatisé.',
    address: '1 rue du Test',
    city: 'Béjaïa',
    wilaya: 'Béjaïa',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: ['wifi', 'parking', 'sea_view'],
    images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    ownerId: ownerB.id,
  };
  r = await call('POST', '/owner/properties', { body: propBody, headers: bearer(tokenA) });
  check('A crée un hôtel', r.status === 201, r.data);
  const propA = r.data.data;
  created.properties.push(propA.id);
  check('ownerId du corps ignoré (bien attribué à A)', propA.ownerId === ownerA.id, propA.ownerId);
  check('équipements + photos enregistrés', propA.amenities.length === 3 && propA.images.length === 2 && propA.images[0].isPrimary);
  r = await call('POST', '/owner/properties', {
    body: { ...propBody, name: `Appartement Test ${stamp}`, propertyType: 'APARTMENT', maxGuests: 4, beds: 2, basePrice: 9000, images: [] },
    headers: bearer(tokenB),
  });
  check('B crée un appartement (unité créée automatiquement)', r.status === 201 && r.data.data.rooms.length === 1, r.data);
  const propB = r.data.data;
  created.properties.push(propB.id);
  r = await call('POST', '/owner/properties', { body: { ...propBody, name: '' }, headers: bearer(tokenA) });
  check('champ obligatoire manquant = 400', r.status === 400 && r.data.success === false, r.data);
  r = await call('PUT', `/owner/properties/${propA.id}`, { body: { shortDescription: 'Vue mer', featured: true }, headers: bearer(tokenA) });
  check('A modifie son bien', r.status === 200 && r.data.data.shortDescription === 'Vue mer' && r.data.data.featured === false, r.data);
  r = await call('GET', '/owner/properties', { headers: bearer(tokenA) });
  check('A ne voit que ses biens', r.data.data.every((p) => p.ownerId === ownerA.id) && r.data.data.some((p) => p.id === propA.id), r.data);

  console.log('\nSécurité A / B');
  check('Owner A → Property A = OK', (await call('GET', `/owner/properties/${propA.id}`, { headers: bearer(tokenA) })).status === 200);
  check('Owner A → Property B = 403', (await call('GET', `/owner/properties/${propB.id}`, { headers: bearer(tokenA) })).status === 403);
  check('Owner B → Property A = 403', (await call('GET', `/owner/properties/${propA.id}`, { headers: bearer(tokenB) })).status === 403);
  check('B ne peut pas modifier A (403)', (await call('PUT', `/owner/properties/${propA.id}`, { body: { name: 'pirate' }, headers: bearer(tokenB) })).status === 403);
  check('B ne peut pas supprimer A (403)', (await call('DELETE', `/owner/properties/${propA.id}`, { headers: bearer(tokenB) })).status === 403);
  check('B ne peut pas créer de chambre chez A (403)', (await call('POST', `/owner/properties/${propA.id}/rooms`, { body: { name: 'x', capacityAdults: 2, totalRooms: 1, basePrice: 1 }, headers: bearer(tokenB) })).status === 403);

  console.log('\nChambres');
  r = await call('POST', `/owner/properties/${propA.id}/rooms`, {
    body: { name: 'Chambre Double', capacityAdults: 2, capacityChildren: 1, totalRooms: 10, beds: 1, bedType: 'Lit double', sizeM2: 25, view: 'Mer', basePrice: 15000, amenities: ['tv', 'ac'] },
    headers: bearer(tokenA),
  });
  check('créer type de chambre', r.status === 201 && r.data.data.totalRooms === 10, r.data);
  const room = r.data.data;
  r = await call('POST', `/owner/properties/${propA.id}/rooms`, { body: { name: 'X', capacityAdults: 0, totalRooms: 1, basePrice: 10 }, headers: bearer(tokenA) });
  check('capacité 0 refusée', r.status === 400);
  r = await call('POST', `/owner/properties/${propA.id}/rooms`, { body: { name: 'X', capacityAdults: 2, totalRooms: 1, basePrice: -5 }, headers: bearer(tokenA) });
  check('prix négatif refusé', r.status === 400);
  r = await call('PUT', `/owner/rooms/${room.id}`, { body: { basePrice: 16000 }, headers: bearer(tokenA) });
  check('modifier chambre', r.status === 200 && r.data.data.basePrice === 16000, r.data);
  check('B → chambre de A = 403', (await call('PUT', `/owner/rooms/${room.id}`, { body: { basePrice: 1 }, headers: bearer(tokenB) })).status === 403);

  console.log('\nTarifs');
  r = await call('POST', `/owner/rooms/${room.id}/rates`, { body: { name: 'Petit-déjeuner inclus', price: 18000, mealPlan: 'BREAKFAST' }, headers: bearer(tokenA) });
  check('créer tarif', r.status === 201 && r.data.data.currency === 'DZD', r.data);
  const rate = r.data.data;
  r = await call('PUT', `/owner/rates/${rate.id}`, { body: { price: 19000 }, headers: bearer(tokenA) });
  check('modifier tarif', r.status === 200 && r.data.data.price === 19000, r.data);
  check('B → tarif de A = 403', (await call('PUT', `/owner/rates/${rate.id}`, { body: { price: 1 }, headers: bearer(tokenB) })).status === 403);
  r = await call('POST', `/owner/rooms/${room.id}/seasonal-rates`, { body: { label: 'Été', startDate: day(30), endDate: day(40), price: 22000 }, headers: bearer(tokenA) });
  check('tarif saisonnier', r.status === 201, r.data);
  r = await call('POST', `/owner/rooms/${room.id}/seasonal-rates`, { body: { startDate: day(40), endDate: day(30), price: 1 }, headers: bearer(tokenA) });
  check('début > fin refusé', r.status === 400);

  console.log('\nDisponibilités');
  r = await call('POST', `/owner/rooms/${room.id}/availability`, { body: { date: day(10), availableQuantity: 7 }, headers: bearer(tokenA) });
  check('créer disponibilité (7)', r.status === 200 && r.data.data.availableQuantity === 7, r.data);
  const availId = r.data.data.id;
  r = await call('POST', `/owner/rooms/${room.id}/availability`, { body: { date: day(10), availableQuantity: 11 }, headers: bearer(tokenA) });
  check('quantité > total refusée', r.status === 400, r.data);
  r = await call('PATCH', `/owner/availability/${availId}/status`, { body: { status: 'UNAVAILABLE' }, headers: bearer(tokenA) });
  check('bloquer une date', r.status === 200 && r.data.data.status === 'UNAVAILABLE', r.data);
  r = await call('PATCH', `/owner/availability/${availId}/status`, { body: { status: 'AVAILABLE' }, headers: bearer(tokenA) });
  check('ouvrir une date', r.status === 200 && r.data.data.status === 'AVAILABLE');
  check('B → disponibilité de A = 403', (await call('PATCH', `/owner/availability/${availId}/status`, { body: { status: 'UNAVAILABLE' }, headers: bearer(tokenB) })).status === 403);
  r = await call('POST', `/owner/rooms/${room.id}/availability/bulk`, { body: { startDate: day(20), endDate: day(22), status: 'UNAVAILABLE' }, headers: bearer(tokenA) });
  check('bloquer une période (3 jours)', r.status === 200 && r.data.data.updated === 3, r.data);
  r = await call('POST', `/owner/rooms/${room.id}/availability/bulk`, { body: { startDate: day(12), endDate: day(14), availableQuantity: 5, priceOverride: 20000 }, headers: bearer(tokenA) });
  check('période : quantité 5 + prix 20 000', r.status === 200 && r.data.data.updated === 3, r.data);
  r = await call('GET', `/owner/rooms/${room.id}/availability?from=${day(9)}&to=${day(23)}`, { headers: bearer(tokenA) });
  const cal = r.data?.data?.days || [];
  check('calendrier', r.status === 200 && cal.length === 15, r.data);
  check('calendrier : jour bloqué', cal.find((d) => d.date === day(21))?.status === 'UNAVAILABLE');
  check('calendrier : bloquées = total - dispo', cal.find((d) => d.date === day(10))?.blockedQuantity === 3, cal.find((d) => d.date === day(10)));

  console.log('\nRéservation publique');
  r = await call('GET', '/accommodations?owned=true&limit=100');
  check('liste publique contient le bien actif', r.status === 200 && r.data.data.some((p) => p.id === propA.id), r.data);
  check('pas de données privées (email/téléphone/ownerId)', r.data.data.every((p) => !('ownerId' in p) && !('email' in p) && !('phone' in p)));
  r = await call('GET', `/accommodations/${propA.id}`);
  check('fiche publique avec chambres et tarifs', r.status === 200 && r.data.data.rooms[0].rates.length === 1, r.data);
  const resBody = { propertyId: propA.id, roomTypeId: room.id, ratePlanId: rate.id, checkIn: day(12), checkOut: day(14), rooms: 2, adults: 3, name: 'Client Test', email: 'client-test@example.com', phone: '0555 00 00 00', gdprConsent: true };
  r = await call('POST', '/accommodations/reservations', { body: resBody });
  check('réserver 2 chambres', r.status === 201 && r.data.data.priceEstimate === 80000, r.data);
  r = await call('GET', `/owner/rooms/${room.id}/availability?from=${day(12)}&to=${day(13)}`, { headers: bearer(tokenA) });
  check('stock décrémenté 5 → 3', r.data.data.days.every((d) => d.availableQuantity === 3 && d.bookedQuantity === 2), r.data.data.days);
  r = await call('POST', '/accommodations/reservations', { body: { ...resBody, rooms: 4, adults: 2 } });
  check('surréservation refusée (409)', r.status === 409, r.data);
  r = await call('POST', '/accommodations/reservations', { body: { ...resBody, checkIn: day(20), checkOut: day(21), rooms: 1, adults: 1 } });
  check('date bloquée refusée (409)', r.status === 409, r.data);
  r = await call('POST', '/accommodations/reservations', { body: { ...resBody, rooms: 1, adults: 5 } });
  check('capacité dépassée refusée', r.status === 400, r.data);

  r = await call('GET', '/owner/reservations', { headers: bearer(tokenA) });
  check('A voit sa réservation', r.status === 200 && r.data.data.length === 1, r.data);
  const reservation = r.data.data[0];
  r = await call('GET', '/owner/reservations', { headers: bearer(tokenB) });
  check('B ne voit pas la réservation de A', r.data.data.every((x) => x.id !== reservation.id));
  check('B → réservation de A = 404', (await call('GET', `/owner/reservations/${reservation.id}`, { headers: bearer(tokenB) })).status === 404);
  r = await call('PATCH', `/owner/reservations/${reservation.id}/status`, { body: { status: 'cancelled' }, headers: bearer(tokenA) });
  check('annulation', r.status === 200 && r.data.data.status === 'cancelled', r.data);
  r = await call('GET', `/owner/rooms/${room.id}/availability?from=${day(12)}&to=${day(13)}`, { headers: bearer(tokenA) });
  check('stock rendu après annulation (5)', r.data.data.days.every((d) => d.availableQuantity === 5 && d.bookedQuantity === 0), r.data.data.days);

  console.log('\nDésactivations en cascade');
  r = await call('PATCH', `/owner/rooms/${room.id}/status`, { body: { status: 'inactive' }, headers: bearer(tokenA) });
  check('chambre désactivée', r.data.data.status === 'inactive');
  check('chambre inactive non réservable', (await call('POST', '/accommodations/reservations', { body: { ...resBody, rooms: 1, adults: 1 } })).status === 404);
  await call('PATCH', `/owner/rooms/${room.id}/status`, { body: { status: 'active' }, headers: bearer(tokenA) });
  r = await call('PATCH', `/admin/owners/${ownerA.id}/status`, { body: { status: 'inactive' }, headers: ADMIN });
  check('admin désactive A', r.status === 200 && r.data.data.status === 'inactive', r.data);
  check('A désactivé : accès refusé (403)', (await call('GET', '/owner/properties', { headers: bearer(tokenA) })).status === 403);
  check('A désactivé : bien invisible au public', (await call('GET', `/accommodations/${propA.id}`)).status === 404);
  check('A désactivé : /api/stays ne le liste plus', !((await call('GET', '/stays')).data || []).some((s) => s.id === propA.id));
  r = await call('PATCH', `/admin/owners/${ownerA.id}/status`, { body: { status: 'active' }, headers: ADMIN });
  check('admin réactive A', r.data.data.status === 'active');
  r = await call('POST', `/admin/owners/${ownerA.id}/reset-password`, { body: { password: 'Nouveau456' }, headers: ADMIN });
  check('réinitialiser mot de passe', r.status === 200);
  check('login avec nouveau mot de passe', (await call('POST', '/owner/login', { body: { email: ownerBody('a').email, password: 'Nouveau456' } })).status === 200);

  console.log('\nAdmin — vue globale');
  r = await call('GET', `/admin/accommodation/properties?ownerId=${ownerA.id}`, { headers: ADMIN });
  check('admin voit les biens de A', r.status === 200 && r.data.data.some((p) => p.id === propA.id), r.data);
  r = await call('GET', '/admin/accommodation/rooms', { headers: ADMIN });
  check('admin voit toutes les chambres', r.status === 200 && r.data.data.some((x) => x.id === room.id));
  r = await call('PUT', `/admin/accommodation/rates/${rate.id}`, { body: { price: 17500 }, headers: ADMIN });
  check('admin modifie un tarif', r.status === 200 && r.data.data.price === 17500, r.data);
  r = await call('GET', `/admin/owners/${ownerA.id}`, { headers: ADMIN });
  check('détail propriétaire (biens + stats)', r.status === 200 && r.data.data.properties.length === 1, r.data);
  r = await call('GET', '/owner/dashboard', { headers: bearer((await call('POST', '/owner/login', { body: { email: ownerBody('a').email, password: 'Nouveau456' } })).data.data.token) });
  check('dashboard propriétaire', r.status === 200 && r.data.data.properties.total === 1 && r.data.data.rooms.total === 10, r.data);
  r = await call('DELETE', `/admin/owners/${ownerB.id}`, { headers: ADMIN });
  check('suppression logique propriétaire B', r.status === 200);
  check('B supprimé : connexion impossible', (await call('POST', '/owner/login', { body: { email: ownerBody('b').email, password: 'Secret123' } })).status === 401);
}

async function cleanup() {
  if (created.properties.length) {
    await query('delete from public.reservations where property_id = any($1::text[])', [created.properties]);
    await query('delete from public.audit_logs where entity_id = any($1::text[])', [created.properties]);
    await query('delete from public.stays where id = any($1::text[])', [created.properties]);
  }
  if (created.owners.length) {
    await query('delete from public.audit_logs where entity_id = any($1::text[]) or actor_id = any($1::text[])', [created.owners]);
    await query('delete from public.owners where id = any($1::uuid[])', [created.owners]);
  }
  await query("delete from public.audit_logs where action = 'reservation.create' and details->>'propertyId' like $1", [`%${stamp}%`]);
}

main()
  .catch((err) => {
    failed += 1;
    console.error('\nErreur :', err);
  })
  .finally(async () => {
    await cleanup().catch((err) => console.error('Nettoyage :', err.message));
    await closePool();
    console.log(`\n${passed} réussis, ${failed} échoués`);
    process.exit(failed ? 1 : 0);
  });
