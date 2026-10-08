/**
 * Catalogue réel du site pour le chatbot : destinations, circuits, hébergements (et chambres), activités,
 * calendriers de réservation. Lu dans la base (Supabase) avec un cache court ; repli sur les données
 * statiques du projet si la base est injoignable. Aucune donnée n’est inventée : un champ absent reste vide.
 */
const { query } = require('../../config/db');
const { canonical, tokenize, fuzzyEqual, arabicStems, hasArabic } = require('./text');
const { siteDetailsFor, L } = require('./siteDetails');

const CACHE_MS = 2 * 60 * 1000;

/** Noms courants, abréviations et graphies arabes des destinations (normalisés). */
const PLACE_ALIASES = {
  bejaia: ['bejaia', 'bejaya', 'bejaa', 'bougie', 'bgayet', 'vgayet', 'بجايه'],
  djanet: ['djanet', 'janet', 'jannet', 'جانت'],
  tadrart: ['tadrart', 'tadrarte', 'tadrart rouge', 'تادرارت', 'تادرارت الحمراء'],
  taghit: ['taghit', 'tagit', 'taghite', 'تاغيت'],
  timimoun: ['timimoun', 'timimoune', 'timimon', 'تيميمون'],
  ghardaia: ['ghardaia', 'gardaia', 'mzab', 'غردايه'],
  hoggar: ['hoggar', 'ahaggar', 'tamanrasset', 'assekrem', 'الهقار', 'تمنراست'],
  constantine: ['constantine', 'qacentina', 'ksentina', 'قسنطينه'],
  alger: ['alger', 'algiers', 'dzair', 'العاصمه'],
  oran: ['oran', 'wahran', 'وهران'],
  jijel: ['jijel', 'جيجل'],
  annaba: ['annaba', 'عنابه'],
  tipaza: ['tipaza', 'tipasa', 'تيبازه'],
  tlemcen: ['tlemcen', 'تلمسان'],
  bechar: ['bechar', 'بشار'],
  illizi: ['illizi', 'اليزي'],
};

/** Destination « parente » (pour regrouper les offres d’une région). */
const REGION = { tadrart: 'djanet' };

/** Circuits d’origine sans place_slug (même table que client/js/data/placeRoutes.js). */
const TOUR_TO_PLACE = { 1: 'timimoun', 2: 'djanet', 3: 'ghardaia', 4: 'bejaia', 5: 'hoggar', 6: 'constantine', 7: 'taghit', 8: 'taghit', 9: 'taghit', 10: 'tadrart' };

const PKG_ALIASES = {
  hotel: ['taghit hotel', 'hotel taghit', 'taghit 4 etoiles', 'formule hotel'],
  guesthouse: ['taghit maison dhote', 'formule maison dhote', 'بيت ضيافه'],
  brezina: ['brezina', 'brizina', 'taghit via brezina', 'taghit brezina', 'بريزينه', 'بريزينا'],
};

/** Appellations courantes des circuits d’origine (par id). */
const TOUR_ALIASES = {
  2: ['tassili', 'tassili najjer', 'tassili n ajjer', 'tasili', 'تاسيلي', 'الطاسيلي', 'طاسيلي'],
};

const ACTIVITY_ALIASES = {
  quad: ['quad', 'kwad', 'كواد'],
  '4x4': ['4x4', '4 x 4', '4*4', 'dune bashing', 'دفع رباعي'],
  camel: ['chameau', 'chameaux', 'dromadaire', 'camel', 'jmel', 'جمل', 'الجمل'],
  kayak: ['kayak', 'canoe', 'كاياك'],
  ksars: ['ksour', 'ksar', 'ksars', 'قصور'],
};

