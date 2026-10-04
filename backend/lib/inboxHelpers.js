const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeClientId(raw) {
  const value = raw?.trim().toLowerCase();
  if (!value || !UUID_RE.test(value)) return null;
  return value;
}

function mapMessage(row) {
  return {
    id: row.id,
    senderType: row.sender_type,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

function mapConversation(row, extras = {}) {
  return {
    id: row.id,
    clientId: row.client_id,
    visitorName: row.visitor_name,
    visitorEmail: row.visitor_email,
    status: row.status,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    ...extras,
  };
}

function handleInboxDbError(err) {
  const msg = err?.message || '';
  if (/relation .*inbox_/i.test(msg)) {
    err.status = 503;
    err.message = 'Messagerie indisponible — lancez npm run migrate dans backend/';
    return err;
  }
  return err;
}

module.exports = {
  UUID_RE,
  EMAIL_RE,
  normalizeClientId,
  mapMessage,
  mapConversation,
  handleInboxDbError,
};
