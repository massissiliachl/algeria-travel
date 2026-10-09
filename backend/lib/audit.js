const { query } = require('../config/db');

/** Journal « qui a modifié quoi et quand ». Ne bloque jamais la requête en cas d'échec. */
async function audit(actor, action, entity, entityId, details = null) {
  try {
    const result = await query(
      `insert into public.audit_logs (actor_type, actor_id, actor_label, action, entity, entity_id, details)
       values ($1, $2, $3, $4, $5, $6, $7) returning id`,
      [
        actor?.type || 'system',
        actor?.id ? String(actor.id) : null,
        actor?.label || null,
        action,
        entity,
        entityId != null ? String(entityId) : null,
        details ? JSON.stringify(details) : null,
      ]
    );
    if (actor?.type === 'owner') require('./partnerActivity').queueAdminEmail(result.rows[0]?.id, actor);
  } catch (err) {
    console.warn('[Audit]', err.message);
  }
}

function actorTag(actor) {
  return actor?.type === 'owner' ? `owner:${actor.id}` : actor?.type || 'system';
}

module.exports = { audit, actorTag };
