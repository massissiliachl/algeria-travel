const express = require('express');
const { query } = require('../../config/db');
const { asyncHandler } = require('../../lib/asyncHandler');
const { partnerAuth } = require('../../middleware/partnerAuth');
const { mapStay, makeBuilders, stayFields } = require('../../lib/mappers');
const { pickPartnerPayload } = require('../../lib/partnerHotelFields');

const router = express.Router();
const { buildUpdate } = makeBuilders(stayFields, { requireId: true });

router.get(
  '/',
  partnerAuth,
  asyncHandler(async (req, res) => {
    const result = await query(
      `select * from public.stays where id = $1 and type = 'hotel'`,
      [req.partner.hotelId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Hôtel introuvable.' });
    }
    res.json(mapStay(result.rows[0]));
  })
);

router.put(
  '/',
  partnerAuth,
  asyncHandler(async (req, res) => {
    const hotelId = req.partner.hotelId;
    const payload = pickPartnerPayload(req.body);
    const { columns, values } = buildUpdate(payload);

    if (!columns.length) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour.' });
    }

    const sets = columns.map((col, i) => {
      const q = col === 'desc' ? '"desc"' : col;
      return `${q} = $${i + 1}`;
    });
    sets.push('updated_at = now()');
    values.push(hotelId);

    const prev = await query(
      `select published from public.stays where id = $1 and type = 'hotel'`,
      [hotelId]
    );
    if (!prev.rows.length) {
      return res.status(404).json({ error: 'Hôtel introuvable.' });
    }

    const result = await query(
      `update public.stays set ${sets.join(', ')}
       where id = $${values.length} and type = 'hotel'
       returning *`,
      values
    );

    const row = result.rows[0];
    const wasPublished = prev.rows[0]?.published === true;
    if (row.published !== false && !wasPublished) {
      const { notifyContentPublished } = require('../../lib/contentNotify');
      notifyContentPublished('hotels', row).catch((err) =>
        console.error('[notify]', err.message)
      );
    }

    res.json(mapStay(row));
  })
);

module.exports = router;
