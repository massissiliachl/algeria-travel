/** Destinations accueil — fiches détaillées + réservation */

import '../core/siteContent.js';
import { asset } from '../core/dom.js';
import { resolveTaghitPlace } from './taghitPackages.js';

export const PLACES = [
  {
    id: 'bejaia',
    name: 'Béjaïa',
    name_en: 'Bejaia',
    name_ar: 'بجاية',
    tagline: 'Perle de la Kabylie',
    tagline_en: 'Pearl of Kabylie',
    tagline_ar: 'لؤلؤة القبائل',
    rating: 4.9,
    reviews: 268,
    temp: '22°C',
    image: '../public/images/bejaia.jpeg',
    gallery: ['../public/images/bejaia.jpeg', '../public/images/home/news-coast.jpg', '../public/images/kayak.jpeg'],
    description:
      'Mer turquoise, Cap Carbon et montagnes du Djurdjura : Béjaïa offre mer et nature dans un même séjour.',
    description_en:
      'Turquoise sea, Cap Carbon and Djurdjura mountains: Béjaïa offers sea and nature in one trip.',
    description_ar:
      'بحر فيروزي وكاب كاربون وجبال جرجرة: بجاية تجمع البحر والطبيعة في إقامة واحدة.',
    bestTime: 'Mai – Octobre',
    bestTime_en: 'May – October',
    bestTime_ar: 'ماي – أكتوبر',
    duration: '3 à 4 jours',
    duration_en: '3 to 4 days',
    duration_ar: '3 إلى 4 أيام',
    price: 25000,
    oldPrice: 30000,
    stay: 'Hôtel Royal Béjaïa',
    stay_en: 'Royal Bejaia Hotel',
    stay_ar: 'فندق رويال بجاية',
    transport: 'Route depuis Alger ou vol + véhicule',
    transport_en: 'Road from Algiers or flight + vehicle',
    transport_ar: 'طريق من الجزائر أو طيران + سيارة',
    includes: [
      { fr: 'Hébergement 2–3 nuits', en: '2–3 nights stay', ar: 'إقامة 2–3 ليالٍ' },
      { fr: 'Excursion Cap Carbon', en: 'Cap Carbon outing', ar: 'رحلة كاب كاربون' },
      { fr: 'Repas traditionnels', en: 'Traditional meals', ar: 'وجبات تقليدية' },
      { fr: 'Transferts locaux', en: 'Local transfers', ar: 'تنقلات محلية' },
    ],
    highlights: [
      { icon: 'Waves', fr: 'Plages & criques', en: 'Beaches & coves', ar: 'شواطئ وخلجان' },
      { icon: 'Mountain', fr: 'Randonnées', en: 'Hiking', ar: 'تنزه' },
      { icon: 'Fish', fr: 'Poissons grillés', en: 'Grilled fish', ar: 'سمك مشوي' },
    ],
  },
  {
    id: 'djanet',
    name: 'Djanet',
    name_en: 'Djanet',
    name_ar: 'جانت',
    tagline: 'Porte du Tassili',
    tagline_en: 'Gateway to Tassili',
    tagline_ar: 'بوابة تاسيلي',
    rating: 4.9,
    reviews: 198,
    temp: '28°C',
    image: '../public/images/djanet.jpeg',
    gallery: ['../public/images/djanet.jpeg', '../public/images/sahara1.jpeg', '../public/images/sahara3.jpeg'],
    description:
      'Porte d’entrée du Tassili n’Ajjer : art rupestre, dunes et bivouacs sous les étoiles avec guides touaregs.',
    description_en:
      'Gateway to Tassili n’Ajjer: rock art, dunes and starlit bivouacs with Tuareg guides.',
    description_ar:
      'بوابة تاسيلي ناجر: فن صخري وكثبان ومبيت تحت النجوم مع مرشدين طوارق.',
    bestTime: 'Novembre – Février',
    bestTime_en: 'November – February',
    bestTime_ar: 'نوفمبر – فبراير',
    duration: '6 à 8 jours',
    duration_en: '6 to 8 days',
    duration_ar: '6 إلى 8 أيام',
    price: 85000,
    oldPrice: 95000,
    stay: 'Campement saharien / bivouac premium',
    stay_en: 'Saharan camp / premium bivouac',
    stay_ar: 'مخيم صحراوي / مبيت فاخر',
    transport: 'Vol vers Djanet + 4×4 guidé',
    transport_en: 'Flight to Djanet + guided 4×4',
    transport_ar: 'رحلة إلى جانت + دفع رباعي مرشد',
    includes: [
      { fr: 'Vols internes (selon formule)', en: 'Domestic flights (package)', ar: 'رحلات داخلية (حسب الباقة)' },
      { fr: 'Circuit 4×4 & trek', en: '4×4 & trek circuit', ar: 'جولة دفع رباعي ومشي' },
      { fr: 'Bivouacs & repas', en: 'Bivouacs & meals', ar: 'مبيت ووجبات' },
      { fr: 'Guide touareg', en: 'Tuareg guide', ar: 'مرشد طوارقي' },
    ],
    highlights: [
      { icon: 'Palette', fr: 'Art rupestre', en: 'Rock art', ar: 'فن صخري' },
      { icon: 'Tent', fr: 'Nuits sous les étoiles', en: 'Nights under stars', ar: 'ليالٍ تحت النجوم' },
      { icon: 'Sun', fr: 'Dunes Tin Merzouga', en: 'Tin Merzouga dunes', ar: 'كثبان تين مرزوقة' },
    ],
  },
  {
    id: 'tadrart',
    name: 'Tadrart Rouge',
    name_en: 'Tadrart Rouge',
    name_ar: 'تادرارت الحمراء',
    tagline: 'Circuit Djanet · 6 jours et 6 nuits en bivouac',
    tagline_en: 'Djanet circuit · 6 days & 6 nights bivouac',
    tagline_ar: 'رحلة جانت · 6 أيام و6 ليالٍ في المخيم',
    region: 'Tadrart Rouge, Djanet',
    region_en: 'Tadrart Rouge, Djanet',
    region_ar: 'تادرارت الحمراء، جانت',
    rating: 4.9,
    reviews: 198,
    temp: '22°C',
    weather: 'Journées douces, nuits fraîches',
    weather_en: 'Mild days, cool nights',
    weather_ar: 'نهار معتدل وليالٍ باردة',
    image: '../public/images/tadrart-djanet.png',
    gallery: ['../public/images/tadrart-djanet.png', '../public/images/djanet.jpeg'],
    description:
      'Entre falaises de grès rouge, arches naturelles et dunes aux teintes changeantes, cette région offre une immersion désertique inoubliable. Découvrez des peintures et gravures préhistoriques de plus de 12 000 ans, témoins des anciens habitants et de la faune du Sahara. Un monde de silence et de beauté brute, où les horizons semblent infinis. Explorez la fascinante Tadrart Rouge, au sud-est de Djanet.',
    description_en:
      'Between red sandstone cliffs, natural arches and dunes of ever-changing hues, this region offers an unforgettable desert immersion. Discover prehistoric paintings and engravings more than 12,000 years old, witnesses of the Sahara’s ancient inhabitants and wildlife. A world of silence and raw beauty, where horizons seem endless. Explore the fascinating Tadrart Rouge, south-east of Djanet.',
    description_ar:
      'بين منحدرات الحجر الرملي الأحمر والأقواس الطبيعية والكثبان متغيرة الألوان، تمنحكم هذه المنطقة انغماساً صحراوياً لا يُنسى. اكتشفوا رسوماً ونقوشاً ما قبل التاريخ يزيد عمرها عن 12000 سنة، شاهدة على سكان الصحراء القدامى وحيواناتها. عالم من الصمت والجمال الخام حيث تبدو الآفاق بلا نهاية. استكشفوا تادرارت الحمراء الساحرة جنوب شرق جانت.',
    overview: {
      title: 'Aperçu de l’aventure à Tadrart',
      title_en: 'The Tadrart adventure at a glance',
      text: [
        'Partez à la découverte de la Tadrart Rouge, joyau du désert algérien et prolongement du Tassili n’Ajjer.',
        'Entre dunes dorées, arches rocheuses et art rupestre millénaire, chaque étape est une merveille.',
        'En 4×4 avec des guides locaux, vivez une aventure unique mêlant nature, culture et histoire.',
      ],
      text_en: [
        'Set off to discover the Tadrart Rouge, jewel of the Algerian desert and extension of the Tassili n’Ajjer.',
        'Between golden dunes, rock arches and ancient rock art, every stage is a marvel.',
        'By 4×4 with local guides, live a unique adventure blending nature, culture and history.',
      ],
    },
    stories: [
      {
        icon: 'MapPin',
        eyebrow: 'Djanet',
        eyebrow_en: 'Djanet',
        title: 'Partez à la découverte de Djanet',
        title_en: 'Set off to discover Djanet',
        text: 'Au cœur du Tassili n’Ajjer, Djanet vous ouvre les portes d’un Sahara vivant : dunes sculptées par le vent, arches de grès, art rupestre millénaire, cuisine touarègue et bivouacs sous les étoiles. Avec nos guides locaux, chaque étape mêle nature, culture et authenticité.',
        text_en: 'In the heart of the Tassili n’Ajjer, Djanet opens the doors to a living Sahara: wind-sculpted dunes, sandstone arches, ancient rock art, Tuareg cuisine and bivouacs under the stars. With our local guides, every stage blends nature, culture and authenticity.',
      },
      {
        icon: 'Landmark',
        eyebrow: 'Tassili n’Ajjer',
        eyebrow_en: 'Tassili n’Ajjer',
        title: 'Plongée au cœur du grand désert algérien',
        title_en: 'Deep into the great Algerian desert',
        text: 'Immense et mystérieux, le Tassili n’Ajjer est bien plus qu’un désert : c’est un véritable musée à ciel ouvert. Classé au patrimoine mondial de l’UNESCO, il abrite un trésor inestimable d’art rupestre préhistorique, d’anciens sentiers caravaniers et de paysages sculptés par des millénaires de vent et de sable.',
        text_en: 'Vast and mysterious, the Tassili n’Ajjer is far more than a desert: it is a true open-air museum. A UNESCO World Heritage site, it holds a priceless treasure of prehistoric rock art, ancient caravan trails and landscapes shaped by millennia of wind and sand.',
      },
    ],
    facts: [
      { icon: 'MapPin', label: 'Destination', label_en: 'Destination', value: 'Djanet', value_en: 'Djanet' },
      { icon: 'Compass', label: 'Circuit', label_en: 'Circuit', value: 'Tadrart Rouge', value_en: 'Tadrart Rouge' },
      { icon: 'Clock', label: 'Durée', label_en: 'Duration', value: '6 jours', value_en: '6 days' },
      { icon: 'Mountain', label: 'Type', label_en: 'Type', value: 'Circuit désert / aventure', value_en: 'Desert / adventure circuit' },
      { icon: 'Car', label: 'Transport', label_en: 'Transport', value: '4×4 tout-terrain', value_en: 'All-terrain 4×4' },
      { icon: 'Tent', label: 'Hébergement', label_en: 'Accommodation', value: 'Bivouac ou lodges selon le programme', value_en: 'Bivouac or lodges depending on the programme' },
      { icon: 'UtensilsCrossed', label: 'Repas', label_en: 'Meals', value: 'Pension complète', value_en: 'Full board' },
      { icon: 'Users', label: 'Guide', label_en: 'Guide', value: 'Guides locaux / guides touaregs expérimentés', value_en: 'Experienced local / Tuareg guides' },
      { icon: 'Sun', label: 'Environnement', label_en: 'Environment', value: 'Désert du Sahara / Tassili n’Ajjer / Tadrart Rouge', value_en: 'Sahara desert / Tassili n’Ajjer / Tadrart Rouge' },
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrivée & transfert',
        title_en: 'Arrival & transfer',
        steps: [
          ['Accueil par l’équipe locale', 'Welcome by the local team'],
          ['Transfert vers le bivouac', 'Transfer to the bivouac'],
          ['Petit déjeuner et visite du marché pour acheter un chèche', 'Breakfast and market visit to buy a chèche (desert scarf)'],
          ['Départ en 4×4 vers Tadrart', 'Departure by 4×4 towards Tadrart'],
          ['Déjeuner en route', 'Lunch on the way'],
          ['Dîner et bivouac à Oued El Beridj', 'Dinner and bivouac at Oued El Beridj'],
        ],
      },
      {
        day: 2,
        title: 'Exploration de Oued El Beridj',
        title_en: 'Exploring Oued El Beridj',
        steps: [
          ['Petit déjeuner', 'Breakfast'],
          ['Exploration de la région', 'Exploring the area'],
          ['Déjeuner', 'Lunch'],
          ['Départ vers Moul N Aga', 'Departure towards Moul N Aga'],
          ['Dîner et bivouac', 'Dinner and bivouac'],
        ],
      },
      {
        day: 3,
        title: 'Tin Merzouga & coucher du soleil',
        title_en: 'Tin Merzouga & sunset',
        steps: [
          ['Départ via Tamezguida', 'Departure via Tamezguida'],
          ['Passage par In Djaren', 'Via In Djaren'],
          ['Passage par Ouan Zaouatene', 'Via Ouan Zaouatene'],
          ['Déjeuner sur le chemin', 'Lunch on the way'],
          ['Arrivée à Tin Merzouga', 'Arrival at Tin Merzouga'],
          ['Coucher du soleil sur la dune', 'Sunset on the dune'],
          ['Dîner et bivouac', 'Dinner and bivouac'],
        ],
      },
      {
        day: 4,
        title: 'Erg Tin Merzouga & Idoukal',
        title_en: 'Tin Merzouga erg & Idoukal',
        steps: [
          ['Petit déjeuner', 'Breakfast'],
          ['Exploration matinale', 'Morning exploration'],
          ['Déjeuner à Idoukal', 'Lunch at Idoukal'],
          ['Dîner et bivouac', 'Dinner and bivouac'],
        ],
      },
      {
        day: 5,
        title: 'Canyon d’In Djaren',
        title_en: 'In Djaren canyon',
        steps: [
          ['Petit déjeuner', 'Breakfast'],
          ['Départ vers Ouan n’Aguen', 'Departure towards Ouan n’Aguen'],
          ['Découverte du Canyon d’In Djaren après le déjeuner', 'Discovery of the In Djaren canyon after lunch'],
          ['Dîner et bivouac à Tissetteka', 'Dinner and bivouac at Tissetteka'],
        ],
      },
      {
        day: 6,
        title: 'Tassili d’Imaharatene & retour',
        title_en: 'Tassili of Imaharatene & return',
        steps: [
          ['Petit déjeuner', 'Breakfast'],
          ['Traversée du Tassili d’Imaharatene', 'Crossing the Tassili of Imaharatene'],
          ['Découverte de Tegharghart (« La vache qui pleure »)', 'Discovery of Tegharghart (“The weeping cow”)'],
          ['Déjeuner', 'Lunch'],
          ['Visite de Djanet', 'Visit of Djanet'],
          ['Visite du marché artisanal', 'Visit of the craft market'],
          ['Dîner', 'Dinner'],
          ['Transfert à l’aéroport', 'Airport transfer'],
        ],
      },
    ],
    itineraryNote: 'L’itinéraire peut être adapté selon les conditions météorologiques ou locales.',
    itineraryNote_en: 'The itinerary may be adapted depending on weather or local conditions.',
    cuisine: {
      breakfast: 'Pour bien commencer la journée, nous proposons un petit-déjeuner simple et complet :',
      breakfast_en: 'To start the day well, we offer a simple and complete breakfast:',
      breakfastItems: [
        ['Pain', 'Bread'],
        ['Miel ou confiture', 'Honey or jam'],
        ['Café', 'Coffee'],
        ['Lait', 'Milk'],
        ['Beurre', 'Butter'],
        ['Fromage à tartiner', 'Cheese spread'],
      ],
      meals: 'Préparés avec passion par nos cuisiniers touaregs, les repas sont variés et généreux, mêlant spécialités locales et cuisine saharienne. Chaque plat reflète l’authenticité et la convivialité du désert.',
      meals_en: 'Lovingly prepared by our Tuareg cooks, meals are varied and generous, blending local specialities and Saharan cuisine. Every dish reflects the authenticity and warmth of the desert.',
      bonus: 'Lors de votre passage au souk de Djanet, ne manquez pas de goûter la Maynama, une douceur traditionnelle très appréciée des habitants.',
      bonus_en: 'When you visit the Djanet souk, don’t miss tasting Maynama, a traditional sweet much loved by locals.',
    },
    faq: [
      {
        q: 'Comment se passent les nuits ?',
        q_en: 'What are the nights like?',
        a: 'Vous dormez en bivouac sous tente, dans un cadre unique, au cœur du désert saharien.',
        a_en: 'You sleep in a tented bivouac, in a unique setting in the heart of the Sahara desert.',
      },
      {
        q: 'Dois-je apporter un sac de couchage ?',
        q_en: 'Should I bring a sleeping bag?',
        a: 'Oui. Le matelas et les couvertures sont fournis, mais il est recommandé d’apporter votre sac de couchage pour plus de confort.',
        a_en: 'Yes. Mattresses and blankets are provided, but we recommend bringing your own sleeping bag for extra comfort.',
      },
      {
        q: 'Quelle est la taille des groupes ?',
        q_en: 'How big are the groups?',
        a: 'Les départs se font en petits groupes afin de garantir confort, sécurité et convivialité.',
        a_en: 'Departures are in small groups to ensure comfort, safety and a friendly atmosphere.',
      },
      {
        q: 'Quels vêtements prévoir ?',
        q_en: 'What clothes should I pack?',
        a: 'Des habits légers pour la journée et plus chauds pour le soir (pull ou polaire). N’oubliez pas : casquette/chapeau, crème solaire et lunettes de soleil.',
        a_en: 'Light clothes for the day and warmer ones for the evening (sweater or fleece). Don’t forget: cap/hat, sunscreen and sunglasses.',
      },
      {
        q: 'Comment sont organisés les repas ?',
        q_en: 'How are meals organised?',
        a: 'Nos cuisiniers touaregs préparent chaque jour des repas variés et généreux. Vous aurez aussi l’occasion de goûter à des spécialités locales.',
        a_en: 'Our Tuareg cooks prepare varied and generous meals every day. You will also get to taste local specialities.',
      },
      {
        q: 'Qu’en est-il de la sécurité ?',
        q_en: 'What about safety?',
        a: 'Le circuit est encadré par des guides touaregs expérimentés, exclusivement dans des zones sécurisées.',
        a_en: 'The circuit is led by experienced Tuareg guides, exclusively in secure areas.',
      },
      {
        q: 'Puis-je utiliser mon téléphone et avoir Internet ?',
        q_en: 'Can I use my phone and get Internet?',
        a: 'La couverture réseau est limitée. Certaines zones ne disposent pas d’Internet.',
        a_en: 'Network coverage is limited. Some areas have no Internet.',
      },
      {
        q: 'Et pour les sanitaires ?',
        q_en: 'What about toilets?',
        a: 'Comme dans la plupart des expéditions en pleine nature, la toilette se fait dans l’environnement.',
        a_en: 'As on most wilderness expeditions, toilets are in the open environment.',
      },
    ],
    faqNote: 'Rappel : merci de ne laisser aucune trace et de respecter la nature.',
    faqNote_en: 'Reminder: please leave no trace and respect nature.',
    checklist: [
      ['Sac de couchage chaud (n’est pas fourni)', 'Warm sleeping bag (not provided)'],
      ['Lampe frontale + piles de rechange', 'Headlamp + spare batteries'],
      ['Chaussures de marche confortables', 'Comfortable walking shoes'],
      ['Vêtements adaptés aux écarts de température (journée chaude, nuit fraîche)', 'Clothes for temperature swings (hot days, cool nights)'],
      ['Chapeau / foulard / lunettes de soleil', 'Hat / scarf / sunglasses'],
      ['Crème solaire + baume à lèvres', 'Sunscreen + lip balm'],
      ['Petite pharmacie personnelle (médicaments, pansements, etc.)', 'Small personal first-aid kit (medication, plasters, etc.)'],
      ['Gourde ou bouteille réutilisable', 'Water bottle or reusable flask'],
      ['Produits d’hygiène biodégradables (savon, lingettes, etc.)', 'Biodegradable toiletries (soap, wipes, etc.)'],
      ['Appareil photo (avec batteries / cartes mémoire supplémentaires)', 'Camera (with spare batteries / memory cards)'],
      ['Un petit sac à dos pour les excursions quotidiennes', 'A small backpack for daily outings'],
    ],
    whyUs: [
      { icon: 'Users', fr: 'Guides touaregs expérimentés', en: 'Experienced Tuareg guides' },
      { icon: 'ShieldCheck', fr: 'Groupes limités', en: 'Small groups' },
      { icon: 'UtensilsCrossed', fr: 'Cuisine locale fraîche, sur feu', en: 'Fresh local cuisine, cooked over fire' },
      { icon: 'Compass', fr: 'Sites majeurs + spots cachés', en: 'Major sites + hidden spots' },
      { icon: 'Headphones', fr: 'Encadrement et assistance sur place', en: 'On-site supervision and assistance' },
      { icon: 'Music2', fr: 'Soirées musicales autour du feu', en: 'Musical evenings around the fire' },
    ],
    includesTitleKey: 'place_includes_offer',
    dates: 'Du 17 au 24 décembre 2026',
    dates_en: '17–24 December 2026',
    dates_ar: 'من 17 إلى 24 ديسمبر 2026',
    bestTime: 'Du 17 au 24 décembre 2026',
    bestTime_en: '17–24 December 2026',
    bestTime_ar: 'من 17 إلى 24 ديسمبر 2026',
    duration: '6 jours / 6 nuits',
    duration_en: '6 days / 6 nights',
    duration_ar: '6 أيام / 6 ليالٍ',
    difficulty: 'Modérée (bivouac, pistes en 4×4)',
    difficulty_en: 'Moderate (bivouac, 4×4 tracks)',
    difficulty_ar: 'متوسطة (مخيم، مسالك بالدفع الرباعي)',
    audience: 'Amateurs d’aventure, amis, familles',
    audience_en: 'Adventure lovers, friends, families',
    audience_ar: 'محبو المغامرة، أصدقاء، عائلات',
    price: 94990,
    pricePerPerson: true,
    pkgTitle: 'Circuit 6 jours / 6 nuits en bivouac',
    pkgTitle_en: '6-day / 6-night bivouac circuit',
    pkgTitle_ar: 'رحلة 6 أيام / 6 ليالٍ في المخيم',
    pkgIcon: 'Tent',
    whatsapp: '213557664089',
    stay: 'Bivouac ou lodge selon le programme · pension complète',
    stay_en: 'Bivouac or lodge depending on the programme · full board',
    stay_ar: 'مخيم أو نُزل حسب البرنامج · إقامة كاملة',
    transport: 'Vols Alger – Djanet – Alger inclus + 4×4 pendant tout le séjour',
    transport_en: 'Algiers – Djanet – Algiers flights included + 4×4 throughout',
    transport_ar: 'تذاكر طيران الجزائر – جانت – الجزائر مشمولة + دفع رباعي طوال الإقامة',
    includes: [
      { fr: 'Billets d’avion Alger – Djanet – Alger inclus', en: 'Algiers – Djanet – Algiers plane tickets included', ar: 'تذاكر الطيران الجزائر – جانت – الجزائر مشمولة' },
      { fr: 'Billets et transferts pour vos excursions', en: 'Tickets and transfers for your excursions', ar: 'التذاكر والتنقلات لرحلاتكم' },
      { fr: 'Transport en 4×4 tout-terrain pour vos aventures dans le désert', en: 'All-terrain 4×4 transport for your desert adventures', ar: 'التنقل بسيارات الدفع الرباعي لمغامراتكم في الصحراء' },
      { fr: 'Hébergement en bivouac ou lodges selon le programme', en: 'Bivouac or lodge accommodation depending on the programme', ar: 'الإقامة في مخيم أو نُزل حسب البرنامج' },
      { fr: 'Pension complète avec cuisine locale préparée sur place', en: 'Full board with local cuisine cooked on site', ar: 'إقامة كاملة مع مطبخ محلي يُحضَّر في المكان' },
      { fr: 'Guides locaux expérimentés pour chaque sortie', en: 'Experienced local guides for every outing', ar: 'مرشدون محليون ذوو خبرة لكل خرجة' },
      { fr: 'Découverte de sites naturels, culturels et historiques', en: 'Discovery of natural, cultural and historic sites', ar: 'اكتشاف مواقع طبيعية وثقافية وتاريخية' },
      { fr: 'Activités et animations authentiques pour toute la famille', en: 'Authentic activities and entertainment for the whole family', ar: 'أنشطة وتنشيط أصيل لكل العائلة' },
      { fr: 'Souvenirs inoubliables et moments de partage uniques', en: 'Unforgettable memories and unique shared moments', ar: 'ذكريات لا تُنسى ولحظات مشاركة فريدة' },
    ],
    highlights: [
      { icon: 'Mountain', fr: 'Falaises de grès rouge et arches naturelles', en: 'Red sandstone cliffs and natural arches', ar: 'منحدرات الحجر الرملي الأحمر والأقواس الطبيعية' },
      { icon: 'Palette', fr: 'Peintures et gravures de plus de 12 000 ans', en: 'Paintings and engravings over 12,000 years old', ar: 'رسوم ونقوش يزيد عمرها عن 12000 سنة' },
      { icon: 'Sunset', fr: 'Coucher du soleil sur les dunes de Tin Merzouga', en: 'Sunset on the Tin Merzouga dunes', ar: 'الغروب على كثبان تين مرزوقة' },
      { icon: 'Tent', fr: 'Bivouacs sous les étoiles', en: 'Bivouacs under the stars', ar: 'مخيمات تحت النجوم' },
      { icon: 'Car', fr: 'En 4×4 avec des guides locaux', en: 'By 4×4 with local guides', ar: 'بالدفع الرباعي مع مرشدين محليين' },
    ],
  },
  {
    id: 'ghardaia',
    name: 'Ghardaïa',
    name_en: 'Ghardaia',
    name_ar: 'غرداية',
    tagline: 'Vallée du M’Zab',
    tagline_en: 'M’Zab Valley',
    tagline_ar: 'وادي مزاب',
    rating: 4.8,
    reviews: 245,
    temp: '26°C',
    image: '../public/images/ghardaia.jpeg',
    gallery: ['../public/images/ghardaia.jpeg', '../public/images/sahara5.jpeg', '../public/images/maison-hote-sud-1.png'],
    description:
      'Cinq cités fortifiées du M’Zab, marchés et architecture mozabite : un joyau UNESCO au cœur du désert.',
    description_en:
      'Five fortified M’Zab cities, markets and Mozabite architecture: a UNESCO jewel in the desert.',
    description_ar:
      'خمس مدن مزاب المحصّنة وأسواق وعمارة ميزابية: جوهرة يونسكو في قلب الصحراء.',
    bestTime: 'Octobre – Mars',
    bestTime_en: 'October – March',
    bestTime_ar: 'أكتوبر – مارس',
    duration: '3 à 4 jours',
    duration_en: '3 to 4 days',
    duration_ar: '3 إلى 4 أيام',
    price: 35000,
    oldPrice: 42000,
    stay: 'Maison d’hôtes traditionnelle mozabite',
    stay_en: 'Traditional Mozabite guest house',
    stay_ar: 'بيت ضيافة ميزابي تقليدي',
    transport: 'Vol ou bus + transferts locaux',
    transport_en: 'Flight or bus + local transfers',
    transport_ar: 'طيران أو حافلة + تنقلات محلية',
    includes: [
      { fr: 'Hébergement 3 nuits', en: '3 nights stay', ar: 'إقامة 3 ليالٍ' },
      { fr: 'Visite des ksour', en: 'Ksour visits', ar: 'زيارة القصور' },
      { fr: 'Guide local', en: 'Local guide', ar: 'مرشد محلي' },
      { fr: 'Dégustation produits locaux', en: 'Local tasting', ar: 'تذوق منتجات محلية' },
    ],
    highlights: [
      { icon: 'Building2', fr: 'Architecture M’Zab', en: 'M’Zab architecture', ar: 'عمارة مزاب' },
      { icon: 'ShoppingBag', fr: 'Marchés colorés', en: 'Colourful markets', ar: 'أسواق ملونة' },
      { icon: 'Users', fr: 'Hospitalité mozabite', en: 'Mozabite hospitality', ar: 'ضيافة ميزابية' },
    ],
  },
  {
    id: 'hoggar',
    name: 'Hoggar',
    name_en: 'Hoggar',
    name_ar: 'الهقار',
    tagline: 'Montagnes du Sahara',
    tagline_en: 'Sahara mountains',
    tagline_ar: 'جبال الصحراء',
    rating: 5.0,
    reviews: 167,
    temp: '24°C',
    image: '../public/images/hogar.jpeg',
    gallery: ['../public/images/hogar.jpeg', '../public/images/sahara2.jpeg', '../public/images/sahara7.jpeg'],
    description:
      'Massif volcanique autour de Tamanrasset. Lever de soleil à Assekrem, silence absolu et hospitalité touareg.',
    description_en:
      'Volcanic massif around Tamanrasset. Sunrise at Assekrem, absolute silence and Tuareg hospitality.',
    description_ar:
      'كتلة بركانية حول تمنراست. شروق أسكرام وصمت مطلق وضيافة طوارق.',
    bestTime: 'Novembre – Février',
    bestTime_en: 'November – February',
    bestTime_ar: 'نوفمبر – فبراير',
    duration: '7 à 9 jours',
    duration_en: '7 to 9 days',
    duration_ar: '7 إلى 9 أيام',
    price: 95000,
    oldPrice: 105000,
    stay: 'Campements & nuits en auberge à Tamanrasset',
    stay_en: 'Camps & guesthouse nights in Tamanrasset',
    stay_ar: 'مخيمات وليالٍ في نزل بتمنراست',
    transport: 'Vol vers Tamanrasset + 4×4',
    transport_en: 'Flight to Tamanrasset + 4×4',
    transport_ar: 'رحلة إلى تمنراست + دفع رباعي',
    includes: [
      { fr: 'Circuit Assekrem', en: 'Assekrem circuit', ar: 'جولة أسكرام' },
      { fr: 'Hébergement mixte', en: 'Mixed accommodation', ar: 'إقامة متنوعة' },
      { fr: 'Repas sahariens', en: 'Saharan meals', ar: 'وجبات صحراوية' },
      { fr: 'Équipe locale', en: 'Local team', ar: 'فريق محلي' },
    ],
    highlights: [
      { icon: 'Sunrise', fr: 'Assekrem', en: 'Assekrem', ar: 'أسكرام' },
      { icon: 'Mountain', fr: 'Paysages volcaniques', en: 'Volcanic landscapes', ar: 'مناظر بركانية' },
      { icon: 'Tent', fr: 'Immersion touareg', en: 'Tuareg immersion', ar: 'انغماس طوارقي' },
    ],
  },
  /** Défaut = formule Hôtel 4★ (99 990 DA). Maison d’hôte → /guesthouses */
  resolveTaghitPlace('hotel'),
  {
    id: 'timimoun',
    name: 'Timimoun',
    name_en: 'Timimoun',
    name_ar: 'تيميمون',
    tagline: 'Perle rouge du Sahara',
    tagline_en: 'Red pearl of the Sahara',
    tagline_ar: 'لؤلؤة الصحراء الحمراء',
    rating: 4.9,
    reviews: 234,
    temp: '30°C',
    image: '../public/images/sahara1.jpeg',
    gallery: ['../public/images/sahara1.jpeg', '../public/images/sahara2.jpeg', '../public/images/sahara3.jpeg'],
    description:
      'Dunes rouges du Grand Erg Occidental, ksour ocre et couchers de soleil magiques au cœur du Gourara.',
    description_en:
      'Red dunes of the Grand Western Erg, ochre ksour and magical sunsets in the heart of Gourara.',
    description_ar:
      'كثبان حمراء من العرق الغربي الكبير وقصور حمراء وغروب ساحر في قلب القورارة.',
    bestTime: 'Octobre – Avril',
    bestTime_en: 'October – April',
    bestTime_ar: 'أكتوبر – أبريل',
    duration: '5 jours',
    duration_en: '5 days',
    duration_ar: '5 أيام',
    price: 45000,
    oldPrice: 55000,
    stay: 'Maison d’hôtes & campement saharien',
    stay_en: 'Guest house & Saharan camp',
    stay_ar: 'بيت ضيافة ومخيم صحراوي',
    transport: 'Vol vers Timimoun + 4×4',
    transport_en: 'Flight to Timimoun + 4×4',
    transport_ar: 'رحلة إلى تيميمون + دفع رباعي',
    includes: [
      { fr: 'Hébergement 4 nuits', en: '4 nights accommodation', ar: 'إقامة 4 ليالٍ' },
      { fr: 'Excursion dunes & ksour', en: 'Dunes & ksour excursion', ar: 'رحلة الكثبان والقصور' },
      { fr: 'Repas traditionnels', en: 'Traditional meals', ar: 'وجبات تقليدية' },
      { fr: 'Guide local', en: 'Local guide', ar: 'مرشد محلي' },
    ],
    highlights: [
      { icon: 'Sun', fr: 'Dunes rouges', en: 'Red dunes', ar: 'كثبان حمراء' },
      { icon: 'Landmark', fr: 'Ksour traditionnels', en: 'Traditional ksour', ar: 'قصور تقليدية' },
      { icon: 'Sunset', fr: 'Couchers de soleil', en: 'Sunsets', ar: 'غروب الشمس' },
    ],
  },
  {
    id: 'constantine',
    name: 'Constantine',
    name_en: 'Constantine',
    name_ar: 'قسنطينة',
    tagline: 'Ville des ponts suspendus',
    tagline_en: 'City of suspended bridges',
    tagline_ar: 'مدينة الجسور المعلقة',
    rating: 4.7,
    reviews: 145,
    temp: '20°C',
    image: '../public/images/alger.jpeg',
    gallery: ['../public/images/alger.jpeg', '../public/images/home/dest-alger.jpg'],
    description:
      'Perchée sur son rocher, Constantine fascine par ses ponts, son palais Ahmed Bey et son histoire millénaire.',
    description_en:
      'Perched on its rock, Constantine fascinates with its bridges, Ahmed Bey palace and millennia of history.',
    description_ar:
      'تتربع قسنطينة على صخرتها وتبهر بجسورها وقصر أحمد باي وتاريخها العريق.',
    bestTime: 'Mars – Juin / Sept – Nov',
    bestTime_en: 'March – June / Sept – Nov',
    bestTime_ar: 'مارس – يونيو / سبتمبر – نوفمبر',
    duration: '3 jours',
    duration_en: '3 days',
    duration_ar: '3 أيام',
    price: 22000,
    oldPrice: 28000,
    stay: 'Hôtel centre-ville',
    stay_en: 'Downtown hotel',
    stay_ar: 'فندق وسط المدينة',
    transport: 'Vol ou train + transferts locaux',
    transport_en: 'Flight or train + local transfers',
    transport_ar: 'طيران أو قطار + تنقلات محلية',
    includes: [
      { fr: 'Hébergement 2 nuits', en: '2 nights stay', ar: 'إقامة ليلتين' },
      { fr: 'Visite des ponts', en: 'Bridges tour', ar: 'جولة الجسور' },
      { fr: 'Palais Ahmed Bey', en: 'Ahmed Bey palace', ar: 'قصر أحمد باي' },
      { fr: 'Guide francophone', en: 'French-speaking guide', ar: 'مرشد ناطق بالفرنسية' },
    ],
    highlights: [
      { icon: 'Route', fr: 'Ponts suspendus', en: 'Suspended bridges', ar: 'جسور معلقة' },
      { icon: 'Landmark', fr: 'Palais Ahmed Bey', en: 'Ahmed Bey palace', ar: 'قصر أحمد باي' },
      { icon: 'Building2', fr: 'Médina & musées', en: 'Medina & museums', ar: 'مدينة قديمة ومتاحف' },
    ],
  },
];

