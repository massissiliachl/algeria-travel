/** Fallback chat côté navigateur quand /api/chat est indisponible (ex. site statique Render). */

const DESTINATIONS = {
  taghit: ['taghit', 'tagit', 'tghit'],
  bejaia: ['bejaia', 'bejaïa', 'bejaya', 'bougie', 'bja'],
  oran: ['oran'],
  alger: ['alger', 'algiers'],
  djanet: ['djanet', 'dj'],
  ghardaia: ['ghardaia', 'ghardaïa', 'ghard'],
};

const GREETINGS = /^(cc|bjr|bj|bsr|bs|slt|salut|bonjour|bonsoir|bonjourt|hello|hi|hey|salam|slm|saha|marhaba|ahlan)(\s*[!?.…]*)$/i;

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function findDestination(text) {
  const n = normalize(text);
  for (const [id, aliases] of Object.entries(DESTINATIONS)) {
    if (aliases.some((a) => n.includes(a))) return id;
  }
  return null;
}

function pick(lang, fr, en, ar) {
  if (lang === 'en') return en;
  if (lang === 'ar') return ar;
  return fr;
}

export function getOfflineWelcome(lang = 'fr') {
  return {
    reply: pick(
      lang,
      "Bonjour ! Je suis l'assistant Algeria Travel. Demandez-moi : voyages, tarifs, Taghit, désert, réservation, activités… Même en abrégé (voy, resa, sah…) je comprends !",
      "Hello! I'm the Algeria Travel assistant. Ask about trips, prices, Taghit, desert, booking, activities… Short forms work too!",
      'مرحباً! أنا مساعد Algeria Travel. اسأل عن الرحلات، الأسعار، تاغيت، الصحراء، الحجز، الأنشطة…',
    ),
    suggestions: pick(
      lang,
      ['Béjaïa', 'Taghit', 'Oran', 'Tarif Taghit', 'Réserver'],
      ['Bejaia', 'Taghit', 'Oran', 'Taghit price', 'Book'],
      ['بجاية', 'تاغيت', 'وهران', 'سعر تاغيت', 'حجز'],
    ),
    links: [{ label: lang === 'en' ? 'Taghit offer' : lang === 'ar' ? 'عرض تاغيت' : 'Offre Taghit', url: '/place/taghit?pkg=hotel' }],
    source: 'offline',
  };
}

