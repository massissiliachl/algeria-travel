/** Source unique — formules Taghit (hôtel + maison d’hôte). Pas de doublons ailleurs. */

exports.TAGHIT_PLACE = {
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
  recommendedDuration: '2 à 3 jours',
  recommendedDuration_en: '2 to 3 days',
  recommendedDuration_ar: 'يومان إلى 3 أيام',
  difficulty: 'Facile à modérée',
  difficulty_en: 'Easy to moderate',
  difficulty_ar: 'سهل إلى متوسط',
  audience: 'En couple, famille, amis',
  audience_en: 'Couples, families, friends',
  audience_ar: 'أزواج، عائلات، أصدقاء',
  image: '/images/taghit.jpeg',
  gallery: ['/images/taghit.jpeg', '/images/sahara5.jpeg', '/images/sahara1.jpeg'],
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

exports.TAGHIT_PACKAGES = {
  hotel: {
    id: 'hotel',
    price: 99990,
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
    duration: 'Pension complète',
    duration_en: 'Full board',
    duration_ar: 'إقامة كاملة',
    includes: [
      { fr: 'Pension complète', en: 'Full board', ar: 'إقامة كاملة' },
      {
        fr: 'Activités : 4×4, ski sur sable, dromadaire, visite des ksars incluse',
        en: 'Activities: 4×4, sand skiing, camel, ksar visits included',
        ar: 'أنشطة: دفع رباعي، تزلج على الرمال، جمل، زيارة القصور مشمولة',
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
      { icon: 'Plane', fr: 'Vol inclus', en: 'Flight included', ar: 'رحلة مشمولة' },
      { icon: 'Car', fr: '4×4 & dunes', en: '4×4 & dunes', ar: 'دفع رباعي' },
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
};

exports.getTaghitPackage = (pkgId) => {
  if (pkgId === 'guesthouse') return TAGHIT_PACKAGES.guesthouse;
  return TAGHIT_PACKAGES.hotel;
};

/** Fusion lieu + formule pour /place/taghit */
exports.resolveTaghitPlace = (pkgId = 'hotel') => {
  const pkg = getTaghitPackage(pkgId);
  return {
    ...TAGHIT_PLACE,
    price: pkg.price,
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
    includes: pkg.extra ? [...pkg.includes, pkg.extra] : pkg.includes,
    highlights: pkg.highlights,
    activePkg: pkg.id,
  };
};

exports.getTaghitPackage = (pkgId) => pkgId === 'guesthouse' ? exports.TAGHIT_PACKAGES.guesthouse : exports.TAGHIT_PACKAGES.hotel;
exports.resolveTaghitPlace = (pkgId = 'hotel') => {
  const pkg = exports.getTaghitPackage(pkgId);
  return {
    ...exports.TAGHIT_PLACE,
    price: pkg.price,
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
    includes: pkg.extra ? [...pkg.includes, pkg.extra] : pkg.includes,
    badge: pkg.badge,
    badge_en: pkg.badge_en,
    badge_ar: pkg.badge_ar,
  };
};
