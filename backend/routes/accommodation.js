/**
 * Gestion des hébergements, montée deux fois :
 *   /api/owner/*               → propriétaire authentifié, limité à ses biens
 *   /api/admin/accommodation/* → administrateur, accès à tous les biens
 * L'identité vient toujours du middleware (req.owner / req.actor), jamais du corps de la requête.
 */
const crypto = require('crypto');
const express = require('express');
const { query, withTransaction } = require('../config/db');
const { asyncHandler } = require('../lib/asyncHandler');
const { ok, list, fail, apiErrorHandler, pagination, v, slugify } = require('../lib/api');
const A = require('../lib/accommodation');
const { audit, actorTag } = require('../lib/audit');
const { notifyOwner } = require('../lib/ownerNotifications');

const UNIT_TYPES = new Set(['APARTMENT', 'VILLA']);
const RESERVATION_STATUSES = ['pending', 'reviewed', 'confirmed', 'rejected', 'cancelled'];
const RELEASED = new Set(['rejected', 'cancelled']);

const AVAILABLE_TODAY_SQL = `coalesce((select case when a.status = 'AVAILABLE' then a.available_quantity else 0 end
  from public.room_availability a where a.room_type_id = r.id and a.date = current_date), r.total_rooms)`;

/** Condition SQL limitant les biens au propriétaire connecté (aucune pour l'admin). */
function scope(req, params, alias = 's') {
  if (A.isAdmin(req)) return 'true';
  params.push(req.owner.id);
  return `${alias}.owner_id = $${params.length}`;
}

function buildSets(data, extra = {}) {
  const cols = [];
  const values = [];
  for (const [col, val] of Object.entries({ ...data, ...extra })) {
    if (val === undefined) continue;
    values.push(val);
    cols.push(col);
  }
  return { cols, values };
}

const quoteCol = (c) => (c === 'desc' ? '"desc"' : c);

// ─── Biens ──────────────────────────────────────────────────────────────────

function parseProperty(body, { creating, admin }) {
  const has = (k) => creating || Object.prototype.hasOwnProperty.call(body, k);
  const pick = (k, fn) => (has(k) ? fn() : undefined);
  const statuses = admin ? ['active', 'inactive', 'pending'] : ['active', 'inactive'];
  const type = pick('propertyType', () => v.oneOf(body.propertyType, 'Type de bien', A.PROPERTY_TYPES, { required: true, upper: true }));
  const city = pick('city', () => v.str(body.city, 'Ville', { required: true, max: 100 }));
  const wilaya = pick('wilaya', () => v.str(body.wilaya, 'Wilaya', { required: true, max: 100 }));
  const status = pick('status', () => v.oneOf(body.status, 'Statut', statuses, { lower: true }) || (creating ? 'active' : undefined));
  const data = {
    name: pick('name', () => v.str(body.name, 'Nom', { required: true, max: 150 })),
    type: type && type.toLowerCase(),
    desc: pick('description', () => v.str(body.description, 'Description', { required: true, max: 8000 })),
    short_desc: pick('shortDescription', () => v.str(body.shortDescription, 'Description courte', { max: 300 })),
    address: pick('address', () => v.str(body.address, 'Adresse', { required: true, max: 300 })),
    city,
    location: city,
    wilaya,
    wilaya_key: wilaya === undefined ? undefined : slugify(wilaya),
    lat: pick('latitude', () => v.num(body.latitude, 'Latitude', { min: -90, max: 90 })),
    lng: pick('longitude', () => v.num(body.longitude, 'Longitude', { min: -180, max: 180 })),
    phone: pick('phone', () => v.phone(body.phone, 'Téléphone')),
    email: pick('email', () => v.email(body.email, 'Email')),
    check_in: pick('checkInTime', () => v.time(body.checkInTime, 'Heure d’arrivée')),
    check_out: pick('checkOutTime', () => v.time(body.checkOutTime, 'Heure de départ')),
    status,
    published: status === undefined ? undefined : status === 'active',
    max_guests: pick('maxGuests', () => v.int(body.maxGuests, 'Nombre de personnes', { min: 1, max: 500 })),
    bedrooms: pick('bedrooms', () => v.int(body.bedrooms, 'Nombre de chambres', { min: 0, max: 500 })),
    beds: pick('beds', () => v.int(body.beds, 'Nombre de lits', { min: 0, max: 1000 })),
    price: pick('basePrice', () => v.int(body.basePrice, 'Prix de base', { min: 0 })),
    place_id: pick('placeId', () => v.str(body.placeId, 'Destination', { max: 80 })),
  };
  if (admin && has('featured')) data.featured = Boolean(v.bool(body.featured));
  return data;
}

async function setAmenities(propertyId, codes) {
  if (!Array.isArray(codes)) fail(400, 'Liste d’équipements invalide.');
  const clean = [...new Set(codes.map((c) => String(c).trim()).filter(Boolean))].slice(0, 60);
  await query('delete from public.property_amenities where property_id = $1', [propertyId]);
  if (clean.length) {
    await query(
      `insert into public.property_amenities (property_id, amenity_id)
       select $1, id from public.amenities where code = any($2::text[]) on conflict do nothing`,
      [propertyId, clean]
    );
  }
  await A.syncPropertyAmenities(propertyId);
}

