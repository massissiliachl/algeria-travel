const express = require('express');
const { query } = require('../config/db');
const { createRateLimiter } = require('../middleware/rateLimit');
const {
  getClientId,
  normalizeItemType,
  normalizeItemId,
  normalizeAuthorName,
  normalizeBody,
  fetchApprovedThreads,
  handleCommentsDbError,
} = require('../lib/comments');

const router = express.Router();

const commentsLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 80,
  message: 'Trop de commentaires. Réessayez plus tard.',
});

function requireClientId(req, res, next) {
  const clientId = getClientId(req);
  if (!clientId) {
    return res.status(400).json({ error: 'Identifiant client invalide.' });
  }
  req.commentClientId = clientId;
  next();
}

router.get('/', commentsLimiter, async (req, res, next) => {
  try {
    const itemType = normalizeItemType(req.query.item_type ?? req.query.itemType);
    const itemId = normalizeItemId(req.query.item_id ?? req.query.itemId);

    if (!itemType || !itemId) {
      return res.status(400).json({ error: 'Type et identifiant requis.' });
    }

    const items = await fetchApprovedThreads(itemType, itemId, getClientId(req));
    res.json({ items });
  } catch (err) {
    next(handleCommentsDbError(err));
  }
});

router.post('/', commentsLimiter, requireClientId, async (req, res, next) => {
  try {
    const body = req.body || {};
    const itemType = normalizeItemType(body.item_type ?? body.itemType);
    const itemId = normalizeItemId(body.item_id ?? body.itemId);
    const text = normalizeBody(body.body);
    const authorName = normalizeAuthorName(body.author_name ?? body.authorName);
    const parentId = body.parent_id ?? body.parentId ?? null;

    if (!itemType || !itemId || !text) {
      return res.status(400).json({ error: 'Contenu, type et identifiant requis.' });
    }

    if (!authorName) {
      return res.status(400).json({ error: 'Nom d\'utilisateur requis (2 caractères minimum).' });
    }

    if (parentId) {
      const parent = await query(
        `select id, item_type, item_id, status
         from public.comments
         where id = $1`,
        [parentId]
      );
      if (!parent.rows.length) {
        return res.status(404).json({ error: 'Commentaire parent introuvable.' });
      }
      const row = parent.rows[0];
      if (row.item_type !== itemType || row.item_id !== itemId) {
        return res.status(400).json({ error: 'Réponse invalide pour ce contenu.' });
      }
      if (row.status !== 'approved') {
        return res.status(400).json({ error: 'Impossible de répondre à ce commentaire.' });
      }
    }

    const result = await query(
      `insert into public.comments
         (item_type, item_id, parent_id, client_id, author_name, body, status)
       values ($1, $2, $3, $4, $5, $6, 'pending')
       returning id, created_at`,
      [itemType, itemId, parentId, req.commentClientId, authorName, text]
    );

    res.status(201).json({
      ok: true,
      pending: true,
      id: result.rows[0].id,
      createdAt: result.rows[0].created_at,
      message: 'Commentaire envoyé — visible après validation par notre équipe.',
    });
  } catch (err) {
    next(handleCommentsDbError(err));
  }
});

router.post('/:id/like', commentsLimiter, requireClientId, async (req, res, next) => {
  try {
    const commentId = req.params.id;

    const exists = await query(
      `select id from public.comments
       where id = $1 and status = 'approved'`,
      [commentId]
    );
    if (!exists.rows.length) {
      return res.status(404).json({ error: 'Commentaire introuvable.' });
    }

    const current = await query(
      `select id from public.comment_likes
       where comment_id = $1 and client_id = $2`,
      [commentId, req.commentClientId]
    );

    if (current.rows.length) {
      await query(
        `delete from public.comment_likes
         where comment_id = $1 and client_id = $2`,
        [commentId, req.commentClientId]
      );
    } else {
      await query(
        `insert into public.comment_likes (comment_id, client_id)
         values ($1, $2)
         on conflict (comment_id, client_id) do nothing`,
        [commentId, req.commentClientId]
      );
    }

    const stats = await query(
      `select
         (select count(*)::int from public.comment_likes where comment_id = $1) as likes,
         exists(
           select 1 from public.comment_likes
           where comment_id = $1 and client_id = $2
         ) as user_liked`,
      [commentId, req.commentClientId]
    );

    const row = stats.rows[0];
    res.json({
      likes: Number(row.likes) || 0,
      userLiked: Boolean(row.user_liked),
    });
  } catch (err) {
    next(handleCommentsDbError(err));
  }
});

module.exports = router;
