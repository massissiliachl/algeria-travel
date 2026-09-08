const { buildSystemPrompt } = require('./systemPromptLoader');
const { mergeSession, buildRecap } = require('./chatSession');
const { extractEntities } = require('./chatNlp');
const { WHATSAPP, getSuggestions } = require('./chatUi');
const { TAGHIT_PACKAGES } = require('../scripts/data/taghitPackages.cjs');
const { FEATURED_TOURS } = require('../scripts/data/tours.cjs');
const { PLACES } = require('../scripts/data/places.cjs');
const { ACTIVITIES } = require('../scripts/data/activities.cjs');

const EMAILS = ['travelalgeriadz@gmail.com', 'visit.bougie@gmail.com'];

/** Abréviations catalogue (recherche locale) */
const ABBREVIATIONS = {
  voy: ['voyage', 'voyages'],
  v: ['voyage', 'vol'],
  circ: ['circuit', 'circuits'],
  circu: ['circuit', 'circuits'],
  dest: ['destination', 'destinations'],
  res: ['reservation', 'reserver', 'réserver'],
  resa: ['reservation', 'réserver', 'reserver'],
  résa: ['reservation', 'réserver'],
  sah: ['sahara', 'desert'],
  des: ['desert', 'désert', 'destination'],
  dz: ['algerie', 'algérie', 'algeria'],
  dza: ['algerie', 'algérie'],
  th: ['taghit'],
  tag: ['taghit'],
  tgh: ['taghit'],
  bj: ['bejaia', 'bejaïa'],
  bja: ['bejaia', 'bejaïa'],
  gh: ['ghardaia', 'ghardaïa'],
  gha: ['ghardaia', 'ghardaïa'],
  dj: ['djanet'],
  dja: ['djanet'],
  tim: ['timimoun'],
  tam: ['tamanrasset', 'hoggar'],
  or: ['oran'],
  alg: ['alger', 'algiers'],
  cst: ['constantine'],
  jij: ['jijel'],
  ann: ['annaba'],
  tip: ['tipaza'],
  tlm: ['tlemcen'],
  comb: ['combien', 'prix', 'tarif'],
  cb: ['combien'],
  px: ['prix', 'tarif'],
  ht: ['hotel', 'hôtel'],
  mh: ['maison', 'hote', 'hôte', 'guesthouse'],
  vol: ['vol', 'avion', 'flight', 'billet'],
  av: ['avion', 'vol'],
  act: ['activite', 'activité', 'activity'],
  quad: ['quad', 'quads'],
  '4x4': ['4x4', '4wd', 'safari'],
  drom: ['dromadaire', 'chameau', 'camel'],
  rdv: ['reservation', 'réserver', 'contact'],
  wpp: ['whatsapp', 'whatsap', 'watsapp'],
  wa: ['whatsapp'],
  tt: ['tout', 'tous', 'all', 'liste', 'catalogue'],
  pkg: ['package', 'formule', 'offre'],
  sej: ['sejour', 'séjour'],
  sud: ['sahara', 'desert', 'sud'],
  nord: ['bejaia', 'jijel', 'oran', 'alger'],
};

/** Synonymes globaux par thème */
const THEME_SYNONYMS = {
  voyage: [
    'voyage', 'voyages', 'voy', 'trip', 'travel', 'tour', 'tours', 'sejour', 'séjour', 'sej',
    'circuit', 'circuits', 'circu', 'package', 'packages', 'formule', 'formules', 'offre', 'offres',
    'catalogue', 'produit', 'produits', 'programme', 'programmes', 'escapade', 'séjour', 'partir',
    'partir en algerie', 'decouvrir', 'découvrir', 'explorer', 'السفر', 'رحلة', 'رحلات', 'جولة',
  ],
  sahara: [
    'sahara', 'sah', 'desert', 'des', 'désert', 'dunes', 'dune', 'erg', 'oasis', 'sud', 'grand sud',
    'saharien', 'saharienne', 'صحراء', 'كثبان', 'erg', 'erg occidental', 'grand erg',
  ],
  reservation: [
    'reserver', 'réserver', 'reservation', 'réservation', 'resa', 'résa', 'book', 'booking',
    'commander', 'inscrire', 'inscription', 'place', 'disponibilite', 'disponibilité', 'حجز',
  ],
  prix: [
    'prix', 'tarif', 'tarifs', 'cout', 'coût', 'combien', 'budget', 'cher', 'pas cher', 'promo',
    'reduction', 'réduction', 'da', 'dzd', 'euro', 'eur', 'سعر', 'ثمن',
  ],
  hebergement: [
    'hotel', 'hôtel', 'hotels', 'hôtels', 'hebergement', 'hébergement', 'logement', 'nuit', 'nuits',
    'maison', 'hote', 'hôte', 'guesthouse', 'auberge', 'pension', 'dormir', 'فندق', 'إقامة',
  ],
  activite: [
    'activite', 'activité', 'activites', 'activités', 'activity', 'quad', '4x4', 'dromadaire',
    'chameau', 'camel', 'kayak', 'ski', 'sable', 'sandboard', 'ksar', 'ksour', 'visite', 'excursion',
    'مغامرة', 'نشاط',
  ],
  contact: [
    'contact', 'contacter', 'email', 'mail', 'telephone', 'téléphone', 'tel', 'appeler', 'joindre',
    'whatsapp', 'wpp', 'wa', 'numero', 'numéro', 'اتصل', 'واتساب',
  ],
};

