const { query } = require('../config/db');

const TABLES = [
  'places',
  'activities',
  'tours',
  'stays',
  'blog_posts',
  'gallery_items',
  'chat_conversations',
  'contact_messages',
  'inbox_conversations',
  'reservations',
];

const INTERVAL = `now() - interval '6 months'`;
let lastRun = 0;

/** Supprime ce qui est archivé depuis plus de 6 mois. Au plus une fois par heure. */
async function purgeExpiredArchives() {
  const now = Date.now();
  if (now - lastRun < 60 * 60 * 1000) return;
  lastRun = now;

  await query(
    `delete from public.chat_requests r
     using public.chat_conversations c
     where r.conversation_id = c.id
       and c.archived_at is not null
       and c.archived_at < ${INTERVAL}`
  ).catch((err) => console.error('[Archive] chat_requests :', err.message));

  for (const table of TABLES) {
    try {
      const result = await query(
        `delete from public.${table} where archived_at is not null and archived_at < ${INTERVAL}`
      );
      if (result.rowCount) console.log(`[Archive] ${result.rowCount} ligne(s) supprimée(s) dans ${table}`);
    } catch (err) {
      console.error(`[Archive] ${table} :`, err.message);
    }
  }
}

module.exports = { purgeExpiredArchives };
