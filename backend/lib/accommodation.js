/**
 * Hébergements : biens (table stays), types de chambre, tarifs, disponibilités.
 * Contrôle d'appartenance : un propriétaire n'accède qu'aux biens dont owner_id = req.owner.id.
 */
const { query } = require('../config/db');
const { fail, v } = require('./api');

const PROPERTY_TYPES = ['HOTEL', 'APARTMENT', 'VILLA', 'GUESTHOUSE', 'RESIDENCE', 'OTHER'];
const MEAL_PLANS = ['ROOM_ONLY', 'BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE'];
const MAX_RANGE_DAYS = 366;

const pad = (n) => String(n).padStart(2, '0');

/** pg renvoie les colonnes date en Date locale : on relit les composantes locales. */
function isoDate(d) {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  return Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86_400_000);
}

function dateRange(from, to) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

const todayIso = () => isoDate(new Date());

const num = (x) => (x == null ? null : Number(x));

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapOwner(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: row.address,
    status: row.status,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.property_count != null ? { propertyCount: Number(row.property_count) } : {}),
  };
}

function mapProperty(row, { privateFields = true } = {}) {
  if (!row) return null;
  const out = {
    id: row.id,
    slug: row.slug || row.id,
    name: row.name,
    propertyType: String(row.type || 'other').toUpperCase(),
    description: row.desc,
    shortDescription: row.short_desc,
    address: row.address,
    city: row.city || row.location,
    wilaya: row.wilaya,
    latitude: num(row.lat),
    longitude: num(row.lng),
    phone: row.phone,
    email: row.email,
    status: row.status,
    featured: row.featured,
    checkInTime: row.check_in,
    checkOutTime: row.check_out,
    maxGuests: row.max_guests,
    bedrooms: row.bedrooms,
    beds: row.beds,
    basePrice: row.price,
    image: row.image,
    rating: num(row.rating),
    placeId: row.place_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (row.room_count != null) out.roomCount = Number(row.room_count);
  if (row.room_type_count != null) out.roomTypeCount = Number(row.room_type_count);
  if (row.min_price != null) out.minPrice = Number(row.min_price);
  if (privateFields) {
    out.ownerId = row.owner_id;
    if (row.owner_first_name !== undefined) {
      out.owner = row.owner_id
        ? { id: row.owner_id, name: `${row.owner_first_name || ''} ${row.owner_last_name || ''}`.trim(), status: row.owner_status }
        : null;
    }
  } else {
    delete out.phone;
    delete out.email;
  }
  return out;
}

function mapImage(row) {
  return { id: row.id, propertyId: row.property_id, url: row.url, alt: row.alt, isPrimary: row.is_primary, sortOrder: row.sort_order, createdAt: row.created_at };
}

function mapRoom(row) {
  if (!row) return null;
  const out = {
    id: row.id,
    propertyId: row.property_id,
    name: row.name,
    description: row.description,
    capacityAdults: row.capacity_adults,
    capacityChildren: row.capacity_children,
    totalRooms: row.total_rooms,
    beds: row.beds,
    bedType: row.bed_type,
    sizeM2: num(row.size_m2),
    view: row.view,
    amenities: row.amenities || [],
    basePrice: row.base_price,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (row.available_today != null) out.availableRooms = Number(row.available_today);
  if (row.property_name !== undefined) out.propertyName = row.property_name;
  if (row.rate_count != null) out.rateCount = Number(row.rate_count);
  return out;
}

function mapRate(row) {
  return {
    id: row.id,
    roomTypeId: row.room_type_id,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    mealPlan: row.meal_plan,
    cancellationPolicy: row.cancellation_policy,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSeasonal(row) {
  return {
    id: row.id,
    roomTypeId: row.room_type_id,
    ratePlanId: row.rate_plan_id,
    label: row.label,
    startDate: isoDate(row.start_date),
    endDate: isoDate(row.end_date),
    price: row.price,
    status: row.status,
  };
}

function mapAvailability(row) {
  return {
    id: row.id,
    roomTypeId: row.room_type_id,
    date: isoDate(row.date),
    availableQuantity: row.available_quantity,
    bookedQuantity: row.booked_quantity,
    status: row.status,
    minimumStay: row.minimum_stay,
    maximumStay: row.maximum_stay,
    priceOverride: row.price_override,
    updatedAt: row.updated_at,
  };
}

function mapReservation(row) {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    propertyId: row.property_id,
    propertyName: row.property_name || null,
    roomTypeId: row.room_type_id,
    roomName: row.room_name || null,
    ratePlanId: row.rate_plan_id,
    ratePlanName: row.rate_plan_name || null,
    ownerId: row.owner_id,
    itemName: row.item_name,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    checkInDate: isoDate(row.check_in_date),
    checkOutDate: isoDate(row.check_out_date),
    roomsRequested: row.rooms_requested,
    travelers: row.travelers,
    message: row.message,
    priceEstimate: row.price_estimate,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Contrôle d'accès ───────────────────────────────────────────────────────

const isAdmin = (req) => req.actor?.type === 'admin';

function assertOwns(req, ownerId) {
  if (isAdmin(req)) return;
  if (!req.owner || ownerId !== req.owner.id) fail(403, 'Accès refusé : ce bien ne vous appartient pas.');
}

async function loadProperty(req, id) {
  const result = await query('select * from public.stays where id = $1 and deleted_at is null', [String(id || '')]);
  const row = result.rows[0];
  if (!row) fail(404, 'Bien introuvable.');
  assertOwns(req, row.owner_id);
  return row;
}

async function loadRoom(req, id) {
  v.uuid(id, 'Chambre');
  const result = await query(
    `select r.*, s.owner_id, s.name as property_name, s.type as property_type
     from public.room_types r join public.stays s on s.id = r.property_id
     where r.id = $1 and r.deleted_at is null and s.deleted_at is null`,
    [id]
  );
  const row = result.rows[0];
  if (!row) fail(404, 'Chambre introuvable.');
  assertOwns(req, row.owner_id);
  return row;
}

async function loadRate(req, id) {
  v.uuid(id, 'Tarif');
  const result = await query(
    `select rp.*, s.owner_id from public.rate_plans rp
     join public.room_types r on r.id = rp.room_type_id
     join public.stays s on s.id = r.property_id
     where rp.id = $1 and rp.deleted_at is null and r.deleted_at is null and s.deleted_at is null`,
    [id]
  );
  const row = result.rows[0];
  if (!row) fail(404, 'Tarif introuvable.');
  assertOwns(req, row.owner_id);
  return row;
}

async function loadSeasonal(req, id) {
  v.uuid(id, 'Tarif saisonnier');
  const result = await query(
    `select sr.*, s.owner_id from public.seasonal_rates sr
     join public.room_types r on r.id = sr.room_type_id
     join public.stays s on s.id = r.property_id
     where sr.id = $1 and r.deleted_at is null and s.deleted_at is null`,
    [id]
  );
  const row = result.rows[0];
  if (!row) fail(404, 'Tarif saisonnier introuvable.');
  assertOwns(req, row.owner_id);
  return row;
}

async function loadAvailability(req, id) {
  v.uuid(id, 'Disponibilité');
  const result = await query(
    `select a.*, r.total_rooms, s.owner_id from public.room_availability a
     join public.room_types r on r.id = a.room_type_id
     join public.stays s on s.id = r.property_id
     where a.id = $1 and r.deleted_at is null and s.deleted_at is null`,
    [id]
  );
  const row = result.rows[0];
  if (!row) fail(404, 'Disponibilité introuvable.');
  assertOwns(req, row.owner_id);
  return row;
}

async function loadImage(req, id) {
  v.uuid(id, 'Photo');
  const result = await query(
    `select i.*, s.owner_id from public.property_images i
     join public.stays s on s.id = i.property_id
     where i.id = $1 and s.deleted_at is null`,
    [id]
  );
  const row = result.rows[0];
  if (!row) fail(404, 'Photo introuvable.');
  assertOwns(req, row.owner_id);
  return row;
}

// ─── Synchronisation des champs historiques de stays (site public) ─────────

async function syncPropertyMedia(propertyId) {
  const images = await query(
    'select url from public.property_images where property_id = $1 order by is_primary desc, sort_order asc, created_at asc',
    [propertyId]
  );
  const urls = images.rows.map((r) => r.url);
  if (!urls.length) return;
  await query('update public.stays set image = $2, gallery = $3::jsonb, updated_at = now() where id = $1', [
    propertyId,
    urls[0],
    JSON.stringify(urls),
  ]);
}

async function syncPropertyAmenities(propertyId) {
  const result = await query(
    `select a.label, a.label_en, a.label_ar from public.property_amenities pa
     join public.amenities a on a.id = pa.amenity_id where pa.property_id = $1 order by a.id`,
    [propertyId]
  );
  const rows = result.rows;
  await query('update public.stays set amenities = $2::jsonb where id = $1', [
    propertyId,
    JSON.stringify({
      fr: rows.map((r) => r.label),
      en: rows.map((r) => r.label_en || r.label),
      ar: rows.map((r) => r.label_ar || r.label),
    }),
  ]);
}

// ─── Disponibilités ─────────────────────────────────────────────────────────

function checkRange(from, to) {
  if (from > to) fail(400, 'La date de début doit être antérieure ou égale à la date de fin.');
  if (daysBetween(from, to) + 1 > MAX_RANGE_DAYS) fail(400, `Période trop longue (${MAX_RANGE_DAYS} jours maximum).`);
}

/** Prix d'une nuit : prix forcé du jour > tarif saisonnier (du tarif, puis de la chambre) > tarif > prix de base. */
function nightlyPrice(date, { room, ratePlan, dayRow, seasonal }) {
  if (dayRow?.price_override != null) return dayRow.price_override;
  const covering = seasonal.filter((s) => s.status === 'active' && isoDate(s.start_date) <= date && isoDate(s.end_date) >= date);
  const forPlan = ratePlan ? covering.find((s) => s.rate_plan_id === ratePlan.id) : null;
  const forRoom = covering.find((s) => !s.rate_plan_id);
  if (forPlan) return forPlan.price;
  if (forRoom) return forRoom.price;
  if (ratePlan) return ratePlan.price;
  return room.base_price;
}

async function getCalendar(room, from, to, db = { query }) {
  checkRange(from, to);
  const [rows, seasonal, reserved] = await Promise.all([
    db.query(
      'select * from public.room_availability where room_type_id = $1 and date between $2 and $3',
      [room.id, from, to]
    ),
    db.query(
      'select * from public.seasonal_rates where room_type_id = $1 and end_date >= $2 and start_date <= $3',
      [room.id, from, to]
    ),
    db.query(
      `select to_char(d, 'YYYY-MM-DD') as day, sum(r.rooms_requested)::int as rooms
       from public.reservations r
       cross join lateral generate_series(r.check_in_date, r.check_out_date - 1, interval '1 day') d
       where r.room_type_id = $1 and r.inventory_held = true
         and r.check_out_date > $2 and r.check_in_date <= $3
       group by 1`,
      [room.id, from, to]
    ),
  ]);
  const byDate = new Map(rows.rows.map((r) => [isoDate(r.date), r]));
  const reservedByDate = new Map(reserved.rows.map((r) => [r.day, r.rooms]));
  return dateRange(from, to).map((date) => {
    const row = byDate.get(date);
    const total = room.total_rooms;
    const booked = row ? row.booked_quantity : reservedByDate.get(date) || 0;
    const available = row ? row.available_quantity : Math.max(0, total - booked);
    return {
      id: row?.id || null,
      date,
      totalRooms: total,
      availableQuantity: available,
      bookedQuantity: booked,
      blockedQuantity: Math.max(0, total - available - booked),
      status: row?.status || 'AVAILABLE',
      minimumStay: row?.minimum_stay ?? null,
      maximumStay: row?.maximum_stay ?? null,
      priceOverride: row?.price_override ?? null,
      price: nightlyPrice(date, { room, dayRow: row, seasonal: seasonal.rows }),
      stored: Boolean(row),
    };
  });
}

/** Validation d'un jour envoyé par le propriétaire. Les clés absentes ne sont pas modifiées. */
function parseDayInput(body, room, { requireDate = true } = {}) {
  const day = {
    date: requireDate ? v.date(body.date, 'Date', { required: true }) : null,
    availableQuantity: v.int(body.availableQuantity, 'Quantité disponible', { min: 0, max: 10_000 }),
    status: v.oneOf(body.status, 'Statut', ['AVAILABLE', 'UNAVAILABLE'], { upper: true }),
    minimumStay: body.minimumStay === null ? null : v.int(body.minimumStay, 'Séjour minimum', { min: 1, max: 365 }),
    maximumStay: body.maximumStay === null ? null : v.int(body.maximumStay, 'Séjour maximum', { min: 1, max: 365 }),
    priceOverride: body.priceOverride === null ? null : v.int(body.priceOverride, 'Prix', { min: 0 }),
    has: (k) => Object.prototype.hasOwnProperty.call(body, k),
  };
  if (day.minimumStay && day.maximumStay && day.minimumStay > day.maximumStay) {
    fail(400, 'Le séjour minimum doit être inférieur ou égal au séjour maximum.');
  }
  if (day.availableQuantity != null && day.availableQuantity > room.total_rooms) {
    fail(400, `Quantité disponible supérieure au nombre total de chambres (${room.total_rooms}).`);
  }
  return day;
}

/** Applique la même modification sur plusieurs dates, dans une transaction. */
async function applyDays(client, room, dates, day) {
  const updated = [];
  for (const date of dates) {
    await client.query(
      `insert into public.room_availability (room_type_id, date, available_quantity, booked_quantity)
       select $1, $2::date, greatest(0, $3 - coalesce(sum(r.rooms_requested), 0))::int, coalesce(sum(r.rooms_requested), 0)::int
       from public.reservations r
       where r.room_type_id = $1 and r.inventory_held = true and r.check_in_date <= $2::date and r.check_out_date > $2::date
       on conflict (room_type_id, date) do nothing`,
      [room.id, date, room.total_rooms]
    );
    const current = (
      await client.query('select * from public.room_availability where room_type_id = $1 and date = $2 for update', [room.id, date])
    ).rows[0];
    const next = {
      available: day.availableQuantity ?? current.available_quantity,
      status: day.status ?? current.status,
      min: day.has('minimumStay') ? day.minimumStay : current.minimum_stay,
      max: day.has('maximumStay') ? day.maximumStay : current.maximum_stay,
      price: day.has('priceOverride') ? day.priceOverride : current.price_override,
    };
    if (next.available + current.booked_quantity > room.total_rooms) {
      fail(409, `Le ${date} : ${current.booked_quantity} chambre(s) déjà réservée(s), disponible maximum ${room.total_rooms - current.booked_quantity}.`);
    }
    const res = await client.query(
      `update public.room_availability
       set available_quantity = $2, status = $3, minimum_stay = $4, maximum_stay = $5, price_override = $6, updated_at = now()
       where id = $1 returning *`,
      [current.id, next.available, next.status, next.min, next.max, next.price]
    );
    updated.push(mapAvailability(res.rows[0]));
  }
  return updated;
}

/** Bloque le stock pour chaque nuit [checkIn, checkOut). Doit être appelé dans une transaction. */
async function holdInventory(client, room, checkIn, checkOut, rooms) {
  const nights = dateRange(checkIn, addDays(checkOut, -1));
  for (const date of nights) {
    await client.query(
      `insert into public.room_availability (room_type_id, date, available_quantity, booked_quantity)
       values ($1, $2, $3, 0) on conflict (room_type_id, date) do nothing`,
      [room.id, date, room.total_rooms]
    );
  }
  const locked = await client.query(
    'select * from public.room_availability where room_type_id = $1 and date >= $2 and date < $3 order by date for update',
    [room.id, checkIn, checkOut]
  );
  const first = locked.rows.find((r) => isoDate(r.date) === checkIn);
  if (first?.minimum_stay && nights.length < first.minimum_stay) {
    fail(409, `Séjour minimum de ${first.minimum_stay} nuit(s) à partir du ${checkIn}.`);
  }
  if (first?.maximum_stay && nights.length > first.maximum_stay) {
    fail(409, `Séjour maximum de ${first.maximum_stay} nuit(s) à partir du ${checkIn}.`);
  }
  for (const row of locked.rows) {
    const date = isoDate(row.date);
    if (row.status !== 'AVAILABLE') fail(409, `Aucune disponibilité le ${date}.`);
    if (row.available_quantity < rooms) {
      fail(409, row.available_quantity === 0 ? `Complet le ${date}.` : `Seulement ${row.available_quantity} chambre(s) disponible(s) le ${date}.`);
    }
  }
  await client.query(
    `update public.room_availability
     set available_quantity = available_quantity - $4, booked_quantity = booked_quantity + $4, updated_at = now()
     where room_type_id = $1 and date >= $2 and date < $3`,
    [room.id, checkIn, checkOut, rooms]
  );
  return locked.rows;
}

/** Rend le stock d'une réservation annulée / refusée. */
async function releaseInventory(client, reservation) {
  if (!reservation.inventory_held || !reservation.room_type_id) return;
  await client.query(
    `update public.room_availability
     set available_quantity = available_quantity + least(booked_quantity, $4),
         booked_quantity = greatest(0, booked_quantity - $4), updated_at = now()
     where room_type_id = $1 and date >= $2 and date < $3`,
    [reservation.room_type_id, isoDate(reservation.check_in_date), isoDate(reservation.check_out_date), reservation.rooms_requested || 1]
  );
  await client.query('update public.reservations set inventory_held = false where id = $1', [reservation.id]);
}

async function rehold(client, reservation) {
  if (reservation.inventory_held || !reservation.room_type_id) return;
  const room = (await client.query('select * from public.room_types where id = $1', [reservation.room_type_id])).rows[0];
  if (!room) return;
  await holdInventory(client, room, isoDate(reservation.check_in_date), isoDate(reservation.check_out_date), reservation.rooms_requested || 1);
  await client.query('update public.reservations set inventory_held = true where id = $1', [reservation.id]);
}

/** Ajuste les jours déjà enregistrés quand le nombre total de chambres change. */
async function clampAvailabilityToTotal(roomId, total) {
  await query(
    `update public.room_availability
     set available_quantity = greatest(0, least(available_quantity, $2 - booked_quantity)), updated_at = now()
     where room_type_id = $1 and date >= current_date and available_quantity + booked_quantity > $2`,
    [roomId, total]
  );
}

/** Conditions de réservabilité : propriétaire, bien, chambre, tarif actifs. */
const BOOKABLE_PROPERTY_SQL = `s.deleted_at is null and s.status = 'active' and coalesce(s.published, true) = true
  and (s.owner_id is null or exists (select 1 from public.owners o where o.id = s.owner_id and o.status = 'active' and o.deleted_at is null))`;

module.exports = {
  PROPERTY_TYPES,
  MEAL_PLANS,
  isoDate,
  addDays,
  daysBetween,
  dateRange,
  todayIso,
  mapOwner,
  mapProperty,
  mapImage,
  mapRoom,
  mapRate,
  mapSeasonal,
  mapAvailability,
  mapReservation,
  isAdmin,
  assertOwns,
  loadProperty,
  loadRoom,
  loadRate,
  loadSeasonal,
  loadAvailability,
  loadImage,
  syncPropertyMedia,
  syncPropertyAmenities,
  checkRange,
  nightlyPrice,
  getCalendar,
  parseDayInput,
  applyDays,
  holdInventory,
  releaseInventory,
  rehold,
  clampAvailabilityToTotal,
  BOOKABLE_PROPERTY_SQL,
};
