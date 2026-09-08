/** NLP — SMS FR, darija, Arabizi, villes, extraction d'entités */

const CITY_ALIASES = {
  alger: ['alger', 'algiers', 'alg', 'dzair', 'el djazair', 'capitale', 'casbah', 'الجزائر'],
  oran: ['oran', 'ouahran', 'wahran', 'orn', 'وهران'],
  bejaia: ['bejaia', 'bejaïa', 'bejaya', 'bejaiaa', 'beja', 'bougie', 'bougi', 'bj', 'bja', 'بجاية'],
  constantine: ['constantine', 'qacentina', 'cst', 'قسنطينة'],
  annaba: ['annaba', 'ann', 'bone', 'عنابة'],
  tlemcen: ['tlemcen', 'telemsen', 'tlm', 'تلمسان'],
  setif: ['setif', 'sétif', 'سطif'],
  batna: ['batna', 'باتنة'],
  blida: ['blida', 'البليدة'],
  tipaza: ['tipaza', 'tipasa', 'tip', 'تيبaza'],
  'tizi-ouzou': ['tizi ouzou', 'tiziouzou', 'tizi', 'تيزي وزو'],
  bouira: ['bouira', 'البويرة'],
  jijel: ['jijel', 'jij', 'جijel'],
  skikda: ['skikda', 'سkikda'],
  mostaganem: ['mostaganem', 'مستغانem'],
  bechar: ['bechar', 'béchar', 'bechar', 'بشار'],
  tamanrasset: ['tamanrasset', 'tam', 'تمنرasset'],
  ouargla: ['ouargla', 'ورقلة'],
  ghardaia: ['ghardaia', 'ghardaïa', 'gh', 'gha', 'mzab', 'غرداية'],
  timimoun: ['timimoun', 'tim', 'تيميمون'],
  djanet: ['djanet', 'dj', 'dja', 'jant', 'جانت'],
  adrar: ['adrar', 'أdrar'],
  touggourt: ['touggourt', 'تقgourt'],
  taghit: ['taghit', 'th', 'tag', 'tgh', 'تاغيت'],
  hoggar: ['hoggar', 'assekrem', 'tuareg', 'الhoggar'],
  kabylie: ['kabylie', 'kabyle', 'kabylia', 'قبail'],
  sahara: ['sahara', 'sah', 'desert', 'des', 'désert', 'sud', 'grand sud', 'صحراء'],
};

