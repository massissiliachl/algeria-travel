/**
 * Persistance du chatbot (tables chat_conversations / chat_messages / chat_requests de la base existante).
 * Si la migration 027 n’est pas encore appliquée, repli en mémoire (perdu au redémarrage) pour ne rien casser.
 */
const crypto = require('crypto');
const { query } = require('../../config/db');
const { sendMail } = require('../mail');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'travelalgeriadz@gmail.com';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = new Set(['NEW', 'IN_PROGRESS', 'RESOLVED']);
const REQUEST_STATUSES = new Set(['pending', 'contacted', 'confirmed', 'cancelled', 'closed']);

let memoryMode = !process.env.DATABASE_URL;
const mem = { conversations: new Map(), messages: [], requests: [], seq: 0 };

const isUuid = (v) => UUID_RE.test(String(v || ''));
const isMissingTable = (err) => err && (err.code === '42P01' || /does not exist/i.test(err.message || ''));

async function db(sql, params) {
  if (memoryMode) return null;
  try {
    return await query(sql, params);
  } catch (err) {
    if (isMissingTable(err) || err.code === 'ECONNREFUSED') {
      console.warn('[Chatbot] tables indisponibles, stockage en mémoire :', err.message);
      memoryMode = true;
      return null;
    }
    throw err;
  }
}