async function addImages(propertyId, images) {
  if (!Array.isArray(images)) fail(400, 'Liste de photos invalide.');
  const existing = await query('select count(*)::int as n, bool_or(is_primary) as has_primary from public.property_images where property_id = $1', [propertyId]);
  let order = existing.rows[0].n;
  let hasPrimary = Boolean(existing.rows[0].has_primary);
  if (order + images.length > 40) fail(400, '40 photos maximum par bien.');
  const added = [];
  for (const img of images) {
    const url = v.url(typeof img === 'string' ? img : img?.url, 'URL de la photo');
    const alt = typeof img === 'string' ? null : v.str(img.alt, 'Texte alternatif', { max: 200 });
    const primary = !hasPrimary || (typeof img === 'object' && img?.isPrimary === true);
    if (primary && hasPrimary) await query('update public.property_images set is_primary = false where property_id = $1', [propertyId]);
    const row = await query(
      'insert into public.property_images (property_id, url, alt, is_primary, sort_order) values ($1, $2, $3, $4, $5) returning *',
      [propertyId, url, alt, primary, order++]
    );
    hasPrimary = true;
    added.push(A.mapImage(row.rows[0]));
  }
  await A.syncPropertyMedia(propertyId);
  return added;
}

async function propertyDetails(req, row) {
  const [images, amenities, rooms, owner] = await Promise.all([
    query('select * from public.property_images where property_id = $1 order by is_primary desc, sort_order, created_at', [row.id]),
    query(
      `select a.code from public.property_amenities pa join public.amenities a on a.id = pa.amenity_id
       where pa.property_id = $1 order by a.id`,
      [row.id]
    ),
    query(
      `select r.*, ${AVAILABLE_TODAY_SQL} as available_today,
              (select count(*) from public.rate_plans rp where rp.room_type_id = r.id and rp.deleted_at is null) as rate_count
       from public.room_types r where r.property_id = $1 and r.deleted_at is null order by r.sort_order, r.created_at`,
      [row.id]
    ),
    row.owner_id ? query('select * from public.owners where id = $1', [row.owner_id]) : { rows: [] },
  ]);
  return {
    ...A.mapProperty(row),
    images: images.rows.map(A.mapImage),
    amenities: amenities.rows.map((a) => a.code),
    rooms: rooms.rows.map(A.mapRoom),
    ...(A.isAdmin(req) ? { owner: A.mapOwner(owner.rows[0]) } : {}),
  };
}

