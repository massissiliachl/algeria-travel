const webpush = require('web-push');
const { query } = require('../config/db');

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:Algeria.travel@gmail.com';

let vapidReady = false;

function initVapid() {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  vapidReady = true;
  return true;
}

function isPushConfigured() {
  return vapidReady || initVapid();
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

async function sendPushToAll(notification) {
  if (!isPushConfigured()) return { sent: 0, failed: 0 };

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
  const pushResult = await sendPushToAll(row);
  return { notification: row, push: pushResult };
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
  getVapidPublicKey: () => VAPID_PUBLIC || null,
  publishNotification,
  getFeedSince,
  saveSubscription,
  removeSubscription,
};
