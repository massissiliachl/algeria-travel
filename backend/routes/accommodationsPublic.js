/**
 * API publique des hébergements : uniquement les biens réservables (propriétaire, bien, chambre, tarif actifs).
 * Aucune donnée privée du propriétaire n'est exposée.
 */
const express = require('express');
const { query, withTransaction } = require('../config/db');
const { asyncHandler } = require('../lib/asyncHandler');
const { createRateLimiter } = require('../middleware/rateLimit');
const { ok, list, fail, apiErrorHandler, pagination, v, slugify } = require('../lib/api');
const A = require('../lib/accommodation');
const { generateReferenceCode, generateAccessToken, hashAccessToken } = require('../lib/reservationTokens');
const { sendReservationClientEmail, sendReservationAdminEmail } = require('../lib/reservationEmails');
const { createPartnerNotification } = require('../lib/partnerNotifications');
const { notifyOwner } = require('../lib/ownerNotifications');
const { audit } = require('../lib/audit');

const router = express.Router();

const reservationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RESERVATION_RATE_LIMIT) || 5,
  message: 'Trop de demandes de réservation. Réessayez dans une heure.',
});

const MIN_PRICE_SQL = `(select min(least(r.base_price, coalesce((select min(rp.price) from public.rate_plans rp
    where rp.room_type_id = r.id and rp.status = 'active' and rp.deleted_at is null), r.base_price)))
  from public.room_types r where r.property_id = s.id and r.status = 'active' and r.deleted_at is null)`;

const MAX_STAY_NIGHTS = 60;

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = pagination(req.query, { defaultLimit: 24 });
    const params = [];
    const where = [A.BOOKABLE_PROPERTY_SQL];
    if (req.query.type && A.PROPERTY_TYPES.includes(String(req.query.type).toUpperCase())) {
      params.push(String(req.query.type).toLowerCase());
      where.push(`s.type = $${params.length}`);
    }
    if (req.query.city) {
      params.push(String(req.query.city).trim().toLowerCase());
      where.push(`lower(coalesce(s.city, s.location)) = $${params.length}`);
    }
    if (req.query.wilaya) {
      params.push(slugify(req.query.wilaya));
      where.push(`s.wilaya_key = $${params.length}`);
    }
    if (req.query.q) {
      params.push(`%${String(req.query.q).trim().toLowerCase()}%`);
      where.push(`(lower(s.name) like $${params.length} or lower(coalesce(s.city, s.location, '')) like $${params.length})`);
    }
    if (req.query.owned === 'true') where.push('s.owner_id is not null');
    const sqlWhere = where.join(' and ');
    const total = await query(`select count(*)::int as n from public.stays s where ${sqlWhere}`, params);
    params.push(limit, offset);
    const result = await query(
      `select s.*, ${MIN_PRICE_SQL} as min_price from public.stays s where ${sqlWhere}
       order by s.featured desc, s.name asc limit $${params.length - 1} offset $${params.length}`,
      params
    );
    list(res, result.rows.map((r) => A.mapProperty(r, { privateFields: false })), { page, limit, total: total.rows[0].n });
  })
);

async function loadPublicProperty(idOrSlug) {
  const result = await query(
    `select s.*, ${MIN_PRICE_SQL} as min_price from public.stays s
     where (s.id = $1 or s.slug = $1) and ${A.BOOKABLE_PROPERTY_SQL}`,
    [String(idOrSlug || '')]
  );
  if (!result.rows.length) fail(404, 'Hébergement introuvable ou indisponible.');
  return result.rows[0];
}

async function loadBookableRoom(roomId) {
  v.uuid(roomId, 'Chambre');
  const result = await query(
    `select r.*, s.name as property_name, s.type as property_type, s.owner_id, s.id as pid
     from public.room_types r join public.stays s on s.id = r.property_id
     where r.id = $1 and r.status = 'active' and r.deleted_at is null and ${A.BOOKABLE_PROPERTY_SQL}`,
    [roomId]
  );
  if (!result.rows.length) fail(404, 'Chambre introuvable ou non réservable.');
  return result.rows[0];
}