const STAY_TYPE_LABEL = {
  hotel: L('Hôtel', 'Hotel', 'فندق'),
  guesthouse: L('Maison d’hôte', 'Guesthouse', 'بيت ضيافة'),
  apartment: L('Appartement', 'Apartment', 'شقة'),
  villa: L('Villa', 'Villa', 'فيلا'),
  residence: L('Résidence', 'Residence', 'إقامة'),
  other: L('Hébergement', 'Accommodation', 'إقامة'),
};

const asList = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};
const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
const txt = (fr, en, ar) => (fr || en || ar ? L(fr || en || ar, en, ar) : null);
const i18nItems = (list) =>
  asList(list)
    .map((i) => (typeof i === 'string' ? L(i) : i && (i.fr || i.en) ? L(i.fr || i.en, i.en, i.ar) : null))
    .filter(Boolean);
/** Complète les traductions absentes d’un texte (a) avec celles d’une autre source (b). */
const mergeL = (a, b) => {
  if (!a) return b || null;
  if (!b) return a;
  return { fr: a.fr || b.fr, en: a.en && a.en !== a.fr ? a.en : b.en, ar: a.ar && a.ar !== a.fr ? a.ar : b.ar };
};
const todayIso = () => new Date().toISOString().slice(0, 10);

function aliasesOf(...names) {
  const out = new Set();
  for (const n of names.flat()) {
    const a = canonical(n || '');
    if (a && a.length >= 2) out.add(a);
  }
  return [...out];
}

/* ── Construction des éléments ── */

function buildPlace(row) {
  const id = String(row.id);
  return {
    kind: 'place',
    id,
    key: `place:${id}`,
    name: L(row.name, row.name_en, row.name_ar),
    aliases: aliasesOf(id, row.name, row.name_en, row.name_ar, PLACE_ALIASES[id] || []),
    placeId: id,
    region: REGION[id] || null,
    price: num(row.price),
    priceOnRequest: false,
    perPerson: id === 'taghit' || Boolean(row.price_per_person),
    duration: txt(row.duration, row.duration_en, row.duration_ar),
    bestTime: txt(row.best_time ?? row.bestTime, row.best_time_en ?? row.bestTime_en, row.best_time_ar ?? row.bestTime_ar),
    description: txt(row.description, row.description_en, row.description_ar),
    includes: i18nItems(row.includes),
    transport: txt(row.transport, row.transport_en, row.transport_ar),
    stay: txt(row.stay, row.stay_en, row.stay_ar),
    bookingOpen: row.booking_open ?? row.bookingOpen ?? null,
    url: `/place/${id}`,
  };
}

function buildTour(row) {
  const id = String(row.id);
  const placeSlug = row.place_slug || row.placeSlug || TOUR_TO_PLACE[Number(id)] || null;
  const pkg = row.pkg || null;
  const extra = siteDetailsFor(placeSlug, pkg) || {};
  const price = num(row.price);
  const parts = String(row.name || '').split(/\s+[—–-]\s+/).filter((p) => p.length >= 5);
  const placeAliasSet = new Set(aliasesOf(Object.values(PLACE_ALIASES).flat()));
  const generic = /^(hotel|maison|circuit|voyage|sejour|formule|le|la)\b/;
  return {
    kind: 'tour',
    id,
    key: `tour:${id}`,
    name: L(row.name, row.name_en, row.name_ar),
    aliases: [
      ...aliasesOf(row.name, row.name_en, row.name_ar).filter((a) => !placeAliasSet.has(a)),
      ...aliasesOf(parts).filter((a) => !placeAliasSet.has(a) && !generic.test(a)),
      ...aliasesOf(PKG_ALIASES[pkg] || []),
      ...aliasesOf(TOUR_ALIASES[id] || []),
    ],
    placeId: placeSlug,
    pkg,
    price: price || null,
    priceOnRequest: !price,
    perPerson: extra.perPerson ?? true,
    duration: mergeL(txt(row.duration, row.duration_en, row.duration_ar), extra.duration),
    bestTime: txt(row.best_time ?? row.bestTime, row.best_time_en, row.best_time_ar),
    dates: extra.dates || null,
    description: txt(row.description || row.full_description, row.description_en, null) || txt(row.subtitle, row.subtitle_en, row.subtitle_ar) || extra.description || null,
    includes: extra.includes || [],
    itinerary: asList(row.itinerary).map((d) => ({ day: d.day, title: L(d.title, d.title_en), desc: L(d.desc, d.desc_en) })),
    transport: extra.transport || null,
    stay: extra.stay || null,
    bookingOpen: row.booking_open ?? row.bookingOpen ?? null,
    url: pkg === 'guesthouse' ? '/guesthouses' : placeSlug ? `/place/${placeSlug}${pkg ? `?pkg=${pkg}` : ''}` : '/tours',
  };
}

