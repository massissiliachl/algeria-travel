const express = require('express');
const { query } = require('../../config/db');
const { asyncHandler } = require('../../lib/asyncHandler');
const { partnerAuth } = require('../../middleware/partnerAuth');
const { mapReservation } = require('../../lib/partnerNotifications');

const router = express.Router();

router.get(
  '/',
  partnerAuth,
  asyncHandler(async (req, res) => {
    const hotelId = req.partner.hotelId;
    const result = await query(
      `select * from public.reservations
       where item_type = 'stay' and item_id = $1
       order by created_at desc
       limit 100`,
      [hotelId]
    );
    res.json({ reservations: result.rows.map(mapReservation) });
  })
);

router.get(
  '/:id',
  partnerAuth,
  asyncHandler(async (req, res) => {
    const hotelId = req.partner.hotelId;
    const result = await query(
      `select * from public.reservations
       where id = $1 and item_type = 'stay' and item_id = $2`,
      [req.params.id, hotelId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }
    res.json(mapReservation(result.rows[0]));
  })
);

module.exports = router;