const TOKEN_EXPANSIONS = {
  bjr: ['bonjour'], bj: ['bonjour'], slt: ['salut'], cc: ['coucou'], bsr: ['bonsoir'],
  slm: ['salam'], salam: ['salam'], yo: ['salut'], hello: ['bonjour'],
  cmb: ['combien'], cb: ['combien'], com: ['combien'], pk: ['pourquoi'], pq: ['pourquoi'],
  prq: ['pourquoi'], koi: ['quoi'], win: ['ou'], ou: ['ou'],
  ajd: ['aujourdhui'], auj: ['aujourdhui'], mtn: ['maintenant'], dem: ['demain'],
  dem1: ['demain'], apdem: ['apres demain'], j: ['jour'], jr: ['jour'], jrs: ['jours'],
  n: ['nuit'], nuit: ['nuit'], nuits: ['nuits'], sem: ['semaine'], we: ['weekend'],
  wk: ['weekend'], mat: ['matin'], aprem: ['apres midi'], soir: ['soir'],
  res: ['reservation', 'reserver'], resa: ['reservation', 'reserver'], résa: ['reservation'],
  réserv: ['reservation'], reserv: ['reservation'], book: ['reserver'], booking: ['reservation'],
  conf: ['confirmation'], dispo: ['disponibilite'], disp: ['disponibilite'],
  apt: ['appartement'], appart: ['appartement'], apprt: ['appartement'], app: ['appartement'],
  logt: ['logement'], heberg: ['hebergement'], héb: ['hebergement'], hotel: ['hotel'],
  hot: ['hotel'], ch: ['chambre'], chbre: ['chambre'], villa: ['villa'], camp: ['camping'],
  avion: ['avion'], vol: ['vol'], aero: ['aeroport'], aeroport: ['aeroport'],
  train: ['train'], gare: ['gare'], bus: ['bus'], taxi: ['taxi'], vtc: ['vtc'],
  ferry: ['ferry'], bateau: ['bateau'], nav: ['navette'], loc: ['location'], auto: ['voiture'],
  activ: ['activite'], act: ['activite'], exc: ['excursion'], excurs: ['excursion'],
  rando: ['randonnee'], rand: ['randonnee'], quad: ['quad'], cheval: ['cheval'],
  kayak: ['kayak'], plong: ['plongee'], surf: ['surf'], ski: ['ski'], plage: ['plage'], mer: ['mer'],
  prix: ['prix', 'tarif'], tarif: ['prix'], budget: ['budget'], promo: ['promotion'],
  rem: ['remise'], réduc: ['reduction'], cheap: ['economique'], 'pas cher': ['economique'],
  tel: ['telephone'], tél: ['telephone'], num: ['numero'], msg: ['message'],
  mail: ['email'], info: ['information'], infos: ['informations'], rdv: ['rendez vous'],
  svp: ['sil vous plait'], stp: ['sil te plait'], mrc: ['merci'], thx: ['merci'],
  ok: ['daccord'], okk: ['daccord'], oki: ['daccord'], dac: ['daccord'], dacc: ['daccord'],
  nn: ['non'], oui: ['oui'], ouais: ['oui'],
  ch7al: ['combien'], chhal: ['combien'], wach: ['quoi'], wesh: ['quoi'],
  kayn: ['il y a'], makanch: ['il n y a pas'],
  n7eb: ['je veux'], nheb: ['je veux'], n7ab: ['je veux'], hab: ['je veux'],
  bghit: ['je veux'], 'n7eb nroh': ['je veux aller'], 'n7eb nzour': ['je veux visiter'],
  nroh: ['je vais'], nrouh: ['je vais'], nzour: ['visiter'], safar: ['voyage'], siyaha: ['tourisme'],
  lyoum: ['aujourdhui'], ghodwa: ['demain'], lyoum: ['aujourdhui'],
  m3a: ['avec'], bla: ['sans'], wahdi: ['seul'], ana: ['moi'], hna: ['nous'],
  voy: ['voyage'], circ: ['circuit'], circu: ['circuit'], dest: ['destination'],
  sej: ['sejour'], tt: ['tout'], px: ['prix'], comb: ['combien'], ht: ['hotel'],
  mh: ['maison hote'], av: ['avion'], wpp: ['whatsapp'], wa: ['whatsapp'],
  resto: ['restaurant'], restau: ['restaurant'], maps: ['carte', 'localisation'],
  agent: ['humain', 'conseiller'], humain: ['humain'], conseiller: ['conseiller'],
  keske: ['qu est ce'], koi: ['quoi'], cmb: ['combien'], cb: ['combien'],
  pcq: ['parce que'], pck: ['parce que'], pk: ['pourquoi'], pq: ['pourquoi'],
  ajd: ['aujourdhui'], auj: ['aujourdhui'], mtn: ['maintenant'], dem: ['demain'],
  we: ['weekend'], wk: ['weekend'], mat: ['matin'], aprem: ['apres midi'],
  ch: ['chambre'], chbre: ['chambre'], loc: ['location'], auto: ['voiture'],
  exc: ['excursion'], excurs: ['excursion'], rand: ['randonnee'], plong: ['plongee'],
  pascher: ['pas cher', 'economique'], pscher: ['pas cher'], pch: ['pas cher'],
  ndir: ['faire', 'organiser'], ndiro: ['organiser'], ndirha: ['organiser'],
  nzour: ['visiter'], nzourou: ['visiter'], nzourha: ['visiter'],
  fi: ['a', 'dans'], f: ['a'], l: ['le'], d: ['de'],
  '3and': ['avec'], '3andi': ['j ai'], '3andna': ['nous avons'],
  wahdi: ['seul'], drari: ['enfants'], s7abi: ['amis'],
  prog: ['programme'], itin: ['itineraire'], org: ['organiser'],
  hajz: ['reservation'], htl: ['hotel'], htlm: ['hotel'],
};

const EMOJI_HINTS = {
  '🏨': 'hotel', '🏡': 'logement', '🏖️': 'plage', '🌊': 'mer', '🏜️': 'sahara',
  '🏔️': 'montagne', '🚗': 'voiture', '✈️': 'vol', '🚆': 'train', '🚌': 'bus',
  '🚢': 'ferry', '🍽️': 'restaurant', '📍': 'localisation', '📅': 'date',
  '💰': 'prix', '💳': 'paiement', '🛻': 'quad', '🐎': 'cheval',
};