function buildStay(row, rooms = []) {
  const id = String(row.id);
  const type = String(row.type || 'other').toLowerCase();
  const amenities = row.amenities && typeof row.amenities === 'object' && !Array.isArray(row.amenities) ? row.amenities : {};
  return {
    kind: 'stay',
    id,
    key: `stay:${id}`,
    name: L(row.name, row.name_en, row.name_ar),
    aliases: aliasesOf(row.name, row.name_en, row.name_ar),
    placeId: row.place_id || row.placeId || row.wilaya_key || null,
    city: txt(row.city || row.location, row.location_en, row.location_ar),
    stayType: type,
    typeLabel: STAY_TYPE_LABEL[type] || STAY_TYPE_LABEL.other,
    price: num(row.price),
    priceOnRequest: !num(row.price),
    perPerson: Boolean(row.price_per_person ?? row.pricePerPerson),
    stars: num(row.stars),
    description: txt(row.short_desc || row.desc, row.desc_en, row.desc_ar),
    amenities: L((amenities.fr || []).join(', '), (amenities.en || []).join(', '), (amenities.ar || []).join('، ')),
    maxGuests: num(row.max_guests),
    rooms,
    bookingOpen: (row.availability || 'available') !== 'full',
    url: type === 'guesthouse' ? '/guesthouses' : '/hotels',
  };
}

function buildActivity(row) {
  const id = String(row.id);
  return {
    kind: 'activity',
    id,
    key: `activity:${id}`,
    name: L(row.name, row.name_en || row.nameEn, row.name_ar || row.nameAr),
    aliases: aliasesOf(id, row.name, row.name_en, row.name_ar, ACTIVITY_ALIASES[id] || []),
    places: asList(row.places).map(String),
    price: num(row.price),
    priceOnRequest: !num(row.price),
    perPerson: true,
    duration: txt(row.duration || row.duration_short, row.duration_en, row.duration_ar),
    bestTime: txt(row.dates, row.dates_en, row.dates_ar),
    description: txt(row.desc, row.desc_en, row.desc_ar),
    includes: i18nItems(row.included),
    location: txt(row.location, row.location_en, row.location_ar),
    url: `/activity/${id}`,
  };
}

const isTestRow = (row) => /^test/i.test(String(row.id)) || /^test\d*$/i.test(String(row.name || '').trim());

/* ── Chargement ── */

async function safeRows(sql, params = []) {
  try {
    return (await query(sql, params)).rows;
  } catch (err) {
    console.warn('[Chatbot] catalogue :', err.message);
    return null;
  }
}

function staticCatalog() {
  const { PLACES } = require('../../scripts/data/places.cjs');
  const { TAGHIT_PLACE } = require('../../scripts/data/taghitPackages.cjs');
  const { FEATURED_TOURS } = require('../../scripts/data/tours.cjs');
  const { ACTIVITIES } = require('../../scripts/data/activities.cjs');
  const { STAYS } = require('../../scripts/data/stays.cjs');
  const places = [...PLACES.filter((p) => p.id !== 'taghit'), { ...TAGHIT_PLACE, price: 75000 }].map((p) =>
    buildPlace({ ...p, booking_open: p.id === 'taghit' ? true : p.bookingOpen ?? null })
  );
  return {
    places,
    tours: FEATURED_TOURS.map(buildTour),
    stays: STAYS.filter((s) => s.published !== false).map((s) => buildStay(s)),
    activities: ACTIVITIES.map(buildActivity),
    calendars: new Map(),
    source: 'static',
  };
}

