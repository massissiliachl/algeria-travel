const express = require('express');
const { query } = require('../config/db');
const { createRateLimiter } = require('../middleware/rateLimit');
const {
  EMAIL_RE,
  normalizeClientId,
  mapMessage,
  mapConversation,
  handleInboxDbError,
} = require('../lib/inboxHelpers');

const router = express.Router();

/** Limite uniquement l'envoi de messages — pas la lecture (polling). */
const inboxSendLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.INBOX_RATE_LIMIT) || 30,
  message: 'Trop de messages envoyés. Réessayez plus tard.',
});

function requireClientId(req, res, next) {
  const clientId = normalizeClientId(req.headers['x-inbox-client']);
  if (!clientId) {
    return res.status(400).json({ error: 'Identifiant messagerie invalide.' });
  }
  req.inboxClientId = clientId;
  next();
}

async function getOrCreateConversation(clientId, profile = {}) {
  const existing = await query(
    `select * from public.inbox_conversations where client_id = $1`,
    [clientId]
  );
  if (existing.rows.length) {
    const row = existing.rows[0];
    const name = profile.name?.trim();
    const email = profile.email?.trim().toLowerCase();
    if ((name && name !== row.visitor_name) || (email && email !== row.visitor_email)) {
      const updated = await query(
        `update public.inbox_conversations
         set visitor_name = coalesce($2, visitor_name),
             visitor_email = coalesce($3, visitor_email)
         where id = $1
         returning *`,
        [row.id, name || null, email || null]
      );
      return updated.rows[0];
    }
    return row;
  }

  const created = await query(
    `insert into public.inbox_conversations (client_id, visitor_name, visitor_email)
     values ($1, $2, $3)
     returning *`,
    [clientId, profile.name?.trim() || null, profile.email?.trim().toLowerCase() || null]
  );
  return created.rows[0];
}

async function listMessages(conversationId) {
  const result = await query(
    `select id, sender_type, body, read_at, created_at
     from public.inbox_messages
     where conversation_id = $1
     order by created_at asc`,
    [conversationId]
  );
  return result.rows.map(mapMessage);
}

router.get('/', requireClientId, async (req, res, next) => {
  try {
    const conversation = await getOrCreateConversation(req.inboxClientId);
    const messages = await listMessages(conversation.id);

    const unread = await query(
      `select count(*)::int as count
       from public.inbox_messages
       where conversation_id = $1 and sender_type = 'admin' and read_at is null`,
      [conversation.id]
    );

    res.json({
      conversation: mapConversation(conversation),
      messages,
      unreadCount: unread.rows[0]?.count || 0,
    });
  } catch (err) {
    next(handleInboxDbError(err));
  }
});

router.post('/read', requireClientId, async (req, res, next) => {
  try {
    const conversation = await getOrCreateConversation(req.inboxClientId);
    await query(
      `update public.inbox_messages
       set read_at = now()
       where conversation_id = $1 and sender_type = 'admin' and read_at is null`,
      [conversation.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(handleInboxDbError(err));
  }
});

router.post('/messages', inboxSendLimiter, requireClientId, async (req, res, next) => {
  try {
    const body = String(req.body?.body || req.body?.message || '').trim();
    const name = req.body?.name?.trim();
    const email = req.body?.email?.trim().toLowerCase();

    if (!body) {
      return res.status(400).json({ error: 'Message requis.' });
    }
    if (body.length > 2000) {
      return res.status(400).json({ error: 'Message trop long (2000 caractères max).' });
    }
    if (email && !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }

    const conversation = await getOrCreateConversation(req.inboxClientId, { name, email });

    await query(
      `insert into public.inbox_messages (conversation_id, sender_type, body)
       values ($1, 'visitor', $2)`,
      [conversation.id, body]
    );

    await query(
      `update public.inbox_conversations
       set last_message_at = now(), status = 'open'
       where id = $1`,
      [conversation.id]
    );

    const messages = await listMessages(conversation.id);
    const refreshed = await query(
      `select * from public.inbox_conversations where id = $1`,
      [conversation.id]
    );

    res.status(201).json({
      conversation: mapConversation(refreshed.rows[0]),
      messages,
      unreadCount: 0,
    });
  } catch (err) {
    next(handleInboxDbError(err));
  }
});

module.exports = router;
