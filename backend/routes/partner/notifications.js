const express = require('express');
const { asyncHandler } = require('../../lib/asyncHandler');
const { partnerAuth } = require('../../middleware/partnerAuth');
const {
  listPartnerNotifications,
  countUnreadPartnerNotifications,
  markPartnerNotificationRead,
  markAllPartnerNotificationsRead,
} = require('../../lib/partnerNotifications');

const router = express.Router();

router.get(
  '/',
  partnerAuth,
  asyncHandler(async (req, res) => {
    const hotelId = req.partner.hotelId;
    const unreadOnly = req.query.unread === '1';
    const [items, unreadCount] = await Promise.all([
      listPartnerNotifications(hotelId, { unreadOnly }),
      countUnreadPartnerNotifications(hotelId),
    ]);
    res.json({ notifications: items, unreadCount });
  })
);

router.patch(
  '/read-all',
  partnerAuth,
  asyncHandler(async (req, res) => {
    await markAllPartnerNotificationsRead(req.partner.hotelId);
    res.json({ success: true });
  })
);

router.patch(
  '/:id/read',
  partnerAuth,
  asyncHandler(async (req, res) => {
    const ok = await markPartnerNotificationRead(req.partner.hotelId, Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Notification introuvable.' });
    const unreadCount = await countUnreadPartnerNotifications(req.partner.hotelId);
    res.json({ success: true, unreadCount });
  })
);

module.exports = router;
