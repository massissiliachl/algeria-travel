/**
 * Activité des partenaires (propriétaires) pour l'admin : lecture du journal d'audit
 * et email récapitulatif. Les actions d'un même partenaire sont regroupées pendant
 * PARTNER_NOTIFY_DELAY_MS pour éviter un email par case du calendrier.
 */
const { query } = require('../config/db');
const { sendMail } = require('./mail');

const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || 'travelalgeriadz@gmail.com';
const DELAY_MS = () => Math.max(0, Number(process.env.PARTNER_NOTIFY_DELAY_MS) || 120000);
const ADMIN_URL = () => `${process.env.SITE_URL || 'https://algeriatravel.org'}/admin/`;

const money = (n) => (n == null || n === '' ? '' : `${Number(n).toLocaleString('fr-FR')} DA`);
const day = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
};
const quoted = (s) => (s ? ` « ${s} »` : '');
const AVAILABILITY = { AVAILABLE: 'ouverte', UNAVAILABLE: 'fermée' };
const RESERVATION = { reviewed: 'vue', confirmed: 'confirmée', rejected: 'refusée', cancelled: 'annulée' };

function availabilityText(d) {
  const parts = [AVAILABILITY[d.status] || ''];
  if (d.quantity != null && d.status !== 'UNAVAILABLE') parts.push(`${d.quantity} chambre(s)`);
  if (d.price != null) parts.push(`prix ${money(d.price)}`);
  const text = parts.filter(Boolean).join(', ');
  return text ? ` (${text})` : '';
}

/** Phrase lisible pour une ligne du journal (sans le nom du partenaire). */
function describe(row) {
  const d = row.details || {};
  const room = quoted(row.room_name || d.name);
  const property = quoted(row.property_name || d.name);
  switch (row.action) {
    case 'property.create': return `a ajouté l’établissement${property}`;
    case 'property.update': return `a modifié les informations de l’établissement${property}`;
    case 'property.activate': return `a mis en ligne l’établissement${property}`;
    case 'property.deactivate': return `a mis hors ligne l’établissement${property}`;
    case 'property.delete': return `a supprimé l’établissement${property}`;
    case 'property.amenities': return `a modifié les équipements de${property || ' son établissement'}`;
    case 'property.images.add': return `a ajouté ${d.count || 1} photo(s) à${property || ' son établissement'}`;
    case 'property.images.delete': return `a supprimé une photo de${property || ' son établissement'}`;
    case 'room.create': return `a ajouté la chambre${room}`;
    case 'room.update': return `a modifié la chambre${room}`;
    case 'room.activate': return `a activé la chambre${room}`;
    case 'room.deactivate': return `a désactivé la chambre${room}`;
    case 'room.delete': return `a supprimé la chambre${room}`;
    case 'rate.create': return `a ajouté le tarif${quoted(d.name)}${d.price != null ? ` à ${money(d.price)}` : ''} (chambre${room})`;
    case 'rate.update': return `a modifié un tarif (chambre${room})`;
    case 'rate.activate': return `a activé un tarif (chambre${room})`;
    case 'rate.deactivate': return `a désactivé un tarif (chambre${room})`;
    case 'rate.delete': return `a supprimé le tarif${quoted(d.name)} (chambre${room})`;
    case 'seasonal_rate.create':
      return `a ajouté un tarif saisonnier du ${day(d.startDate)} au ${day(d.endDate)}${d.price != null ? ` à ${money(d.price)}` : ''} (chambre${room})`;
    case 'seasonal_rate.update': return `a modifié un tarif saisonnier (chambre${room})`;
    case 'seasonal_rate.delete': return `a supprimé un tarif saisonnier (chambre${room})`;
    case 'availability.bulk':
      return `a mis à jour les disponibilités du ${day(d.startDate)} au ${day(d.endDate)}${availabilityText(d)} (chambre${room})`;
    case 'availability.set': return `a modifié la disponibilité du ${day(d.date)}${availabilityText(d)} (chambre${room})`;
    case 'availability.update': return `a modifié la disponibilité du ${day(d.date)} (chambre${room})`;
    case 'availability.open': return `a ouvert le ${day(d.date)} à la réservation (chambre${room})`;
    case 'availability.block': return `a bloqué le ${day(d.date)} (chambre${room})`;
    case 'reservation.status':
      return `a passé la réservation ${row.reference_code || ''} au statut « ${RESERVATION[d.status] || d.status} »`.replace('  ', ' ');
    case 'owner.update_profile': return d.password ? 'a modifié son profil et son mot de passe' : 'a modifié son profil';
    default: return `a effectué l’action « ${row.action} »`;
  }
}

