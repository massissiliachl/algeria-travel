const express = require('express');
const authRoutes = require('./auth');
const hotelRoutes = require('./hotel');
const mediaRoutes = require('./media');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/hotel', hotelRoutes);
router.use('/availability', require('./availability'));
router.use('/media', mediaRoutes);
router.use('/notifications', require('./notifications'));
router.use('/reservations', require('./reservations'));

module.exports = router;
