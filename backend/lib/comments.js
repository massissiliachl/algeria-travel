const { query } = require('../config/db');

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_ITEM_TYPES = new Set(['hotel', 'tour', 'activity', 'place', 'stay', 'gallery']);
const VALID_STATUSES = new Set(['pending', 'approved', 'rejected']);
const MAX_ITEM_ID_LEN = 120;
const MAX_AUTHOR_LEN = 60;
const MAX_BODY_LEN = 2000;

function getClientId(req) {
  const raw = req.headers['x-favorite-client']?.trim();
  if (!raw || !UUID_RE.test(raw)) return null;
  return raw.toLowerCase();
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

function normalizeStatus(value) {
  const key = value?.trim().toLowerCase();
  return VALID_STATUSES.has(key) ? key : null;
}

function normalizeAuthorName(value) {
  const name = String(value ?? '').trim().slice(0, MAX_AUTHOR_LEN);
  if (name.length < 2) return null;
  return name;
}

function normalizeBody(value) {
  const body = String(value ?? '').trim();
  if (!body || body.length > MAX_BODY_LEN) return null;
  return body;
}

function mapCommentRow(row) {
  return {
    id: row.id,
    itemType: row.item_type,
    itemId: row.item_id,
    parentId: row.parent_id,
    authorName: row.author_name,
    body: row.body,
    status: row.status,
    rejectionReason: row.rejection_reason,
    likes: Number(row.likes) || 0,
    userLiked: Boolean(row.user_liked),
    createdAt: row.created_at,
    replies: [],
  };
}

async function fetchApprovedThreads(itemType, itemId, clientId = null) {
  const params = [itemType, itemId];
  let userJoin = '';
  if (clientId) {
    params.push(clientId);
    userJoin = `left join public.comment_likes ul
      on ul.comment_id = c.id and ul.client_id = $${params.length}`;
  }

  const result = await query(
    `select
       c.*,
       coalesce(count(cl.id), 0)::int as likes
       ${clientId ? ', (ul.id is not null) as user_liked' : ', false as user_liked'}
     from public.comments c
     left join public.comment_likes cl on cl.comment_id = c.id
     ${userJoin}
     where c.item_type = $1
       and c.item_id = $2
       and c.status = 'approved'
     group by c.id${clientId ? ', ul.id' : ''}
     order by c.created_at asc`,
    params
  );

  const all = result.rows.map(mapCommentRow);
  const roots = all.filter((c) => !c.parentId);
  const byParent = new Map();

  all.filter((c) => c.parentId).forEach((reply) => {
    const list = byParent.get(reply.parentId) || [];
    list.push(reply);
    byParent.set(reply.parentId, list);
  });

  return roots.map((root) => ({
    ...root,
    replies: byParent.get(root.id) || [],
  }));
}

async function getPendingCount() {
  const result = await query(
    `select count(*)::int as count from public.comments where status = 'pending'`
  );
  return result.rows[0]?.count ?? 0;
}

function handleCommentsDbError(err) {
  const msg = err?.message || '';
  if (/relation .*comments.* does not exist/i.test(msg)) {
    err.status = 503;
    err.message = 'Table comments absente — lancez npm run migrate dans backend/';
    return err;
  }
  if (/DATABASE_URL manquant/i.test(msg)) {
    err.status = 503;
    err.message = 'Base de données non configurée (backend/.env).';
    return err;
  }
  return err;
}

module.exports = {
  UUID_RE,
  VALID_ITEM_TYPES,
  VALID_STATUSES,
  getClientId,
  normalizeItemType,
  normalizeItemId,
  normalizeStatus,
  normalizeAuthorName,
  normalizeBody,
  mapCommentRow,
  fetchApprovedThreads,
  getPendingCount,
  handleCommentsDbError,
};