function reference(type) {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `${type === 'booking' ? 'CB' : 'CC'}-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/* ── Conversations ── */

async function createConversation({ language = 'fr', pageUrl = null, userAgent = null } = {}) {
  const r = await db(
    `insert into public.chat_conversations (language, page_url, user_agent) values ($1, $2, $3)
     returning id, language, status, created_at`,
    [language, pageUrl, userAgent]
  );
  if (r) return r.rows[0];
  const conv = {
    id: crypto.randomUUID(),
    language,
    status: 'NEW',
    human_requested: false,
    context: {},
    message_count: 0,
    page_url: pageUrl,
    created_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  };
  mem.conversations.set(conv.id, conv);
  return conv;
}

async function getConversation(id) {
  if (!isUuid(id)) return null;
  const r = await db('select * from public.chat_conversations where id = $1', [id]);
  if (r) return r.rows[0] || null;
  return mem.conversations.get(id) || null;
}

async function getMessages(id, { afterId = 0, limit = 200 } = {}) {
  const r = await db(
    `select id, sender, body, intent, meta, created_at from public.chat_messages
     where conversation_id = $1 and id > $2 order by id asc limit $3`,
    [id, Number(afterId) || 0, limit]
  );
  if (r) return r.rows;
  return mem.messages.filter((m) => m.conversation_id === id && m.id > (Number(afterId) || 0)).slice(0, limit);
}

async function addMessage(conversationId, sender, body, intent = null, meta = null) {
  const r = await db(
    `insert into public.chat_messages (conversation_id, sender, body, intent, meta)
     values ($1, $2, $3, $4, $5) returning id, sender, body, intent, meta, created_at`,
    [conversationId, sender, body, intent, meta ? JSON.stringify(meta) : null]
  );
  if (r) return r.rows[0];
  mem.seq += 1;
  const msg = { id: mem.seq, conversation_id: conversationId, sender, body, intent, meta, created_at: new Date().toISOString() };
  mem.messages.push(msg);
  if (mem.messages.length > 5000) mem.messages.splice(0, 1000);
  return msg;
}

/** Enregistre l’échange client ↔ bot et met à jour la fiche conversation. */
async function saveTurn(conversationId, { userMessage, reply, intent, context, flags = {}, suggestions = [], links = [] }) {
  await addMessage(conversationId, 'user', userMessage, intent);
  const botMsg = await addMessage(conversationId, 'bot', reply, intent, { suggestions, links });
  const profile = context?.profile || {};
  const r = await db(
    `update public.chat_conversations set
       language = $2, context = $3, last_message = $4, last_intent = $5,
       customer_name = coalesce($6, customer_name), customer_phone = coalesce($7, customer_phone),
       customer_email = coalesce($8, customer_email),
       human_requested = human_requested or $9,
       status = case when $9 and status = 'RESOLVED' then 'NEW' else status end,
       message_count = message_count + 2, last_message_at = now(), updated_at = now()
     where id = $1`,
    [conversationId, context?.lang || 'fr', JSON.stringify(context || {}), userMessage.slice(0, 500), intent, profile.name || null, profile.phone || null, profile.email || null, Boolean(flags.human)]
  );
  if (!r) {
    const conv = mem.conversations.get(conversationId);
    if (conv) {
      Object.assign(conv, {
        language: context?.lang || conv.language,
        context,
        last_message: userMessage.slice(0, 500),
        last_intent: intent,
        customer_name: profile.name || conv.customer_name || null,
        customer_phone: profile.phone || conv.customer_phone || null,
        customer_email: profile.email || conv.customer_email || null,
        human_requested: conv.human_requested || Boolean(flags.human),
        message_count: (conv.message_count || 0) + 2,
        last_message_at: new Date().toISOString(),
      });
      if (flags.human && conv.status === 'RESOLVED') conv.status = 'NEW';
    }
  }
  return botMsg;
}

/* ── Demandes (réservation / rappel) ── */

async function createRequest(conversationId, type, data) {
  const ref = reference(type);
  const row = {
    reference: ref,
    conversation_id: isUuid(conversationId) ? conversationId : null,
    type,
    name: data.name || null,
    phone: data.phone || null,
    email: data.email || null,
    item_key: data.itemKey || null,
    item_name: data.itemName || data.context?.offer || null,
    start_date: data.startDate || null,
    end_date: data.endDate || null,
    dates_label: data.datesLabel || data.context?.dates || null,
    persons: data.persons || data.context?.persons || null,
    rooms: data.rooms || data.context?.rooms || null,
    notes: data.notes || data.note || null,
    payload: data,
  };
  const r = await db(
    `insert into public.chat_requests
       (reference, conversation_id, type, name, phone, email, item_key, item_name, start_date, end_date, dates_label, persons, rooms, notes, payload)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) returning id, reference, created_at`,
    [row.reference, row.conversation_id, row.type, row.name, row.phone, row.email, row.item_key, row.item_name, row.start_date, row.end_date, row.dates_label, row.persons, row.rooms, row.notes, JSON.stringify(row.payload)]
  );
  if (!r) mem.requests.push({ ...row, id: mem.requests.length + 1, status: 'pending', created_at: new Date().toISOString() });
  if (row.conversation_id) {
    await db(
      `update public.chat_conversations set human_requested = human_requested or $2,
         status = case when status = 'RESOLVED' then 'NEW' else status end, updated_at = now() where id = $1`,
      [row.conversation_id, type === 'contact']
    );
  }
  notifyTeam(row).catch((err) => console.warn('[Chatbot] email équipe :', err.message));
  return { reference: ref };
}

async function notifyTeam(row) {
  const title = row.type === 'booking' ? 'Nouvelle demande de réservation (chatbot)' : 'Demande de rappel par un conseiller (chatbot)';
  const lines = [
    title,
    `Référence : ${row.reference}`,
    row.item_name && `Offre : ${row.item_name}`,
    row.dates_label && `Dates : ${row.dates_label}`,
    row.persons && `Voyageurs : ${row.persons}`,
    row.rooms && `Chambres : ${row.rooms}`,
    `Nom : ${row.name || '—'}`,
    `Téléphone : ${row.phone || '—'}`,
    `Email : ${row.email || '—'}`,
    row.notes && `Note : ${row.notes}`,
    '',
    'À traiter depuis l’admin › Chat / Messages clients. Ce n’est pas une réservation confirmée.',
  ].filter((l) => l !== null && l !== undefined && l !== false);
  await sendMail({ to: ADMIN_EMAIL, subject: `Chatbot — ${title} ${row.reference}`, text: lines.join('\n') });
}

/** Premier « je veux parler à un conseiller » d’une conversation : prévenir l’équipe même sans coordonnées. */
async function notifyHumanRequest(conversationId) {
  const messages = (await getMessages(conversationId, { limit: 200 })).slice(-12);
  const who = { user: 'Client', bot: 'Assistant', agent: 'Équipe' };
  const lines = [
    'Un visiteur du site demande à parler à un conseiller via le chatbot.',
    '',
    'Derniers messages :',
    ...messages.map((m) => `${who[m.sender] || m.sender} : ${String(m.body).replace(/\s+/g, ' ').slice(0, 300)}`),
    '',
    'Répondre depuis l’admin › Chat / Messages clients : la réponse s’affiche dans le chat du visiteur.',
  ];
  await sendMail({ to: ADMIN_EMAIL, subject: 'Chatbot — Un client demande un conseiller', text: lines.join('\n') });
}

/* ── Admin ── */

async function listConversations({ status, q, limit = 50, offset = 0 } = {}) {
  const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const off = Math.max(Number(offset) || 0, 0);
  const st = STATUSES.has(status) ? status : null;
  const term = String(q || '').trim().slice(0, 80);
  const r = await db(
    `select c.id, c.language, c.status, c.human_requested, c.customer_name, c.customer_phone, c.customer_email,
            c.last_message, c.last_intent, c.message_count, c.page_url, c.created_at, c.last_message_at,
            (select count(*)::int from public.chat_requests r where r.conversation_id = c.id) as request_count
     from public.chat_conversations c
     where ($1::text is null or c.status = $1)
       and ($2::text = '' or c.customer_name ilike '%' || $2 || '%' or c.customer_phone ilike '%' || $2 || '%'
            or c.customer_email ilike '%' || $2 || '%' or c.last_message ilike '%' || $2 || '%')
       and c.message_count > 0
     order by c.human_requested and c.status <> 'RESOLVED' desc, c.last_message_at desc
     limit $3 offset $4`,
    [st, term, lim, off]
  );
  const counts = await db(`select status, count(*)::int as n from public.chat_conversations where message_count > 0 group by status`, []);
  if (r) {
    return { items: r.rows, counts: Object.fromEntries((counts?.rows || []).map((x) => [x.status, x.n])), storage: 'db' };
  }
  const all = [...mem.conversations.values()].filter((c) => c.message_count > 0);
  const items = all
    .filter((c) => !st || c.status === st)
    .filter((c) => !term || [c.customer_name, c.customer_phone, c.customer_email, c.last_message].some((v) => String(v || '').toLowerCase().includes(term.toLowerCase())))
    .sort((a, b) => String(b.last_message_at).localeCompare(String(a.last_message_at)))
    .slice(off, off + lim)
    .map((c) => ({ ...c, request_count: mem.requests.filter((x) => x.conversation_id === c.id).length }));
  const countsMem = {};
  for (const c of all) countsMem[c.status] = (countsMem[c.status] || 0) + 1;
  return { items, counts: countsMem, storage: 'memory' };
}

async function getConversationDetail(id) {
  const conversation = await getConversation(id);
  if (!conversation) return null;
  const messages = await getMessages(id, { limit: 1000 });
  const r = await db('select * from public.chat_requests where conversation_id = $1 order by created_at desc', [id]);
  const requests = r ? r.rows : mem.requests.filter((x) => x.conversation_id === id);
  return { conversation, messages, requests };
}

async function updateConversation(id, { status, humanRequested } = {}) {
  if (!isUuid(id)) return null;
  const st = STATUSES.has(status) ? status : null;
  const hr = typeof humanRequested === 'boolean' ? humanRequested : null;
  const r = await db(
    `update public.chat_conversations set status = coalesce($2, status), human_requested = coalesce($3, human_requested), updated_at = now()
     where id = $1 returning *`,
    [id, st, hr]
  );
  if (r) return r.rows[0] || null;
  const conv = mem.conversations.get(id);
  if (!conv) return null;
  if (st) conv.status = st;
  if (hr !== null) conv.human_requested = hr;
  return conv;
}

async function updateRequest(id, status) {
  if (!REQUEST_STATUSES.has(status)) return null;
  const r = await db('update public.chat_requests set status = $2, updated_at = now() where id = $1 returning *', [Number(id), status]);
  if (r) return r.rows[0] || null;
  const req = mem.requests.find((x) => x.id === Number(id));
  if (req) req.status = status;
  return req || null;
}

async function addAgentMessage(id, body) {
  const msg = await addMessage(id, 'agent', body);
  const r = await db(
    `update public.chat_conversations set status = case when status = 'NEW' then 'IN_PROGRESS' else status end,
       last_message_at = now(), updated_at = now(), message_count = message_count + 1 where id = $1`,
    [id]
  );
  if (!r) {
    const conv = mem.conversations.get(id);
    if (conv) {
      if (conv.status === 'NEW') conv.status = 'IN_PROGRESS';
      conv.message_count += 1;
    }
  }
  return msg;
}

module.exports = {
  isUuid,
  createConversation,
  getConversation,
  getMessages,
  addMessage,
  saveTurn,
  createRequest,
  notifyHumanRequest,
  listConversations,
  getConversationDetail,
  updateConversation,
  updateRequest,
  addAgentMessage,
};
