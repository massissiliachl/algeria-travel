const express = require('express');
const { query } = require('../../config/db');
const { requireAdmin } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const { hashPassword } = require('../../lib/password');
const { ok, list, fail, apiErrorHandler, pagination, v } = require('../../lib/api');
const { mapOwner, mapProperty } = require('../../lib/accommodation');
const { audit } = require('../../lib/audit');
const { notifyOwner } = require('../../lib/ownerNotifications');

const router = express.Router();
router.use(requireAdmin, (req, res, next) => {
  req.actor = { type: 'admin', id: 'admin', label: 'Admin' };
  next();
});

const SORTS = { name: 'o.last_name', email: 'o.email', created: 'o.created_at', properties: 'property_count', login: 'o.last_login' };

async function findOwner(id) {
  v.uuid(id, 'Propriétaire');
  const result = await query('select * from public.owners where id = $1 and deleted_at is null', [id]);
  if (!result.rows.length) fail(404, "Ce propriétaire n'existe pas.");
  return result.rows[0];
}

function parseOwner(body, { creating }) {
  const data = {
    first_name: v.str(body.firstName, 'Prénom', { required: creating, max: 80 }),
    last_name: v.str(body.lastName, 'Nom', { required: creating, max: 80 }),
    email: v.email(body.email, 'Email', { required: creating }),
    phone: v.phone(body.phone, 'Téléphone', { required: creating }),
    whatsapp: v.phone(body.whatsapp, 'WhatsApp'),
    address: v.str(body.address, 'Adresse', { max: 300 }),
    status: v.oneOf(body.status, 'Statut', ['active', 'inactive'], { lower: true }),
  };
  if (creating || body.password) {
    v.password(body.password);
    if (body.confirmPassword !== undefined && body.confirmPassword !== body.password) {
      fail(400, 'Les mots de passe ne correspondent pas.');
    }
  }
  return data;
}

