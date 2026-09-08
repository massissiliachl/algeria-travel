/** Infos transport entre villes algériennes */

const { formatDestinationLabel } = require('./chatSession');

const ROUTES = {
  'alger-bejaia': {
    fr: {
      title: 'Alger → Béjaïa',
      options: [
        '🚗 Voiture : ~220 km, 2h30–3h via A1 puis RN26',
        '🚌 Bus : liaisons quotidiennes depuis Alger (~3–4h)',
        '✈️ Vol : aéroport d\'Alger + transfert local (~1h)',
      ],
      tip: 'La route côtière est magnifique. Arrêt possible à Tizi Ouzou.',
    },
    en: {
      title: 'Algiers → Bejaia',
      options: [
        '🚗 Car: ~220 km, 2h30–3h via A1 then RN26',
        '🚌 Bus: daily from Algiers (~3–4h)',
        '✈️ Flight: Algiers airport + transfer (~1h)',
      ],
      tip: 'Scenic coastal road. Stop at Tizi Ouzou for nature.',
    },
  },
  'alger-oran': {
    fr: {
      title: 'Alger → Oran',
      options: ['🚗 Voiture : ~430 km, 4h30–5h', '🚌 Bus : ~5–6h', '✈️ Vol : ~1h', '🚆 Train : ~4h'],
      tip: 'Le vol intérieur est le plus rapide.',
    },
    en: {
      title: 'Algiers → Oran',
      options: ['🚗 Car: ~430 km, 4h30–5h', '🚌 Bus: ~5–6h', '✈️ Flight: ~1h', '🚆 Train: ~4h'],
      tip: 'Domestic flight is fastest.',
    },
  },
  'alger-constantine': {
    fr: {
      title: 'Alger → Constantine',
      options: ['🚗 Voiture : ~320 km, 3h30–4h', '🚌 Bus : ~4–5h', '✈️ Vol : ~1h'],
      tip: 'Constantine se visite à pied — chaussures confortables.',
    },
    en: {
      title: 'Algiers → Constantine',
      options: ['🚗 Car: ~320 km, 3h30–4h', '🚌 Bus: ~4–5h', '✈️ Flight: ~1h'],
      tip: 'Best explored on foot.',
    },
  },
  'alger-taghit': {
    fr: {
      title: 'Alger → Taghit',
      options: [
        '✈️ Vol aller-retour Alger ➤ Béchar · ✈️ Béchar ➤ Alger (inclus offre Taghit 23–28 oct.)',
        '🚌 Bus Mercedes Béchar – Taghit inclus',
        '🚗 Voiture : ~750 km, 8h+ (déconseillé en 1 jour)',
      ],
      tip: 'Formule Taghit : vol aller-retour + navette. Voir /place/taghit?pkg=hotel',
    },
    en: {
      title: 'Algiers → Taghit',
      options: [
        '✈️ Round-trip flight Algiers ➤ Béchar · ✈️ Béchar ➤ Algiers (included Taghit offer Oct 23–28)',
        '🚌 Mercedes bus Béchar – Taghit included',
        '🚗 Car: ~750 km, 8h+ (not recommended in one day)',
      ],
      tip: 'Taghit package includes flight + shuttle. See /place/taghit?pkg=hotel',
    },
  },
  'alger-djanet': {
    fr: {
      title: 'Alger → Djanet',
      options: ['✈️ Vol intérieur ~2h', '🛻 4×4 sur place (circuits)'],
      tip: 'Accessible surtout par avion. Voir nos circuits Sahara.',
    },
    en: {
      title: 'Algiers → Djanet',
      options: ['✈️ Domestic flight ~2h', '🛻 4×4 on site (tours)'],
      tip: 'Mainly reached by plane. See Sahara tours.',
    },
  },
};

const KNOWN_CITIES = new Set([
  'alger', 'bejaia', 'oran', 'constantine', 'taghit', 'bechar', 'djanet',
  'ghardaia', 'timimoun', 'annaba', 'jijel', 'tlemcen', 'tipaza',
]);

function normalizeCityId(name) {
  const n = String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const map = {
    alger: 'alger', algiers: 'alger', dzair: 'alger', algiers: 'alger',
    bejaia: 'bejaia', bejaya: 'bejaia', bougie: 'bejaia', beja: 'bejaia',
    oran: 'oran', ouahran: 'oran', wahran: 'oran',
    constantine: 'constantine', taghit: 'taghit', bechar: 'taghit',
    djanet: 'djanet', ghardaia: 'ghardaia', timimoun: 'timimoun',
    annaba: 'annaba', jijel: 'jijel', tlemcen: 'tlemcen', tipaza: 'tipaza',
  };
  if (map[n]) return map[n];
  for (const [alias, id] of Object.entries(map)) {
    if (n === alias || n.startsWith(`${alias} `) || n.endsWith(` ${alias}`)) return id;
  }
  return KNOWN_CITIES.has(n) ? n : null;
}

function parseRoute(text) {
  let n = String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  n = n
    .replace(/comment\s+(aller|se\s+rendre|voyager)|how\s+to\s+(get|go)|trajet\s+(de|from)?|transport\s+(de|from)?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const city = '[a-z-]{3,}';
  const patterns = [
    new RegExp(`(?:de|from|d)\\s+(${city})\\s+(?:a|à|to|vers|-)\\s+(${city})`, 'i'),
    new RegExp(`(${city})\\s+(?:a|à|to|vers|-)\\s+(${city})`, 'i'),
  ];

  for (const re of patterns) {
    const m = n.match(re);
    if (!m) continue;
    const from = normalizeCityId(m[1]);
    const to = normalizeCityId(m[2]);
    if (from && to && from !== to) return { from, to };
  }
  return null;
}

function getTransportInfo(from, to, lang = 'fr') {
  const key = `${from}-${to}`;
  const reverse = `${to}-${from}`;
  const route = ROUTES[key] || ROUTES[reverse];
  if (!route) return null;

  const data = route[lang] || route.fr;
  return ['🚗 ' + (data.title || `${formatDestinationLabel(from, lang)} → ${formatDestinationLabel(to, lang)}`), '', ...data.options, '', `💡 ${data.tip}`].join('\n');
}

function buildTransportReply(text, lang = 'fr', session = {}) {
  const route = parseRoute(text);
  if (route) return getTransportInfo(route.from, route.to, lang);

  const n = String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const toMatch = n.match(/(?:aller|comment|trajet|transport|vol|bus|train|deplacer|deplacement).*?(?:a|à|vers|to|pour)\s+([a-z-]{3,})/);
  if (toMatch) {
    const to = normalizeCityId(toMatch[1]);
    const from = normalizeCityId(session.origin) || 'alger';
    if (to && to !== from) return getTransportInfo(from, to, lang);
  }

  if (session.destination && /transport|trajet|comment|aller|vol|bus|train/.test(n)) {
    return getTransportInfo('alger', session.destination, lang);
  }

  return null;
}

module.exports = { parseRoute, getTransportInfo, buildTransportReply, ROUTES };