async function loadFromDb() {
  const [places, tours, stays, rooms, activities, calendars] = await Promise.all([
    safeRows('select * from public.places where coalesce(published, true) = true'),
    safeRows('select * from public.tours where coalesce(published, true) = true order by id'),
    safeRows(
      `select s.* from public.stays s
       where coalesce(s.published, true) = true and coalesce(s.status, 'active') = 'active' and s.deleted_at is null`
    ),
    safeRows(
      `select r.*, (select min(rp.price) from public.rate_plans rp
         where rp.room_type_id = r.id and rp.status = 'active' and rp.deleted_at is null) as min_rate
       from public.room_types r where r.status = 'active' and r.deleted_at is null order by r.sort_order, r.base_price`
    ),
    safeRows('select * from public.activities where coalesce(published, true) = true'),
    safeRows('select * from public.booking_calendars'),
  ]);
  if (!places || !tours) return null;

  const roomsByStay = new Map();
  for (const r of rooms || []) {
    if (!roomsByStay.has(r.property_id)) roomsByStay.set(r.property_id, []);
    roomsByStay.get(r.property_id).push({
      id: r.id,
      name: r.name,
      capacity: Number(r.capacity_adults) || null,
      children: Number(r.capacity_children) || 0,
      totalRooms: Number(r.total_rooms) || 0,
      price: Math.min(...[r.base_price, r.min_rate].filter((v) => v != null).map(Number)),
      raw: r,
    });
  }

  return {
    places: places.map(buildPlace),
    tours: tours.map(buildTour),
    stays: (stays || []).map((s) => buildStay(s, roomsByStay.get(s.id) || [])),
    activities: (activities || []).filter((a) => !isTestRow(a)).map(buildActivity),
    calendars: new Map((calendars || []).map((c) => [c.key, { mode: c.mode, periods: asList(c.periods), blocked: asList(c.blocked) }])),
    source: 'db',
  };
}

let cache = null;
let cacheAt = 0;
let loading = null;

async function getCatalog() {
  if (cache && Date.now() - cacheAt < CACHE_MS) return cache;
  if (!loading) {
    loading = (async () => {
      let data = process.env.DATABASE_URL ? await loadFromDb().catch(() => null) : null;
      if (!data) data = staticCatalog();
      data.all = [...data.places, ...data.tours, ...data.stays, ...data.activities];
      data.byKey = new Map(data.all.map((i) => [i.key, i]));
      cache = data;
      cacheAt = Date.now();
      return data;
    })().finally(() => {
      loading = null;
    });
  }
  return loading;
}

function invalidateCatalog() {
  cacheAt = 0;
}

/* ── Recherche d’entités dans un message ── */

function tokensMatch(msgToken, aliasToken) {
  if (msgToken === aliasToken) return 'exact';
  if (hasArabic(msgToken) || hasArabic(aliasToken)) {
    return arabicStems(msgToken).some((s) => arabicStems(aliasToken).includes(s)) ? 'exact' : null;
  }
  return fuzzyEqual(msgToken, aliasToken) ? 'fuzzy' : null;
}

/**
 * Éléments du catalogue cités dans le message, du plus précis au moins précis.
 * @returns {Array<{ item, score, exact }>}
 */
