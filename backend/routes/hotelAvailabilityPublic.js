const express = require('express');
const { asyncHandler } = require('../lib/asyncHandler');
const {
  parseIsoDate,
  addDays,
  getAvailabilityRange,
  checkStayAvailability,
} = require('../lib/hotelAvailability');

const router = express.Router();

router.get(
  '/:id/availability',
  asyncHandler(async (req, res) => {
    const hotelId = req.params.id;
    const today = new Date().toISOString().slice(0, 10);
    const from = parseIsoDate(req.query.from) || today;
    const to = parseIsoDate(req.query.to) || addDays(from, 60);

    if (to < from) {
      return res.status(400).json({ error: 'Plage de dates invalide.' });
    }

    const range = await getAvailabilityRange(hotelId, from, to);
    if (!range) {
      return res.status(404).json({ error: 'Hôtel introuvable.' });
    }

    res.json(range);
  })
);

router.get(
  '/:id/availability/check',
  asyncHandler(async (req, res) => {
    const hotelId = req.params.id;
    const checkIn = parseIsoDate(req.query.checkIn);
    const checkOut = parseIsoDate(req.query.checkOut);
    const roomsRequested = Math.max(1, Number(req.query.rooms) || 1);

    const result = await checkStayAvailability(hotelId, checkIn, checkOut, roomsRequested);
    if (!result.ok) {
      return res.status(409).json({ available: false, error: result.error });
    }

    res.json({
      available: true,
      nights: result.nights,
      totalPrice: result.totalPrice,
      nightly: result.nightly,
    });
  })
);

module.exports = router;