function makeAccommodationRouter() {
  const router = express.Router();

  router.get(
    '/amenities',
    asyncHandler(async (req, res) => {
      const result = await query('select id, code, label, label_en, label_ar, scope from public.amenities order by id');
      ok(res, result.rows.map((r) => ({ id: r.id, code: r.code, label: r.label, labelEn: r.label_en, labelAr: r.label_ar, scope: r.scope })));
    })
  );

  // ── Tableau de bord ──
  router.get(
    '/dashboard',
    asyncHandler(async (req, res) => {
      const params = [];
      const where = scope(req, params);
      const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 7));
      const resWhere = A.isAdmin(req) ? 'r.property_id is not null' : `r.owner_id = $1`;
      const [props, rooms, reservations, upcoming, chart, preview] = await Promise.all([
        query(
          `select count(*)::int as total, count(*) filter (where s.status = 'active')::int as active
           from public.stays s where s.deleted_at is null and ${where}`,
          params
        ),
        query(
          `select coalesce(sum(r.total_rooms), 0)::int as total, coalesce(sum(${AVAILABLE_TODAY_SQL}), 0)::int as available
           from public.room_types r join public.stays s on s.id = r.property_id
           where r.deleted_at is null and r.status = 'active' and s.deleted_at is null and ${where}`,
          params
        ),
        query(
          `select count(*)::int as total, count(*) filter (where r.status = 'pending')::int as pending,
                  count(*) filter (where r.status = 'confirmed')::int as confirmed
           from public.reservations r where ${resWhere}`,
          A.isAdmin(req) ? [] : [req.owner.id]
        ),
        query(
          `select r.*, s.name as property_name, rt.name as room_name, s.image as property_image
           from public.reservations r
           left join public.stays s on s.id = r.property_id
           left join public.room_types rt on rt.id = r.room_type_id
           where ${resWhere} and r.check_out_date >= current_date and r.status not in ('rejected', 'cancelled')
           order by r.check_in_date asc limit 5`,
          A.isAdmin(req) ? [] : [req.owner.id]
        ),
        query(
          `select to_char(d, 'YYYY-MM-DD') as day,
                  (select count(*) from public.reservations r where ${resWhere} and r.created_at::date = d::date)::int as count
           from generate_series(current_date - ${days - 1}, current_date, interval '1 day') d order by d`,
          A.isAdmin(req) ? [] : [req.owner.id]
        ),
        query(
          `select s.*, (select coalesce(sum(r.total_rooms), 0) from public.room_types r where r.property_id = s.id and r.deleted_at is null) as room_count,
                  (select count(*) from public.reservations x where x.property_id = s.id) as reservation_count
           from public.stays s where s.deleted_at is null and ${where} order by s.updated_at desc limit 4`,
          params
        ),
      ]);
      ok(res, {
        properties: props.rows[0],
        rooms: rooms.rows[0],
        reservations: reservations.rows[0],
        upcoming: upcoming.rows.map((r) => ({ ...A.mapReservation(r), propertyImage: r.property_image })),
        chart: chart.rows,
        recentProperties: preview.rows.map((r) => ({ ...A.mapProperty(r), reservationCount: Number(r.reservation_count) })),
      });
    })
  );

  // ── Biens ──
  router.get(
    '/properties',
    asyncHandler(async (req, res) => {
      const { page, limit, offset } = pagination(req.query);
      const params = [];
      const where = ['s.deleted_at is null', scope(req, params)];
      if (req.query.q) {
        params.push(`%${String(req.query.q).trim().toLowerCase()}%`);
        where.push(`(lower(s.name) like $${params.length} or lower(coalesce(s.city, s.location, '')) like $${params.length})`);
      }
      if (['active', 'inactive', 'pending'].includes(req.query.status)) {
        params.push(req.query.status);
        where.push(`s.status = $${params.length}`);
      }
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
      if (A.isAdmin(req) && req.query.ownerId) {
        params.push(v.uuid(req.query.ownerId, 'Propriétaire'));
        where.push(`s.owner_id = $${params.length}`);
      }
      const sorts = { name: 's.name', created: 's.created_at', city: 'coalesce(s.city, s.location)', price: 's.price', updated: 's.updated_at' };
      const sort = sorts[req.query.sort] || 's.created_at';
      const order = req.query.order === 'asc' ? 'asc' : 'desc';
      const sqlWhere = where.join(' and ');
      const total = await query(`select count(*)::int as n from public.stays s where ${sqlWhere}`, params);
      params.push(limit, offset);
      const result = await query(
        `select s.*, o.first_name as owner_first_name, o.last_name as owner_last_name, o.status as owner_status,
                (select coalesce(sum(r.total_rooms), 0) from public.room_types r where r.property_id = s.id and r.deleted_at is null) as room_count,
                (select count(*) from public.room_types r where r.property_id = s.id and r.deleted_at is null) as room_type_count
         from public.stays s left join public.owners o on o.id = s.owner_id
         where ${sqlWhere} order by ${sort} ${order} nulls last limit $${params.length - 1} offset $${params.length}`,
        params
      );
      list(res, result.rows.map((r) => A.mapProperty(r)), { page, limit, total: total.rows[0].n });
    })
  );

  router.post(
    '/properties',
    asyncHandler(async (req, res) => {
      const body = req.body || {};
      const admin = A.isAdmin(req);
      const data = parseProperty(body, { creating: true, admin });
      let ownerId = req.owner?.id;
      if (admin) {
        if (body.ownerId) {
          const owner = await query('select id from public.owners where id = $1 and deleted_at is null', [v.uuid(body.ownerId, 'Propriétaire')]);
          if (!owner.rows.length) fail(404, "Ce propriétaire n'existe pas.");
          ownerId = owner.rows[0].id;
        } else {
          fail(400, 'Choisissez le propriétaire du bien.');
        }
      }
      const id = `${slugify(data.name) || 'bien'}-${crypto.randomBytes(3).toString('hex')}`;
      const tag = actorTag(req.actor);
      const { cols, values } = buildSets(data, { id, slug: id, owner_id: ownerId, created_by: tag, updated_by: tag });
      const result = await query(
        `insert into public.stays (${cols.map(quoteCol).join(', ')}) values (${values.map((_, i) => `$${i + 1}`).join(', ')}) returning *`,
        values
      );
      const row = result.rows[0];
      if (Array.isArray(body.amenities)) await setAmenities(id, body.amenities);
      if (Array.isArray(body.images) && body.images.length) await addImages(id, body.images);
      if (UNIT_TYPES.has(String(body.propertyType).toUpperCase()) && body.createDefaultUnit !== false) {
        await query(
          `insert into public.room_types (property_id, name, capacity_adults, total_rooms, beds, base_price, created_by, updated_by)
           values ($1, 'Logement entier', $2, 1, $3, $4, $5, $5)`,
          [id, data.max_guests || 2, data.beds, data.price || 0, tag]
        );
      }
      await audit(req.actor, 'property.create', 'property', id, { name: row.name, ownerId });
      const fresh = await query('select * from public.stays where id = $1', [id]);
      ok(res, await propertyDetails(req, fresh.rows[0]), 201);
    })
  );

  router.get(
    '/properties/:id',
    asyncHandler(async (req, res) => {
      const row = await A.loadProperty(req, req.params.id);
      ok(res, await propertyDetails(req, row));
    })
  );

  router.put(
    '/properties/:id',
    asyncHandler(async (req, res) => {
      const prev = await A.loadProperty(req, req.params.id);
      const body = req.body || {};
      const data = parseProperty(body, { creating: false, admin: A.isAdmin(req) });
      for (const k of ['name', 'type', 'desc', 'address', 'city', 'wilaya']) {
        if (data[k] === null) fail(400, 'Champ obligatoire manquant.');
      }
      const extra = { updated_by: actorTag(req.actor), updated_at: new Date() };
      if (A.isAdmin(req) && body.ownerId) {
        const owner = await query('select id from public.owners where id = $1 and deleted_at is null', [v.uuid(body.ownerId, 'Propriétaire')]);
        if (!owner.rows.length) fail(404, "Ce propriétaire n'existe pas.");
        extra.owner_id = owner.rows[0].id;
      }
      const { cols, values } = buildSets(data, extra);
      values.push(prev.id);
      const result = await query(
        `update public.stays set ${cols.map((c, i) => `${quoteCol(c)} = $${i + 1}`).join(', ')} where id = $${values.length} returning *`,
        values
      );
      if (Array.isArray(body.amenities)) await setAmenities(prev.id, body.amenities);
      await audit(req.actor, 'property.update', 'property', prev.id, { fields: Object.keys(body) });
      if (data.status && data.status !== prev.status && A.isAdmin(req)) {
        notifyOwner(prev.owner_id, 'property_status_changed', { propertyName: prev.name, status: data.status, by: 'admin' });
      }
      ok(res, await propertyDetails(req, result.rows[0]));
    })
  );

  router.patch(
    '/properties/:id/status',
    asyncHandler(async (req, res) => {
      const prev = await A.loadProperty(req, req.params.id);
      const statuses = A.isAdmin(req) ? ['active', 'inactive', 'pending'] : ['active', 'inactive'];
      const status = v.oneOf(req.body?.status, 'Statut', statuses, { required: true, lower: true });
      const result = await query(
        'update public.stays set status = $2, published = $3, updated_by = $4, updated_at = now() where id = $1 returning *',
        [prev.id, status, status === 'active', actorTag(req.actor)]
      );
      await audit(req.actor, `property.${status === 'active' ? 'activate' : 'deactivate'}`, 'property', prev.id, { name: prev.name, status });
      if (status !== prev.status && A.isAdmin(req)) {
        notifyOwner(prev.owner_id, 'property_status_changed', { propertyName: prev.name, status, by: 'admin' });
      }
      ok(res, A.mapProperty(result.rows[0]));
    })
  );

  /** Suppression logique : les réservations historiques restent liées au bien. */
  router.delete(
    '/properties/:id',
    asyncHandler(async (req, res) => {
      const prev = await A.loadProperty(req, req.params.id);
      await query(
        "update public.stays set deleted_at = now(), status = 'inactive', published = false, updated_by = $2, updated_at = now() where id = $1",
        [prev.id, actorTag(req.actor)]
      );
      await audit(req.actor, 'property.delete', 'property', prev.id, { name: prev.name });
      ok(res, { id: prev.id });
    })
  );

  router.put(
    '/properties/:id/amenities',
    asyncHandler(async (req, res) => {
      const prev = await A.loadProperty(req, req.params.id);
      await setAmenities(prev.id, req.body?.codes);
      await audit(req.actor, 'property.amenities', 'property', prev.id);
      ok(res, { codes: req.body.codes });
    })
  );

  // ── Photos ──
  router.post(
    '/properties/:id/images',
    asyncHandler(async (req, res) => {
      const prev = await A.loadProperty(req, req.params.id);
      const images = Array.isArray(req.body?.images) ? req.body.images : [req.body || {}];
      const added = await addImages(prev.id, images);
      await audit(req.actor, 'property.images.add', 'property', prev.id, { count: added.length });
      ok(res, added, 201);
    })
  );

  router.put(
    '/properties/:id/images/order',
    asyncHandler(async (req, res) => {
      const prev = await A.loadProperty(req, req.params.id);
      const ids = req.body?.ids;
      if (!Array.isArray(ids)) fail(400, 'Liste invalide.');
      for (let i = 0; i < ids.length; i += 1) {
        await query('update public.property_images set sort_order = $3 where id = $1 and property_id = $2', [v.uuid(ids[i], 'Photo'), prev.id, i]);
      }
      await A.syncPropertyMedia(prev.id);
      ok(res, { ids });
    })
  );

  router.patch(
    '/images/:id/primary',
    asyncHandler(async (req, res) => {
      const img = await A.loadImage(req, req.params.id);
      await query('update public.property_images set is_primary = (id = $2) where property_id = $1', [img.property_id, img.id]);
      await A.syncPropertyMedia(img.property_id);
      ok(res, { id: img.id });
    })
  );

  router.delete(
    '/images/:id',
    asyncHandler(async (req, res) => {
      const img = await A.loadImage(req, req.params.id);
      await query('delete from public.property_images where id = $1', [img.id]);
      if (img.is_primary) {
        await query(
          `update public.property_images set is_primary = true
           where id = (select id from public.property_images where property_id = $1 order by sort_order limit 1)`,
          [img.property_id]
        );
      }
      await A.syncPropertyMedia(img.property_id);
      await audit(req.actor, 'property.images.delete', 'property', img.property_id);
      ok(res, { id: img.id });
    })
  );

  // ── Types de chambre ──
  function parseRoom(body, creating) {
    const has = (k) => creating || Object.prototype.hasOwnProperty.call(body, k);
    const pick = (k, fn) => (has(k) ? fn() : undefined);
    const amenities = pick('amenities', () => {
      if (body.amenities == null) return '[]';
      if (!Array.isArray(body.amenities)) fail(400, 'Équipements invalides.');
      return JSON.stringify(body.amenities.map((a) => String(a).trim().slice(0, 60)).filter(Boolean).slice(0, 40));
    });
    return {
      name: pick('name', () => v.str(body.name, 'Nom de la chambre', { required: true, max: 120 })),
      description: pick('description', () => v.str(body.description, 'Description', { max: 3000 })),
      capacity_adults: pick('capacityAdults', () => v.int(body.capacityAdults, 'Capacité adultes', { required: true, min: 1, max: 50 })),
      capacity_children: pick('capacityChildren', () => v.int(body.capacityChildren, 'Capacité enfants', { min: 0, max: 50 }) ?? 0),
      total_rooms: pick('totalRooms', () => v.int(body.totalRooms, 'Nombre total', { required: true, min: 0, max: 10_000 })),
      beds: pick('beds', () => v.int(body.beds, 'Nombre de lits', { min: 0, max: 50 })),
      bed_type: pick('bedType', () => v.str(body.bedType, 'Type de lit', { max: 80 })),
      size_m2: pick('sizeM2', () => v.num(body.sizeM2, 'Superficie', { min: 0, max: 100_000 })),
      view: pick('view', () => v.str(body.view, 'Vue', { max: 80 })),
      amenities,
      base_price: pick('basePrice', () => v.int(body.basePrice, 'Prix de base', { required: true, min: 0 })),
      status: pick('status', () => v.oneOf(body.status, 'Statut', ['active', 'inactive'], { lower: true }) || (creating ? 'active' : undefined)),
      sort_order: pick('sortOrder', () => v.int(body.sortOrder, 'Ordre', { min: 0, max: 10_000 }) ?? (creating ? 0 : undefined)),
    };
  }

  router.get(
    '/rooms',
    asyncHandler(async (req, res) => {
      const { page, limit, offset } = pagination(req.query, { defaultLimit: 50 });
      const params = [];
      const where = ['r.deleted_at is null', 's.deleted_at is null', scope(req, params)];
      if (req.query.propertyId) {
        params.push(String(req.query.propertyId));
        where.push(`r.property_id = $${params.length}`);
      }
      if (['active', 'inactive'].includes(req.query.status)) {
        params.push(req.query.status);
        where.push(`r.status = $${params.length}`);
      }
      if (A.isAdmin(req) && req.query.ownerId) {
        params.push(v.uuid(req.query.ownerId, 'Propriétaire'));
        where.push(`s.owner_id = $${params.length}`);
      }
      const sqlWhere = where.join(' and ');
      const total = await query(`select count(*)::int as n from public.room_types r join public.stays s on s.id = r.property_id where ${sqlWhere}`, params);
      params.push(limit, offset);
      const result = await query(
        `select r.*, s.name as property_name, ${AVAILABLE_TODAY_SQL} as available_today,
                (select count(*) from public.rate_plans rp where rp.room_type_id = r.id and rp.deleted_at is null) as rate_count
         from public.room_types r join public.stays s on s.id = r.property_id
         where ${sqlWhere} order by s.name, r.sort_order, r.created_at limit $${params.length - 1} offset $${params.length}`,
        params
      );
      list(res, result.rows.map(A.mapRoom), { page, limit, total: total.rows[0].n });
    })
  );

  router.get(
    '/properties/:propertyId/rooms',
    asyncHandler(async (req, res) => {
      const prop = await A.loadProperty(req, req.params.propertyId);
      const result = await query(
        `select r.*, ${AVAILABLE_TODAY_SQL} as available_today,
                (select count(*) from public.rate_plans rp where rp.room_type_id = r.id and rp.deleted_at is null) as rate_count
         from public.room_types r where r.property_id = $1 and r.deleted_at is null order by r.sort_order, r.created_at`,
        [prop.id]
      );
      ok(res, result.rows.map(A.mapRoom));
    })
  );

  router.post(
    '/properties/:propertyId/rooms',
    asyncHandler(async (req, res) => {
      const prop = await A.loadProperty(req, req.params.propertyId);
      const data = parseRoom(req.body || {}, true);
      const tag = actorTag(req.actor);
      const { cols, values } = buildSets(data, { property_id: prop.id, created_by: tag, updated_by: tag });
      const result = await query(
        `insert into public.room_types (${cols.join(', ')}) values (${values.map((_, i) => `$${i + 1}${cols[i] === 'amenities' ? '::jsonb' : ''}`).join(', ')}) returning *`,
        values
      );
      await audit(req.actor, 'room.create', 'room_type', result.rows[0].id, { propertyId: prop.id, name: data.name });
      ok(res, A.mapRoom(result.rows[0]), 201);
    })
  );

  router.get(
    '/rooms/:id',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.id);
      const rates = await query('select * from public.rate_plans where room_type_id = $1 and deleted_at is null order by price', [room.id]);
      ok(res, { ...A.mapRoom(room), propertyName: room.property_name, propertyType: String(room.property_type).toUpperCase(), rates: rates.rows.map(A.mapRate) });
    })
  );

  router.put(
    '/rooms/:id',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.id);
      const data = parseRoom(req.body || {}, false);
      if (data.name === null || data.capacity_adults === null || data.total_rooms === null || data.base_price === null) {
        fail(400, 'Champ obligatoire manquant.');
      }
      const { cols, values } = buildSets(data, { updated_by: actorTag(req.actor), updated_at: new Date() });
      if (!cols.length) fail(400, 'Aucune donnée à mettre à jour.');
      values.push(room.id);
      const result = await query(
        `update public.room_types set ${cols.map((c, i) => `${c} = $${i + 1}${c === 'amenities' ? '::jsonb' : ''}`).join(', ')}
         where id = $${values.length} returning *`,
        values
      );
      if (data.total_rooms != null && data.total_rooms !== room.total_rooms) await A.clampAvailabilityToTotal(room.id, data.total_rooms);
      await audit(req.actor, 'room.update', 'room_type', room.id, { fields: Object.keys(req.body || {}) });
      ok(res, A.mapRoom(result.rows[0]));
    })
  );

  router.patch(
    '/rooms/:id/status',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.id);
      const status = v.oneOf(req.body?.status, 'Statut', ['active', 'inactive'], { required: true, lower: true });
      const result = await query('update public.room_types set status = $2, updated_by = $3, updated_at = now() where id = $1 returning *', [
        room.id,
        status,
        actorTag(req.actor),
      ]);
      await audit(req.actor, `room.${status === 'active' ? 'activate' : 'deactivate'}`, 'room_type', room.id, { name: room.name });
      ok(res, A.mapRoom(result.rows[0]));
    })
  );

  router.delete(
    '/rooms/:id',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.id);
      await query("update public.room_types set deleted_at = now(), status = 'inactive', updated_by = $2, updated_at = now() where id = $1", [
        room.id,
        actorTag(req.actor),
      ]);
      await audit(req.actor, 'room.delete', 'room_type', room.id, { name: room.name });
      ok(res, { id: room.id });
    })
  );

  // ── Tarifs ──
  function parseRate(body, creating) {
    const has = (k) => creating || Object.prototype.hasOwnProperty.call(body, k);
    const pick = (k, fn) => (has(k) ? fn() : undefined);
    return {
      name: pick('name', () => v.str(body.name, 'Nom du tarif', { required: true, max: 120 })),
      description: pick('description', () => v.str(body.description, 'Description', { max: 2000 })),
      price: pick('price', () => v.int(body.price, 'Prix', { required: true, min: 0 })),
      currency: pick('currency', () => v.oneOf(body.currency, 'Devise', ['DZD', 'EUR', 'USD'], { upper: true }) || (creating ? 'DZD' : undefined)),
      meal_plan: pick('mealPlan', () => v.oneOf(body.mealPlan, 'Formule repas', A.MEAL_PLANS, { upper: true }) || (creating ? 'ROOM_ONLY' : undefined)),
      cancellation_policy: pick('cancellationPolicy', () => v.str(body.cancellationPolicy, 'Conditions d’annulation', { max: 2000 })),
      status: pick('status', () => v.oneOf(body.status, 'Statut', ['active', 'inactive'], { lower: true }) || (creating ? 'active' : undefined)),
    };
  }

  router.get(
    '/rooms/:roomId/rates',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.roomId);
      const result = await query('select * from public.rate_plans where room_type_id = $1 and deleted_at is null order by price', [room.id]);
      ok(res, result.rows.map(A.mapRate));
    })
  );

  router.post(
    '/rooms/:roomId/rates',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.roomId);
      const data = parseRate(req.body || {}, true);
      const { cols, values } = buildSets(data, { room_type_id: room.id });
      const result = await query(
        `insert into public.rate_plans (${cols.join(', ')}) values (${values.map((_, i) => `$${i + 1}`).join(', ')}) returning *`,
        values
      );
      await audit(req.actor, 'rate.create', 'rate_plan', result.rows[0].id, { roomId: room.id, name: data.name, price: data.price });
      ok(res, A.mapRate(result.rows[0]), 201);
    })
  );

  router.put(
    '/rates/:id',
    asyncHandler(async (req, res) => {
      const rate = await A.loadRate(req, req.params.id);
      const data = parseRate(req.body || {}, false);
      if (data.name === null || data.price === null) fail(400, 'Champ obligatoire manquant.');
      const { cols, values } = buildSets(data, { updated_at: new Date() });
      values.push(rate.id);
      const result = await query(
        `update public.rate_plans set ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} where id = $${values.length} returning *`,
        values
      );
      await audit(req.actor, 'rate.update', 'rate_plan', rate.id, { fields: Object.keys(req.body || {}) });
      ok(res, A.mapRate(result.rows[0]));
    })
  );

  router.patch(
    '/rates/:id/status',
    asyncHandler(async (req, res) => {
      const rate = await A.loadRate(req, req.params.id);
      const status = v.oneOf(req.body?.status, 'Statut', ['active', 'inactive'], { required: true, lower: true });
      const result = await query('update public.rate_plans set status = $2, updated_at = now() where id = $1 returning *', [rate.id, status]);
      await audit(req.actor, `rate.${status === 'active' ? 'activate' : 'deactivate'}`, 'rate_plan', rate.id);
      ok(res, A.mapRate(result.rows[0]));
    })
  );

  router.delete(
    '/rates/:id',
    asyncHandler(async (req, res) => {
      const rate = await A.loadRate(req, req.params.id);
      await query("update public.rate_plans set deleted_at = now(), status = 'inactive', updated_at = now() where id = $1", [rate.id]);
      await audit(req.actor, 'rate.delete', 'rate_plan', rate.id, { name: rate.name });
      ok(res, { id: rate.id });
    })
  );

  // ── Tarifs saisonniers ──
  async function parseSeasonal(body, room, creating) {
    const startDate = v.date(body.startDate, 'Date de début', { required: creating });
    const endDate = v.date(body.endDate, 'Date de fin', { required: creating });
    if (startDate && endDate && startDate > endDate) fail(400, 'La date de début doit être antérieure ou égale à la date de fin.');
    let ratePlanId;
    if ('ratePlanId' in body) {
      ratePlanId = body.ratePlanId ? v.uuid(body.ratePlanId, 'Tarif') : null;
      if (ratePlanId) {
        const rp = await query('select 1 from public.rate_plans where id = $1 and room_type_id = $2 and deleted_at is null', [ratePlanId, room.id]);
        if (!rp.rows.length) fail(400, 'Ce tarif n’appartient pas à cette chambre.');
      }
    }
    return {
      label: 'label' in body || creating ? v.str(body.label, 'Libellé', { max: 120 }) : undefined,
      start_date: startDate ?? undefined,
      end_date: endDate ?? undefined,
      price: 'price' in body || creating ? v.int(body.price, 'Prix', { required: true, min: 0 }) : undefined,
      rate_plan_id: ratePlanId,
      status: 'status' in body ? v.oneOf(body.status, 'Statut', ['active', 'inactive'], { lower: true }) : creating ? 'active' : undefined,
    };
  }

  router.get(
    '/rooms/:roomId/seasonal-rates',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.roomId);
      const result = await query('select * from public.seasonal_rates where room_type_id = $1 order by start_date', [room.id]);
      ok(res, result.rows.map(A.mapSeasonal));
    })
  );

  router.post(
    '/rooms/:roomId/seasonal-rates',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.roomId);
      const data = await parseSeasonal(req.body || {}, room, true);
      const { cols, values } = buildSets(data, { room_type_id: room.id });
      const result = await query(
        `insert into public.seasonal_rates (${cols.join(', ')}) values (${values.map((_, i) => `$${i + 1}`).join(', ')}) returning *`,
        values
      );
      await audit(req.actor, 'seasonal_rate.create', 'room_type', room.id, { startDate: data.start_date, endDate: data.end_date, price: data.price });
      ok(res, A.mapSeasonal(result.rows[0]), 201);
    })
  );

  router.put(
    '/seasonal-rates/:id',
    asyncHandler(async (req, res) => {
      const sr = await A.loadSeasonal(req, req.params.id);
      const data = await parseSeasonal(req.body || {}, { id: sr.room_type_id }, false);
      const start = data.start_date || A.isoDate(sr.start_date);
      const end = data.end_date || A.isoDate(sr.end_date);
      if (start > end) fail(400, 'La date de début doit être antérieure ou égale à la date de fin.');
      const { cols, values } = buildSets(data, { updated_at: new Date() });
      values.push(sr.id);
      const result = await query(
        `update public.seasonal_rates set ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} where id = $${values.length} returning *`,
        values
      );
      await audit(req.actor, 'seasonal_rate.update', 'room_type', sr.room_type_id);
      ok(res, A.mapSeasonal(result.rows[0]));
    })
  );

  router.delete(
    '/seasonal-rates/:id',
    asyncHandler(async (req, res) => {
      const sr = await A.loadSeasonal(req, req.params.id);
      await query('delete from public.seasonal_rates where id = $1', [sr.id]);
      await audit(req.actor, 'seasonal_rate.delete', 'room_type', sr.room_type_id);
      ok(res, { id: sr.id });
    })
  );

  // ── Disponibilités ──
  router.get(
    '/rooms/:roomId/availability',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.roomId);
      const from = v.date(req.query.from, 'Date de début') || A.todayIso();
      const to = v.date(req.query.to, 'Date de fin') || A.addDays(from, 41);
      ok(res, { room: A.mapRoom(room), days: await A.getCalendar(room, from, to) });
    })
  );

  router.post(
    '/rooms/:roomId/availability',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.roomId);
      const day = A.parseDayInput(req.body || {}, room);
      const [updated] = await withTransaction((client) => A.applyDays(client, room, [day.date], day));
      await audit(req.actor, 'availability.set', 'room_type', room.id, { date: day.date, status: day.status, quantity: day.availableQuantity });
      ok(res, updated);
    })
  );

  router.post(
    '/rooms/:roomId/availability/bulk',
    asyncHandler(async (req, res) => {
      const room = await A.loadRoom(req, req.params.roomId);
      const body = req.body || {};
      const startDate = v.date(body.startDate, 'Date de début', { required: true });
      const endDate = v.date(body.endDate, 'Date de fin', { required: true });
      A.checkRange(startDate, endDate);
      const day = A.parseDayInput(body, room, { requireDate: false });
      let dates = A.dateRange(startDate, endDate);
      if (Array.isArray(body.weekdays) && body.weekdays.length) {
        const keep = new Set(body.weekdays.map(Number));
        dates = dates.filter((d) => keep.has(new Date(`${d}T00:00:00Z`).getUTCDay()));
      }
      const updated = await withTransaction((client) => A.applyDays(client, room, dates, day));
      await audit(req.actor, 'availability.bulk', 'room_type', room.id, {
        startDate,
        endDate,
        status: day.status,
        quantity: day.availableQuantity,
        price: day.priceOverride,
      });
      ok(res, { updated: updated.length, days: updated });
    })
  );

  router.put(
    '/availability/:id',
    asyncHandler(async (req, res) => {
      const row = await A.loadAvailability(req, req.params.id);
      const room = { id: row.room_type_id, total_rooms: row.total_rooms };
      const day = A.parseDayInput(req.body || {}, room, { requireDate: false });
      const [updated] = await withTransaction((client) => A.applyDays(client, room, [A.isoDate(row.date)], day));
      await audit(req.actor, 'availability.update', 'room_type', row.room_type_id, { date: A.isoDate(row.date) });
      ok(res, updated);
    })
  );

  router.patch(
    '/availability/:id/status',
    asyncHandler(async (req, res) => {
      const row = await A.loadAvailability(req, req.params.id);
      const status = v.oneOf(req.body?.status, 'Statut', ['AVAILABLE', 'UNAVAILABLE'], { required: true, upper: true });
      const result = await query('update public.room_availability set status = $2, updated_at = now() where id = $1 returning *', [row.id, status]);
      await audit(req.actor, status === 'AVAILABLE' ? 'availability.open' : 'availability.block', 'room_type', row.room_type_id, { date: A.isoDate(row.date) });
      ok(res, A.mapAvailability(result.rows[0]));
    })
  );

  // ── Réservations ──
  function reservationScope(req, params) {
    if (A.isAdmin(req)) return "(r.property_id is not null or r.item_type = 'stay')";
    params.push(req.owner.id);
    const p = `$${params.length}`;
    return `(r.owner_id = ${p} or (r.item_type = 'stay' and r.owner_id is null and r.item_id in (select id from public.stays where owner_id = ${p})))`;
  }

  const RESERVATION_SELECT = `select r.*, coalesce(s.name, s2.name) as property_name, rt.name as room_name, rp.name as rate_plan_name
    from public.reservations r
    left join public.stays s on s.id = r.property_id
    left join public.stays s2 on r.property_id is null and r.item_type = 'stay' and s2.id = r.item_id
    left join public.room_types rt on rt.id = r.room_type_id
    left join public.rate_plans rp on rp.id = r.rate_plan_id`;

  router.get(
    '/reservations',
    asyncHandler(async (req, res) => {
      const { page, limit, offset } = pagination(req.query);
      const params = [];
      const where = [reservationScope(req, params)];
      if (RESERVATION_STATUSES.includes(req.query.status)) {
        params.push(req.query.status);
        where.push(`r.status = $${params.length}`);
      }
      if (req.query.propertyId) {
        params.push(String(req.query.propertyId));
        where.push(`coalesce(r.property_id, r.item_id) = $${params.length}`);
      }
      if (req.query.q) {
        params.push(`%${String(req.query.q).trim().toLowerCase()}%`);
        where.push(`(lower(r.client_name) like $${params.length} or lower(r.client_email) like $${params.length} or lower(coalesce(r.reference_code, '')) like $${params.length})`);
      }
      const sqlWhere = where.join(' and ');
      const total = await query(`select count(*)::int as n from public.reservations r where ${sqlWhere}`, params);
      params.push(limit, offset);
      const result = await query(
        `${RESERVATION_SELECT} where ${sqlWhere} order by r.created_at desc limit $${params.length - 1} offset $${params.length}`,
        params
      );
      list(res, result.rows.map(A.mapReservation), { page, limit, total: total.rows[0].n });
    })
  );

  router.get(
    '/reservations/:id',
    asyncHandler(async (req, res) => {
      const params = [v.uuid(req.params.id, 'Réservation')];
      const result = await query(`${RESERVATION_SELECT} where r.id = $1 and ${reservationScope(req, params)}`, params);
      if (!result.rows.length) fail(404, 'Réservation introuvable.');
      ok(res, A.mapReservation(result.rows[0]));
    })
  );

  router.patch(
    '/reservations/:id/status',
    asyncHandler(async (req, res) => {
      const id = v.uuid(req.params.id, 'Réservation');
      const status = v.oneOf(req.body?.status, 'Statut', ['reviewed', 'confirmed', 'rejected', 'cancelled'], { required: true, lower: true });
      const params = [id];
      const visible = await query(`select r.id from public.reservations r where r.id = $1 and ${reservationScope(req, params)}`, params);
      if (!visible.rows.length) fail(404, 'Réservation introuvable.');
      const updated = await withTransaction(async (client) => {
        const row = (await client.query('select * from public.reservations where id = $1 for update', [id])).rows[0];
        if (RELEASED.has(status)) await A.releaseInventory(client, row);
        else if (RELEASED.has(row.status)) await A.rehold(client, row);
        return (await client.query('update public.reservations set status = $2 where id = $1 returning *', [id, status])).rows[0];
      });
      await audit(req.actor, 'reservation.status', 'reservation', id, { status });
      ok(res, A.mapReservation(updated));
    })
  );

  router.get(
    '/audit',
    asyncHandler(async (req, res) => {
      const params = [];
      let where = 'true';
      if (!A.isAdmin(req)) {
        params.push(String(req.owner.id), req.owner.id);
        where = `(actor_id = $1 or (entity = 'property' and entity_id in (select id from public.stays where owner_id = $2)))`;
      }
      const result = await query(`select * from public.audit_logs where ${where} order by created_at desc limit 100`, params);
      ok(res, result.rows);
    })
  );

  router.use(apiErrorHandler);
  return router;
}

module.exports = { makeAccommodationRouter };
