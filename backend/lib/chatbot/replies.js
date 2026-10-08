/**
 * Textes et mise en forme des réponses (fr / en / ar) : prix, dates, fiches, boutons de suggestion.
 */
const CONTACT = {
  phone: '+33 6 19 50 17 08',
  whatsapp: '33619501708',
  email: 'travelalgeriadz@gmail.com',
  address: 'Russel en face Stade, Béjaïa 06000, Algérie',
};

const tr = (lang, fr, en, ar) => (lang === 'en' ? en ?? fr : lang === 'ar' ? ar ?? fr : fr);
const pick = (l10n, lang) => (l10n ? l10n[lang] || l10n.fr || l10n.en || '' : '');
const nameOf = (item, lang) => pick(item?.name, lang) || item?.id || '';

function money(n, lang) {
  const v = Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : ' ');
  return tr(lang, `${v} DA`, `${v} DZD`, `${v} دج`);
}

const MONTHS = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};
const monthName = (m, lang) => (MONTHS[lang] || MONTHS.fr)[m - 1] || '';

function fmtDate(iso, lang, withYear = true) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (lang === 'en') return `${monthName(m, 'en')} ${d}${withYear ? `, ${y}` : ''}`;
  return `${d} ${monthName(m, lang)}${withYear ? ` ${y}` : ''}`;
}

function fmtRange(start, end, lang) {
  if (!start) return '';
  if (!end || end === start) return fmtDate(start, lang);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const sameMonth = sameYear && start.slice(5, 7) === end.slice(5, 7);
  const d1 = Number(start.slice(8, 10));
  const from = sameMonth ? (lang === 'en' ? fmtDate(start, lang, false) : String(d1)) : fmtDate(start, lang, !sameYear);
  const to = sameMonth && lang === 'en' ? String(Number(end.slice(8, 10))) + `, ${end.slice(0, 4)}` : fmtDate(end, lang);
  return tr(lang, `du ${from} au ${to}`, `${from}–${to}`, `من ${from} إلى ${to}`);
}

/** Libellé des dates retenues dans le contexte. */
function datesLabel(dates, lang) {
  if (!dates) return '';
  if (dates.start) return fmtRange(dates.start, dates.end, lang);
  if (dates.label) return pick(dates.label, lang);
  if (dates.month) return `${monthName(dates.month, lang)} ${dates.year || ''}`.trim();
  return '';
}

const personsLabel = (n, lang) => tr(lang, `${n} personne${n > 1 ? 's' : ''}`, `${n} traveller${n > 1 ? 's' : ''}`, `${n} أشخاص`);

/** Prix affichable d’un élément, ou null si inconnu. */
function priceText(item, lang) {
  if (!item) return null;
  if (item.kind === 'stay') {
    const prices = (item.rooms || []).map((r) => r.price).filter((p) => Number.isFinite(p) && p > 0);
    const min = prices.length ? Math.min(...prices) : item.price;
    if (!min) return null;
    return tr(lang, `à partir de ${money(min, lang)} / nuit`, `from ${money(min, lang)} / night`, `ابتداءً من ${money(min, lang)} / الليلة`);
  }
  if (!item.price) return null;
  const per = item.perPerson ? tr(lang, ' / personne', ' / person', ' / للشخص') : '';
  const from = item.kind === 'place' ? tr(lang, 'à partir de ', 'from ', 'ابتداءً من ') : '';
  return `${from}${money(item.price, lang)}${per}`;
}

const ICON = { tour: '🧭', place: '📍', stay: '🏨', activity: '🎯' };

/** Fiche courte d’une offre : uniquement les champs réellement connus. */
function describe(item, lang, { calendar } = {}) {
  const lines = [`${ICON[item.kind] || '•'} **${nameOf(item, lang)}**`];
  if (item.kind === 'stay') {
    const city = pick(item.city, lang);
    lines.push(`${pick(item.typeLabel, lang)}${item.stars ? ` ${'★'.repeat(item.stars)}` : ''}${city ? ` · ${city}` : ''}`);
  }
  const price = priceText(item, lang);
  lines.push(`💰 ${price || tr(lang, 'Prix sur demande', 'Price on request', 'السعر عند الطلب')}`);
  const duration = pick(item.duration, lang);
  if (duration) lines.push(`🕒 ${duration}`);
  const periods = calendar?.mode === 'fixed' ? calendar.periods : [];
  if (periods.length) lines.push(`📅 ${periods.slice(0, 3).map((p) => fmtRange(p.start, p.end, lang)).join(' · ')}`);
  else if (pick(item.dates, lang)) lines.push(`📅 ${pick(item.dates, lang)}`);
  else if (pick(item.bestTime, lang)) lines.push(`🌤️ ${tr(lang, 'Meilleure période', 'Best time', 'أفضل فترة')} : ${pick(item.bestTime, lang)}`);
  if (item.kind === 'activity' && pick(item.location, lang)) lines.push(`📍 ${pick(item.location, lang)}`);
  return lines.join('\n');
}

/** Ligne de liste : « • Nom — prix ». */
function listLine(item, lang) {
  const price = priceText(item, lang);
  return `• ${nameOf(item, lang)}${price ? ` — ${price}` : ''}`;
}

/* ── Boutons de suggestion ── */

