const express = require('express');
const { query } = require('../config/db');
const { mapGallery } = require('../lib/mappers');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_REACTIONS = new Set(['like', 'dislike']);

const galleryLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 300,
  message: 'Trop de requêtes galerie. Réessayez plus tard.',
});

function getClientId(req) {
  const raw = req.headers['x-favorite-client']?.trim();
  if (!raw || !UUID_RE.test(raw)) return null;
  return raw.toLowerCase();
}

function requireClientId(req, res, next) {
  const clientId = getClientId(req);
  if (!clientId) {
    return res.status(400).json({ error: 'Identifiant client invalide.' });
  }
  req.galleryClientId = clientId;
  next();
}

function normalizeReaction(value) {
  const key = value?.trim().toLowerCase();
  return VALID_REACTIONS.has(key) ? key : null;
}

function normalizeItemId(value) {
  const id = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function handleGalleryDbError(err) {
  const msg = err?.message || '';
  if (/relation .*gallery_reactions.* does not exist/i.test(msg)) {
    err.status = 503;
    err.message = 'Table gallery_reactions absente — lancez npm run migrate dans backend/';
    return err;
  }
  if (/DATABASE_URL manquant/i.test(msg)) {
    err.status = 503;
    err.message = 'Base de données non configurée (backend/.env).';
    return err;
  }
  return err;
}

function mapGalleryItem(row) {
  return {
    ...mapGallery(row),
    likes: Number(row.likes) || 0,
    dislikes: Number(row.dislikes) || 0,
    userReaction: row.user_reaction || null,
  };
}

async function fetchGalleryItems(clientId = null) {
  const params = [];
  let userJoin = '';
  if (clientId) {
    params.push(clientId);
    userJoin = `left join public.gallery_reactions ur
      on ur.gallery_item_id = gi.id and ur.client_id = $${params.length}`;
  }

  const result = await query(
    `select
       gi.*,
       coalesce(sum(case when gr.reaction = 'like' then 1 else 0 end), 0)::int as likes,
       coalesce(sum(case when gr.reaction = 'dislike' then 1 else 0 end), 0)::int as dislikes
       ${clientId ? ', max(ur.reaction) as user_reaction' : ''}
     from public.gallery_items gi
     left join public.gallery_reactions gr on gr.gallery_item_id = gi.id
     ${userJoin}
     where coalesce(gi.published, true) = true
     group by gi.id
     order by gi.sort_order asc, gi.id asc`,
    params
  );

  return result.rows.map(mapGalleryItem);
}

async function fetchGalleryItemStats(itemId, clientId = null) {
  const params = [itemId];
  let userJoin = '';
  if (clientId) {
    params.push(clientId);
    userJoin = `left join public.gallery_reactions ur
      on ur.gallery_item_id = gi.id and ur.client_id = $2`;
  }

  const result = await query(
    `select
       gi.id,
       coalesce(sum(case when gr.reaction = 'like' then 1 else 0 end), 0)::int as likes,
       coalesce(sum(case when gr.reaction = 'dislike' then 1 else 0 end), 0)::int as dislikes
       ${clientId ? ', max(ur.reaction) as user_reaction' : ''}
     from public.gallery_items gi
     left join public.gallery_reactions gr on gr.gallery_item_id = gi.id
     ${userJoin}
     where gi.id = $1 and coalesce(gi.published, true) = true
     group by gi.id`,
    params
  );

  if (!result.rows.length) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    likes: Number(row.likes) || 0,
    dislikes: Number(row.dislikes) || 0,
    userReaction: row.user_reaction || null,
  };
}

router.get('/', galleryLimiter, async (req, res, next) => {
  try {
    const items = await fetchGalleryItems(getClientId(req));
    res.json(items);
  } catch (err) {
    next(handleGalleryDbError(err));
  }
});

router.get('/:id', galleryLimiter, async (req, res, next) => {
  try {
    const itemId = normalizeItemId(req.params.id);
    if (!itemId) return res.status(400).json({ error: 'Identifiant invalide.' });

    const items = await fetchGalleryItems(getClientId(req));
    const item = items.find((row) => row.id === itemId);
    if (!item) return res.status(404).json({ error: 'Introuvable.' });
    res.json(item);
  } catch (err) {
    next(handleGalleryDbError(err));
  }
});

router.post('/:id/reaction', galleryLimiter, requireClientId, async (req, res, next) => {
  try {
    const itemId = normalizeItemId(req.params.id);
    const reaction = normalizeReaction(req.body?.reaction);

    if (!itemId || !reaction) {
      return res.status(400).json({ error: 'Photo et réaction requises.' });
    }

    const exists = await query(
      `select id from public.gallery_items
       where id = $1 and coalesce(published, true) = true`,
      [itemId]
    );
    if (!exists.rows.length) {
      return res.status(404).json({ error: 'Photo introuvable.' });
    }

    const current = await query(
      `select reaction from public.gallery_reactions
       where gallery_item_id = $1 and client_id = $2`,
      [itemId, req.galleryClientId]
    );

    if (current.rows[0]?.reaction === reaction) {
      await query(
        `delete from public.gallery_reactions
         where gallery_item_id = $1 and client_id = $2`,
        [itemId, req.galleryClientId]
      );
    } else {
      await query(
        `insert into public.gallery_reactions (gallery_item_id, client_id, reaction)
         values ($1, $2, $3)
         on conflict (gallery_item_id, client_id)
         do update set reaction = excluded.reaction, updated_at = now()`,
        [itemId, req.galleryClientId, reaction]
      );
    }

    const stats = await fetchGalleryItemStats(itemId, req.galleryClientId);
    res.json(stats);
  } catch (err) {
    next(handleGalleryDbError(err));
  }
});

module.exports = router;
