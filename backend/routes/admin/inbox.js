const express = require('express');
const { query } = require('../../config/db');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const { mapMessage, mapConversation, handleInboxDbError } = require('../../lib/inboxHelpers');

const router = express.Router();

router.use(adminAuth);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    try {
      const result = await query(
        `select
           count(distinct m.conversation_id)::int as unread_conversations,
           count(*)::int as unread_messages
         from public.inbox_messages m
         join public.inbox_conversations c on c.id = m.conversation_id
         where m.sender_type = 'visitor' and m.read_at is null and c.status = 'open'`
      );
      res.json({
        unreadConversations: result.rows[0]?.unread_conversations || 0,
        unreadMessages: result.rows[0]?.unread_messages || 0,
      });
    } catch (err) {
      throw handleInboxDbError(err);
    }
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    try {
      const status = req.query.status === 'closed' ? 'closed' : 'open';
      const result = await query(
        `select c.*,
                (
                  select body from public.inbox_messages m
                  where m.conversation_id = c.id
                  order by m.created_at desc
                  limit 1
                ) as last_message_body,
                (
                  select count(*)::int from public.inbox_messages m
                  where m.conversation_id = c.id
                    and m.sender_type = 'visitor'
                    and m.read_at is null
                ) as unread_count
         from public.inbox_conversations c
         where c.status = $1
         order by c.last_message_at desc`,
        [status]
      );

      res.json({
        conversations: result.rows.map((row) =>
          mapConversation(row, {
            lastMessageBody: row.last_message_body,
            unreadCount: row.unread_count || 0,
          })
        ),
      });
    } catch (err) {
      throw handleInboxDbError(err);
    }
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      const conversationResult = await query(
        `select * from public.inbox_conversations where id = $1`,
        [req.params.id]
      );
      if (!conversationResult.rows.length) {
        return res.status(404).json({ error: 'Conversation introuvable.' });
      }

      const messagesResult = await query(
        `select id, sender_type, body, read_at, created_at
         from public.inbox_messages
         where conversation_id = $1
         order by created_at asc`,
        [req.params.id]
      );

      res.json({
        conversation: mapConversation(conversationResult.rows[0]),
        messages: messagesResult.rows.map(mapMessage),
      });
    } catch (err) {
      throw handleInboxDbError(err);
    }
  })
);

router.post(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    try {
      const body = String(req.body?.body || '').trim();
      if (!body) {
        return res.status(400).json({ error: 'Message requis.' });
      }
      if (body.length > 2000) {
        return res.status(400).json({ error: 'Message trop long (2000 caractères max).' });
      }

      const conversationResult = await query(
        `select id from public.inbox_conversations where id = $1`,
        [req.params.id]
      );
      if (!conversationResult.rows.length) {
        return res.status(404).json({ error: 'Conversation introuvable.' });
      }

      await query(
        `insert into public.inbox_messages (conversation_id, sender_type, body)
         values ($1, 'admin', $2)`,
        [req.params.id, body]
      );

      await query(
        `update public.inbox_conversations
         set last_message_at = now(), status = 'open'
         where id = $1`,
        [req.params.id]
      );

      const messagesResult = await query(
        `select id, sender_type, body, read_at, created_at
         from public.inbox_messages
         where conversation_id = $1
         order by created_at asc`,
        [req.params.id]
      );

      const conversation = await query(
        `select * from public.inbox_conversations where id = $1`,
        [req.params.id]
      );

      res.status(201).json({
        conversation: mapConversation(conversation.rows[0]),
        messages: messagesResult.rows.map(mapMessage),
      });
    } catch (err) {
      throw handleInboxDbError(err);
    }
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      const conversationResult = await query(
        `select * from public.inbox_conversations where id = $1`,
        [req.params.id]
      );
      if (!conversationResult.rows.length) {
        return res.status(404).json({ error: 'Conversation introuvable.' });
      }

      const status = req.body?.status;
      if (status && !['open', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide.' });
      }

      if (req.body?.markRead) {
        await query(
          `update public.inbox_messages
           set read_at = now()
           where conversation_id = $1 and sender_type = 'visitor' and read_at is null`,
          [req.params.id]
        );
      }

      let updated = conversationResult.rows[0];
      if (status) {
        const result = await query(
          `update public.inbox_conversations set status = $2 where id = $1 returning *`,
          [req.params.id, status]
        );
        updated = result.rows[0];
      }

      res.json({ conversation: mapConversation(updated) });
    } catch (err) {
      throw handleInboxDbError(err);
    }
  })
);

module.exports = router;