const S = {
  prices: (l) => ({ label: tr(l, '💰 Prix', '💰 Prices', '💰 الأسعار'), value: tr(l, 'Quels sont vos prix ?', 'What are your prices?', 'شحال الأسعار؟') }),
  destinations: (l) => ({ label: tr(l, '📍 Destinations', '📍 Destinations', '📍 الوجهات'), value: tr(l, 'Quelles destinations ?', 'Which destinations?', 'واش هي الوجهات؟') }),
  tours: (l) => ({ label: tr(l, '🧭 Circuits', '🧭 Tours', '🧭 الرحلات'), value: tr(l, 'Vos circuits', 'Your tours', 'الرحلات') }),
  hotels: (l) => ({ label: tr(l, '🏨 Hébergements', '🏨 Stays', '🏨 الإقامة'), value: tr(l, 'Je cherche un hôtel', 'I need a hotel', 'نحب فندق') }),
  activities: (l) => ({ label: tr(l, '🎯 Activités', '🎯 Activities', '🎯 النشاطات'), value: tr(l, 'Quelles activités ?', 'Which activities?', 'واش هي النشاطات؟') }),
  book: (l) => ({ label: tr(l, '📝 Réserver', '📝 Book', '📝 نحجز'), value: tr(l, 'Je veux réserver', 'I want to book', 'نحب نحجز') }),
  program: (l) => ({ label: tr(l, '📋 Programme', '📋 Programme', '📋 البرنامج'), value: tr(l, 'Le programme ?', 'The programme?', 'البرنامج؟') }),
  dates: (l) => ({ label: tr(l, '📅 Dates', '📅 Dates', '📅 التواريخ'), value: tr(l, 'Quelles dates ?', 'Which dates?', 'وقتاش؟') }),
  price: (l) => ({ label: tr(l, '💰 Prix', '💰 Price', '💰 السعر'), value: tr(l, 'Quel est le prix ?', 'What is the price?', 'بشحال؟') }),
  availability: (l) => ({ label: tr(l, '✅ Disponibilités', '✅ Availability', '✅ التوفر'), value: tr(l, 'C’est disponible ?', 'Is it available?', 'كاين بلايص؟') }),
  human: (l) => ({ label: tr(l, '👤 Parler à un conseiller', '👤 Talk to an advisor', '👤 التحدث مع مستشار'), value: tr(l, 'Je veux parler à un conseiller', 'I want to talk to an advisor', 'نحب نهدر مع مستشار'), human: true }),
  yes: (l) => ({ label: tr(l, 'Oui', 'Yes', 'نعم'), value: tr(l, 'oui', 'yes', 'نعم') }),
  no: (l) => ({ label: tr(l, 'Non', 'No', 'لا'), value: tr(l, 'non', 'no', 'لا') }),
  confirm: (l) => ({ label: tr(l, '✅ Confirmer', '✅ Confirm', '✅ تأكيد'), value: tr(l, 'confirmer', 'confirm', 'نعم') }),
  modify: (l) => ({ label: tr(l, '✏️ Modifier', '✏️ Edit', '✏️ تعديل'), value: tr(l, 'modifier', 'edit', 'تعديل') }),
  skip: (l) => ({ label: tr(l, 'Passer', 'Skip', 'تخطي'), value: tr(l, 'non', 'no', 'لا') }),
  none: (l) => ({ label: tr(l, 'Aucune', 'None', 'لا شيء'), value: tr(l, 'aucune', 'none', 'لا') }),
  contactInfo: (l) => ({ label: tr(l, '📞 Contact', '📞 Contact', '📞 الاتصال'), value: tr(l, 'Comment vous contacter ?', 'How can I contact you?', 'كيفاش نتواصل معاكم؟') }),
  payment: (l) => ({ label: tr(l, '💳 Paiement', '💳 Payment', '💳 الدفع'), value: tr(l, 'Comment payer ?', 'How can I pay?', 'كيفاش نخلص؟') }),
};
const sugg = (lang, ...keys) => keys.filter((k) => S[k]).map((k) => S[k](lang));
const option = (label, value) => ({ label, value: value ?? label });

const MAIN_MENU = ['prices', 'destinations', 'hotels', 'activities', 'book', 'human'];

const welcome = (lang) =>
  tr(
    lang,
    'Bonjour 👋 Je suis l’assistant d’Algeria Travel. Je peux vous renseigner sur nos circuits, hébergements, activités, prix et disponibilités, ou préparer une demande de réservation. Que cherchez-vous ?',
    'Hello 👋 I’m the Algeria Travel assistant. I can help with our tours, stays, activities, prices and availability, or prepare a booking request. What are you looking for?',
    'مرحبا 👋 أنا مساعد Algeria Travel. نقدر نعاونك في الرحلات، الإقامة، النشاطات، الأسعار والتوفر، أو نحضّر لك طلب حجز. واش تحب؟'
  );

const contactBlock = (lang) =>
  tr(
    lang,
    `📞 Téléphone / WhatsApp : ${CONTACT.phone}\n✉️ Email : ${CONTACT.email}`,
    `📞 Phone / WhatsApp: ${CONTACT.phone}\n✉️ Email: ${CONTACT.email}`,
    `📞 الهاتف / واتساب: ${CONTACT.phone}\n✉️ البريد: ${CONTACT.email}`
  );

module.exports = {
  CONTACT,
  tr,
  pick,
  nameOf,
  money,
  monthName,
  fmtDate,
  fmtRange,
  datesLabel,
  personsLabel,
  priceText,
  describe,
  listLine,
  sugg,
  option,
  MAIN_MENU,
  welcome,
  contactBlock,
};