function findEntities(catalog, text) {
  const tokens = tokenize(canonical(text));
  const found = new Map();
  for (const item of catalog.all) {
    for (const alias of item.aliases) {
      const aTokens = tokenize(alias);
      if (!aTokens.length || aTokens.length > tokens.length) continue;
      if (aTokens.length === 1 && aTokens[0].length < 3 && !/\d/.test(aTokens[0])) continue;
      for (let i = 0; i + aTokens.length <= tokens.length; i += 1) {
        let fuzzy = 0;
        let ok = true;
        for (let j = 0; j < aTokens.length; j += 1) {
          const m = tokensMatch(tokens[i + j], aTokens[j]);
          if (!m) {
            ok = false;
            break;
          }
          if (m === 'fuzzy') fuzzy += 1;
        }
        if (!ok) continue;
        const score = aTokens.length * 10 - fuzzy * 3 + (item.kind === 'tour' ? 1 : 0);
        const prev = found.get(item.key);
        if (!prev || prev.score < score) found.set(item.key, { item, score, exact: fuzzy === 0 });
      }
    }
  }
  return [...found.values()].sort((a, b) => b.score - a.score);
}

/* ── Relations & disponibilités ── */

const placeOf = (catalog, id) => catalog.places.find((p) => p.id === id) || null;

/** Offres liées à une destination (elle-même et ses sous-régions, ex. Djanet → Tadrart). */
function offersFor(catalog, placeId) {
  const ids = new Set([placeId, ...catalog.places.filter((p) => p.region === placeId).map((p) => p.id)]);
  return {
    tours: catalog.tours.filter((t) => ids.has(t.placeId)),
    stays: catalog.stays.filter((s) => ids.has(s.placeId)),
    activities: catalog.activities.filter((a) => a.places.some((p) => ids.has(p))),
  };
}

/** Calendrier fixé par l’admin pour un élément (formule puis destination), limité aux dates à venir. */
function calendarFor(catalog, item) {
  if (!item) return null;
  const placeId = item.placeId || (item.kind === 'place' ? item.id : null);
  if (!placeId) return null;
  const keys = item.pkg ? [`${placeId}:${item.pkg}`, placeId] : [placeId];
  const key = keys.find((k) => catalog.calendars.has(k));
  if (!key) return null;
  const cal = catalog.calendars.get(key);
  const today = todayIso();
  return {
    mode: cal.mode,
    periods: cal.periods.filter((p) => p.start >= today),
    blocked: cal.blocked.filter((p) => p.end >= today),
  };
}

/** Réservations ouvertes ? (destination + circuit). null = information inconnue. */
function bookingOpenFor(catalog, item) {
  if (!item) return null;
  if (item.kind === 'stay') return item.bookingOpen;
  if (item.kind === 'activity') return null;
  const place = placeOf(catalog, item.placeId || item.id);
  if (item.kind === 'tour' && item.bookingOpen === false) return false;
  if (place && place.bookingOpen === false) return false;
  if (place?.bookingOpen === true || item.bookingOpen === true) return true;
  return null;
}

/** Chambres libres d’un hébergement sur une période (stock géré par les propriétaires). */
async function roomAvailability(stay, checkIn, checkOut) {
  if (!stay?.rooms?.length || !checkIn) return null;
  const A = require('../accommodation');
  const to = checkOut && checkOut > checkIn ? A.addDays(checkOut, -1) : checkIn;
  const out = [];
  for (const room of stay.rooms) {
    try {
      const days = await A.getCalendar(room.raw, checkIn, to);
      const free = Math.min(...days.map((d) => (d.status === 'AVAILABLE' ? d.availableQuantity : 0)));
      out.push({ room, free: Number.isFinite(free) ? free : 0 });
    } catch (err) {
      console.warn('[Chatbot] disponibilité chambre :', err.message);
      return null;
    }
  }
  return out;
}

module.exports = {
  getCatalog,
  invalidateCatalog,
  findEntities,
  offersFor,
  placeOf,
  calendarFor,
  bookingOpenFor,
  roomAvailability,
  PLACE_ALIASES,
};
