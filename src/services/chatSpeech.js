const VOICE_PREF_KEY = 'algeria-travel-chat-voice';

/** Arabizi / darija → forme parlée claire (FR ou AR) */
const DARIJA_SPEECH = {
  bjr: 'bonjour',
  bj: 'bonjour',
  bsr: 'bonsoir',
  bs: 'bonsoir',
  slt: 'salut',
  slm: 'salam alikom',
  salam: 'salam alikom',
  saha: 'salam',
  cc: 'coucou',
  mrc: 'merci',
  thx: 'merci',
  ch7al: 'combien',
  chhal: 'combien',
  cmb: 'combien',
  comb: 'combien',
  cb: 'combien',
  n7eb: 'je veux',
  nheb: 'je veux',
  n7ab: 'je veux',
  bghit: 'je veux',
  ndir: 'je fais',
  ndiro: 'on fait',
  nroh: 'j\'y vais',
  nzour: 'je visite',
  wach: 'est-ce que',
  wesh: 'est-ce que',
  kayn: 'il y a',
  makanch: 'il n\'y a pas',
  kifach: 'comment',
  ghodwa: 'demain',
  lyoum: 'aujourd\'hui',
  lyom: 'aujourd\'hui',
  m3a: 'avec',
  bla: 'sans',
  wahdi: 'seul',
  inchalah: 'incha Allah',
  nchalah: 'incha Allah',
  dispo: 'disponible',
  disp: 'disponible',
  resa: 'réservation',
  reserv: 'réservation',
  rez: 'réservation',
  pr: 'pour',
  pers: 'personnes',
  perss: 'personnes',
  jrs: 'jours',
  jr: 'jour',
  lyali: 'nuits',
  nuit: 'nuit',
  nuits: 'nuits',
  voy: 'voyage',
  circ: 'circuit',
  sej: 'séjour',
  ht: 'hôtel',
  htl: 'hôtel',
  hot: 'hôtel',
  transp: 'transport',
  transf: 'transfert',
  av: 'avion',
  vol: 'vol',
  prix: 'prix',
  tarif: 'tarif',
  px: 'prix',
  ttc: 'toutes taxes comprises',
  incl: 'inclus',
  prog: 'programme',
  org: 'organiser',
  svp: 's\'il vous plaît',
  stp: 's\'il te plaît',
  ok: 'd\'accord',
  dac: 'd\'accord',
  dz: 'Algérie',
  dza: 'Algérie',
  sah: 'Sahara',
  des: 'désert',
  tag: 'Taghit',
  th: 'Taghit',
  tgh: 'Taghit',
  bja: 'Béjaïa',
  dj: 'Djanet',
  gh: 'Ghardaïa',
  tim: 'Timimoun',
  or: 'Oran',
  alg: 'Alger',
  wpp: 'WhatsApp',
  wa: 'WhatsApp',
  rdv: 'rendez-vous',
  labes: 'ça va',
  hamdoulah: 'hamdoulah',
  zouj: 'deux',
  tlata: 'trois',
  rb3a: 'quatre',
  khamsa: 'cinq',
};

const PLACE_PRONUNCIATION = {
  bejaia: 'Béjaïa',
  bejaïa: 'Béjaïa',
  bejaya: 'Béjaïa',
  bougie: 'Béjaïa',
  taghit: 'Taghit',
  ghardaia: 'Ghardaïa',
  ghardaïa: 'Ghardaïa',
  djanet: 'Djanet',
  timimoun: 'Timimoun',
  tamanrasset: 'Tamanrasset',
  alger: 'Alger',
  algiers: 'Alger',
  oran: 'Oran',
  constantine: 'Constantine',
  annaba: 'Annaba',
  jijel: 'Jijel',
  tlemcen: 'Tlemcen',
  kabylie: 'Kabylie',
};

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function loadVoiceEnabled() {
  try {
    const v = localStorage.getItem(VOICE_PREF_KEY);
    if (v === null) return true;
    return v === 'true';
  } catch {
    return true;
  }
}

export function saveVoiceEnabled(enabled) {
  try {
    localStorage.setItem(VOICE_PREF_KEY, enabled ? 'true' : 'false');
  } catch {
    /* ignore */
  }
}