const readAdminDestinations = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('at_destinations');
    const list = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(list)) return null;
    return list.map((d) => ({
      ...d,
      image: asset(d.image),
      gallery: Array.isArray(d.gallery) ? d.gallery.map(asset) : d.gallery,
    }));
  } catch {
    return null;
  }
};

const applyAdminOverride = (place) => {
  if (!place) return place;
  const adminList = readAdminDestinations();
  if (!adminList?.length) return place;
  const override = adminList.find((d) => d.id === place.id);
  if (!override) return place;
  if (override.active === false) return null;
  const gallery =
    Array.isArray(override.gallery) && override.gallery.length
      ? override.gallery
      : place.gallery;
  return {
    ...place,
    name: override.name || place.name,
    tagline: override.tagline || place.tagline,
    price: override.price != null ? Number(override.price) : place.price,
    bestTime: override.bestTime || place.bestTime,
    image: override.image || place.image,
    description: override.description || place.description,
    gallery: gallery?.length ? gallery : place.image ? [place.image] : place.gallery,
  };
};

/** Destination créée uniquement dans l’admin */
const placeFromAdmin = (d) => {
  if (!d || d.active === false) return null;
  const image = d.image || '../public/images/sahara1.jpeg';
  const gallery =
    Array.isArray(d.gallery) && d.gallery.length ? d.gallery : [image];
  return {
    id: d.id,
    name: d.name,
    name_en: d.name,
    name_ar: d.name,
    tagline: d.tagline || '',
    tagline_en: d.tagline || '',
    tagline_ar: d.tagline || '',
    rating: 4.8,
    reviews: 0,
    temp: '—',
    image,
    gallery,
    description: d.description || '',
    description_en: d.description || '',
    description_ar: d.description || '',
    bestTime: d.bestTime || '',
    bestTime_en: d.bestTime || '',
    bestTime_ar: d.bestTime || '',
    duration: 'Sur mesure',
    duration_en: 'Custom',
    duration_ar: 'حسب الطلب',
    price: Number(d.price || 0),
    stay: 'Selon formule',
    stay_en: 'Package dependent',
    stay_ar: 'حسب الباقة',
    transport: 'À définir',
    transport_en: 'To confirm',
    transport_ar: 'يحدد لاحقاً',
    includes: [
      { fr: 'Hébergement', en: 'Stay', ar: 'إقامة' },
      { fr: 'Assistance Algeria Travel', en: 'Algeria Travel support', ar: 'مساعدة Algeria Travel' },
    ],
    highlights: [
      { icon: 'MapPin', fr: d.name, en: d.name, ar: d.name },
      { icon: 'Camera', fr: 'Paysages', en: 'Landscapes', ar: 'مناظر' },
      { icon: 'Heart', fr: 'Expérience locale', en: 'Local experience', ar: 'تجربة محلية' },
    ],
    fromAdmin: true,
  };
};

