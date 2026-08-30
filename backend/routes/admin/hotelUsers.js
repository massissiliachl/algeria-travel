const express = require('express');
const { query } = require('../../config/db');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const { hashPassword } = require('../../lib/password');

const router = express.Router();
router.use(adminAuth);

function mapHotelUser(row) {
  return {
    id: row.id,
    hotelId: row.hotel_id,
    email: row.email,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    let sql = `select hu.*, s.name as hotel_name
               from public.hotel_users hu
               join public.stays s on s.id = hu.hotel_id`;
    const params = [];
    if (req.query.hotelId) {
      params.push(req.query.hotelId);
      sql += ` where hu.hotel_id = $${params.length}`;
    }
    sql += ' order by hu.created_at desc';
    const result = await query(sql, params);
    res.json({
      total: result.rows.length,
      items: result.rows.map((row) => ({
        ...mapHotelUser(row),
        hotelName: row.hotel_name,
      })),
    });
  })
);

router.get(
  '/by-hotel/:hotelId',
  asyncHandler(async (req, res) => {
    const result = await query(
      `select * from public.hotel_users where hotel_id = $1`,
      [req.params.hotelId]
    );
    if (!result.rows.length) {
      return res.json({ account: null });
    }
    res.json({ account: mapHotelUser(result.rows[0]) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const hotelId = String(req.body?.hotelId || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password || '';

    if (!hotelId || !email || !password) {
      return res.status(400).json({ error: 'hotelId, email et mot de passe requis.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Mot de passe : minimum 8 caractères.' });
    }

    const hotel = await query(
      `select id from public.stays where id = $1 and type = 'hotel'`,
      [hotelId]
    );
    if (!hotel.rows.length) {
      return res.status(404).json({ error: 'Hôtel introuvable.' });
    }

    const existing = await query(
      `select id from public.hotel_users where hotel_id = $1 or lower(email) = $2`,
      [hotelId, email]
    );
    if (existing.rows.length) {
      return res.status(409).json({ error: 'Un compte existe déjà pour cet hôtel ou cet email.' });
    }

    const passwordHash = await hashPassword(password);
    const result = await query(
      `insert into public.hotel_users (hotel_id, email, password_hash)
       values ($1, $2, $3) returning *`,
      [hotelId, email, passwordHash]
    );

    res.status(201).json(mapHotelUser(result.rows[0]));
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const updates = [];
    const values = [];
    let i = 1;

    if (req.body?.email) {
      updates.push(`email = $${i++}`);
      values.push(String(req.body.email).trim().toLowerCase());
    }
    if (req.body?.password) {
      if (req.body.password.length < 8) {
        return res.status(400).json({ error: 'Mot de passe : minimum 8 caractères.' });
      }
      updates.push(`password_hash = $${i++}`);
      values.push(await hashPassword(req.body.password));
    }
    if (req.body?.active !== undefined) {
      updates.push(`active = $${i++}`);
      values.push(Boolean(req.body.active));
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour.' });
    }

    updates.push('updated_at = now()');
    values.push(req.params.id);

    const result = await query(
      `update public.hotel_users set ${updates.join(', ')} where id = $${values.length} returning *`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Compte introuvable.' });
    }

    res.json(mapHotelUser(result.rows[0]));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await query(
      `delete from public.hotel_users where id = $1 returning id`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Compte introuvable.' });
    }
    res.json({ success: true, id: result.rows[0].id });
  })
);

module.exports = router;
