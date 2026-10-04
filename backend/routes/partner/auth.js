const express = require('express');
const { query } = require('../../config/db');
const { asyncHandler } = require('../../lib/asyncHandler');
const { hashPassword, verifyPassword } = require('../../lib/password');
const { signPartnerToken } = require('../../lib/jwt');
const { mapStay } = require('../../lib/mappers');

const router = express.Router();

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

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password || '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const userResult = await query(
      `select hu.*, s.name as hotel_name, s.published as hotel_published, s.image as hotel_image
       from public.hotel_users hu
       join public.stays s on s.id = hu.hotel_id and s.type = 'hotel'
       where lower(hu.email) = $1`,
      [email]
    );

    if (!userResult.rows.length) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const user = userResult.rows[0];
    if (!user.active) {
      return res.status(403).json({ error: 'Compte désactivé. Contactez Algeria Travel.' });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const token = signPartnerToken({
      sub: user.id,
      hotelId: user.hotel_id,
      email: user.email,
    });

    res.json({
      token,
      user: mapHotelUser(user),
      hotel: {
        id: user.hotel_id,
        name: user.hotel_name,
        published: user.hotel_published,
        image: user.hotel_image,
      },
    });
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.headers['x-partner-token'];
    if (!token) return res.status(401).json({ error: 'Authentification requise.' });

    const { verifyToken } = require('../../lib/jwt');
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Session expirée.' });
    }

    const userResult = await query(
      `select hu.*, s.name as hotel_name, s.published as hotel_published, s.image as hotel_image
       from public.hotel_users hu
       join public.stays s on s.id = hu.hotel_id
       where hu.id = $1 and hu.active = true`,
      [payload.sub]
    );

    if (!userResult.rows.length) {
      return res.status(401).json({ error: 'Compte introuvable.' });
    }

    const user = userResult.rows[0];
    res.json({
      user: mapHotelUser(user),
      hotel: {
        id: user.hotel_id,
        name: user.hotel_name,
        published: user.hotel_published,
        image: user.hotel_image,
      },
    });
  })
);

module.exports = router;
