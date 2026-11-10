/** Source unique — formules Taghit (hôtel + maison d’hôte). Pas de doublons ailleurs. */

const TAGHIT_PLACE = {
  id: 'taghit',
  name: 'Taghit',
  name_en: 'Taghit',
  name_ar: 'تاغيت',
  tagline: 'Joyau du Grand Erg',
  tagline_en: 'Jewel of the Grand Erg',
  tagline_ar: 'جوهرة العرق الكبير',
  rating: 4.9,
  reviews: 142,
  temp: '26°C',
  weather: 'Ensoleillé',
  weather_en: 'Sunny',
  weather_ar: 'مشمس',
  idealFor: 'Détente & Aventure',
  idealFor_en: 'Relaxation & Adventure',
  idealFor_ar: 'استرخاء ومغامرة',
  region: 'Béchar, Algérie',
  region_en: 'Béchar, Algeria',
  region_ar: 'بشار، الجزائر',
  recommendedDuration: '4 ou 5 jours',
  recommendedDuration_en: '4 or 5 days',
  recommendedDuration_ar: '4 أو 5 أيام',
  difficulty: 'Facile à modérée',
  difficulty_en: 'Easy to moderate',
  difficulty_ar: 'سهل إلى متوسط',
  audience: 'En couple, famille, amis',
  audience_en: 'Couples, families, friends',
  audience_ar: 'أزواج، عائلات، أصدقاء',
  image: '../public/images/taghit.jpeg',
  gallery: ['../public/images/taghit.jpeg', '../public/images/sahara5.jpeg', '../public/images/sahara1.jpeg'],
  description:
    'Entre palmeraies, dunes dorées et patrimoine local, Taghit offre une expérience saharienne unique : ksar millénaire, sources naturelles et couchers de soleil inoubliables au pied du Grand Erg.',
  description_en:
    'Between palm groves, golden dunes and local heritage, Taghit offers a unique Saharan experience: ancient ksar, natural springs and unforgettable sunsets at the foot of the Grand Erg.',
  description_ar:
    'بين واحات النخيل والكثبان الذهبية والتراث المحلي، تقدم تاغيت تجربة صحراوية فريدة: قصر قديم وينابيع طبيعية وغروب لا يُنسى عند سفح العرق الكبير.',
  bestTime: 'Octobre – Mars',
  bestTime_en: 'October – March',
  bestTime_ar: 'أكتوبر – مارس',
  whyVisit: [
    { icon: 'TreePalm', fr: 'Palmeraie et sources naturelles', en: 'Palm grove and natural springs', ar: 'واحة نخيل وينابيع طبيعية' },
    { icon: 'Sunrise', fr: 'Portes du désert du Grand Erg', en: 'Gateway to the Grand Erg desert', ar: 'بوابة صحراء العرق الكبير' },
    { icon: 'Mountain', fr: 'Randonnées et paysages époustouflants', en: 'Hikes and breathtaking landscapes', ar: 'تنزه ومناظر خلابة' },
    { icon: 'Heart', fr: 'Hospitalité et culture locale authentique', en: 'Hospitality and authentic local culture', ar: 'ضيافة وثقافة محلية أصيلة' },
  ],
};

/** Départs communs hôtel + avion (mêmes dates flyer) */
export const TAGHIT_DEPARTURES = [
  { start: '2026-11-16', end: '2026-11-20', fr: 'Du 16 au 20 novembre', en: '16–20 November', ar: 'من 16 إلى 20 نوفمبر' },
  { start: '2026-11-23', end: '2026-11-27', fr: 'Du 23 au 27 novembre', en: '23–27 November', ar: 'من 23 إلى 27 نوفمبر' },
  { start: '2026-12-01', end: '2026-12-04', fr: 'Du 1er au 4 décembre', en: '1–4 December', ar: 'من 1 إلى 4 ديسمبر' },
  { start: '2026-12-08', end: '2026-12-11', fr: 'Du 8 au 11 décembre', en: '8–11 December', ar: 'من 8 إلى 11 ديسمبر' },
  { start: '2026-12-15', end: '2026-12-18', fr: 'Du 15 au 18 décembre', en: '15–18 December', ar: 'من 15 إلى 18 ديسمبر' },
  { start: '2026-12-22', end: '2026-12-25', fr: 'Du 22 au 25 décembre', en: '22–25 December', ar: 'من 22 إلى 25 ديسمبر' },
  { start: '2026-12-29', end: '2027-01-03', fr: 'Du 29 décembre au 3 janvier 2027', en: '29 December – 3 January 2027', ar: 'من 29 ديسمبر إلى 3 يناير 2027' },
];