router.get(
  '/rooms/:roomId/availability',
  asyncHandler(async (req, res) => {
    const room = await loadBookableRoom(req.params.roomId);
    const from = v.date(req.query.from, 'Date de début') || A.todayIso();
    const to = v.date(req.query.to, 'Date de fin') || A.addDays(from, 59);
    if (A.daysBetween(from, to) > 120) fail(400, 'Période trop longue (120 jours maximum).');
    const days = await A.getCalendar(room, from, to);
    ok(res, {
      roomId: room.id,
      days: days.map((d) => ({
        date: d.date,
        available: d.status === 'AVAILABLE' && d.availableQuantity > 0 && d.date >= A.todayIso(),
        quantity: d.status === 'AVAILABLE' ? d.availableQuantity : 0,
        price: d.price,
        minimumStay: d.minimumStay,
      })),
    });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await loadPublicProperty(req.params.id);
    const [images, amenities, rooms, rates] = await Promise.all([
      query('select * from public.property_images where property_id = $1 order by is_primary desc, sort_order', [row.id]),
      query(
        `select a.code, a.label, a.label_en, a.label_ar from public.property_amenities pa
         join public.amenities a on a.id = pa.amenity_id where pa.property_id = $1 order by a.id`,
        [row.id]
      ),
      query(
        "select * from public.room_types where property_id = $1 and status = 'active' and deleted_at is null order by sort_order, base_price",
        [row.id]
      ),
      query(
        `select rp.* from public.rate_plans rp join public.room_types r on r.id = rp.room_type_id
         where r.property_id = $1 and rp.status = 'active' and rp.deleted_at is null order by rp.price`,
        [row.id]
      ),
    ]);
    const ratesByRoom = new Map();
    for (const rp of rates.rows) {
      if (!ratesByRoom.has(rp.room_type_id)) ratesByRoom.set(rp.room_type_id, []);
      ratesByRoom.get(rp.room_type_id).push(A.mapRate(rp));
    }
    ok(res, {
      ...A.mapProperty(row, { privateFields: false }),
      images: images.rows.map((i) => ({ url: i.url, alt: i.alt, isPrimary: i.is_primary })),
      amenities: amenities.rows.map((a) => ({ code: a.code, label: a.label, labelEn: a.label_en, labelAr: a.label_ar })),
      rooms: rooms.rows.map((r) => {
        const m = A.mapRoom(r);
        delete m.createdAt;
        delete m.updatedAt;
        return { ...m, rates: ratesByRoom.get(r.id) || [] };
      }),
    });
  })
);

