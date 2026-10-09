const express = require('express');
const { requireAdmin } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const { listActivity } = require('../../lib/partnerActivity');

const router = express.Router();
router.use(requireAdmin);

/** Modifications faites par les partenaires (chambres, tarifs, disponibilités…), les plus récentes d'abord. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await listActivity({ after: req.query.after, limit: req.query.limit });
    res.json({ items, latestId: items[0]?.id || Number(req.query.after) || 0 });
  })
);

module.exports = router;