const TAGHIT_DATES_FR =
  '7 départs : 16–20 nov. · 23–27 nov. · 1–4 · 8–11 · 15–18 · 22–25 déc. · 29 déc.–3 janv.';
const TAGHIT_DATES_EN =
  '7 departures: 16–20 Nov · 23–27 Nov · 1–4 · 8–11 · 15–18 · 22–25 Dec · 29 Dec–3 Jan';
const TAGHIT_DATES_AR =
  '7 رحلات: 16–20 نوفمبر · 23–27 نوفمبر · 1–4 · 8–11 · 15–18 · 22–25 ديسمبر · 29 ديسمبر–3 يناير';

export const TAGHIT_PACKAGES = {
  hotel: {
    id: 'hotel',
    /** Formule longue par défaut ; la courte reste à 99 990 DA */
    price: 130000,
    icon: 'Hotel',
    title: 'Hôtel 4 étoiles',
    title_en: '4-star hotel',
    title_ar: 'فندق 4 نجوم',
    stay: 'Hôtel 4 étoiles · pension complète',
    stay_en: '4-star hotel · full board',
    stay_ar: 'فندق 4 نجوم · إقامة كاملة',
    transport: 'Vol Alger – Béchar – Alger + navette aéroport',
    transport_en: 'Algiers – Béchar – Algiers flight + airport shuttle',
    transport_ar: 'رحلة الجزائر – بشار – الجزائر + نقل المطار',
    duration: '4 j / 3 n ou 5 j / 4 n',
    duration_en: '4 d / 3 n or 5 d / 4 n',
    duration_ar: '4 أيام / 3 ليالٍ أو 5 أيام / 4 ليالٍ',
    dates: TAGHIT_DATES_FR,
    dates_en: TAGHIT_DATES_EN,
    dates_ar: TAGHIT_DATES_AR,
    departures: TAGHIT_DEPARTURES,
    priceTiers: [
      { fr: '5 jours / 4 nuits', en: '5 days / 4 nights', ar: '5 أيام / 4 ليالٍ', price: 130000 },
      { fr: '4 jours / 3 nuits', en: '4 days / 3 nights', ar: '4 أيام / 3 ليالٍ', price: 99990 },
    ],
    priceFrom: 99990,
    includes: [
      {
        fr: '5 jours / 4 nuits · 130 000 DA · ou 4 jours / 3 nuits · 99 990 DA',
        en: '5 days / 4 nights · 130,000 DZD · or 4 days / 3 nights · 99,990 DZD',
        ar: '5 أيام / 4 ليالٍ · 130000 دج · أو 4 أيام / 3 ليالٍ · 99990 دج',
      },
      {
        fr: 'Pension complète · activités 4×4, ski sur sable, dromadaire, ksars',
        en: 'Full board · 4×4, sand skiing, camel, ksar visits',
        ar: 'إقامة كاملة · دفع رباعي، تزلج، جمل، قصور',
      },
      {
        fr: 'Transport navette aéroport',
        en: 'Airport shuttle transfer',
        ar: 'نقل المطار بالمكوك',
      },
      {
        fr: 'Billet d’avion Alger – Béchar – Alger',
        en: 'Flight ticket Algiers – Béchar – Algiers',
        ar: 'تذكرة طيران الجزائر – بشار – الجزائر',
      },
    ],
    extra: { fr: 'Extras : buggy et quad', en: 'Extras: buggy and quad', ar: 'إضافات: باغي وكواد' },
    highlights: [
      { icon: 'Hotel', fr: 'Hôtel 4★', en: '4★ hotel', ar: 'فندق 4★' },
      { icon: 'Calendar', fr: '7 départs nov.–janv.', en: '7 departures Nov–Jan', ar: '7 رحلات نوفمبر–يناير' },
      { icon: 'Tag', fr: '5 j / 4 n · 130 000 · 4 j / 3 n · 99 990 DA', en: '5 d / 4 n · 130,000 · 4 d / 3 n · 99,990 DZD', ar: '5 أيام / 4 ليالٍ · 130000 · 4 أيام / 3 ليالٍ · 99990 دج' },
    ],
    path: '/place/taghit?pkg=hotel',
  },
  guesthouse: {
    id: 'guesthouse',
    price: 60000,
    icon: 'House',
    title: 'Maison d’hôte authentique',
    title_en: 'Authentic guesthouse',
    title_ar: 'بيت ضيافة أصيل',
    stay: 'Maison d’hôte authentique · pension complète',
    stay_en: 'Authentic guesthouse · full board',
    stay_ar: 'بيت ضيافة أصيل · إقامة كاملة',
    transport: 'Bus Mercedes Alger – Taghit – Alger',
    transport_en: 'Mercedes bus Algiers – Taghit – Algiers',
    transport_ar: 'حافلة مرسيدس الجزائر – تاغيت – الجزائر',
    duration: 'Pension complète',
    duration_en: 'Full board',
    duration_ar: 'إقامة كاملة',
    includes: [
      { fr: 'Pension complète', en: 'Full board', ar: 'إقامة كاملة' },
      {
        fr: 'Activités : 4×4, snowboard sur sable, dromadaire, visite des ksars, qaada en pleine dune, déjeuner ou dîner en palmeraie',
        en: 'Activities: 4×4, sand snowboarding, camel, ksar visits, dune qaada, palm grove lunch or dinner',
        ar: 'أنشطة: دفع رباعي، تزلج على الرمال، جمل، زيارة القصور، قعدة في الكثبان، غداء أو عشاء في الواحة',
      },
      {
        fr: 'Bus Mercedes confortable Alger – Taghit – Alger',
        en: 'Comfortable Mercedes bus Algiers – Taghit – Algiers',
        ar: 'حافلة مرسيدس مريحة الجزائر – تاغيت – الجزائر',
      },
      { fr: 'Assistance 24h/24', en: '24/7 assistance', ar: 'مساعدة على مدار الساعة' },
    ],
    extra: null,
    highlights: [
      { icon: 'House', fr: 'Maison d’hôte', en: 'Guesthouse', ar: 'بيت ضيافة' },
      { icon: 'Car', fr: 'Bus Mercedes', en: 'Mercedes bus', ar: 'حافلة مرسيدس' },
      { icon: 'ShieldCheck', fr: 'Assistance 24h/24', en: '24/7 assistance', ar: 'مساعدة 24/7' },
    ],
    path: '/guesthouses',
  },
  /** 2ᵉ offre Taghit — séjour via Brezina (flyer) */
  brezina: {
    id: 'brezina',
    price: null,
    priceOnRequest: true,
    icon: 'Tent',
    title: 'Taghit via Brezina',
    title_en: 'Taghit via Brezina',
    title_ar: 'تاغيت عبر بريزينا',
    stay: '1 nuit bivouac Brezina + 3 nuits maison d’hôte · pension complète',
    stay_en: '1 night Brezina bivouac + 3 nights guesthouse · full board',
    stay_ar: 'ليلة تخييم بريزينا + 3 ليالٍ بيت ضيافة · إقامة كاملة',
    transport: 'Van Mercedes VIP',
    transport_en: 'Mercedes VIP van',
    transport_ar: 'فان مرسيدس VIP',
    duration: '5 jours / 4 nuits',
    duration_en: '5 days / 4 nights',
    duration_ar: '5 أيام / 4 ليالٍ',
    dates: 'Du 16 au 21 novembre',
    dates_en: '16–21 November',
    dates_ar: 'من 16 إلى 21 نوفمبر',
    tagline: 'Aventure · Découverte · Authenticité',
    tagline_en: 'Adventure · Discovery · Authenticity',
    tagline_ar: 'مغامرة · اكتشاف · أصالة',
    image: '../public/images/taghit-brezina.png',
    whatsapp: '33619501708',
    includes: [
      {
        fr: '1 nuit en bivouac à Brezina (tentes & matériel fournis)',
        en: '1 night Brezina bivouac (tents & gear provided)',
        ar: 'ليلة تخييم في بريزينا (خيام ومعدات متوفرة)',
      },
      {
        fr: '3 nuits en maison d’hôte traditionnelle',
        en: '3 nights in a traditional guesthouse',
        ar: '3 ليالٍ في بيت ضيافة تقليدي',
      },
      {
        fr: 'Van Mercedes VIP + pension complète',
        en: 'Mercedes VIP van + full board',
        ar: 'فان مرسيدس VIP + إقامة كاملة',
      },
      {
        fr: 'Safari 4×4, thé & qaada · kayak · dromadaire · peintures rupestres · soirée musicale',
        en: '4×4 safari, tea & qaada · kayak · camel · rock art · musical evening',
        ar: 'سفاري 4×4، شاي وقعدة · كاياك · جمل · رسوم صخرية · سهرة موسيقية',
      },
      {
        fr: 'Visite ancienne caserne & ksars · guides francophones et locaux',
        en: 'Old barracks & ksars visit · French-speaking & local guides',
        ar: 'زيارة ثكنة قديمة والقصور · مرشدون ناطقون بالفرنسية ومحليون',
      },
    ],
    extra: {
      fr: 'Ambiance familiale, conviviale et authentique',
      en: 'Family-friendly, warm and authentic atmosphere',
      ar: 'أجواء عائلية ودية وأصيلة',
    },
    highlights: [
      { icon: 'Tent', fr: 'Bivouac Brezina', en: 'Brezina bivouac', ar: 'تخييم بريزينا' },
      { icon: 'Car', fr: 'Van Mercedes VIP', en: 'Mercedes VIP van', ar: 'فان مرسيدس VIP' },
      { icon: 'Calendar', fr: '16–21 nov.', en: '16–21 Nov', ar: '16–21 نوفمبر' },
    ],
    path: '/place/taghit?pkg=brezina',
  },
  /** 3ᵉ offre Taghit — séjour 5 j / 4 n par avion (flyer + offre −20 %) */
  avion: {
    id: 'avion',
    /** Flyer : +10 ans = 100 000 DA (pas 75 000) · 2–10 = 75 000 · −2 = 40 000 */
    price: 100000,
    priceTiers: [
      { fr: '+ 10 ans', en: 'Over 10', ar: 'أكثر من 10 سنوات', price: 100000 },
      { fr: 'De 2 à 10 ans', en: '2 to 10 years', ar: 'من 2 إلى 10 سنوات', price: 75000 },
      { fr: '- 2 ans', en: 'Under 2', ar: 'أقل من سنتين', price: 40000 },
    ],
    /** −5 000 DA / pers. dès 3 personnes (adulte → 95 000 DA) */
    groupDiscount: { from: 3, amount: 5000 },
    /** Affiche le badge Offre −20 % sur la fiche */
    offerPercent: 20,
    icon: 'Plane',
    title: 'Séjour Taghit par avion',
    title_en: 'Taghit stay by plane',
    title_ar: 'إقامة تاغيت بالطائرة',
    stay: 'Hébergement 4 nuits · pension complète',
    stay_en: '4 nights accommodation · full board',
    stay_ar: 'إقامة 4 ليالٍ · إقامة كاملة',
    transport: 'Vol aller-retour + transport sur place inclus',
    transport_en: 'Round-trip flight + local transport included',
    transport_ar: 'رحلة ذهاب وإياب + النقل المحلي مشمول',
    duration: '5 jours / 4 nuits',
    duration_en: '5 days / 4 nights',
    duration_ar: '5 أيام / 4 ليالٍ',
    dates: TAGHIT_DATES_FR,
    dates_en: TAGHIT_DATES_EN,
    dates_ar: TAGHIT_DATES_AR,
    departures: TAGHIT_DEPARTURES,
    tagline: 'Évasion au cœur du Sahara · Offre −20 %',
    tagline_en: 'Escape to the Algerian Sahara · −20% offer',
    tagline_ar: 'رحلة إلى قلب الصحراء · عرض −20٪',
    image: '../public/images/taghit.jpeg',
    gallery: ['../public/images/taghit-avion-departs.png', '../public/images/taghit-avion.png'],
    whatsapp: '33619501708',
    itinerary: [
      {
        day: 1,
        title: 'Arrivée & premières découvertes',
        title_en: 'Arrival & first discoveries',
        steps: [
          ['Arrivée dans la journée à Taghit', 'Arrival in Taghit during the day'],
          ['Check-in et prise de repères', 'Check-in and getting your bearings'],
          ['Ascension de la grande dune de Taghit', 'Climb of the great dune of Taghit'],
          ['Qaâda traditionnelle autour d’un thé', 'Traditional qaada over tea'],
          ['Ski sur sable', 'Sand skiing'],
          ['Dîner traditionnel chez l’habitant', 'Traditional dinner with a local host'],
        ],
      },
      {
        day: 2,
        title: 'Patrimoine, lac & traditions',
        title_en: 'Heritage, lake & traditions',
        steps: [
          ['Petit-déjeuner', 'Breakfast'],
          ['Visite des peintures et gravures rupestres', 'Rock paintings and engravings'],
          ['Déjeuner en pleine palmeraie', 'Lunch in the palm grove'],
          ['Activité kayak et visite du lac', 'Kayak and lake visit'],
          ['Balade à dos de dromadaire', 'Camel ride'],
          ['Dîner et soirée musicale locale', 'Dinner and local music evening'],
        ],
      },
      {
        day: 3,
        title: 'Histoire, ksar & dunes',
        title_en: 'History, ksar & dunes',
        steps: [
          ['Visite du Djebel Baroun et de l’ancienne caserne coloniale', 'Djebel Baroun and the old colonial barracks'],
          ['Déjeuner et détente en pleine palmeraie', 'Lunch and relaxation in the palm grove'],
          ['Visite du ksar de Taghit et de ses ruelles étroites', 'Taghit ksar and its narrow alleys'],
          ['Sortie 4×4 dans les dunes au coucher du soleil', '4×4 dune outing at sunset'],
          ['Dîner surprise', 'Surprise dinner'],
        ],
      },
      {
        day: 4,
        title: 'Souk, détente & bivouac',
        title_en: 'Souk, downtime & bivouac',
        steps: [
          ['Visite du souk : artisanat et produits locaux', 'Souk visit: crafts and local products'],
          ['Après-midi détente : piscine / sauna', 'Afternoon downtime: pool / sauna'],
          ['Départ pour un camping dans les dunes', 'Departure for camping in the dunes'],
          ['Dîner traditionnel et musique autour du feu', 'Traditional dinner and music around the campfire'],
        ],
      },
      {
        day: 5,
        title: 'Souvenirs & retour',
        title_en: 'Souvenirs & return',
        steps: [
          ['Petit-déjeuner', 'Breakfast'],
          ['Quartier libre pour l’achat de souvenirs (au choix)', 'Free time for souvenir shopping (optional)'],
          ['Retour, fin du séjour (5 jours / 4 nuits)', 'Return, end of the stay (5 days / 4 nights)'],
        ],
      },
    ],
    includes: [
      {
        fr: '5 jours / 4 nuits · hébergement et pension complète',
        en: '5 days / 4 nights · accommodation and full board',
        ar: '5 أيام / 4 ليالٍ · إقامة كاملة',
      },
      {
        fr: 'Vol aller-retour et transport sur place inclus',
        en: 'Round-trip flight and local transport included',
        ar: 'رحلة ذهاب وإياب والنقل المحلي مشمول',
      },
      {
        fr: 'Activités : kayak, 4×4 dans les dunes, dromadaire, ski sur sable',
        en: 'Activities: kayak, 4×4 in the dunes, camel ride, sand skiing',
        ar: 'أنشطة: كاياك، دفع رباعي في الكثبان، جمل، تزلج على الرمال',
      },
      {
        fr: 'Peintures rupestres, ksar de Taghit, Djebel Baroun, soirée musicale',
        en: 'Rock art, Taghit ksar, Djebel Baroun, music evening',
        ar: 'رسوم صخرية، قصر تاغيت، جبل بارون، سهرة موسيقية',
      },
    ],
    extra: {
      fr: 'Tarifs : 100 000 DA (+ 10 ans) · 75 000 DA (2 à 10 ans) · 40 000 DA (− 2 ans). Offre −20 %. Réduction 5 000 DA / pers. dès 3 personnes.',
      en: 'Rates: 100,000 DZD (over 10) · 75,000 DZD (2–10) · 40,000 DZD (under 2). −20% offer. 5,000 DZD off per person from 3 people.',
      ar: 'الأسعار: 100000 دج (+10) · 75000 دج (2–10) · 40000 دج (−2). عرض −20٪. خصم 5000 دج للفرد من 3 أشخاص.',
    },
    highlights: [
      { icon: 'Plane', fr: 'Vol inclus', en: 'Flight included', ar: 'رحلة مشمولة' },
      { icon: 'Calendar', fr: '5 j / 4 n · 7 départs', en: '5 d / 4 n · 7 departures', ar: '5 أيام / 4 ليالٍ · 7 رحلات' },
      { icon: 'BadgePercent', fr: 'Offre −20 % · −5 000 dès 3 pers.', en: 'Offer −20% · −5,000 from 3 people', ar: 'عرض −20٪ · −5000 من 3 أشخاص' },
    ],
    path: '/place/taghit?pkg=avion',
  },
};

