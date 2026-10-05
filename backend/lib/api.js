/** Format de réponse standard des routes propriétaires / hébergements + validation. */

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const fail = (status, message) => {
  throw new ApiError(status, message);
};

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function list(res, data, pagination) {
  return res.json({ success: true, data, pagination });
}

function apiErrorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.status || 500;
  let message = err.message || 'Erreur serveur';
  if (err.code === '23505') {
    status = 409;
    message = 'Cette valeur existe déjà.';
  } else if (err.code === '23514' || err.code === '22P02' || err.code === '22007' || err.code === '22003') {
    status = 400;
    message = 'Valeur invalide.';
  } else if (status >= 500) {
    console.error('[API]', req.method, req.originalUrl, err.message);
    message = 'Erreur serveur. Réessayez plus tard.';
  }
  res.status(status).json({ success: false, message });
}

function pagination(q, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(q.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE_RE = /^[0-9+ ().-]{8,20}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const blank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

const v = {
  str(value, label, { required = false, max = 500 } = {}) {
    if (blank(value)) {
      if (required) fail(400, `${label} est obligatoire.`);
      return null;
    }
    const s = String(value).trim();
    if (s.length > max) fail(400, `${label} : ${max} caractères maximum.`);
    return s;
  },
  email(value, label = 'Email', { required = false } = {}) {
    const s = v.str(value, label, { required, max: 200 });
    if (s && !EMAIL_RE.test(s)) fail(400, `${label} invalide.`);
    return s ? s.toLowerCase() : null;
  },
  phone(value, label = 'Téléphone', { required = false } = {}) {
    const s = v.str(value, label, { required, max: 30 });
    if (s && !PHONE_RE.test(s)) fail(400, `${label} invalide.`);
    return s;
  },
  int(value, label, { required = false, min = 0, max = 1_000_000_000 } = {}) {
    if (blank(value)) {
      if (required) fail(400, `${label} est obligatoire.`);
      return null;
    }
    const n = Number(value);
    if (!Number.isInteger(n)) fail(400, `${label} doit être un nombre entier.`);
    if (n < min) fail(400, `${label} doit être supérieur ou égal à ${min}.`);
    if (n > max) fail(400, `${label} doit être inférieur ou égal à ${max}.`);
    return n;
  },
  num(value, label, { min = -1e9, max = 1e9 } = {}) {
    if (blank(value)) return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max) fail(400, `${label} invalide.`);
    return n;
  },
  bool(value) {
    if (blank(value)) return null;
    return value === true || value === 'true' || value === 1 || value === '1';
  },
  date(value, label, { required = false } = {}) {
    if (blank(value)) {
      if (required) fail(400, `${label} est obligatoire.`);
      return null;
    }
    const s = String(value).slice(0, 10);
    const d = new Date(`${s}T00:00:00Z`);
    if (!DATE_RE.test(s) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) {
      fail(400, `${label} invalide (format AAAA-MM-JJ).`);
    }
    return s;
  },
  time(value, label) {
    const s = v.str(value, label, { max: 5 });
    if (s && !TIME_RE.test(s)) fail(400, `${label} invalide (format HH:MM).`);
    return s;
  },
  oneOf(value, label, allowed, { required = false, upper = false, lower = false } = {}) {
    if (blank(value)) {
      if (required) fail(400, `${label} est obligatoire.`);
      return null;
    }
    let s = String(value).trim();
    if (upper) s = s.toUpperCase();
    if (lower) s = s.toLowerCase();
    if (!allowed.includes(s)) fail(400, `${label} invalide.`);
    return s;
  },
  uuid(value, label) {
    if (!UUID_RE.test(String(value || ''))) fail(404, `${label} introuvable.`);
    return String(value);
  },
  password(value, { required = true } = {}) {
    if (blank(value)) {
      if (required) fail(400, 'Le mot de passe est obligatoire.');
      return null;
    }
    const s = String(value);
    if (s.length < 8 || s.length > 128 || !/[a-zA-Z]/.test(s) || !/\d/.test(s)) {
      fail(400, 'Mot de passe trop faible : 8 caractères minimum, avec au moins une lettre et un chiffre.');
    }
    return s;
  },
  url(value, label) {
    const s = v.str(value, label, { required: true, max: 1000 });
    if (!/^https?:\/\/\S+$/i.test(s) && !/^\/(uploads|images|public)\/\S+$/i.test(s)) {
      fail(400, `${label} invalide.`);
    }
    return s;
  },
};

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

module.exports = { ApiError, fail, ok, list, apiErrorHandler, pagination, v, slugify, UUID_RE };