const SELECT = `
  select l.id, l.actor_id, l.actor_label, l.action, l.entity, l.entity_id, l.details, l.created_at,
         nullif(trim(concat_ws(' ', o.first_name, o.last_name)), '') as owner_name, o.email as owner_email,
         coalesce(sp.id, sr.id, srate.id, sres.id) as property_id,
         coalesce(sp.name, sr.name, srate.name, sres.name) as property_name,
         coalesce(rt.name, rrt.name, resrt.name) as room_name,
         res.reference_code
    from public.audit_logs l
    left join public.owners o on o.id::text = l.actor_id
    left join public.stays sp on l.entity = 'property' and sp.id = l.entity_id
    left join public.room_types rt on l.entity = 'room_type' and rt.id::text = l.entity_id
    left join public.stays sr on sr.id = rt.property_id
    left join public.rate_plans rp on l.entity = 'rate_plan' and rp.id::text = l.entity_id
    left join public.room_types rrt on rrt.id = rp.room_type_id
    left join public.stays srate on srate.id = rrt.property_id
    left join public.reservations res on l.entity = 'reservation' and res.id::text = l.entity_id
    left join public.stays sres on sres.id = res.property_id
    left join public.room_types resrt on resrt.id = res.room_type_id
   where l.actor_type = 'owner'`;

const toItem = (row) => ({
  id: Number(row.id),
  ownerId: row.actor_id,
  ownerName: row.owner_name || row.actor_label || 'Partenaire',
  ownerEmail: row.owner_email || null,
  propertyId: row.property_id || null,
  propertyName: row.property_name || null,
  roomName: row.room_name || null,
  action: row.action,
  summary: describe(row),
  createdAt: row.created_at,
});

async function listActivity({ after = 0, limit = 30 } = {}) {
  const result = await query(`${SELECT} and l.id > $1 order by l.id desc limit $2`, [
    Math.max(0, Number(after) || 0),
    Math.min(100, Math.max(1, Number(limit) || 30)),
  ]);
  return result.rows.map(toItem);
}

async function getActivityByIds(ids) {
  if (!ids.length) return [];
  const result = await query(`${SELECT} and l.id = any($1::bigint[]) order by l.id`, [ids]);
  return result.rows.map(toItem);
}

const pending = new Map();

async function flush(ownerId) {
  const batch = pending.get(ownerId);
  pending.delete(ownerId);
  if (!batch?.ids.length) return;
  try {
    const items = await getActivityByIds(batch.ids);
    if (!items.length) return;
    const owner = items[0].ownerName;
    const properties = [...new Set(items.map((i) => i.propertyName).filter(Boolean))];
    const where = properties.length ? ` — ${properties.join(', ')}` : '';
    const lines = [
      `Le partenaire ${owner}${items[0].ownerEmail ? ` (${items[0].ownerEmail})` : ''} a fait ${items.length} modification(s)${where} :`,
      '',
      ...items.map((i) => {
        const at = new Date(i.createdAt).toLocaleString('fr-FR', { timeZone: 'Africa/Algiers', dateStyle: 'short', timeStyle: 'short' });
        return `• ${at} — ${i.summary}`;
      }),
      '',
      'Ces changements sont déjà enregistrés et visibles sur le site (page Hébergements).',
      `Vérifier dans l’admin › Propriétaires : ${ADMIN_URL()}`,
    ];
    await sendMail({
      to: ADMIN_EMAIL(),
      subject: `Partenaire ${owner} : ${items.length} modification(s)${where}`,
      text: lines.join('\n'),
    });
  } catch (err) {
    console.warn('[PartnerActivity]', err.message);
  }
}

/** Appelé par audit() pour chaque action d'un partenaire. */
function queueAdminEmail(auditId, actor) {
  if (!auditId || !actor?.id || process.env.PARTNER_NOTIFY === 'off') return;
  const key = String(actor.id);
  let batch = pending.get(key);
  if (!batch) {
    batch = { ids: [] };
    pending.set(key, batch);
    const timer = setTimeout(() => flush(key), DELAY_MS());
    timer.unref?.();
  }
  batch.ids.push(Number(auditId));
}

module.exports = { listActivity, queueAdminEmail, describe };