export const getPlaces = () => {
  const adminList = readAdminDestinations() || [];
  const archived = new Set(adminList.filter((d) => d.active === false).map((d) => d.id));
  const baseIds = new Set(PLACES.map((p) => p.id));

  const base = PLACES.filter((p) => !archived.has(p.id))
    .map(applyAdminOverride)
    .filter(Boolean);

  const custom = adminList
    .filter((d) => d.active !== false && !baseIds.has(d.id) && d.id !== 'taghit')
    .map(placeFromAdmin)
    .filter(Boolean);

  const taghitOverride = adminList.find((d) => d.id === 'taghit');
  if (taghitOverride?.active === false) {
    return [...base, ...custom];
  }
  return [...base, ...custom];
};

export const getPlaceById = (id, pkg) => {
  if (id === 'taghit') {
    const adminList = readAdminDestinations();
    const override = adminList?.find((d) => d.id === 'taghit');
    if (override?.active === false) return null;
    const pkgId = pkg === 'brezina' || pkg === 'hotel' ? pkg : 'hotel';
    return applyAdminOverride(resolveTaghitPlace(pkgId));
  }
  const place = PLACES.find((p) => p.id === id);
  if (place) return applyAdminOverride(place);

  const adminList = readAdminDestinations() || [];
  const custom = adminList.find((d) => d.id === id);
  return placeFromAdmin(custom);
};
