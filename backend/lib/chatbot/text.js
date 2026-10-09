/**
 * Normalisation du texte et correspondance approximative (fautes de frappe, accents, arabe, darija).
 */

const ARABIC_RE = /[\u0600-\u06FF]/;
const ARABIC_DIACRITICS_RE = /[\u064B-\u065F\u0670\u0640]/g;

function normalizeArabic(text) {
  return text
    .replace(ARABIC_DIACRITICS_RE, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[؟،؛]/g, ' ');
}

/** Minuscules, sans accents, arabe unifié, ponctuation retirée, lettres répétées réduites (« slttt » → « slt »). */
function normalize(raw) {
  let text = String(raw || '').toLowerCase();
  text = normalizeArabic(text);
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  text = text
    .replace(/[’'`´]/g, ' ')
    .replace(/[^\p{L}\p{N}@+.\-/:\s]/gu, ' ')
    .replace(/([.\-/:])(?!\d)/g, ' ')
    .replace(/(\p{L})\1{2,}/gu, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return text;
}

function tokenize(text) {
  return text.split(' ').filter(Boolean);
}

function hasArabic(text) {
  return ARABIC_RE.test(String(text || ''));
}

/** Distance de Damerau-Levenshtein (transpositions comptées comme 1). */
function distance(a, b) {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (!la) return lb;
  if (!lb) return la;
  const d = Array.from({ length: la + 1 }, (_, i) => [i, ...new Array(lb).fill(0)]);
  for (let j = 1; j <= lb; j += 1) d[0][j] = j;
  for (let i = 1; i <= la; i += 1) {
    for (let j = 1; j <= lb; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[la][lb];
}

/** Tolérance selon la longueur du mot : pas de faute admise sous 4 lettres. */
function maxTypos(word) {
  if (word.length >= 8) return 2;
  if (word.length >= 4) return 1;
  return 0;
}

function fuzzyEqual(word, target) {
  if (word === target) return true;
  if (hasArabic(word) || hasArabic(target)) return false;
  if (/\d/.test(word) || /\d/.test(target)) return false;
  const tol = Math.min(maxTypos(word), maxTypos(target));
  if (!tol || Math.abs(word.length - target.length) > tol) return false;
  return distance(word, target) <= tol;
}

/** Mot arabe avec préfixes courants retirés (ال، ب، ل، و، ف). */
function arabicStems(word) {
  if (!hasArabic(word)) return [word];
  const out = new Set([word]);
  let w = word;
  for (let i = 0; i < 2; i += 1) {
    const m = w.match(/^(وال|بال|لل|فال|ال|و|ب|ل|ف)(.{2,})$/);
    if (!m) break;
    w = m[2];
    out.add(w);
  }
  return [...out];
}

/** Forme canonique : normalisation + expressions + abréviations/darija remplacées (« resa tadrart svp » → « reservation tadrart sil vous plait »). */
function canonical(raw) {
  const { PHRASES, EXPANSIONS } = require('./lexicon');
  let text = normalize(raw);
  text = text.replace(/\b(\d+)(p|pers|personnes?|ppl|adultes?)\b/g, '$1 personnes');
  text = text.replace(/\b(\d{1,2})(dec|nov|oct|jan|janv|fev|mars|avr|mai|juin|juil|aout|sept)\b/g, '$1 $2');
  for (const [re, rep] of PHRASES) text = text.replace(re, rep);
  text = tokenize(text)
    .map((tok) => (Object.prototype.hasOwnProperty.call(EXPANSIONS, tok) ? EXPANSIONS[tok] : tok))
    .join(' ');
  for (const [re, rep] of PHRASES) text = text.replace(re, rep);
  return text;
}

module.exports = { normalize, canonical, tokenize, hasArabic, distance, fuzzyEqual, arabicStems };
