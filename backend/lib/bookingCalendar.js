const { query } = require('../config/db');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const KEY_RE = /^[a-z0-9][a-z0-9-]{0,80}(:[a-z0-9-]{1,40})?$/;

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const isValidKey = (key) => KEY_RE.test(String(key || ''));

/** Clé du calendrier : « destination » ou « destination:formule » */
function calendarKey(itemId, pkg) {
  const id = String(itemId || '').trim().toLowerCase();
  const p = String(pkg || '').trim().toLowerCase();
  return p && /^[a-z0-9-]{1,40}$/.test(p) ? `${id}:${p}` : id;
}

function normalizePeriods(list, label) {
  if (!Array.isArray(list)) throw Object.assign(new Error(`${label} : liste attendue.`), { status: 400 });
  if (list.length > 100) throw Object.assign(new Error(`${label} : 100 périodes maximum.`), { status: 400 });
  return list
    .map((p) => ({
      start: String(p?.start || '').trim(),
      end: String(p?.end || p?.start || '').trim(),
      label: String(p?.label || '').trim().slice(0, 120),
    }))
    .map((p) => {
      if (!DATE_RE.test(p.start) || !DATE_RE.test(p.end) || Number.isNaN(Date.parse(p.start)) || Number.isNaN(Date.parse(p.end))) {
        throw Object.assign(new Error(`${label} : dates invalides.`), { status: 400 });
      }
      if (p.end < p.start) throw Object.assign(new Error(`${label} : la fin doit être après le début (${p.start}).`), { status: 400 });
      return p;
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

const mapRow = (row, key) => ({
  key: row?.key || key,
  mode: row?.mode || 'open',
  periods: row?.periods || [],
  blocked: row?.blocked || [],
  updatedAt: row?.updated_at || null,
  configured: Boolean(row),
});

/** Calendrier d’une clé ; « taghit:brezina » sans réglage propre retombe sur « taghit » */
async function getCalendar(key) {
  const keys = key.includes(':') ? [key, key.split(':')[0]] : [key];
  const result = await query('select * from public.booking_calendars where key = any($1::text[])', [keys]);
  const row = keys.map((k) => result.rows.find((r) => r.key === k)).find(Boolean);
  return mapRow(row, key);
}

/** Version publique : uniquement les périodes à venir */
function publicView(cal) {
  const today = todayIso();
  return {
    key: cal.key,
    mode: cal.mode,
    periods: cal.periods.filter((p) => p.start >= today),
    blocked: cal.blocked.filter((p) => p.end >= today),
  };
}

/**
 * Vérifie une date de départ.
 * @returns {{ ok: true, period?: object } | { ok: false, error: string }}
 */
async function checkTravelDate(key, date) {
  const day = String(date || '').slice(0, 10);
  const cal = await getCalendar(key);
  const blocked = cal.blocked.find((p) => day >= p.start && day <= p.end);
  if (blocked) {
    return { ok: false, error: `Réservations fermées du ${blocked.start} au ${blocked.end}. Choisissez une autre date.` };
  }
  if (cal.mode === 'fixed') {
    const period = cal.periods.find((p) => day >= p.start && day <= p.end);
    if (!period) {
      const next = publicView(cal).periods;
      return {
        ok: false,
        error: next.length
          ? `Ce séjour n’est proposé qu’aux dates suivantes : ${next.map((p) => `du ${p.start} au ${p.end}`).join(', ')}.`
          : 'Aucune date disponible pour ce séjour actuellement.',
      };
    }
    if (period.start < todayIso()) return { ok: false, error: 'Ce séjour a déjà commencé.' };
    return { ok: true, period };
  }
  return { ok: true };
}

module.exports = { calendarKey, isValidKey, getCalendar, publicView, checkTravelDate, normalizePeriods, mapRow };