const PLACE_ALIASES = {
  alger: ['alger', 'algiers', 'alg', 'casbah', 'capitale', 'الجزائر'],
  oran: ['oran', 'ouest', 'santa cruz', 'mediterranee', 'plage', 'وهران'],
  jijel: ['jijel', 'jij', 'cote verte', 'criques', 'plage', 'جيجel'],
  annaba: ['annaba', 'ann', 'hippo regius', 'est', 'عنابة'],
  tipaza: ['tipaza', 'tip', 'tipasa', 'ruines romaines', 'archéologie'],
  tlemcen: ['tlemcen', 'tlm', 'mansourah', 'andalou', 'cascades'],
  bejaia: ['bejaia', 'bejaïa', 'bj', 'bejaya', 'kabylie', 'cap carbon', 'plage', 'mer', 'cote'],
  djanet: ['djanet', 'dj', 'tassili', 'tin merzouga', 'sahara', 'desert', 'touareg'],
  ghardaia: ['ghardaia', 'ghardaïa', 'gh', 'mzab', 'ksour', 'mozabite', 'oasis'],
  hoggar: ['hoggar', 'assekrem', 'tamanrasset', 'tam', 'tuareg', 'montagne'],
  taghit: ['taghit', 'th', 'tag', 'bechar', 'béchar', 'erg', 'dunes', 'ksar', 'sud ouest'],
  timimoun: ['timimoun', 'tim', 'gourara', 'erg occidental', 'dunes rouges'],
  constantine: ['constantine', 'cst', 'ponts', 'pont suspendu', 'ville des ponts'],
};

const ACTIVITY_ALIASES = {
  quad: ['quad', 'quads', 'moto', 'dune', 'moto desert'],
  '4x4': ['4x4', '4wd', 'safari', 'tout terrain', 'offroad', 'piste'],
  camel: ['chameau', 'dromadaire', 'drom', 'mehari', 'camel', 'balade'],
  kayak: ['kayak', 'paddle', 'nautique', 'lac', 'mer', 'bateau'],
  ksars: ['ksar', 'ksour', 'ksars', 'patrimoine', 'culture', 'architecture'],
};

