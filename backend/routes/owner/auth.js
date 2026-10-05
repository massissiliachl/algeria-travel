const express = require('express');
const { query } = require('../../config/db');
const { asyncHandler } = require('../../lib/asyncHandler');
const { hashPassword, verifyPassword } = require('../../lib/password');
const { signOwnerToken } = require('../../lib/jwt');
const { createRateLimiter } = require('../../middleware/rateLimit');
const { authenticateOwner } = require('../../middleware/ownerAuth');
const { ok, fail, apiErrorHandler, v } = require('../../lib/api');
const { mapOwner } = require('../../lib/accommodation');
const { audit } = require('../../lib/audit');

const router = express.Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.OWNER_LOGIN_RATE_LIMIT) || 10,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
});

/** Hash factice : le temps de réponse est le même que l'email existe ou non. */
const dummyHash = hashPassword('compte-inexistant-0');

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) fail(400, 'Email et mot de passe requis.');

    const result = await query('select * from public.owners where lower(email) = $1 and deleted_at is null', [email]);
    const owner = result.rows[0];
    const valid = await verifyPassword(password, owner?.password_hash || (await dummyHash));
    if (!owner || !valid) fail(401, 'Email ou mot de passe incorrect.');
    if (owner.status !== 'active') fail(403, 'Compte désactivé. Contactez Algeria Travel.');

    const updated = await query('update public.owners set last_login = now() where id = $1 returning *', [owner.id]);
    ok(res, { token: signOwnerToken(owner), owner: mapOwner(updated.rows[0]) });
  })
);

router.get(
  '/me',
  authenticateOwner,
  asyncHandler(async (req, res) => {
    const result = await query('select * from public.owners where id = $1', [req.owner.id]);
    ok(res, mapOwner(result.rows[0]));
  })
);

/** Le propriétaire modifie ses coordonnées et son mot de passe (pas son email ni son statut). */
router.put(
  '/me',
  authenticateOwner,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const sets = [];
    const values = [];
    const set = (col, val) => {
      values.push(val);
      sets.push(`${col} = $${values.length}`);
    };
    if ('phone' in body) set('phone', v.phone(body.phone, 'Téléphone', { required: true }));
    if ('whatsapp' in body) set('whatsapp', v.phone(body.whatsapp, 'WhatsApp'));
    if ('address' in body) set('address', v.str(body.address, 'Adresse', { max: 300 }));
    if (body.newPassword) {
      const current = await query('select password_hash from public.owners where id = $1', [req.owner.id]);
      if (!(await verifyPassword(String(body.currentPassword || ''), current.rows[0].password_hash))) {
        fail(400, 'Mot de passe actuel incorrect.');
      }
      v.password(body.newPassword);
      if (body.confirmPassword !== undefined && body.confirmPassword !== body.newPassword) {
        fail(400, 'Les mots de passe ne correspondent pas.');
      }
      set('password_hash', await hashPassword(body.newPassword));
    }
    if (!sets.length) fail(400, 'Aucune donnée à mettre à jour.');
    values.push(`owner:${req.owner.id}`, req.owner.id);
    const result = await query(
      `update public.owners set ${sets.join(', ')}, updated_by = $${values.length - 1}, updated_at = now()
       where id = $${values.length} returning *`,
      values
    );
    await audit(req.actor, 'owner.update_profile', 'owner', req.owner.id, { password: Boolean(body.newPassword) });
    ok(res, mapOwner(result.rows[0]));
  })
);

router.use(apiErrorHandler);

module.exports = router;
