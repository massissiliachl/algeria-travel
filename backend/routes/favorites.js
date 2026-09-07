const express = require('express');
const { query } = require('../config/db');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_ITEM_TYPES = new Set(['hotel', 'tour', 'activity', 'place', 'stay']);
const MAX_ITEM_ID_LEN = 120;

const favoritesLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 200,
  message: 'Trop de requêtes favoris. Réessayez plus tard.',
});

function getClientId(req) {
  const raw = req.headers['x-favorite-client']?.trim();
  if (!raw || !UUID_RE.test(raw)) return null;
  return raw.toLowerCase();
}

function requireClientId(req, res, next) {
  const clientId = getClientId(req);
  if (!clientId) {
    return res.status(400).json({ error: 'Identifiant client favoris invalide.' });
  }
  req.favoriteClientId = clientId;
  next();
}

function normalizeItemType(value) {
  const key = value?.trim().toLowerCase();
  return VALID_ITEM_TYPES.has(key) ? key : null;
}

function normalizeItemId(value) {
  const id = String(value ?? '').trim();
  if (!id || id.length > MAX_ITEM_ID_LEN) return null;
  return id;
}

function mapRow(row) {
  return {
    itemType: row.item_type,
    itemId: row.item_id,
    createdAt: row.created_at,
  };
}

function handleFavoritesDbError(err) {
  const msg = err?.message || '';
  if (/relation .*favorites.* does not exist/i.test(msg)) {
    err.status = 503;
    err.message = 'Table favorites absente — lancez npm run migrate dans backend/';
    return err;
  }
  if (/DATABASE_URL manquant/i.test(msg)) {
    err.status = 503;
    err.message = 'Base de données non configurée (backend/.env).';
    return err;
  }
  return err;
}

async function listFavorites(clientId) {
  const result = await query(
    `select item_type, item_id, created_at
     from public.favorites
     where client_id = $1
     order by created_at desc`,
    [clientId]
  );
  return result.rows.map(mapRow);
}

router.get('/', favoritesLimiter, requireClientId, async (req, res, next) => {
  try {
    const items = await listFavorites(req.favoriteClientId);
    res.json({ items });
  } catch (err) {
    next(handleFavoritesDbError(err));
  }
});

router.post('/', favoritesLimiter, requireClientId, async (req, res, next) => {
  try {
    const body = req.body || {};
    const itemType = normalizeItemType(body.item_type ?? body.itemType);
    const itemId = normalizeItemId(body.item_id ?? body.itemId);

    if (!itemType || !itemId) {
      return res.status(400).json({ error: 'Type et identifiant requis.' });
    }

    await query(
      `insert into public.favorites (client_id, item_type, item_id)
       values ($1, $2, $3)
       on conflict (client_id, item_type, item_id) do nothing`,
      [req.favoriteClientId, itemType, itemId]
    );

    const items = await listFavorites(req.favoriteClientId);
    res.status(201).json({ items });
  } catch (err) {
    next(handleFavoritesDbError(err));
  }
});

router.delete('/:itemType/:itemId', favoritesLimiter, requireClientId, async (req, res, next) => {
  try {
    const itemType = normalizeItemType(req.params.itemType);
    const itemId = normalizeItemId(req.params.itemId);

    if (!itemType || !itemId) {
      return res.status(400).json({ error: 'Type et identifiant invalides.' });
    }

    await query(
      `delete from public.favorites
       where client_id = $1 and item_type = $2 and item_id = $3`,
      [req.favoriteClientId, itemType, itemId]
    );

    const items = await listFavorites(req.favoriteClientId);
    res.json({ items });
  } catch (err) {
    next(handleFavoritesDbError(err));
  }
});

module.exports = router;