const FAQ = {
  fr: [
    { q: 'Quel est le meilleur moment pour voyager ?', a: "Le printemps (mars-mai) et l'automne (septembre-novembre) offrent les meilleures conditions. Le Sahara est idéal d'octobre à avril." },
    { q: 'Les guides parlent-ils français ?', a: 'Oui, tous nos guides sont francophones et connaissent parfaitement leur région.' },
    { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Cartes bancaires, virements internationaux, PayPal et espèces (EUR/DZD) à votre arrivée.' },
  ],
  en: [
    { q: 'What is the best time to travel?', a: 'Spring (March-May) and autumn (September-November) offer the best conditions. The Sahara is ideal from October to April.' },
    { q: 'Do guides speak French?', a: 'Yes, all our guides speak French and know their region perfectly.' },
    { q: 'What payment methods do you accept?', a: 'Bank cards, international transfers, PayPal and cash (EUR/DZD) on arrival.' },
  ],
  ar: [
    { q: 'ما أفضل وقت للسفر؟', a: 'الربيع (مارس-مايو) والخريف (سبتمبر-نوفمبر) يوفران أفضل الظروف. الصحراء مثالية من أكتوبر إلى أبريل.' },
    { q: 'هل يتحدث المرشدون الفرنسية؟', a: 'نعم، جميع مرشدينا يتحدثون الفرنسية ويعرفون منطقتهm جيداً.' },
    { q: 'ما طرق الدفع المقبولة؟', a: 'البطاقات البنكية، التحويلات الدولية، PayPal والنقد (EUR/DZD) عند الوصول.' },
  ],
};

const UI = {
  fr: {
    greeting: 'Bonjour ! Je suis l\'assistant Algeria Travel. Demandez-moi : voyages, tarifs, Taghit, désert, réservation, activités… Même en abrégé (voy, resa, sah, th…) je comprends !',
    fallback: 'Je n\'ai pas trouvé de réponse précise. Essayez : « voyage », « tarif Taghit », « réserver », « Sahara ». Ou contactez-nous sur WhatsApp — réponse sous 24h.',
    reservation: 'Pour réserver :\n• Choisissez une destination ou un circuit sur le site\n• Ouvrez la fiche → « Réserver »\n• Ou WhatsApp / formulaire /contact\n• Suivi : page /suivi',
    contact: `Contact :\n• WhatsApp : +${WHATSAPP}\n• Email : ${EMAILS.join(', ')}\n• Formulaire : /contact\n• Horaires : lun–sam, réponse sous 24h`,
    payment: FAQ.fr[2].a,
    guides: FAQ.fr[1].a,
    season: FAQ.fr[0].a,
    taghitTitle: 'Offre Taghit — Hôtel 4★',
    taghitGuestTitle: 'Offre Taghit — Maison d\'hôte',
    perPerson: 'DA / pers.',
    seeTaghit: 'Taghit',
    seeTours: 'Circuits',
    seeDestinations: 'Destinations',
    seeActivities: 'Activités',
    seeStays: 'Hébergements',
    contactPage: 'Contact',
    whatsapp: 'WhatsApp',
    track: 'Suivi réservation',
    catalogTitle: 'Nos voyages & formules',
    catalogSahara: 'Sahara & Grand Sud',
    catalogNorth: 'Nord & Côte',
    catalogHeritage: 'Patrimoine & Villes',
    catalogActivities: 'Activités disponibles',
    catalogHint: 'Précisez une destination (ex. Taghit, Djanet) ou « tarif Taghit » pour plus de détails.',
  },
  en: {
    greeting: 'Hello! I\'m the Algeria Travel assistant. Ask about trips, prices, Taghit, desert, booking, activities… Short forms work too (voy, resa, sah, th…)!',
    fallback: 'No precise match. Try: « trip », « Taghit price », « book », « Sahara ». Or contact us on WhatsApp — reply within 24h.',
    reservation: 'To book:\n• Pick a destination or tour on the site\n• Open the page → « Book »\n• Or WhatsApp / form /contact\n• Track: /suivi',
    contact: `Contact:\n• WhatsApp: +${WHATSAPP}\n• Email: ${EMAILS.join(', ')}\n• Form: /contact`,
    payment: FAQ.en[2].a,
    guides: FAQ.en[1].a,
    season: FAQ.en[0].a,
    taghitTitle: 'Taghit offer — 4★ Hotel',
    taghitGuestTitle: 'Taghit offer — Guesthouse',
    perPerson: 'DZD / person',
    seeTaghit: 'Taghit',
    seeTours: 'Tours',
    seeDestinations: 'Destinations',
    seeActivities: 'Activities',
    seeStays: 'Stays',
    contactPage: 'Contact',
    whatsapp: 'WhatsApp',
    track: 'Track booking',
    catalogTitle: 'Our trips & packages',
    catalogSahara: 'Sahara & Deep South',
    catalogNorth: 'North & Coast',
    catalogHeritage: 'Heritage & Cities',
    catalogActivities: 'Available activities',
    catalogHint: 'Specify a destination (e.g. Taghit, Djanet) or « Taghit price » for more details.',
  },
  ar: {
    greeting: 'مرحباً! أنا مساعد Algeria Travel. اسأل عن الرحلات، الأسعار، تاغيت، الصحراء، الحجز، الأنشطة… حتى الاختصارات (voy, resa, sah)!',
    fallback: 'لم أجد إجابة دقيقة. جرّب: « رحلة »، « سعر تاغيت »، « حجز »، « صحراء ». أو WhatsApp — رد خلال 24 س.',
    reservation: 'للحجز:\n• اختر وجهة أو جولة\n• افتح الصفحة → « احجز »\n• أو WhatsApp /contact\n• متابعة: /suivi',
    contact: `تواصل:\n• WhatsApp: +${WHATSAPP}\n• Email: ${EMAILS.join(', ')}\n• /contact`,
    payment: FAQ.ar[2].a,
    guides: FAQ.ar[1].a,
    season: FAQ.ar[0].a,
    taghitTitle: 'عرض تاغيت — فندق 4★',
    taghitGuestTitle: 'عرض تاغيت — بيت ضيافة',
    perPerson: 'دج / للفرد',
    seeTaghit: 'تاغيت',
    seeTours: 'الجولات',
    seeDestinations: 'الوجهات',
    seeActivities: 'الأنشطة',
    seeStays: 'الإقامات',
    contactPage: 'اتصل',
    whatsapp: 'WhatsApp',
    track: 'تتبع الحجز',
    catalogTitle: 'رحلاتنا وعروضنا',
    catalogSahara: 'الصحراء والجنوب',
    catalogNorth: 'الشمال والساحل',
    catalogHeritage: 'التراث والمدن',
    catalogActivities: 'الأنشطة المتاحة',
    catalogHint: 'حدّد وجهة (مثل تاغيت، جانت) أو « سعر تاغيت » لمزيد من التفاصيل.',
  },
};

const SAHARA_PLACES = new Set(['taghit', 'timimoun', 'djanet', 'ghardaia', 'hoggar']);
const NORTH_PLACES = new Set(['bejaia', 'jijel', 'oran', 'alger', 'annaba', 'tipaza']);
const HERITAGE_PLACES = new Set(['ghardaia', 'constantine', 'tlemcen', 'tipaza', 'alger']);

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

function expandQuery(raw) {
  const original = normalizeQuery(raw);
  const tokens = original.split(' ').filter(Boolean);
  const expanded = new Set(tokens);

  for (const token of tokens) {
    if (ABBREVIATIONS[token]) {
      ABBREVIATIONS[token].forEach((t) => expanded.add(normalizeQuery(t)));
    }
  }

  for (const aliases of Object.values(THEME_SYNONYMS)) {
    const normalizedAliases = aliases.map(normalizeQuery);
    const hit = normalizedAliases.some(
      (a) => tokens.includes(a) || original === a
    );
    if (hit) normalizedAliases.forEach((a) => expanded.add(a));
  }

  for (const [placeId, aliases] of Object.entries(PLACE_ALIASES)) {
    const all = [placeId, ...aliases].map(normalizeQuery);
    if (all.some((a) => original.includes(a) || tokens.includes(a))) {
      all.forEach((a) => expanded.add(a));
      expanded.add(placeId);
    }
  }

  return {
    original,
    tokens,
    expanded: [...expanded],
    searchText: [...expanded].join(' '),
  };
}

function scoreText(haystack, needle) {
  if (!needle) return 0;
  const h = normalizeQuery(haystack);
  const n = normalizeQuery(needle);
  if (!h || !n) return 0;
  if (h === n) return 100;
  if (h.startsWith(n)) return 85;
  if (n.startsWith(h) && h.length >= 3) return 75;
  if (h.includes(n)) return 65;
  if (n.includes(h) && h.length >= 4) return 55;
  const parts = n.split(' ').filter(Boolean);
  const hit = parts.filter((p) => p.length >= 2 && h.includes(p)).length;
  if (hit === 0) return 0;
  return Math.round((hit / parts.length) * 50);
}

function pickLang(lang, obj) {
  return obj[lang] || obj.fr;
}

function formatPrice(n, lang) {
  if (!n) return '';
  return `${Number(n).toLocaleString(lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-US' : 'fr-DZ')} ${pickLang(lang, UI).perPerson}`;
}

function placeKeywords(place) {
  const base = [
    place.id, place.name, place.name_en, place.name_ar,
    place.tagline, place.tagline_en, place.region, place.region_en,
  ].filter(Boolean);
  return [...base, ...(PLACE_ALIASES[place.id] || [])];
}

function buildTaghitHotelChunk(lang) {
  const hotel = TAGHIT_PACKAGES.hotel;
  const ui = pickLang(lang, UI);
  const transport = lang === 'en' ? hotel.transport_en : lang === 'ar' ? hotel.transport_ar : hotel.transport;
  const includes = hotel.includes.map((i) => i[lang] || i.fr).join('\n• ');
  const extra = hotel.extra ? `\n• ${hotel.extra[lang] || hotel.extra.fr}` : '';

  return {
    id: 'taghit-hotel',
    keywords: [
      'taghit', 'th', 'tag', 'tgh', 'tarif', 'prix', 'px', 'offre', 'pkg', '75000', '75',
      'vol', 'av', 'avion', 'octobre', 'oct', '23', '28', 'bechar', 'béchar', 'sahara', 'sah',
      'hotel', 'hôtel', 'ht', 'erg', 'dunes', 'ksar', 'coup de coeur', 'new',
      ...THEME_SYNONYMS.voyage.slice(0, 8),
    ],
    text: `${ui.taghitTitle}\n• ${formatPrice(hotel.price, lang)}\n• ${transport}\n• ${includes}${extra}`,
    links: [{ label: ui.seeTaghit, url: '/place/taghit?pkg=hotel' }],
    scoreBoost: 18,
  };
}

function buildTaghitGuestChunk(lang) {
  const guest = TAGHIT_PACKAGES.guesthouse;
  const ui = pickLang(lang, UI);
  const transport = lang === 'en' ? guest.transport_en : lang === 'ar' ? guest.transport_ar : guest.transport;
  const includes = guest.includes.map((i) => i[lang] || i.fr).join('\n• ');

  return {
    id: 'taghit-guest',
    keywords: [
      'taghit', 'th', 'maison', 'hote', 'hôte', 'mh', 'guesthouse', '60000', '60',
      'bus', 'mercedes', 'merced', 'autocar', 'car',
    ],
    text: `${ui.taghitGuestTitle}\n• ${formatPrice(guest.price, lang)}\n• ${transport}\n• ${includes}`,
    links: [{ label: ui.seeTaghit, url: '/guesthouses' }],
    scoreBoost: 14,
  };
}

function buildPlaceChunks(lang) {
  return PLACES.filter((p) => p.id && p.name).map((place) => {
    const descKey = lang === 'en' ? 'description_en' : lang === 'ar' ? 'description_ar' : 'description';
    const nameKey = lang === 'en' ? 'name_en' : lang === 'ar' ? 'name_ar' : 'name';
    const desc = place[descKey] || place.description || '';
    const short = desc.slice(0, 280) + (desc.length > 280 ? '…' : '');
    const price = place.price ? `\n• ${formatPrice(place.price, lang)}` : '';
    const duration = place.recommendedDuration || place.duration;
    const durLine = duration ? `\n• ${duration}` : '';
    return {
      id: `place-${place.id}`,
      keywords: placeKeywords(place),
      text: `${place[nameKey] || place.name}${place.tagline ? ` — ${place.tagline}` : ''}\n${short}${price}${durLine}`,
      links: [{ label: place.name, url: `/place/${place.id}` }],
      scoreBoost: SAHARA_PLACES.has(place.id) ? 8 : 4,
    };
  });
}

function buildTourChunks(lang) {
  return FEATURED_TOURS.map((tour) => {
    const nameKey = lang === 'en' ? 'name_en' : lang === 'ar' ? 'name_ar' : 'name';
    const descKey = lang === 'en' ? 'description_en' : 'description';
    const name = tour[nameKey] || tour.name;
    const desc = tour[descKey] || tour.description || '';
    const dur = tour[lang === 'en' ? 'duration_en' : lang === 'ar' ? 'duration_ar' : 'duration'] || tour.duration;
    return {
      id: `tour-${tour.id}`,
      keywords: [
        name, tour.name, tour.name_en, tour.location, tour.placeSlug,
        'circuit', 'circuits', 'circ', 'tour', 'voyage', 'voyages', 'voy', 'sejour', 'séjour',
        'package', 'formule', 'offre', 'trip', 'travel',
        ...(tour.placeSlug ? PLACE_ALIASES[tour.placeSlug] || [] : []),
      ].filter(Boolean),
      text: `${name}\n${desc.slice(0, 240)}${desc.length > 240 ? '…' : ''}\n• ${dur || ''} · ${formatPrice(tour.price, lang)}`,
      links: [{ label: name, url: tour.placeSlug ? `/place/${tour.placeSlug}` : '/tours' }],
      scoreBoost: tour.placeSlug === 'taghit' ? 12 : 6,
    };
  });
}

function buildActivityChunks(lang) {
  return ACTIVITIES.map((act) => {
    const nameKey = lang === 'en' ? 'name_en' : lang === 'ar' ? 'name_ar' : 'name';
    const descKey = lang === 'en' ? 'desc_en' : lang === 'ar' ? 'desc_ar' : 'desc';
    const name = act[nameKey] || act.name;
    const desc = act[descKey] || act.desc || '';
    const loc = act[lang === 'en' ? 'location_en' : lang === 'ar' ? 'location_ar' : 'location'] || act.location;
    return {
      id: `activity-${act.id}`,
      keywords: [
        act.id, name, act.name, act.name_en,
        act.category, act.tags?.fr, act.tags?.en,
        loc, ...(ACTIVITY_ALIASES[act.id] || []),
        'activite', 'activité', 'act', 'excursion', 'aventure',
      ].filter(Boolean),
      text: `${name} — ${desc}\n• ${loc}${act.price ? `\n• ${formatPrice(act.price, lang)}` : ''}`,
      links: [{ label: name, url: `/activity/${act.id}` }],
      scoreBoost: 5,
    };
  });
}

function buildStaticChunks(lang) {
  const ui = pickLang(lang, UI);
  return [
    {
      id: 'catalog-voyage',
      keywords: THEME_SYNONYMS.voyage,
      text: '__CATALOG__',
      links: [],
      scoreBoost: 25,
    },
    {
      id: 'reservation',
      keywords: [...THEME_SYNONYMS.reservation, 'rdv', 'place', 'dispo'],
      text: ui.reservation,
      links: [{ label: ui.contactPage, url: '/contact' }, { label: ui.track, url: '/suivi' }],
      scoreBoost: 22,
    },
    {
      id: 'contact',
      keywords: THEME_SYNONYMS.contact,
      text: ui.contact,
      links: [{ label: ui.contactPage, url: '/contact' }, { label: ui.whatsapp, url: `https://wa.me/${WHATSAPP}` }],
      scoreBoost: 22,
    },
    {
      id: 'payment',
      keywords: [...THEME_SYNONYMS.prix, 'paypal', 'carte', 'virement', 'espece', 'espèce', 'cb'],
      text: ui.payment,
      links: [{ label: ui.contactPage, url: '/contact' }],
      scoreBoost: 20,
    },
    {
      id: 'guides',
      keywords: ['guide', 'guides', 'francais', 'français', 'langue', 'parler', 'language', 'arab', 'arabe'],
      text: ui.guides,
      links: [],
      scoreBoost: 16,
    },
    {
      id: 'season',
      keywords: ['quand', 'periode', 'période', 'moment', 'saison', 'octobre', 'oct', 'mars', 'when', 'best time', 'متى', 'climat', 'meteo', 'météo'],
      text: ui.season,
      links: [{ label: ui.seeDestinations, url: '/destinations' }],
      scoreBoost: 16,
    },
    {
      id: 'sahara-theme',
      keywords: THEME_SYNONYMS.sahara,
      text: '__SAHARA_CATALOG__',
      links: [{ label: ui.seeDestinations, url: '/destinations' }],
      scoreBoost: 20,
    },
    {
      id: 'hebergement',
      keywords: THEME_SYNONYMS.hebergement,
      text: lang === 'en'
        ? 'Stays: 4★ hotels, authentic guesthouses, full board. Taghit hotel (flight included) or guesthouse (Mercedes bus). Browse /stays and /hotels.'
        : lang === 'ar'
          ? 'إقامات: فنادق 4★، بيوت ضيافة، إقامة كاملة. تاغيت فندق (رحلة مشمولة) أو بيت ضيافة (حافلة). /stays و /hotels'
          : 'Hébergements : hôtels 4★, maisons d\'hôte authentiques, pension complète. Taghit hôtel (vol inclus) ou maison d\'hôte (bus Mercedes). Voir /stays et /hotels.',
      links: [
        { label: ui.seeStays, url: '/stays' },
        { label: ui.seeTaghit, url: '/place/taghit?pkg=hotel' },
      ],
      scoreBoost: 14,
    },
  ];
}

function buildCatalogOverview(lang) {
  const ui = pickLang(lang, UI);
  const nameKey = lang === 'en' ? 'name_en' : lang === 'ar' ? 'name_ar' : 'name';

  const saharaLines = FEATURED_TOURS.filter((t) => SAHARA_PLACES.has(t.placeSlug))
    .map((t) => `• ${t[nameKey] || t.name} — ${formatPrice(t.price, lang)}`);

  const northPlaces = PLACES.filter((p) => NORTH_PLACES.has(p.id))
    .map((p) => `• ${p[nameKey] || p.name}${p.tagline ? ` (${p.tagline})` : ''}`);

  const heritagePlaces = PLACES.filter((p) => HERITAGE_PLACES.has(p.id))
    .map((p) => `• ${p[nameKey] || p.name}`);

  const activityLines = ACTIVITIES.map((a) => {
    const n = a[lang === 'en' ? 'name_en' : lang === 'ar' ? 'name_ar' : 'name'] || a.name;
    return `• ${n}${a.price ? ` — ${formatPrice(a.price, lang)}` : ''}`;
  });

  const hotel = TAGHIT_PACKAGES.hotel;
  const guest = TAGHIT_PACKAGES.guesthouse;

  return {
    reply: [
      ui.catalogTitle,
      '',
      `★ ${ui.taghitTitle} — ${formatPrice(hotel.price, lang)}`,
      lang === 'en' ? hotel.transport_en : hotel.transport,
      '',
      `— ${ui.catalogSahara} —`,
      ...saharaLines,
      `• ${ui.taghitGuestTitle} — ${formatPrice(guest.price, lang)}`,
      '',
      `— ${ui.catalogNorth} —`,
      ...northPlaces.slice(0, 6),
      '',
      `— ${ui.catalogHeritage} —`,
      ...heritagePlaces.slice(0, 5),
      '',
      `— ${ui.catalogActivities} —`,
      ...activityLines.slice(0, 8),
      '',
      ui.catalogHint,
    ].join('\n'),
    links: [
      { label: ui.seeTours, url: '/tours' },
      { label: ui.seeDestinations, url: '/destinations' },
      { label: ui.seeTaghit, url: '/place/taghit?pkg=hotel' },
      { label: ui.seeActivities, url: '/activities' },
    ],
    suggestions: getSuggestions(lang),
  };
}

function buildSaharaOverview(lang) {
  const ui = pickLang(lang, UI);
  const nameKey = lang === 'en' ? 'name_en' : lang === 'ar' ? 'name_ar' : 'name';

  const lines = PLACES.filter((p) => SAHARA_PLACES.has(p.id)).map((p) => {
    const price = p.price ? ` — ${formatPrice(p.price, lang)}` : '';
    return `• ${p[nameKey] || p.name}${price}`;
  });

  const tours = FEATURED_TOURS.filter((t) => SAHARA_PLACES.has(t.placeSlug))
    .map((t) => `• ${t[nameKey] || t.name} — ${formatPrice(t.price, lang)}`);

  return {
    reply: [
      ui.catalogSahara,
      '',
      ...lines,
      '',
      lang === 'en' ? 'Packages:' : lang === 'ar' ? 'الباقات:' : 'Formules :',
      ...tours,
      `• ${ui.taghitGuestTitle} — ${formatPrice(TAGHIT_PACKAGES.guesthouse.price, lang)}`,
      '',
      ui.catalogHint,
    ].join('\n'),
    links: [
      { label: ui.seeTaghit, url: '/place/taghit?pkg=hotel' },
      { label: ui.seeDestinations, url: '/destinations' },
    ],
    suggestions: getSuggestions(lang),
  };
}

let cachedChunks = null;

function getAllChunks(lang) {
  if (!cachedChunks) cachedChunks = {};
  if (cachedChunks[lang]) return cachedChunks[lang];

  cachedChunks[lang] = [
    buildTaghitHotelChunk(lang),
    buildTaghitGuestChunk(lang),
    ...buildStaticChunks(lang),
    ...buildTourChunks(lang),
    ...buildPlaceChunks(lang),
    ...buildActivityChunks(lang),
  ];
  return cachedChunks[lang];
}

function scoreChunk(queryExp, chunk) {
  const isBroadChunk = chunk.id === 'sahara-theme' || chunk.id === 'catalog-voyage';
  const probes = isBroadChunk
    ? [queryExp.original, ...userTokens(queryExp)]
    : [queryExp.original, queryExp.searchText, ...queryExp.expanded];
  let best = 0;

  for (const probe of probes) {
    best = Math.max(best, scoreText(chunk.text, probe));
    for (const kw of chunk.keywords) {
      best = Math.max(best, scoreText(kw, probe), scoreText(probe, kw));
    }
  }

  for (const token of queryExp.tokens) {
    if (token.length < 2) continue;
    if (chunk.id === `activity-${token}`) best += 40;
    if (chunk.id === `place-${token}`) best += 35;
    if (chunk.id === `tour-${token}`) best += 30;
    for (const kw of chunk.keywords) {
      if (normalizeQuery(kw) === token || normalizeQuery(kw).startsWith(token)) {
        best = Math.max(best, 70);
      }
    }
  }

  return best + (chunk.scoreBoost || 0);
}

function searchKnowledge(query, lang = 'fr') {
  const queryExp = expandQuery(query);
  const chunks = getAllChunks(lang);
  const scored = chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(queryExp, chunk) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  return { hits: scored.slice(0, 5), queryExp };
}

function userTokens(queryExp) {
  const tokens = new Set(queryExp.tokens);
  for (const token of queryExp.tokens) {
    if (ABBREVIATIONS[token]) {
      ABBREVIATIONS[token].forEach((t) => tokens.add(normalizeQuery(t)));
    }
  }
  return tokens;
}

function hasSpecificDestination(queryExp) {
  const specific = new Set([
    ...Object.keys(PLACE_ALIASES),
    ...Object.keys(ACTIVITY_ALIASES),
  ]);
  if (queryExp.tokens.some((t) => specific.has(t))) return true;
  return [...userTokens(queryExp)].some((t) => specific.has(t));
}

function isBroadCatalogQuery(queryExp) {
  const voyageTerms = new Set(THEME_SYNONYMS.voyage.map(normalizeQuery));
  const user = userTokens(queryExp);
  const hasVoyage = [...user].some((t) => voyageTerms.has(t));
  const broadOnly = queryExp.tokens.every(
    (t) => voyageTerms.has(t) || t === 'tt' || t === 'all' || t === 'liste' || t.length <= 2
  );
  return hasVoyage && (broadOnly || !hasSpecificDestination(queryExp));
}

function isBroadSaharaQuery(queryExp) {
  const sahTerms = new Set(THEME_SYNONYMS.sahara.map(normalizeQuery));
  const user = userTokens(queryExp);
  const userAskedSah = [...user].some((t) => sahTerms.has(t));
  return userAskedSah && !hasSpecificDestination(queryExp);
}

function buildCatalogAppendix(lang = 'fr') {
  const hotel = TAGHIT_PACKAGES.hotel;
  const guest = TAGHIT_PACKAGES.guesthouse;

  const placesSummary = PLACES.map((p) => `- ${p.name}: ${(p.description || '').slice(0, 100)}…`).join('\n');
  const toursSummary = FEATURED_TOURS.map((t) => `- ${t.name}: ${t.price?.toLocaleString()} DA — ${t.duration || ''}`).join('\n');
  const actSummary = ACTIVITIES.map((a) => `- ${a.name}: ${a.desc?.slice(0, 80)}`).join('\n');

  return `
TAGHIT HÔTEL: ${hotel.price} DA/pers, ${hotel.transport}, vol 23-28 oct.
TAGHIT MAISON D'HÔTE: ${guest.price} DA/pers, ${guest.transport}.

FAQ: ${FAQ[lang]?.map((f) => `${f.q} → ${f.a}`).join(' | ')}

DESTINATIONS:
${placesSummary}

CIRCUITS:
${toursSummary}

ACTIVITÉS:
${actSummary}

CONTACT: WhatsApp +${WHATSAPP}, ${EMAILS.join(', ')}. Réservation: fiches ou /contact. Suivi: /suivi.
`.trim();
}

function buildContextForAI(lang = 'fr', session = {}) {
  const recap = buildRecap(session, lang);
  const appendix = buildCatalogAppendix(lang) + (recap ? `\n\nCONTEXTE CLIENT ACTUEL:\n${recap}` : '');
  return buildSystemPrompt(lang, appendix);
}

function getWelcome(lang) {
  return pickLang(lang, UI).greeting;
}

function matchesAny(query, terms) {
  const n = normalizeQuery(query);
  return terms.some((t) => {
    const term = normalizeQuery(t);
    if (!term) return false;
    if (term.length <= 3) {
      const re = new RegExp(`(^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|\\s)`);
      return re.test(n) || n === term;
    }
    return n.includes(term);
  });
}

function combineHits(hits, lang) {
  const ui = pickLang(lang, UI);
  const unique = [];
  const seen = new Set();

  for (const hit of hits) {
    if (hit.text.startsWith('__')) continue;
    if (seen.has(hit.id)) continue;
    seen.add(hit.id);
    unique.push(hit);
    if (unique.length >= 3) break;
  }

  if (unique.length === 0) return null;

  const reply = unique.map((h) => h.text).join('\n\n—\n\n');
  const links = [];
  const linkUrls = new Set();
  for (const h of unique) {
    for (const l of h.links || []) {
      if (!linkUrls.has(l.url)) {
        linkUrls.add(l.url);
        links.push(l);
      }
    }
  }

  if (links.length < 4) {
    if (!linkUrls.has('/tours')) links.push({ label: ui.seeTours, url: '/tours' });
    if (!linkUrls.has('/destinations')) links.push({ label: ui.seeDestinations, url: '/destinations' });
  }

  return { reply, links: links.slice(0, 6), suggestions: getSuggestions(lang) };
}

function generateLocalReply(message, lang = 'fr', session = {}) {
  const { tryContextualReply } = require('./chatContextual');
  const contextual = tryContextualReply(message, lang, session);
  if (contextual) {
    return {
      reply: contextual.reply,
      suggestions: contextual.suggestions,
      links: contextual.links,
      session: contextual.session,
    };
  }

  const { entities } = extractEntities(message);
  const mergedSession = mergeSession(session, entities);

  const ui = pickLang(lang, UI);
  const queryExp = expandQuery(message);
  const q = queryExp.original;

  if (!q || q.length < 1) {
    return { reply: ui.greeting, suggestions: getSuggestions(lang), links: [], session: mergedSession };
  }

  if (matchesAny(q, ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'cc', 'bjr', 'bsr', 'slm', 'salam', 'مرحب', 'السلام', 'ahlan', 'marhaba'])) {
    return { reply: ui.greeting, suggestions: getSuggestions(lang), links: [{ label: ui.seeTours, url: '/tours' }], session: mergedSession };
  }

  if (matchesAny(q, ['merci', 'thanks', 'thank you', 'thx', 'mrc', 'ok', 'okk', 'oki', 'dac', 'dacc', 'daccord', 'شكر'])) {
    const thanks = {
      fr: 'Avec plaisir ! Demandez « voyage », « Taghit », « réserver » ou une destination pour en savoir plus.',
      en: 'You\'re welcome! Try « trip », « Taghit », « book » or any destination for more info.',
      ar: 'على الرحب والسعة! جرّب « رحلة »، « تاغيت »، « حجز » أو أي وجهة.',
    };
    return { reply: thanks[lang] || thanks.fr, suggestions: getSuggestions(lang), links: [], session: mergedSession };
  }

  if (isBroadCatalogQuery(queryExp)) {
    const cat = buildCatalogOverview(lang);
    return { ...cat, session: mergedSession };
  }

  if (isBroadSaharaQuery(queryExp)) {
    const sah = buildSaharaOverview(lang);
    return { ...sah, session: mergedSession };
  }

  const { hits: rawHits } = searchKnowledge(message, lang);
  let hits = rawHits;

  const user = userTokens(queryExp);
  const hasPrice = [...user].some((t) => t === 'px' || t === 'comb' || t === 'prix' || t === 'tarif');
  if (hasPrice && hasSpecificDestination(queryExp)) {
    hits = hits.filter((h) => h.id !== 'payment');
  }

  if (hits.length > 0) {
    const top = hits[0];

    if (top.id === 'catalog-voyage' || top.text === '__CATALOG__') {
      const cat = buildCatalogOverview(lang);
      return { ...cat, session: mergedSession };
    }
    if (top.id === 'sahara-theme' || top.text === '__SAHARA_CATALOG__') {
      const sah = buildSaharaOverview(lang);
      return { ...sah, session: mergedSession };
    }

    if (top.score >= 22) {
      const combined = combineHits(hits.filter((h) => h.score >= top.score - 15), lang);
      if (combined) return { ...combined, session: mergedSession };
    }
  }

  if (hits.length > 0 && hits[0].score >= 18) {
    const top = hits[0];
    return {
      reply: top.text,
      suggestions: getSuggestions(lang),
      links: top.links || [],
      session: mergedSession,
    };
  }

  return {
    reply: ui.fallback,
    suggestions: getSuggestions(lang),
    links: [
      { label: ui.whatsapp, url: `https://wa.me/${WHATSAPP}` },
      { label: ui.contactPage, url: '/contact' },
      { label: ui.seeTours, url: '/tours' },
    ],
    session: mergedSession,
  };
}

module.exports = {
  normalizeQuery,
  expandQuery,
  searchKnowledge,
  buildContextForAI,
  getWelcome,
  getSuggestions,
  generateLocalReply,
  buildCatalogOverview,
  buildSaharaOverview,
  WHATSAPP,
};
