/**
 * Compréhension d’un message : langue, intentions, dates, nombre de personnes, coordonnées, oui / non.
 * Tolère fautes, abréviations SMS, darija (latin et arabe) et mélange de langues.
 */
const { normalize, canonical, tokenize, hasArabic, fuzzyEqual, arabicStems } = require('./text');
const { INTENTS, YES, NO, MONTHS, NUMBER_WORDS, ENGLISH_HINTS, FRENCH_HINTS } = require('./lexicon');

/* ── Intentions ── */

/** Mots courants qui ressemblent à un mot-clé mais n’en sont pas (« plages » ≠ « places », « argent » ≠ « agent »). */
const NO_FUZZY = new Set(['plage', 'plages', 'argent', 'pour', 'jour', 'jours', 'cours', 'tours', 'quant', 'carta', 'bonne', 'notre', 'votre', 'ville', 'villes', 'voila', 'avant', 'apres']);

const COMPILED = Object.fromEntries(
  Object.entries(INTENTS).map(([intent, def]) => [
    intent,
    {
      words: [...new Set(def.words.map((w) => canonical(w)).filter(Boolean))],
      phrases: [...new Set((def.phrases || []).map((p) => canonical(p)).filter(Boolean))],
    },
  ])
);
const KNOWN_WORDS = new Set(Object.values(COMPILED).flatMap((d) => d.words));

function tokenHits(token, word) {
  if (token === word) return true;
  if (hasArabic(token) || hasArabic(word)) return arabicStems(token).includes(word) || arabicStems(word).includes(token);
  if (word.length < 5 || token.length < 4 || KNOWN_WORDS.has(token) || NO_FUZZY.has(token)) return false;
  return fuzzyEqual(token, word);
}

function detectIntents(text, tokens) {
  const padded = ` ${text} `;
  const scores = {};
  for (const [intent, def] of Object.entries(COMPILED)) {
    let score = 0;
    for (const p of def.phrases) if (padded.includes(` ${p} `)) score += 2;
    for (const w of def.words) {
      if (w.includes(' ')) {
        if (padded.includes(` ${w} `)) score += 1.5;
      } else if (tokens.some((t) => tokenHits(t, w))) {
        score += 1;
      }
    }
    if (score > 0) scores[intent] = score;
  }
  return scores;
}

/* ── Langue ── */

const DARIJA_LATIN = /\b(n7ab|n7eb|nheb|bghit|ch7al|bsh7al|b7al|wach|wesh|kayen|kayn|kifach|win|rakom|nreservi|saha|sahit|labas|khoya|bezaf|chwiya|ghodwa|lyoum|3la|m3a)\b/;