function normalizeQuery(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''´`]/g, ' ')
    .replace(/[^a-z0-9\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function preprocessMessage(raw) {
  let text = splitCompactMessage(String(raw || '').trim());
  for (const [emoji, hint] of Object.entries(EMOJI_HINTS)) {
    if (text.includes(emoji)) text += ` ${hint}`;
  }
  return text;
}

/** Découpe les messages compacts : sltn7ebbejaia4j, ch7alhotel3n2p, etc. */
function splitCompactMessage(text) {
  let s = text;
  const abbrevs = [
    'ch7al', 'chhal', 'ch7al', 'n7eb', 'nheb', 'n7ab', 'bghit', 'win', 'wach', 'wesh', 'kayn', 'makanch',
    'slt', 'bjr', 'bsr', 'slm', 'salam', 'marhaba', 'ahlan', 'coucou', 'cc', 'yo',
    'resa', 'reserv', 'résa', 'dispo', 'disp', 'book', 'booking',
    'hotel', 'ht', 'hot', 'apt', 'appart', 'apprt', 'logt', 'heberg', 'villa', 'camp',
    'voy', 'circ', 'circu', 'sej', 'safar', 'siyaha', 'vol', 'avion', 'aero', 'ferry', 'train', 'bus', 'taxi',
    'plage', 'beach', 'sahara', 'desert', 'resto', 'restau', 'activ', 'quad', 'rando',
    'cmb', 'combien', 'prix', 'tarif', 'px', 'budget', 'dispo',
    'bejaia', 'bejaïa', 'bougie', 'oran', 'alger', 'taghit', 'djanet', 'ghardaia', 'timimoun', 'jijel',
    'constantine', 'annaba', 'tipaza', 'tlemcen', 'setif', 'blida', 'kabylie',
    'pas cher', 'm3a', 'pr', 'pour', 'lyali', 'ghodwa', 'lyoum',
  ].sort((a, b) => b.length - a.length);

  for (const ab of abbrevs) {
    const esc = ab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`(${esc})(?=[a-z0-9\u0600-\u06ff])`, 'gi'), '$1 ');
    s = s.replace(new RegExp(`(?<=[a-z0-9\u0600-\u06ff])(${esc})`, 'gi'), ' $1');
  }

  s = s
    .replace(/(\d+)lyali/gi, '$1 lyali')
    .replace(/(\d+)([jnp])(?=\s|$|[^a-z0-9])/gi, '$1$2 ')
    .replace(/(\d+)\s*p(?=\s|$)/gi, '$1 p')
    .replace(/pr(\d+)/gi, 'pr $1')
    .replace(/(\d+)\s*(pers|perso|personnes?|pax)/gi, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  return s;
}

function expandTokens(tokens) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    if (TOKEN_EXPANSIONS[token]) {
      TOKEN_EXPANSIONS[token].forEach((t) => expanded.add(normalizeQuery(t)));
    }
  }
  return [...expanded];
}

function expandQuery(raw) {
  const preprocessed = preprocessMessage(raw);
  const original = normalizeQuery(preprocessed);
  const tokens = original.split(' ').filter(Boolean);
  const expanded = expandTokens(tokens);

  for (const [cityId, aliases] of Object.entries(CITY_ALIASES)) {
    const all = [cityId, ...aliases].map(normalizeQuery);
    if (all.some((a) => tokens.includes(a) || original.includes(a))) {
      all.forEach((a) => expanded.push(a));
      expanded.push(cityId);
    }
  }

  return {
    original,
    tokens,
    expanded: [...new Set(expanded)],
    searchText: [...new Set(expanded)].join(' '),
  };
}

function detectLanguage(text) {
  const t = String(text || '');
  if (/[\u0600-\u06FF]/.test(t)) return 'ar';
  if (/\b(hi|hello|thanks|book|trip|travel|hotel|price|how much)\b/i.test(t)) return 'en';
  if (/\b(ch7al|n7eb|win|wach|bghit|lyoum|ghodwa|m3a|slm)\b/i.test(t)) return 'fr';
  return 'fr';
}

function findDestination(text, tokens) {
  const n = normalizeQuery(text);
  for (const [cityId, aliases] of Object.entries(CITY_ALIASES)) {
    const all = [cityId, ...aliases].map(normalizeQuery);
    for (const a of all) {
      if (a.length < 3) continue;
      if (n.includes(a) || tokens.includes(a)) return cityId;
    }
  }
  return null;
}

function parsePersons(text) {
  const patterns = [
    /(\d+)\s*(?:pers(?:onnes?)?|p(?:ers)?|personnes?|persons?|people|pax|ashkhas|أشخاص)/i,
    /(?:pr|pour)\s*(\d+)/i,
    /(\d+)p(?=\s|$|[^a-z])/i,
    /(\d+)pers\b/i,
    /m3a\s*(\d+)/i,
    /(\d+)\s*(?:voyageurs?|travelers?)/i,
    /couple/i,
    /famille/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      if (/couple/i.test(m[0])) return { travelers: 2, type: 'couple' };
      if (/famille/i.test(m[0])) return { travelers: null, type: 'family' };
      return { travelers: parseInt(m[1], 10), type: 'group' };
    }
  }
  return {};
}

function parseDuration(text) {
  const n = normalizeQuery(text);
  let days = null;
  let nights = null;

  const dayMatch = n.match(/(\d+)\s*(?:j|jr|jrs|jours?|days?|lyali?)/);
  if (dayMatch) {
    const val = parseInt(dayMatch[1], 10);
    if (/lyali|nuits?|n\b/.test(dayMatch[0])) nights = val;
    else days = val;
  }

  const nightMatch = n.match(/(\d+)\s*(?:nuits?|nights?|lyali|3lyali)/);
  if (nightMatch) nights = parseInt(nightMatch[1], 10);

  const shortNightMatch = n.match(/(\d+)n\b/);
  if (shortNightMatch) nights = parseInt(shortNightMatch[1], 10);

  const shortDayMatch = n.match(/(\d+)j\b/);
  if (shortDayMatch) days = parseInt(shortDayMatch[1], 10);

  const lyaliMatch = n.match(/(\d+)lyali/);
  if (lyaliMatch) nights = parseInt(lyaliMatch[1], 10);

  return { days, nights };
}

function parseDateRange(text) {
  const patterns = [
    /du\s*(\d{1,2})\s*(?:au|a|→|-)\s*(\d{1,2})/i,
    /(\d{1,2})\s*(?:au|a|→|-)\s*(\d{1,2})/,
    /(\d{1,2})\s*o\s*(\d{1,2})/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return { arrivalDay: parseInt(m[1], 10), departureDay: parseInt(m[2], 10) };
  }
  return {};
}

function parseBudget(text) {
  const n = normalizeQuery(text);
  if (/pas cher|economique|cheap|petit budget|low budget/.test(n)) {
    return { budgetLevel: 'economique' };
  }
  if (/luxe|haut de gamme|5 etoiles|5 étoiles/.test(n)) {
    return { budgetLevel: 'luxe' };
  }
  const m = n.match(/(?:budget\s*)?(\d+)\s*(?:k|m|000|da|dzd|dinars?)?/);
  if (m) {
    let amount = parseInt(m[1], 10);
    if (/k|000/.test(m[0]) || amount >= 1000) {
      if (amount < 1000 && /k/.test(m[0])) amount *= 1000;
    }
    if (amount >= 5000) return { budgetAmount: amount };
  }
  return {};
}

function detectIntent(text, entities) {
  const n = normalizeQuery(text);
  const trimmed = n.trim();
  const greetingOnly = /^(bjr|bj|slt|salut|cc|coucou|bonjour|bonsoir|slm|salam|marhaba|ahlan|hello|hi)(\s*[!?.…]*)$/;
  if (greetingOnly.test(trimmed)) return 'GREETING';
  if (/humain|agent|conseiller|appelez|appeler|parler a quelqu/.test(n)) return 'CONTACT';
  const ackOnly = /^(merci|thx|mrc|ok|okk|oki|dac|dacc|parfait|c bon|c est bon)(\s*[!?.…]*)$/;
  if (ackOnly.test(trimmed)) return 'ACK';
  if (/^(prix|tarif|cmb|ch7al|combien|px|budget)\??$/.test(n)) return 'FOLLOWUP_PRICE';
  if (/^(dispo|disp|disponible)\??$/.test(n)) return 'FOLLOWUP_AVAILABILITY';
  if (entities.destination && !entities.accommodation && !entities.activity && n.length < 20) return 'DESTINATION_SEARCH';
  if (/hotel|ht|apt|appart|heberg|logement|villa|camping/.test(n)) return 'ACCOMMODATION_SEARCH';
  if (/resto|restaurant|restau|manger|cuisine/.test(n)) return 'RESTAURANT_SEARCH';
  if (/quoi faire|qqch|qq chose|truc a faire|visiter|nzour|decouvrir|découvrir/.test(n)) return 'ACTIVITY_SEARCH';
  if (/plage|beach|mer|bord de mer/.test(n)) return 'BEACH_SEARCH';
  if (/activ|quad|4x4|rando|excursion|cheval|kayak|bateau/.test(n)) return 'ACTIVITY_SEARCH';
  if (/vol|avion|aero|ferry|train|bus|taxi|loc voiture|location voiture|transport|comment aller|trajet/.test(n)) return 'TRANSPORT';
  if (/reserv|resa|book|hajz|حجز/.test(n)) return 'BOOKING';
  if (/programme|itineraire|itinéraire|plan|organiser/.test(n)) return 'ITINERARY';
  if (/voyage|voy|circuit|sejour|safar|siyaha|trip|travel/.test(n)) return 'TRIP_PLANNING';
  if (/capitale|capital/.test(n) && /alger|algerie|dz/.test(n)) return 'GENERAL_INFORMATION';
  if (/meteo|météo|weather|climat/.test(n)) return 'WEATHER';
  if (/annul/.test(n)) return 'CANCELLATION';
  if (/paiement|payer|carte|paypal/.test(n)) return 'PAYMENT';
  if (entities.destination) return 'DESTINATION_SEARCH';
  return 'GENERAL_QUESTION';
}

function extractEntities(raw) {
  const text = preprocessMessage(raw);
  const queryExp = expandQuery(text);
  const { tokens } = queryExp;

  const destination = findDestination(text, tokens);
  const persons = parsePersons(text);
  const duration = parseDuration(text);
  const dates = parseDateRange(text);
  const budget = parseBudget(text);

  let accommodation = null;
  const n = normalizeQuery(text);
  if (/hotel|ht|hot\b/.test(n)) accommodation = 'hotel';
  else if (/apt|appart|appartement/.test(n)) accommodation = 'appartement';
  else if (/maison|mh|guesthouse|hote|hôte/.test(n)) accommodation = 'guesthouse';
  else if (/villa/.test(n)) accommodation = 'villa';
  else if (/camping|camp/.test(n)) accommodation = 'camping';

  let activity = null;
  if (/quad/.test(n)) activity = 'quad';
  else if (/4x4|4wd/.test(n)) activity = '4x4';
  else if (/dromadaire|chameau|camel|drom/.test(n)) activity = 'camel';
  else if (/kayak/.test(n)) activity = 'kayak';
  else if (/bateau|ferry|nav/.test(n)) activity = 'boat';
  else if (/plage|beach/.test(n)) activity = 'beach';

  let interests = [];
  if (/plage|mer|beach/.test(n)) interests.push('plage');
  if (/nature|rando|montagne/.test(n)) interests.push('nature');
  if (/culture|patrimoine|monument|ksar/.test(n)) interests.push('culture');
  if (/aventure|quad|4x4/.test(n)) interests.push('aventure');
  if (/couple|romantique|lune de miel|honeymoon/.test(n)) interests.push('couple');
  if (/famille|enfants|bebe/.test(n)) interests.push('famille');

  const entities = {
    destination,
    accommodation,
    activity,
    interests,
    travelers: persons.travelers,
    travelerType: persons.type,
    days: duration.days,
    nights: duration.nights,
    arrivalDay: dates.arrivalDay,
    departureDay: dates.departureDay,
    budgetLevel: budget.budgetLevel,
    budgetAmount: budget.budgetAmount,
    wantsPrice: /ch7al|cmb|combien|prix|tarif|px|budget|price|how much|كم/.test(n),
    wantsAvailability: /dispo|disponib|available/.test(n),
  };

  if (entities.arrivalDay && entities.departureDay) {
    entities.nights = Math.max(0, entities.departureDay - entities.arrivalDay);
  }

  return { entities, queryExp, intent: detectIntent(text, entities) };
}

module.exports = {
  normalizeQuery,
  expandQuery,
  preprocessMessage,
  splitCompactMessage,
  detectLanguage,
  extractEntities,
  detectIntent,
  findDestination,
  CITY_ALIASES,
  TOKEN_EXPANSIONS,
};