function normalizeForSpeech(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const DARIJA_AR_SPEECH = {
  n7eb: 'أريد',
  nheb: 'أريد',
  bghit: 'أريد',
  ch7al: 'كم',
  chhal: 'كم',
  cmb: 'كم',
  slm: 'سلام عليكم',
  salam: 'سلام عليكم',
  ghodwa: 'غدا',
  lyoum: 'اليوم',
  m3a: 'مع',
  wach: 'هل',
  kayn: 'يوجد',
  dispo: 'متاح',
  resa: 'حجز',
  pr: 'ل',
  pers: 'أشخاص',
  voy: 'رحلة',
  sah: 'الصحراء',
  bjr: 'مرحبا',
  mrc: 'شكرا',
  inchalah: 'إن شاء الله',
  nchalah: 'إن شاء الله',
};

function expandDarijaTokens(text, uiLang = 'fr') {
  const map = uiLang === 'ar'
    ? { ...DARIJA_AR_SPEECH, ...PLACE_PRONUNCIATION }
    : { ...DARIJA_SPEECH, ...PLACE_PRONUNCIATION };

  return String(text || '').replace(/\b[\w'\u0600-\u06FF]+\b/g, (token) => {
    const key = normalizeForSpeech(token);
    if (map[key]) return map[key];
    return token;
  });
}

export function textForSpeech(raw, uiLang = 'fr') {
  let text = String(raw || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[•·▪→/|]/g, ', ')
    .replace(/\b(\d+)\s*(?:da|dzd|dinars?)\b/gi, '$1 dinars algériens')
    .replace(/\b(\d+)\s*p\b/gi, '$1 personnes')
    .replace(/\b(\d+)\s*j\b/gi, '$1 jours')
    .replace(/\b(\d+)\s*n\b/gi, '$1 nuits')
    .replace(/\s+/g, ' ')
    .trim();

  text = expandDarijaTokens(text, uiLang);

  if (uiLang === 'fr') {
    text = text
      .replace(/\bAlgeria Travel\b/gi, 'Algeria Travel')
      .replace(/\bWhatsApp\b/gi, 'WhatsApp');
  }

  return text
    .replace(/([.!?…])\s*/g, '$1 ')
    .replace(/,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isArabicScript(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function splitSpeechSegments(text) {
  const segments = [];
  const re = /[\u0600-\u06FF]+|[^\u0600-\u06FF]+/g;
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = re.exec(text)) !== null) {
    const chunk = match[0].trim();
    if (!chunk) continue;
    segments.push({
      text: chunk,
      lang: isArabicScript(chunk) ? 'ar' : 'fr',
    });
  }
  return segments.length ? segments : [{ text, lang: 'fr' }];
}

let voicesReady = false;

function refreshVoices() {
  if (!isSpeechSupported()) return [];
  voicesReady = true;
  return window.speechSynthesis.getVoices();
}

if (typeof window !== 'undefined' && isSpeechSupported()) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

function pickFemaleVoice(lang) {
  if (!isSpeechSupported()) return null;
  const voices = voicesReady ? window.speechSynthesis.getVoices() : refreshVoices();

  if (lang === 'ar') {
    const arPriority = [
      /ar-dz/i, /ar-xa/i, /ar-sa/i, /ar-eg/i, /ar-ma/i, /ar-tn/i,
    ];
    const femaleHints = /female|femme|zira|hoda|salma|laila|naayf|zeina|mariam|yasmin|amira|nadia|sonia|google.*ar/i;
    const maleHints = /\bmale\b|homme|\bmajed\b|\bmoaz\b/i;

    for (const loc of arPriority) {
      const pool = voices.filter((v) => loc.test(v.lang));
      const hit = pool.find((v) => femaleHints.test(v.name) && !maleHints.test(v.name))
        || pool.find((v) => !maleHints.test(v.name))
        || pool[0];
      if (hit) return hit;
    }
    return voices.find((v) => v.lang.startsWith('ar')) || null;
  }

  if (lang === 'en') {
    const pool = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const femaleHints = /samantha|karen|victoria|fiona|tessa|zira|google.*english.*female|female/i;
    return pool.find((v) => femaleHints.test(v.name))
      || pool.find((v) => !/\bmale\b|david|mark|alex|daniel|james|george/i.test(v.name))
      || pool[0]
      || null;
  }

  const pool = voices.filter((v) => v.lang.toLowerCase().startsWith('fr'));
  const frPriority = /amélie|amelie|denise|hélène|helene|marie|google.*français|google.*french|female|femme/i;
  return pool.find((v) => frPriority.test(v.name))
    || pool.find((v) => !/\bmale\b|homme|paul|nicolas|thomas|henri/i.test(v.name))
    || pool[0]
    || null;
}

function speechLangCode(lang) {
  if (lang === 'ar') return 'ar-DZ';
  if (lang === 'en') return 'en-US';
  return 'fr-FR';
}

function speechRate(lang) {
  if (lang === 'ar') return 0.88;
  if (lang === 'en') return 0.92;
  return 0.9;
}

let activeCallbacks = null;

export function warmUpVoices() {
  refreshVoices();
}

export function stopSpeech() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
  if (activeCallbacks) {
    activeCallbacks.onEnd?.();
    activeCallbacks = null;
  }
}

function speakSegment(segment, uiLang, isFirst, isLast) {
  return new Promise((resolve) => {
    const segLang = segment.lang === 'ar' ? 'ar' : (uiLang === 'en' ? 'en' : segment.lang);
    const utter = new SpeechSynthesisUtterance(segment.text);
    utter.lang = speechLangCode(segLang);
    const voice = pickFemaleVoice(segLang);
    if (voice) utter.voice = voice;
    utter.rate = speechRate(segLang);
    utter.pitch = segLang === 'ar' ? 1.05 : 1.06;
    utter.volume = 1;

    utter.onstart = () => {
      if (isFirst) activeCallbacks?.onStart?.();
    };
    utter.onend = () => {
      if (isLast) {
        activeCallbacks?.onEnd?.();
        activeCallbacks = null;
      }
      resolve();
    };
    utter.onerror = () => {
      if (isLast) {
        activeCallbacks?.onEnd?.();
        activeCallbacks = null;
      }
      resolve();
    };

    window.speechSynthesis.speak(utter);
  });
}

async function speakQueue(segments, uiLang) {
  for (let i = 0; i < segments.length; i += 1) {
    if (!activeCallbacks) break;
    // eslint-disable-next-line no-await-in-loop
    await speakSegment(segments[i], uiLang, i === 0, i === segments.length - 1);
  }
}

export function speakText(text, uiLang = 'fr', callbacks = {}) {
  if (!isSpeechSupported()) return;
  const clean = textForSpeech(text, uiLang);
  if (!clean) return;

  stopSpeech();
  activeCallbacks = callbacks;

  const segments = splitSpeechSegments(clean).map((seg) => ({
    ...seg,
    lang: seg.lang === 'ar' ? 'ar' : uiLang,
  }));

  speakQueue(segments, uiLang);
}