/** Langue du message, ou null si le message est neutre (nombre, nom, « ok »…). */
function detectLanguage(raw) {
  const s = String(raw || '');
  const arabic = (s.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (s.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  if (arabic && arabic >= latin) return 'ar';
  const tokens = tokenize(normalize(s));
  if (!tokens.length) return null;
  let en = 0;
  let fr = 0;
  for (const t of tokens) {
    if (ENGLISH_HINTS.has(t)) en += 1;
    if (FRENCH_HINTS.has(t)) fr += 1;
  }
  if (DARIJA_LATIN.test(normalize(s))) fr += 1;
  if (en > fr) return 'en';
  if (fr > 0) return 'fr';
  if (/[éèêàçùâîôû]/i.test(s)) return 'fr';
  return null;
}

/* ── Dates ── */

const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const isValidDay = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

function monthOf(token) {
  if (!token) return null;
  if (MONTHS[token]) return MONTHS[token];
  for (const s of arabicStems(token)) if (MONTHS[s]) return MONTHS[s];
  if (token.length >= 5) {
    const hit = Object.keys(MONTHS).find((k) => k.length >= 5 && fuzzyEqual(token, k));
    if (hit) return MONTHS[hit];
  }
  return null;
}

const RANGE_WORDS = new Set(['au', 'a', 'to', 'till', 'until', 'jusqu', 'jusquau', 'et', 'الى', 'حتى', 'ل', 'لل']);
/** « sept personnes » : le mot suivant indique un nombre, pas un mois. */
const NOT_MONTH_NEXT = /^(personnes|adultes|enfants|jours|nuits|chambres|people|days|nights|rooms)$/;

/** Année du prochain passage de (mois, jour) à partir d’aujourd’hui. */
function inferYear(month, day, today) {
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  if (month < m || (month === m && (day || 31) < d)) return y + 1;
  return y;
}

/**
 * Dates citées : « du 12 au 18 », « 12 dec », « décembre », « 18/12 », « 2026-12-18 », « demain », « من 12 الى 18 ».
 * @param context { month, year } d’une date précédente, pour « du 12 au 18 » sans mois.
 * @returns {{ start?, end?, month?, year? } | null}
 */
function parseDates(rawText, context = {}, today = new Date(), expecting = false) {
  const phone = parsePhone(rawText);
  const text = canonical(phone ? String(rawText).replace(phone, ' ') : rawText);
  const tokens = tokenize(text);
  if (!tokens.length) return null;

  let m;
  if ((m = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b(?:.*?\b(\d{4})-(\d{2})-(\d{2})\b)?/))) {
    const start = iso(+m[1], +m[2], +m[3]);
    const end = m[4] ? iso(+m[4], +m[5], +m[6]) : null;
    return { start, end, month: +m[2], year: +m[1] };
  }

  const slash = [...text.matchAll(/\b(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?\b/g)];
  if (slash.length) {
    const toIso = (x) => {
      const d = +x[1];
      const mo = +x[2];
      let y = x[3] ? +x[3] : inferYear(mo, d, today);
      if (y < 100) y += 2000;
      return isValidDay(y, mo, d) ? { iso: iso(y, mo, d), mo, y } : null;
    };
    const a = toIso(slash[0]);
    const b = slash[1] ? toIso(slash[1]) : null;
    if (a) return { start: a.iso, end: b?.iso || null, month: a.mo, year: a.y };
  }

  const monthIdx = tokens.findIndex((t, i) => monthOf(t) && !/^\d/.test(t) && !NOT_MONTH_NEXT.test(tokens[i + 1] || ''));
  const month = monthIdx >= 0 ? monthOf(tokens[monthIdx]) : null;
  const yearTok = tokens.find((t) => /^20\d{2}$/.test(t));
  const days = [];
  tokens.forEach((t, i) => {
    if (!/^\d{1,2}$/.test(t)) return;
    const n = +t;
    if (n < 1 || n > 31) return;
    const next = tokens[i + 1] || '';
    if (/^(personnes|pers|adultes|enfants|people|persons|chambres|rooms|jours|nuits|days|nights|ans|اشخاص|شخص|غرف|ايام|ليالي|h|heures|dz|da|euros?)$/.test(next)) return;
    days.push({ n, i });
  });
  const rangeWord = tokens.some((t) => RANGE_WORDS.has(t)) || /\d\s*-\s*\d/.test(text);

  if (days.length && (month || (context.month && (expecting || (days.length >= 2 && rangeWord))))) {
    const mo = month || context.month;
    const d1 = days[0].n;
    const d2 = days.length > 1 && rangeWord ? days[1].n : null;
    let y = yearTok ? +yearTok : month ? inferYear(mo, d1, today) : context.year || inferYear(mo, d1, today);
    if (!isValidDay(y, mo, d1)) return null;
    let end = null;
    if (d2) {
      let mo2 = mo;
      let y2 = y;
      if (d2 < d1) {
        mo2 = mo === 12 ? 1 : mo + 1;
        if (mo === 12) y2 += 1;
      }
      if (isValidDay(y2, mo2, d2)) end = iso(y2, mo2, d2);
    }
    return { start: iso(y, mo, d1), end, month: mo, year: y };
  }

  if (days.length >= 2 && rangeWord) {
    const d1 = days[0].n;
    const d2 = days[1].n;
    let mo = today.getMonth() + 1;
    let y = today.getFullYear();
    if (d1 < today.getDate()) {
      mo = mo === 12 ? 1 : mo + 1;
      if (mo === 1) y += 1;
    }
    if (!isValidDay(y, mo, d1)) return null;
    let mo2 = mo;
    let y2 = y;
    if (d2 < d1) {
      mo2 = mo === 12 ? 1 : mo + 1;
      if (mo === 12) y2 += 1;
    }
    return { start: iso(y, mo, d1), end: isValidDay(y2, mo2, d2) ? iso(y2, mo2, d2) : null, month: mo, year: y };
  }

  if (month) {
    const y = yearTok ? +yearTok : inferYear(month, null, today);
    return { month, year: y };
  }

  if (/\b(demain|tomorrow|ghodwa|غدوه|غدا)\b/.test(text)) {
    const t = new Date(today.getTime() + 86400000);
    return { start: iso(t.getFullYear(), t.getMonth() + 1, t.getDate()), month: t.getMonth() + 1, year: t.getFullYear() };
  }
  return null;
}

/* ── Personnes / chambres ── */

/** Frontières de mot compatibles avec l’arabe (\b ne connaît que l’ASCII). */
const B = '(?<![\\p{L}\\p{N}])';
const E = '(?![\\p{L}\\p{N}])';
const PERSON_WORDS = '(?:personnes?|pers|adultes?|voyageurs?|people|persons?|travell?ers?|pax|adults?|اشخاص|شخص|انفار|نفر|افراد)';

function numberFrom(token) {
  if (/^\d{1,2}$/.test(token)) return +token;
  if (NUMBER_WORDS[token] != null) return NUMBER_WORDS[token];
  for (const s of arabicStems(token)) if (NUMBER_WORDS[s] != null) return NUMBER_WORDS[s];
  return null;
}

/** Nombre de voyageurs. `expecting` = la question précédente portait sur les voyageurs (un nombre seul suffit). */
function parsePersons(rawText, expecting = false) {
  const text = canonical(rawText);
  let total = 0;
  let found = false;
  for (const m of text.matchAll(new RegExp(`${B}(\\d{1,2}|${Object.keys(NUMBER_WORDS).join('|')})\\s*${PERSON_WORDS}${E}`, 'gu'))) {
    total += numberFrom(m[1]) || 0;
    found = true;
  }
  for (const m of text.matchAll(new RegExp(`${B}(\\d{1,2}|un|une|deux|trois|quatre|cinq|one|two|three)\\s*(?:enfants?|children|kids?|bebes?|اطفال|ولاد)${E}`, 'gu'))) {
    total += numberFrom(m[1]) || 0;
    found = true;
  }
  if (found && total > 0) return Math.min(total, 50);
  let m;
  if ((m = text.match(/\b(?:nous sommes|on est|on sera|nous serons|we are|we re|pour|for|groupe de|famille de|family of|group of|ahna)\s+(\d{1,2}|[a-z]+)\b(?!\s*(?:jours|nuits|days|nights|h|heures|dec|nov|oct|janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre|\/))/))) {
    const n = numberFrom(m[1]);
    if (n && n <= 50) return n;
  }
  if (/\b(en couple|a deux|as a couple|couple)\b/.test(text)) return 2;
  if (/\b(seul|seule|alone|solo|wahdi|وحدي)\b/.test(text)) return 1;
  if (expecting) {
    const tokens = tokenize(text);
    if (tokens.length <= 3) {
      for (const t of tokens) {
        const n = numberFrom(t);
        if (n && n <= 50) return n;
      }
    }
  }
  return null;
}

function parseRooms(rawText, expecting = false) {
  const text = canonical(rawText);
  const m = text.match(new RegExp(`${B}(\\d{1,2}|une|un|deux|trois|quatre|one|two|three)\\s*(?:chambres?|rooms?|غرف|غرفه|بيوت)${E}`, 'u'));
  if (m) return numberFrom(m[1]);
  if (expecting) {
    const tokens = tokenize(text);
    if (tokens.length <= 2) for (const t of tokens) if (numberFrom(t)) return numberFrom(t);
  }
  return null;
}

/* ── Coordonnées ── */

function parseEmail(raw) {
  const m = String(raw || '').match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return m ? m[0].toLowerCase() : null;
}

function parsePhone(raw) {
  const s = String(raw || '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  for (const m of s.matchAll(/(?:\+|00)?\d[\d\s.-]{6,18}\d/g)) {
    const chunk = m[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(chunk.trim())) continue;
    const digits = chunk.replace(/\D/g, '');
    if (digits.length >= 9 && digits.length <= 15) return chunk.trim().replace(/\s+/g, ' ');
  }
  return null;
}

const NAME_PREFIX = /^(?:je m appelle|je mappelle|moi c est|moi cest|c est|cest|je suis|my name is|i am|im|name|nom|ismi|smiti|اسمي|انا)\s+/;

function parseName(raw) {
  const text = normalize(raw).replace(NAME_PREFIX, '');
  if (!text || /\d|@/.test(text)) return null;
  const words = tokenize(text).slice(0, 4);
  if (!words.length || words.join('').length < 2) return null;
  const original = String(raw).trim().replace(/^(je m['’ ]?appelle|moi c['’ ]?est|c['’ ]?est|je suis|my name is|i['’ ]?m|i am|اسمي|انا)\s+/i, '');
  const parts = original.split(/\s+/).slice(0, 4).join(' ');
  return parts.replace(/[^\p{L}\s'’-]/gu, '').trim().replace(/\b\p{L}/gu, (c) => c.toUpperCase()) || null;
}

/* ── Analyse complète ── */

function analyze(raw, { expecting = null, context = {} } = {}) {
  const text = canonical(raw);
  const tokens = tokenize(text);
  const intents = detectIntents(text, tokens);
  const short = tokens.length <= 4;
  const yes = short && (YES.has(text) || [...YES].some((y) => text === y || text.startsWith(`${y} `)) || /^(oui|yes|ok|ايه|نعم)\b/.test(text));
  const no = short && !yes && (NO.has(text) || /^(non|no|لا)\b/.test(text));
  return {
    raw: String(raw || ''),
    text,
    tokens,
    lang: detectLanguage(raw),
    intents,
    yes,
    no,
    dates: parseDates(raw, context, new Date(), ['dates', 'dates_end', 'avail_dates'].includes(expecting)),
    persons: parsePersons(raw, expecting === 'persons'),
    rooms: parseRooms(raw, expecting === 'rooms'),
    email: parseEmail(raw),
    phone: parsePhone(raw),
    modify: /\b(modifier|changer|corriger|edit|change|modify|نبدل|بدل)\b/.test(text),
  };
}

module.exports = { analyze, parseDates, parsePersons, parsePhone, parseEmail, parseName, detectLanguage, detectIntents };
