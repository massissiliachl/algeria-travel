const webpush = require('web-push');
const { query } = require('../config/db');
const { isFirebaseConfigured, getMessaging } = require('./firebaseAdmin');

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:Algeria.travel@gmail.com';
const FIREBASE_VAPID_PUBLIC =
  process.env.FIREBASE_VAPID_PUBLIC_KEY ||
  'BEhwHkpMuA62eyXN2EzRn0TIZg8uC8bsU8OImw4E5skGnYCwTVgJ1QxQmbcmjaR6uQvXBnKPEgQAPvjjxBmfNt0';
const SITE = process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

let vapidReady = false;

function initVapid() {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  vapidReady = true;
  return true;
}

function isPushConfigured() {
  return isFirebaseConfigured() || vapidReady || initVapid();
}

async function createSiteNotification(payload) {
  const result = await query(
    `insert into public.site_notifications
      (content_type, content_id, title_fr, title_en, title_ar, body_fr, body_en, body_ar, link)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning *`,
    [
      payload.contentType,
      String(payload.contentId || ''),
      payload.titleFr,
      payload.titleEn || payload.titleFr,
      payload.titleAr || payload.titleFr,
      payload.bodyFr || null,
      payload.bodyEn || payload.bodyFr || null,
      payload.bodyAr || payload.bodyFr || null,
      payload.link || '/',
    ]
  );
  return result.rows[0];
}

async function sendFcmToAll(notification) {
  const messaging = getMessaging();
  if (!messaging) return { sent: 0, failed: 0, configured: false };

  const result = await query('select token from public.fcm_tokens');
  let sent = 0;
  let failed = 0;

  const title = notification.title_fr;
  const body = notification.body_fr || '';
  const link = notification.link || '/';
  const absoluteLink = link.startsWith('http') ? link : `${SITE}${link}`;

  await Promise.all(
    result.rows.map(async (row) => {
      try {
        await messaging.send({
          token: row.token,
          notification: { title, body },
          data: {
            title,
            body,
            link,
            id: String(notification.id),
          },
          webpush: {
            notification: {
              icon: '/logo.png',
              badge: '/logo.png',
            },
            fcmOptions: { link: absoluteLink },
          },
        });
        sent += 1;
      } catch (err) {
        failed += 1;
        const code = err.code || err.errorInfo?.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          await query('delete from public.fcm_tokens where token = $1', [row.token]);
        }
      }
    })
  );

  return { sent, failed, configured: true };
}

async function sendWebPushToAll(notification) {
  if (!vapidReady && !initVapid()) return { sent: 0, failed: 0 };

  const subs = await query('select * from public.push_subscriptions');
  let sent = 0;
  let failed = 0;

  const payload = JSON.stringify({
    title: notification.title_fr,
    body: notification.body_fr || '',
    link: notification.link,
    id: notification.id,
  });

  await Promise.all(
    subs.rows.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent += 1;
      } catch (err) {
        failed += 1;
        if (err.statusCode === 404 || err.statusCode === 410) {
          await query('delete from public.push_subscriptions where id = $1', [sub.id]);
        }
      }
    })
  );

  return { sent, failed };
}

async function publishNotification(payload) {
  const row = await createSiteNotification(payload);
  const fcm = await sendFcmToAll(row);
  const push = await sendWebPushToAll(row);
  return { notification: row, fcm, push };
}

async function getFeedSince(since) {
  const params = [];
  let sql = 'select * from public.site_notifications';
  if (since) {
    params.push(since);
    sql += ` where created_at > $${params.length}`;
  }
  sql += ' order by created_at desc limit 50';
  const result = await query(sql, params);
  return result.rows;
}

async function saveFcmToken({ token, lang, userAgent }) {
  await query(
    `insert into public.fcm_tokens (token, lang, user_agent, updated_at)
     values ($1, $2, $3, now())
     on conflict (token) do update
       set lang = excluded.lang,
           user_agent = excluded.user_agent,
           updated_at = now()`,
    [token, lang || 'fr', userAgent || null]
  );
}

async function removeFcmToken(token) {
  await query('delete from public.fcm_tokens where token = $1', [token]);
}

async function saveSubscription({ endpoint, keys, lang }) {
  await query(
    `insert into public.push_subscriptions (endpoint, p256dh, auth, lang)
     values ($1, $2, $3, $4)
     on conflict (endpoint) do update set p256dh = $2, auth = $3, lang = $4`,
    [endpoint, keys.p256dh, keys.auth, lang || 'fr']
  );
}

async function removeSubscription(endpoint) {
  await query('delete from public.push_subscriptions where endpoint = $1', [endpoint]);
}

module.exports = {
  isPushConfigured,
  getVapidPublicKey: () => FIREBASE_VAPID_PUBLIC || VAPID_PUBLIC || null,
  publishNotification,
  getFeedSince,
  saveFcmToken,
  removeFcmToken,
  saveSubscription,
  removeSubscription,
};