/** Formules proposées sur la fiche Taghit (Brezina retiré du catalogue tant qu’il n’est pas republie en admin) */
export const TAGHIT_PLACE_PKGS = ['hotel', 'avion'];

/** Paliers âge (+10 / 2–10 / −2) — ne pas les coller en une seule ligne de prix */
export const isAgePriceTiers = (tiers) =>
  Array.isArray(tiers) &&
  tiers.length === 3 &&
  /ans|years|سنوات|Over|Under/i.test(`${tiers[0]?.fr || ''} ${tiers[0]?.en || ''} ${tiers[0]?.ar || ''}`);

/** Affichage public des tarifs durée (ex. hôtel 130 000 · 99 990 DA) — ignore les paliers âge */
export const formatPriceTiersLabel = (tiers) => {
  if (!Array.isArray(tiers) || tiers.length < 2 || isAgePriceTiers(tiers)) return '';
  const prices = tiers.map((tier) => Number(tier.price) || 0).filter((n) => n > 0);
  if (prices.length < 2) return '';
  return `${prices.map((n) => n.toLocaleString('fr-DZ')).join(' · ')} DA`;
};

const getTaghitPackage = (pkgId) => TAGHIT_PACKAGES[pkgId] || TAGHIT_PACKAGES.hotel;