async function assertEmailFree(email, exceptId = null) {
  const result = await query(
    'select 1 from public.owners where lower(email) = $1 and ($2::uuid is null or id <> $2)',
    [email, exceptId]
  );
  if (result.rows.length) fail(409, 'Un propriétaire utilise déjà cet email.');
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = pagination(req.query);
    const where = ['o.deleted_at is null'];
    const params = [];
    if (req.query.q) {
      params.push(`%${String(req.query.q).trim().toLowerCase()}%`);
      where.push(`(lower(o.first_name || ' ' || o.last_name) like $${params.length} or lower(o.email) like $${params.length} or o.phone like $${params.length})`);
    }
    if (['active', 'inactive'].includes(req.query.status)) {
      params.push(req.query.status);
      where.push(`o.status = $${params.length}`);
    }
    const sort = SORTS[req.query.sort] || 'o.created_at';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';
    const total = await query(`select count(*)::int as n from public.owners o where ${where.join(' and ')}`, params);
    params.push(limit, offset);
    const result = await query(
      `select o.*, (select count(*) from public.stays s where s.owner_id = o.id and s.deleted_at is null) as property_count
       from public.owners o where ${where.join(' and ')}
       order by ${sort} ${order} nulls last limit $${params.length - 1} offset $${params.length}`,
      params
    );
    list(res, result.rows.map(mapOwner), { page, limit, total: total.rows[0].n });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const owner = await findOwner(req.params.id);
    const properties = await query(
      `select s.*, (select coalesce(sum(r.total_rooms), 0) from public.room_types r where r.property_id = s.id and r.deleted_at is null) as room_count
       from public.stays s where s.owner_id = $1 and s.deleted_at is null order by s.name`,
      [owner.id]
    );
    const stats = await query(
      `select count(*)::int as reservations, count(*) filter (where status = 'pending')::int as pending
       from public.reservations where owner_id = $1`,
      [owner.id]
    );
    ok(res, {
      ...mapOwner(owner),
      properties: properties.rows.map((row) => mapProperty(row)),
      stats: stats.rows[0],
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = parseOwner(req.body || {}, { creating: true });
    await assertEmailFree(data.email);
    const passwordHash = await hashPassword(req.body.password);
    const result = await query(
      `insert into public.owners (first_name, last_name, email, phone, whatsapp, address, password_hash, status, created_by, updated_by)
       values ($1, $2, $3, $4, $5, $6, $7, $8, 'admin', 'admin') returning *`,
      [data.first_name, data.last_name, data.email, data.phone, data.whatsapp, data.address, passwordHash, data.status || 'active']
    );
    const owner = result.rows[0];
    await audit(req.actor, 'owner.create', 'owner', owner.id, { email: owner.email });
    notifyOwner(owner.id, 'account_created');
    ok(res, mapOwner(owner), 201);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const owner = await findOwner(req.params.id);
    const data = parseOwner(req.body || {}, { creating: false });
    if (data.email && data.email !== owner.email.toLowerCase()) await assertEmailFree(data.email, owner.id);
    const sets = [];
    const values = [];
    const clearable = { whatsapp: 'whatsapp', address: 'address' };
    for (const [col, val] of Object.entries(data)) {
      if (val === null && !(clearable[col] && clearable[col] in req.body)) continue;
      values.push(val);
      sets.push(`${col} = $${values.length}`);
    }
    if (req.body.password) {
      values.push(await hashPassword(req.body.password));
      sets.push(`password_hash = $${values.length}`);
    }
    if (!sets.length) fail(400, 'Aucune donnée à mettre à jour.');
    values.push(owner.id);
    const result = await query(
      `update public.owners set ${sets.join(', ')}, updated_by = 'admin', updated_at = now() where id = $${values.length} returning *`,
      values
    );
    const updated = result.rows[0];
    await audit(req.actor, 'owner.update', 'owner', owner.id, { fields: Object.keys(req.body || {}).filter((k) => !/password/i.test(k)) });
    if (data.status && data.status !== owner.status) notifyOwner(owner.id, 'account_status_changed', { status: data.status });
    ok(res, mapOwner(updated));
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const owner = await findOwner(req.params.id);
    const status = v.oneOf(req.body?.status, 'Statut', ['active', 'inactive'], { required: true, lower: true });
    const result = await query(
      "update public.owners set status = $2, updated_by = 'admin', updated_at = now() where id = $1 returning *",
      [owner.id, status]
    );
    await audit(req.actor, status === 'active' ? 'owner.activate' : 'owner.deactivate', 'owner', owner.id);
    if (status !== owner.status) notifyOwner(owner.id, 'account_status_changed', { status });
    ok(res, mapOwner(result.rows[0]));
  })
);

router.post(
  '/:id/reset-password',
  asyncHandler(async (req, res) => {
    const owner = await findOwner(req.params.id);
    const password = v.password(req.body?.password);
    if (req.body.confirmPassword !== undefined && req.body.confirmPassword !== password) {
      fail(400, 'Les mots de passe ne correspondent pas.');
    }
    await query("update public.owners set password_hash = $2, updated_by = 'admin', updated_at = now() where id = $1", [
      owner.id,
      await hashPassword(password),
    ]);
    await audit(req.actor, 'owner.reset_password', 'owner', owner.id);
    ok(res, { id: owner.id });
  })
);

/** Suppression logique : le compte est désactivé et masqué, ses biens deviennent inactifs (historique conservé). */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const owner = await findOwner(req.params.id);
    await query(
      `update public.owners set deleted_at = now(), status = 'inactive', email = email || '#deleted-' || extract(epoch from now())::bigint,
       updated_by = 'admin', updated_at = now() where id = $1`,
      [owner.id]
    );
    await query(
      "update public.stays set status = 'inactive', published = false, updated_by = 'admin', updated_at = now() where owner_id = $1 and deleted_at is null",
      [owner.id]
    );
    await audit(req.actor, 'owner.delete', 'owner', owner.id, { email: owner.email });
    ok(res, { id: owner.id });
  })
);

router.get(
  '/:id/audit',
  asyncHandler(async (req, res) => {
    const owner = await findOwner(req.params.id);
    const result = await query(
      `select * from public.audit_logs
       where (entity = 'owner' and entity_id = $1) or actor_id = $1
          or (entity = 'property' and entity_id in (select id from public.stays where owner_id = $2))
       order by created_at desc limit 100`,
      [owner.id, owner.id]
    );
    ok(res, result.rows);
  })
);

router.use(apiErrorHandler);

module.exports = router;
