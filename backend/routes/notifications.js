const express = require('express');
const { asyncHandler } = require('../lib/asyncHandler');
const {
  getVapidPublicKey,
  isPushConfigured,
  getFeedSince,
  saveFcmToken,
  removeFcmToken,
  saveSubscription,
  removeSubscription,
} = require('../lib/notificationService');

const router = express.Router();

router.get(
  '/vapid-public-key',
  asyncHandler(async (req, res) => {
    const key = getVapidPublicKey();
    res.json({ publicKey: key, pushEnabled: isPushConfigured() });
  })
);

router.get(
  '/feed',
  asyncHandler(async (req, res) => {
    const since = req.query.since || null;
    const items = await getFeedSince(since);
    res.json({
      items: items.map((row) => ({
        id: row.id,
        contentType: row.content_type,
        contentId: row.content_id,
        titleFr: row.title_fr,
        titleEn: row.title_en,
        titleAr: row.title_ar,
        bodyFr: row.body_fr,
        bodyEn: row.body_en,
        bodyAr: row.body_ar,
        link: row.link,
        createdAt: row.created_at,
      })),
    });
  })
);

router.post(
  '/subscribe-fcm',
  asyncHandler(async (req, res) => {
    const { token, lang, userAgent } = req.body || {};
    if (!token?.trim()) {
      return res.status(400).json({ error: 'Token FCM requis.' });
    }

    await saveFcmToken({
      token: token.trim(),
      lang: lang || 'fr',
      userAgent: userAgent || null,
    });

    res.json({ success: true });
  })
);

router.post(
  '/unsubscribe-fcm',
  asyncHandler(async (req, res) => {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'Token requis.' });
    await removeFcmToken(token);
    res.json({ success: true });
  })
);

router.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const { subscription, lang } = req.body || {};
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ error: 'Abonnement push invalide.' });
    }

    await saveSubscription({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      lang: lang || 'fr',
    });

    res.json({ success: true });
  })
);

router.post(
  '/unsubscribe',
  asyncHandler(async (req, res) => {
    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: 'Endpoint requis.' });
    await removeSubscription(endpoint);
    res.json({ success: true });
  })
);

module.exports = router;