/** Fusion lieu + formule pour /place/taghit */
export const resolveTaghitPlace = (pkgId = 'hotel') => {
  const pkg = getTaghitPackage(pkgId);
  return {
    ...TAGHIT_PLACE,
    ...(pkg.image
      ? { image: pkg.image, gallery: [...new Set([pkg.image, ...(pkg.gallery || []), ...TAGHIT_PLACE.gallery])] }
      : {}),
    price: pkg.price,
    oldPrice: pkg.oldPrice || null,
    priceFrom: pkg.priceFrom != null ? pkg.priceFrom : null,
    priceOnRequest: Boolean(pkg.priceOnRequest),
    pricePerPerson: true,
    pkgTitle: pkg.title,
    pkgTitle_en: pkg.title_en,
    pkgTitle_ar: pkg.title_ar,
    pkgIcon: pkg.icon,
    stay: pkg.stay,
    stay_en: pkg.stay_en,
    stay_ar: pkg.stay_ar,
    transport: pkg.transport,
    transport_en: pkg.transport_en,
    transport_ar: pkg.transport_ar,
    duration: pkg.duration,
    duration_en: pkg.duration_en,
    duration_ar: pkg.duration_ar,
    /* La durée recommandée suit la formule (plus « 2 à 3 jours » générique) */
    recommendedDuration: pkg.duration || TAGHIT_PLACE.recommendedDuration,
    recommendedDuration_en: pkg.duration_en || TAGHIT_PLACE.recommendedDuration_en,
    recommendedDuration_ar: pkg.duration_ar || TAGHIT_PLACE.recommendedDuration_ar,
    dates: pkg.dates || null,
    dates_en: pkg.dates_en || null,
    dates_ar: pkg.dates_ar || null,
    whatsapp: pkg.whatsapp || null,
    includes: pkg.extra ? [...pkg.includes, pkg.extra] : pkg.includes,
    highlights: pkg.highlights,
    ...(pkg.itinerary ? { itinerary: pkg.itinerary } : {}),
    priceTiers: pkg.priceTiers || null,
    groupDiscount: pkg.groupDiscount || null,
    offerPercent: pkg.offerPercent || null,
    departures: pkg.departures || null,
    activePkg: pkg.id,
  };
};
