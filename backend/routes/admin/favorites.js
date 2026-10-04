const express = require('express');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const { getFavoriteStats } = require('../../lib/favoriteStats');

const router = express.Router();

router.get(
  '/stats',
  adminAuth,
  asyncHandler(async (req, res) => {
    res.json(await getFavoriteStats());
  })
);

module.exports = router;
