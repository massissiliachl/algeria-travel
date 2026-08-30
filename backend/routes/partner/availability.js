const express = require('express');
const { asyncHandler } = require('../../lib/asyncHandler');
const { partnerAuth } = require('../../middleware/partnerAuth');
const {
  parseIsoDate,
  addDays,
  getAvailabilityRange,
  getRoomAvailabilityRange,
  upsertPartnerDays,
  bulkSetPartnerRange,
  upsertRoomDays,
  bulkSetRoomRange,
} = require('../../lib/hotelAvailability');

const router = express.Router();

router.get(
  '/',
  partnerAuth,
  asyncHandler(async (req, res) => {
    const hotelId = req.partner.hotelId;
    const today = new Date().toISOString().slice(0, 10);
    const from = parseIsoDate(req.query.from) || today;
    const to = parseIsoDate(req.query.to) || addDays(from, 90);
    const roomIndex = req.query.room ? Number(req.query.room) : null;

    if (roomIndex) {
      const range = await getRoomAvailabilityRange(hotelId, roomIndex, from, to, { partner: true });
      if (!range) {
        return res.status(404).json({ error: 'Hôtel introuvable.' });
      }
      return res.json(range);
    }

    const range = await getAvailabilityRange(hotelId, from, to, { partner: true });
    if (!range) {
      return res.status(404).json({ error: 'Hôtel introuvable.' });
    }

    res.json(range);
  })
);

router.put(
  '/',
  partnerAuth,
  asyncHandler(async (req, res) => {
    const hotelId = req.partner.hotelId;
    const { days, from, to, roomsTotal, closed, priceOverride, roomIndex, available } = req.body || {};

    if (roomIndex != null) {
      if (Array.isArray(days) && days.length) {
        const updated = await upsertRoomDays(hotelId, roomIndex, days);
        return res.json({ success: true, updated, roomIndex: Number(roomIndex) });
      }

      if (from && to) {
        const updated = await bulkSetRoomRange(hotelId, roomIndex, from, to, available !== false);
        return res.json({ success: true, updated, roomIndex: Number(roomIndex) });
      }

      return res.status(400).json({ error: 'Fournissez roomIndex avec days[] ou from/to.' });
    }

    if (Array.isArray(days) && days.length) {
      await upsertPartnerDays(hotelId, days);
      return res.json({ success: true, updated: days.length });
    }

    if (from && to) {
      const count = await bulkSetPartnerRange(hotelId, from, to, {
        roomsTotal: Math.max(0, Number(roomsTotal) || 0),
        closed: Boolean(closed),
        priceOverride:
          priceOverride != null && priceOverride !== ''
            ? Math.max(0, Number(priceOverride))
            : null,
      });
      return res.json({ success: true, updated: count });
    }

    return res.status(400).json({ error: 'Fournissez days[] ou from/to.' });
  })
);

module.exports = router;