/** Demande de réservation : vérifie toute la chaîne puis bloque le stock dans la même transaction. */
router.post(
  '/reservations',
  reservationLimiter,
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (b.website) fail(400, 'Requête invalide.');
    const room = await loadBookableRoom(b.roomTypeId);
    if (b.propertyId && String(b.propertyId) !== room.pid) fail(400, 'Cette chambre n’appartient pas à cet hébergement.');

    const checkIn = v.date(b.checkIn, 'Date d’arrivée', { required: true });
    const checkOut = v.date(b.checkOut, 'Date de départ', { required: true });
    if (checkIn < A.todayIso()) fail(400, 'La date d’arrivée est déjà passée.');
    if (checkOut <= checkIn) fail(400, 'La date de départ doit être après la date d’arrivée.');
    const nights = A.daysBetween(checkIn, checkOut);
    if (nights > MAX_STAY_NIGHTS) fail(400, `Séjour limité à ${MAX_STAY_NIGHTS} nuits.`);

    const rooms = v.int(b.rooms ?? 1, 'Nombre de chambres', { min: 1, max: 20 });
    const adults = v.int(b.adults ?? 1, 'Adultes', { min: 1, max: 50 });
    const children = v.int(b.children ?? 0, 'Enfants', { min: 0, max: 50 });
    if (adults > room.capacity_adults * rooms) fail(400, `Capacité dépassée : ${room.capacity_adults} adulte(s) maximum par chambre.`);
    if (children > room.capacity_children * rooms) {
      fail(400, room.capacity_children ? `Capacité dépassée : ${room.capacity_children} enfant(s) maximum par chambre.` : 'Cette chambre n’accepte pas d’enfants supplémentaires.');
    }

    const name = v.str(b.name, 'Nom', { required: true, max: 120 });
    const email = v.email(b.email, 'Email', { required: true });
    const phone = v.phone(b.phone, 'Téléphone', { required: true });
    const message = v.str(b.message, 'Message', { max: 2000 });
    if (b.gdprConsent !== true) fail(400, 'Vous devez accepter le traitement de vos données.');

    let ratePlan = null;
    if (b.ratePlanId) {
      const rp = await query(
        "select * from public.rate_plans where id = $1 and room_type_id = $2 and status = 'active' and deleted_at is null",
        [v.uuid(b.ratePlanId, 'Tarif'), room.id]
      );
      if (!rp.rows.length) fail(400, 'Ce tarif n’est plus disponible.');
      ratePlan = rp.rows[0];
    }

    const accessToken = generateAccessToken();
    const travelers = Math.min(20, adults + children);
    const stayType = ['hotel', 'guesthouse'].includes(room.property_type) ? room.property_type : null;
    const itemName = `${room.property_name} — ${room.name}${ratePlan ? ` (${ratePlan.name})` : ''}`;

    const { reservation, total } = await withTransaction(async (client) => {
      const dayRows = await A.holdInventory(client, room, checkIn, checkOut, rooms);
      const seasonal = (
        await client.query('select * from public.seasonal_rates where room_type_id = $1 and end_date >= $2 and start_date < $3', [room.id, checkIn, checkOut])
      ).rows;
      const byDate = new Map(dayRows.map((r) => [A.isoDate(r.date), r]));
      const perRoom = A.dateRange(checkIn, A.addDays(checkOut, -1)).reduce(
        (sum, date) => sum + A.nightlyPrice(date, { room, ratePlan, dayRow: byDate.get(date), seasonal }),
        0
      );
      const sum = perRoom * rooms;
      let referenceCode;
      for (let i = 0; i < 8 && !referenceCode; i += 1) {
        const candidate = generateReferenceCode();
        const exists = await client.query('select 1 from public.reservations where reference_code = $1', [candidate]);
        if (!exists.rows.length) referenceCode = candidate;
      }
      if (!referenceCode) fail(500, 'Impossible de générer une référence.');
      const inserted = await client.query(
        `insert into public.reservations (
           item_type, item_id, item_name, client_name, client_email, client_phone,
           travel_date, check_in_date, check_out_date, rooms_requested, travelers, stay_type, message,
           price_estimate, unit_price, price_per_person, payment_method, gdpr_consent_at,
           reference_code, access_token_hash, property_id, room_type_id, rate_plan_id, owner_id, inventory_held
         ) values ('stay', $1, $2, $3, $4, $5, $6, $6, $7, $8, $9, $10, $11, $12, $13, false, 'pre_request', now(),
                   $14, $15, $1, $16, $17, $18, true)
         returning *`,
        [
          room.pid, itemName, name, email, phone, checkIn, checkOut, rooms, travelers, stayType,
          message ? `${message}\n\nAdultes : ${adults} · Enfants : ${children}` : `Adultes : ${adults} · Enfants : ${children}`,
          sum, Math.round(perRoom / nights), referenceCode, hashAccessToken(accessToken), room.id, ratePlan?.id || null, room.owner_id,
        ]
      );
      return { reservation: inserted.rows[0], total: sum };
    });

    await audit({ type: 'system', label: 'site' }, 'reservation.create', 'reservation', reservation.id, {
      propertyId: room.pid,
      roomTypeId: room.id,
      checkIn,
      checkOut,
      rooms,
    });

    res.status(201).json({
      success: true,
      data: {
        referenceCode: reservation.reference_code,
        accessToken,
        priceEstimate: total,
        nights,
        status: reservation.status,
      },
      message: 'Demande de réservation envoyée. L’établissement vous recontacte rapidement.',
    });

    const mail = { referenceCode: reservation.reference_code, itemName, travelDate: checkIn, checkInDate: checkIn, checkOutDate: checkOut, travelers, priceEstimate: total, paymentMethod: 'pre_request' };
    Promise.all([
      createPartnerNotification(room.pid, reservation.id).catch(() => {}),
      notifyOwner(room.owner_id, 'reservation_created', {
        referenceCode: reservation.reference_code,
        propertyName: room.property_name,
        roomName: room.name,
        checkIn,
        checkOut,
        nights,
        rooms,
        clientName: name,
        total,
      }),
      sendReservationClientEmail({ ...mail, email, name, accessToken }).catch((err) => console.warn('[Mail] client', err.message)),
      sendReservationAdminEmail({ ...mail, itemType: 'stay', name, email, phone, roomsRequested: rooms, message }).catch((err) =>
        console.warn('[Mail] admin', err.message)
      ),
    ]);
  })
);

router.use(apiErrorHandler);

module.exports = router;