export function getOfflineReply(message, lang = 'fr', session = {}) {
  const n = normalize(message);
  const dest = findDestination(n) || session.destination || null;
  const nextSession = { ...session, destination: dest || session.destination || null, language: lang };

  if (GREETINGS.test(n)) {
    return {
      reply: pick(
        lang,
        'Bonjour 😊 Comment puis-je vous aider pour votre voyage en Algérie ? Destinations, hôtels, activités, circuits, Taghit…',
        'Hello 😊 How can I help with your trip to Algeria? Destinations, hotels, activities, tours, Taghit…',
        'مرحباً 😊 كيف يمكنني مساعدتك في رحلتك إلى الجزائر؟',
      ),
      suggestions: pick(lang, ['Taghit', 'Tarif Taghit', 'Réserver', 'Béjaïa'], ['Taghit', 'Taghit price', 'Book', 'Bejaia'], ['تاغيت', 'سعر تاغيت', 'حجز', 'بجاية']),
      links: [{ label: 'Circuits', url: '/tours' }],
      session: { ...nextSession, lastIntent: 'GREETING' },
      source: 'offline',
    };
  }

  if (/^taghit$/i.test(n) || (dest === 'taghit' && n.length < 20)) {
    return {
      reply: pick(
        lang,
        '🌵 **Taghit** est une magnifique destination du Sahara algérien.\n\nSouhaitez-vous connaître les **circuits**, les **activités**, les **hébergements** ou les **tarifs** ?',
        '🌵 **Taghit** is a stunning Saharan destination.\n\nWould you like **tours**, **activities**, **accommodation** or **prices**?',
        '🌵 **تاغيت** وجهة صحراوية رائعة.\n\nهل تريدون **الدوائر**، **الأنشطة**، **الإقامة** أو **الأسعار**؟',
      ),
      suggestions: pick(lang, ['Tarif Taghit', 'Réserver', 'Programme'], ['Taghit price', 'Book', 'Program'], ['سعر تاغيت', 'حجز', 'برنامج']),
      links: [{ label: 'Taghit', url: '/place/taghit?pkg=hotel' }],
      session: { ...nextSession, destination: 'taghit' },
      source: 'offline',
    };
  }

  if (/^(dispo|disp|disponible)\??$/i.test(n)) {
    return {
      reply: pick(
        lang,
        'Bien sûr 😊 Que souhaitez-vous vérifier ?\n\n🏨 Hébergement · 🎯 Activité · 🚐 Transport · 🗺️ Circuit\n\nIndiquez aussi la date et le nombre de personnes.',
        'Sure 😊 What would you like to check?\n\n🏨 Stay · 🎯 Activity · 🚐 Transport · 🗺️ Tour',
        'بالطبع 😊 ماذا تريدون التحقق منه؟\n\n🏨 إقامة · 🎯 نشاط · 🚐 نقل · 🗺️ دائرة',
      ),
      suggestions: pick(lang, ['Taghit', 'Tarif Taghit', 'Réserver'], ['Taghit', 'Taghit price', 'Book'], ['تاغيت', 'سعر تاغيت', 'حجز']),
      links: [{ label: 'Contact', url: '/contact' }],
      session: nextSession,
      source: 'offline',
    };
  }

  if (/prix|tarif|cmb|combien|ch7al|price|how much|c est combien/.test(n)) {
    return {
      reply: pick(
        lang,
        '💰 Je peux vous renseigner. Pour calculer le tarif, indiquez :\n\n📍 destination · 📅 dates · 👥 nombre de personnes · 🎯 prestation.',
        '💰 Share destination, dates, travelers and service for a price estimate.',
        '💰 أرسلوا الوجهة والتواريخ وعدد الأشخاص والخدمة لحساب السعر.',
      ),
      suggestions: pick(lang, ['Taghit', 'Tarif Taghit', 'Réserver'], ['Taghit', 'Taghit price', 'Book'], ['تاغيت', 'سعر تاغيت', 'حجز']),
      links: [{ label: 'Taghit', url: '/place/taghit?pkg=hotel' }],
      session: nextSession,
      source: 'offline',
    };
  }

  if (/devis|quote/.test(n)) {
    return {
      reply: pick(
        lang,
        '📋 Avec plaisir ! Indiquez : destination, dates, nombre de personnes, hébergement, transport et activités souhaitées.',
        '📋 Please share destination, dates, travelers, accommodation, transport and activities.',
        '📋 أرسلوا الوجهة والتواريخ وعدد الأشخاص والإقامة والنقل والأنشطة.',
      ),
      links: [{ label: 'Contact', url: '/contact' }],
      session: nextSession,
      source: 'offline',
    };
  }

  if (/resa|reserv|book|hajz|حجز/.test(n)) {
    return {
      reply: pick(
        lang,
        '📌 Pour préparer votre réservation : nom, téléphone, destination, dates, nombre de voyageurs et formule souhaitée.',
        '📌 For booking: name, phone, destination, dates, travelers and package.',
        '📌 للحجز: الاسم، الهاتف، الوجهة، التواريخ، عدد المسافرين والصيغة.',
      ),
      links: [{ label: 'WhatsApp', url: 'https://wa.me/213557664089' }, { label: 'Contact', url: '/contact' }],
      session: nextSession,
      source: 'offline',
    };
  }

  return {
    reply: pick(
      lang,
      '😊 Je peux vous aider pour votre voyage en Algérie.\n\n🗺️ Circuit · 🏨 Hébergement · 🎯 Activité · 💰 Tarif · 📌 Réservation\n\nQue recherchez-vous ?',
      '😊 I can help with your trip to Algeria.\n\n🗺️ Tour · 🏨 Stay · 🎯 Activity · 💰 Price · 📌 Booking',
      '😊 يمكنني مساعدتكم في رحلتكم إلى الجزائر.\n\n🗺️ دائرة · 🏨 إقامة · 🎯 نشاط · 💰 سعر · 📌 حجز',
    ),
    suggestions: pick(lang, ['Taghit', 'Tarif Taghit', 'Réserver'], ['Taghit', 'Taghit price', 'Book'], ['تاغيت', 'سعر تاغيت', 'حجز']),
    links: [{ label: 'Taghit', url: '/place/taghit?pkg=hotel' }, { label: 'Circuits', url: '/tours' }],
    session: nextSession,
    source: 'offline',
  };
}

export function isChatApiBrokenResponse(data) {
  return !data || typeof data.reply !== 'string' || !String(data.reply).trim();
}
