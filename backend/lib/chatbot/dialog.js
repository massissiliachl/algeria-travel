/**
 * Dialogue du chatbot : contexte de conversation, réponses par intention, collecte progressive
 * des informations de réservation et de rappel. Toutes les informations commerciales viennent du catalogue.
 */
const { analyze, parseName, parseDates } = require('./nlu');
const { canonical, tokenize } = require('./text');
const C = require('./catalog');
const R = require('./replies');
const { CARD_PAYMENT_ENABLED } = require('../paymentMethod');

const { tr, pick, nameOf, sugg, option } = R;
const MAX_LIST = 6;
const MAX_FALLBACKS = 2;

function freshContext(lang = 'fr') {
  return {
    lang,
    topicKey: null,
    placeId: null,
    category: null,
    dates: null,
    persons: null,
    rooms: null,
    pending: null,
    booking: null,
    profile: {},
    notes: null,
    fallbacks: 0,
    lastIntent: null,
    humanRequested: false,
  };
}

/* ── Aides catalogue ── */

const STAY_TYPES = {
  hotel: ['hotel', 'guesthouse', 'residence', 'other'],
  guesthouse: ['guesthouse'],
  apartment: ['apartment', 'villa', 'residence'],
};
const isStayCategory = (cat) => Boolean(STAY_TYPES[cat]);

function placeIdsOf(catalog, placeId) {
  return new Set([placeId, ...catalog.places.filter((p) => p.region === placeId).map((p) => p.id)]);
}

function staysFor(catalog, placeId, category) {
  let list = catalog.stays;
  if (placeId) {
    const ids = placeIdsOf(catalog, placeId);
    list = list.filter((s) => ids.has(s.placeId) || [...ids].some((id) => canonical(pick(s.city, 'fr')).includes(id)));
  }
  if (STAY_TYPES[category]) list = list.filter((s) => STAY_TYPES[category].includes(s.stayType));
  return list;
}

/** Formules de circuit qui incluent l’hébergement (ex. Taghit hôtel / maison d’hôte). */
function stayTours(catalog, placeId, category) {
  if (category === 'apartment') return [];
  const pkgs = category === 'guesthouse' ? ['guesthouse'] : ['hotel', 'guesthouse'];
  const ids = placeId ? placeIdsOf(catalog, placeId) : null;
  return catalog.tours.filter((t) => pkgs.includes(t.pkg) && (!ids || ids.has(t.placeId)));
}

/** Offres réservables d’une destination : ses circuits, sinon la destination elle-même. */
function offerList(catalog, place) {
  const { tours } = C.offersFor(catalog, place.id);
  return tours.length ? tours : [place];
}

function topOffers(catalog) {
  const tours = catalog.tours.filter((t) => t.price && C.bookingOpenFor(catalog, t) !== false);
  const rest = catalog.tours.filter((t) => t.price && !tours.includes(t));
  return [...tours, ...rest].slice(0, MAX_LIST);
}

const MONTH_FR = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];

/** Offres dont les dates connues (calendrier admin ou dates publiées) tombent dans le mois donné. */
function offersInMonth(catalog, month, year) {
  const out = [];
  for (const item of [...catalog.tours, ...catalog.places]) {
    const cal = C.calendarFor(catalog, item);
    const periods = cal?.mode === 'fixed' ? cal.periods : [];
    const inCal = periods.some((p) => {
      const [y1, m1] = p.start.split('-').map(Number);
      const [y2, m2] = p.end.split('-').map(Number);
      const a = y1 * 12 + m1;
      const b = y2 * 12 + m2;
      const t = (year || y1) * 12 + month;
      return t >= a && t <= b;
    });
    const inText = !periods.length && canonical(pick(item.dates, 'fr')).includes(MONTH_FR[month - 1]);
    if (inCal || inText) out.push(item);
  }
  return out.filter((i) => !(i.kind === 'place' && out.some((t) => t.kind === 'tour' && t.placeId === i.id)));
}

function inPeriod(day, p) {
  return day >= p.start && day <= p.end;
}

/**
 * Départs à date fixe : calendrier de l’admin, sinon dates publiées du circuit (« Du 17 au 24 décembre 2026 »).
 * null = pas de contrainte de date connue.
 */
function fixedPeriods(catalog, item) {
  const cal = C.calendarFor(catalog, item);
  if (cal?.mode === 'fixed') return cal.periods;
  const text = pick(item?.dates, 'fr');
  if (!text) return null;
  const d = parseDates(text);
  const today = new Date().toISOString().slice(0, 10);
  return d?.start && d.end && d.end >= today ? [{ start: d.start, end: d.end }] : null;
}

/* ── Contexte ── */

function categoryFrom(a) {
  const I = a.intents;
  if (I.APARTMENT) return 'apartment';
  if (I.HOTEL) return a.text.includes('maison dhote') ? 'guesthouse' : 'hotel';
  if (I.ACTIVITY) return 'activity';
  if (I.TOUR) return 'tour';
  return null;
}

function applyEntity(st, entity) {
  const { c, catalog } = st;
  if (!entity) return;
  const prevTopic = st.topic();
  switch (entity.kind) {
    case 'place': {
      c.placeId = entity.id;
      if (prevTopic?.kind === 'tour' && prevTopic.placeId === entity.id) break;
      const offers = C.offersFor(catalog, entity.id);
      c.topicKey = !isStayCategory(c.category) && c.category !== 'activity' && offers.tours.length === 1 ? offers.tours[0].key : entity.key;
      break;
    }
    case 'tour':
      c.topicKey = entity.key;
      c.placeId = entity.placeId || c.placeId;
      break;
    case 'stay':
      c.topicKey = entity.key;
      c.placeId = entity.placeId || c.placeId;
      c.category = ['apartment', 'villa'].includes(entity.stayType) ? 'apartment' : 'hotel';
      break;
    case 'activity':
      c.topicKey = entity.key;
      break;
    default:
  }
}

/** Intègre dates, voyageurs, chambres et coordonnées trouvés dans le message. */
function absorbDetails(st) {
  const { c, a } = st;
  const slot = c.pending?.slot;
  if (a.dates) {
    if (slot === 'dates_end' && c.dates?.start && a.dates.start && !a.dates.end && a.dates.start > c.dates.start) {
      c.dates = { ...c.dates, end: a.dates.start };
    } else if (a.dates.start || !c.dates?.start || a.dates.month !== c.dates.month) {
      c.dates = a.dates;
    }
    st.got.dates = true;
  }
  const nights = a.text.match(/\b(\d{1,2})\s*(?:nuits?|nights?|ليالي|ليله)\b/);
  if (nights && c.dates?.start && !c.dates.end && slot === 'dates_end') {
    const d = new Date(`${c.dates.start}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + Number(nights[1]));
    c.dates = { ...c.dates, end: d.toISOString().slice(0, 10) };
    st.got.dates = true;
  }
  if (a.persons) {
    c.persons = a.persons;
    st.got.persons = true;
  }
  if (a.rooms && (slot === 'rooms' || /chambre|room|غرف/.test(a.text))) {
    c.rooms = a.rooms;
    st.got.rooms = true;
  }
  if (a.email) {
    c.profile.email = a.email;
    st.got.email = true;
  }
  if (a.phone) {
    c.profile.phone = a.phone;
    st.got.phone = true;
  }
}

/* ── Réponses ── */

function out(st, intent, reply, suggestions = [], extra = {}) {
  return { intent, reply, suggestions, links: extra.links || [], flags: st.flags };
}

function askChoose(st, items, then, question, intent) {
  const { c, L } = st;
  const list = items.slice(0, MAX_LIST);
  c.pending = { slot: 'choose', options: list.map((i) => i.key), then };
  const lines = list.map((i, n) => `${n + 1}. ${R.listLine(i, L).slice(2)}`).join('\n');
  const label = intent || (then === 'BOOKING_NEXT' ? 'BOOKING' : then === 'SUMMARY' ? 'TOUR' : then);
  return out(st, label, `${question}\n${lines}`, [
    ...list.map((i) => option(nameOf(i, L))),
    ...sugg(L, 'human'),
  ]);
}

function offerLink(st, item) {
  return item?.url ? [{ label: tr(st.L, 'Voir l’offre', 'View offer', 'شوف العرض'), url: item.url }] : [];
}

function offerBooking(st, intent, text, extraKeys = ['program', 'dates']) {
  const { c, L } = st;
  const links = offerLink(st, st.topic());
  if (c.booking?.active) return out(st, intent, text, [], { links });
  c.pending = { slot: 'offer_booking' };
  const question = tr(L, 'Souhaitez-vous faire une demande de réservation ?', 'Would you like to send a booking request?', 'تحب تبعث طلب حجز؟');
  return out(st, intent, `${text}\n\n${question}`, [...sugg(L, 'book'), ...sugg(L, ...extraKeys), ...sugg(L, 'human')], { links });
}

function offerContact(st, intent, text, note) {
  const { c, L } = st;
  c.pending = { slot: 'offer_contact', note: note || null };
  const q = tr(L, 'Voulez-vous que je transmette votre demande à notre équipe ?', 'Shall I forward your request to our team?', 'تحب نبعث طلبك لفريقنا؟');
  return out(st, intent, `${text}\n\n${q}`, sugg(L, 'yes', 'no'));
}

function menu(st, intent, text) {
  return out(st, intent, text, sugg(st.L, ...R.MAIN_MENU));
}

/* ── Intentions ── */

function onSummary(st, intent = 'TOUR') {
  const { catalog, L } = st;
  const item = st.topic();
  if (!item) return menu(st, intent, tr(L, 'Voici ce que je peux vous proposer :', 'Here is what I can offer:', 'هذا واش نقدر نقترح عليك:'));
  if (item.kind === 'place') {
    const offers = offerList(catalog, item);
    if (offers.length > 1 || offers[0] !== item) {
      return askChoose(st, offers, 'SUMMARY', tr(L, `Pour ${nameOf(item, L)}, nous proposons :`, `For ${nameOf(item, L)}, we offer:`, `في ${nameOf(item, L)} نقترح:`));
    }
  }
  return offerBooking(st, intent, R.describe(item, L, { calendar: C.calendarFor(catalog, item) }), ['price', 'program', 'availability']);
}

function onPrice(st) {
  const { c, catalog, L } = st;
  const item = st.topic();
  if (isStayCategory(c.category) && (!item || item.kind === 'place')) return onStays(st, 'PRICE');
  if (c.category === 'activity' && (!item || item.kind === 'place')) return onActivities(st, 'PRICE');
  if (!item) {
    return askChoose(st, topOffers(catalog), 'PRICE', tr(L, 'Voici nos prix actuels 💰', 'Here are our current prices 💰', 'هذي أسعارنا الحالية 💰'));
  }
  if (item.kind === 'place') {
    const offers = offerList(catalog, item);
    if (offers.length > 1) {
      return askChoose(st, offers, 'PRICE', tr(L, `Prix pour ${nameOf(item, L)} 💰`, `Prices for ${nameOf(item, L)} 💰`, `الأسعار في ${nameOf(item, L)} 💰`));
    }
  }
  const price = R.priceText(item, L);
  if (!price) {
    return offerContact(
      st,
      'PRICE',
      tr(L, `Le prix de « ${nameOf(item, L)} » n’est pas publié : il est établi sur devis par notre équipe.`, `The price of “${nameOf(item, L)}” is not published: our team quotes it on request.`, `سعر « ${nameOf(item, L)} » غير منشور، فريقنا يعطيك عرض سعر.`),
      `Demande de prix : ${nameOf(item, 'fr')}`
    );
  }
  let text = tr(L, `💰 ${nameOf(item, L)} : ${price}`, `💰 ${nameOf(item, L)}: ${price}`, `💰 ${nameOf(item, L)}: ${price}`);
  const duration = pick(item.duration, L);
  if (duration) text += ` · ${duration}`;
  if (c.persons && item.perPerson && item.price) {
    text += `\n${tr(L, `Pour ${R.personsLabel(c.persons, L)} : environ ${R.money(item.price * c.persons, L)} (estimation, confirmée par notre équipe).`, `For ${R.personsLabel(c.persons, L)}: about ${R.money(item.price * c.persons, L)} (estimate, confirmed by our team).`, `لـ ${R.personsLabel(c.persons, L)}: حوالي ${R.money(item.price * c.persons, L)} (تقدير، يأكده فريقنا).`)}`;
  }
  return offerBooking(st, 'PRICE', text, ['program', 'availability']);
}

async function onAvailability(st) {
  const { c, catalog, L } = st;
  const item = st.topic();
  if (isStayCategory(c.category) && (!item || item.kind === 'place')) return onStays(st, 'AVAILABILITY');
  if (!item) {
    if (c.dates?.month) {
      const list = offersInMonth(catalog, c.dates.month, c.dates.year);
      const month = R.monthName(c.dates.month, L);
      if (list.length) {
        return askChoose(st, list, 'AVAILABILITY', tr(L, `Départs connus en ${month} 📅`, `Known departures in ${month} 📅`, `الرحلات المعروفة في ${month} 📅`));
      }
      return askChoose(st, topOffers(catalog), 'AVAILABILITY', tr(L, `Je n’ai pas de départ à date fixe en ${month}. Ces offres se réservent à la demande, sous réserve de confirmation par notre équipe :`, `No fixed-date departure in ${month}. These offers are booked on request, subject to confirmation by our team:`, `ما عندناش رحلة بتاريخ ثابت في ${month}. هذي العروض تتحجز عند الطلب ويأكدها فريقنا:`));
    }
    return askChoose(st, topOffers(catalog), 'AVAILABILITY', tr(L, 'Pour quelle offre souhaitez-vous connaître les disponibilités ?', 'Which offer would you like to check?', 'على أي عرض تحب تعرف التوفر؟'));
  }
  if (item.kind === 'place') {
    const offers = offerList(catalog, item);
    if (offers.length > 1) return askChoose(st, offers, 'AVAILABILITY', tr(L, 'Pour quelle formule ?', 'Which package?', 'أي عرض؟'));
  }
  const name = nameOf(item, L);
  const open = C.bookingOpenFor(catalog, item);
  if (open === false) {
    return offerContact(st, 'AVAILABILITY', tr(L, `Les réservations en ligne pour « ${name} » sont fermées pour le moment.`, `Online bookings for “${name}” are currently closed.`, `الحجز عبر الإنترنت لـ « ${name} » مغلق حالياً.`), `Disponibilité : ${nameOf(item, 'fr')}`);
  }
  if (item.kind === 'stay') return stayAvailability(st, item);

  const cal = C.calendarFor(catalog, item);
  const day = c.dates?.start;
  if (day && cal?.blocked?.some((p) => inPeriod(day, p))) {
    const b = cal.blocked.find((p) => inPeriod(day, p));
    return offerContact(st, 'AVAILABILITY', tr(L, `Les réservations sont fermées ${R.fmtRange(b.start, b.end, L)} pour « ${name} ».`, `Bookings are closed ${R.fmtRange(b.start, b.end, L)} for “${name}”.`, `الحجز مغلق ${R.fmtRange(b.start, b.end, L)} لـ « ${name} ».`));
  }
  if (cal?.mode === 'fixed') {
    if (!cal.periods.length) {
      return offerContact(st, 'AVAILABILITY', tr(L, `Aucune date n’est ouverte pour « ${name} » pour le moment.`, `No dates are open for “${name}” at the moment.`, `ما كاين حتى تاريخ مفتوح لـ « ${name} » حالياً.`), `Disponibilité : ${nameOf(item, 'fr')}`);
    }
    const periods = cal.periods.map((p) => R.fmtRange(p.start, p.end, L));
    let head;
    if (day) {
      const ok = cal.periods.some((p) => inPeriod(day, p));
      head = ok
        ? tr(L, `✅ Le ${R.fmtDate(day, L)} fait partie des dates ouvertes pour « ${name} ».`, `✅ ${R.fmtDate(day, L)} is within the open dates for “${name}”.`, `✅ ${R.fmtDate(day, L)} من التواريخ المفتوحة لـ « ${name} ».`)
        : tr(L, `❌ Le ${R.fmtDate(day, L)} ne fait pas partie des dates ouvertes pour « ${name} ».`, `❌ ${R.fmtDate(day, L)} is not an open date for “${name}”.`, `❌ ${R.fmtDate(day, L)} ماشي من التواريخ المفتوحة لـ « ${name} ».`);
    } else {
      head = tr(L, `📅 Dates ouvertes pour « ${name} » :`, `📅 Open dates for “${name}”:`, `📅 التواريخ المفتوحة لـ « ${name} »:`);
    }
    const text = `${head}\n${periods.map((p) => `• ${p}`).join('\n')}\n${tr(L, 'Les places restantes sont confirmées par notre équipe à réception de votre demande.', 'Remaining seats are confirmed by our team when we receive your request.', 'الأماكن المتبقية يأكدها فريقنا عند استلام طلبك.')}`;
    return offerBooking(st, 'AVAILABILITY', text, ['price', 'program']);
  }
  const fixedText = pick(item.dates, L);
  let text;
  if (fixedText) {
    text = tr(L, `📅 « ${name} » : ${fixedText}.`, `📅 “${name}”: ${fixedText}.`, `📅 « ${name} »: ${fixedText}.`);
    const fp = fixedPeriods(catalog, item);
    if (day && fp?.length) {
      text += fp.some((p) => inPeriod(day, p))
        ? `\n${tr(L, '✅ Vos dates correspondent à ce départ.', '✅ Your dates match this departure.', '✅ التواريخ تاعك توافق هذا الانطلاق.')}`
        : `\n${tr(L, `❌ Pas de départ à la date indiquée (${R.datesLabel(c.dates, L)}).`, `❌ No departure on the date you gave (${R.datesLabel(c.dates, L)}).`, `❌ ما كاينش انطلاق في التاريخ اللي عطيت (${R.datesLabel(c.dates, L)}).`)}`;
    }
  } else {
    text = tr(L, `📅 « ${name} » se réserve à la date de votre choix${day ? ` (vous avez indiqué ${R.datesLabel(c.dates, L)})` : ''}.`, `📅 “${name}” can be booked on the date of your choice${day ? ` (you mentioned ${R.datesLabel(c.dates, L)})` : ''}.`, `📅 « ${name} » يتحجز في التاريخ اللي تختارو${day ? ` (${R.datesLabel(c.dates, L)})` : ''}.`);
  }
  text += `\n${open === true
    ? tr(L, 'Les réservations sont ouvertes ; les places sont confirmées par notre équipe à réception de votre demande.', 'Bookings are open; seats are confirmed by our team when we receive your request.', 'الحجز مفتوح؛ الأماكن يأكدها فريقنا عند استلام طلبك.')
    : tr(L, 'Je n’ai pas la disponibilité en temps réel pour cette offre : notre équipe vous la confirme.', 'I don’t have real-time availability for this offer: our team will confirm it.', 'ما عنديش التوفر في الوقت الحقيقي لهذا العرض، فريقنا يأكدهولك.')}`;
  return offerBooking(st, 'AVAILABILITY', text, ['price', 'program']);
}

async function stayAvailability(st, stay) {
  const { c, L } = st;
  const name = nameOf(stay, L);
  if (!c.dates?.start || !c.dates?.end) {
    c.pending = { slot: 'avail_dates' };
    return out(st, 'AVAILABILITY', tr(L, `Pour vérifier « ${name} », indiquez vos dates d’arrivée et de départ (ex. du 12 au 15 décembre).`, `To check “${name}”, tell me your check-in and check-out dates (e.g. 12 to 15 December).`, `باش نشوف « ${name} »، عطيني تاريخ الوصول والمغادرة (مثلاً من 12 إلى 15 ديسمبر).`), sugg(L, 'human'));
  }
  const rooms = await C.roomAvailability(stay, c.dates.start, c.dates.end).catch(() => null);
  const period = R.fmtRange(c.dates.start, c.dates.end, L);
  if (!rooms) {
    return offerBooking(st, 'AVAILABILITY', tr(L, `Je n’ai pas le calendrier des chambres de « ${name} » en temps réel. Notre équipe vous confirme la disponibilité ${period}.`, `I don’t have live room availability for “${name}”. Our team will confirm availability ${period}.`, `ما عنديش رزنامة الغرف لـ « ${name} ». فريقنا يأكد التوفر ${period}.`), ['price']);
  }
  const free = rooms.filter((r) => r.free > 0);
  if (!free.length) {
    return offerContact(st, 'AVAILABILITY', tr(L, `❌ D’après le calendrier, « ${name} » est complet ${period}.`, `❌ According to the calendar, “${name}” is fully booked ${period}.`, `❌ حسب الرزنامة « ${name} » ممتلئ ${period}.`), `Disponibilité ${nameOf(stay, 'fr')} ${c.dates.start} → ${c.dates.end}`);
  }
  const lines = free.map((r) => `• ${r.room.name} — ${tr(L, `${r.free} libre(s)`, `${r.free} free`, `${r.free} متاحة`)}${Number.isFinite(r.room.price) ? ` · ${R.money(r.room.price, L)}${tr(L, ' / nuit', ' / night', ' / الليلة')}` : ''}`);
  return offerBooking(st, 'AVAILABILITY', `${tr(L, `✅ Chambres disponibles à « ${name} » ${period} :`, `✅ Rooms available at “${name}” ${period}:`, `✅ غرف متاحة في « ${name} » ${period}:`)}\n${lines.join('\n')}`, ['price']);
}

function onStays(st, intent) {
  const { c, catalog, L } = st;
  const cat = isStayCategory(c.category) ? c.category : 'hotel';
  const place = c.placeId ? C.placeOf(catalog, c.placeId) : null;
  const items = [...staysFor(catalog, c.placeId, cat), ...stayTours(catalog, c.placeId, cat)];
  const catLabel = {
    hotel: tr(L, 'hébergement', 'accommodation', 'إقامة'),
    guesthouse: tr(L, 'maison d’hôte', 'guesthouse', 'بيت ضيافة'),
    apartment: tr(L, 'appartement', 'apartment', 'شقة'),
  }[cat];
  const then = intent === 'BOOKING' ? 'BOOKING_NEXT' : intent === 'PRICE' ? 'PRICE' : intent === 'AVAILABILITY' ? 'AVAILABILITY' : 'SUMMARY';

  if (items.length) {
    const where = place ? tr(L, ` à ${nameOf(place, L)}`, ` in ${nameOf(place, L)}`, ` في ${nameOf(place, L)}`) : '';
    const q = place || items.length <= MAX_LIST
      ? tr(L, `Voici nos offres d’${catLabel}${where} 🏨 Laquelle vous intéresse ?`, `Here are our ${catLabel} offers${where} 🏨 Which one interests you?`, `هذي عروض ${catLabel}${where} 🏨 أي واحد يهمك؟`)
      : tr(L, `Voici nos offres d’${catLabel} 🏨 Dans quelle ville souhaitez-vous séjourner ?`, `Here are our ${catLabel} offers 🏨 Which city?`, `هذي عروض ${catLabel} 🏨 في أي مدينة؟`);
    return askChoose(st, items, then, q, intent);
  }

  const where = place ? tr(L, ` à ${nameOf(place, L)}`, ` in ${nameOf(place, L)}`, ` في ${nameOf(place, L)}`) : '';
  let text = tr(L, `Je n’ai pas d’offre d’${catLabel}${where} dans notre catalogue pour le moment.`, `We have no ${catLabel} offer${where} in our catalogue at the moment.`, `ما عندناش عرض ${catLabel}${where} في الكتالوج حالياً.`);
  const alternatives = [];
  if (place) {
    const otherStays = staysFor(catalog, c.placeId, null);
    alternatives.push(...otherStays);
    const tours = C.offersFor(catalog, c.placeId).tours.filter((t) => pick(t.stay, 'fr'));
    if (tours.length) {
      text += `\n${tr(L, `Nos circuits${where} incluent l’hébergement :`, `Our tours${where} include accommodation:`, `رحلاتنا${where} فيها الإقامة:`)}\n${tours.map((t) => `• ${nameOf(t, L)} — ${pick(t.stay, L)}`).join('\n')}`;
      alternatives.push(...tours);
    }
  }
  if (!alternatives.length) {
    const elsewhere = [...staysFor(catalog, null, cat), ...stayTours(catalog, null, cat)].slice(0, 3);
    if (elsewhere.length) text += `\n${tr(L, 'Ailleurs, nous proposons :', 'Elsewhere, we offer:', 'في أماكن أخرى نقترح:')}\n${elsewhere.map((i) => R.listLine(i, L)).join('\n')}`;
  }
  return offerContact(st, intent, text, `Recherche ${catLabel}${place ? ` à ${nameOf(place, 'fr')}` : ''}`);
}

function onActivities(st, intent) {
  const { c, catalog, L } = st;
  const list = c.placeId ? C.offersFor(catalog, c.placeId).activities : catalog.activities;
  if (!list.length) {
    const place = C.placeOf(catalog, c.placeId);
    return offerContact(st, intent, tr(L, `Je n’ai pas d’activité publiée${place ? ` à ${nameOf(place, L)}` : ''} pour le moment.`, `No activity is published${place ? ` in ${nameOf(place, L)}` : ''} yet.`, `ما كاين حتى نشاط منشور${place ? ` في ${nameOf(place, L)}` : ''} حالياً.`));
  }
  return askChoose(st, list, intent === 'PRICE' ? 'PRICE' : 'SUMMARY', tr(L, 'Nos activités 🎯', 'Our activities 🎯', 'نشاطاتنا 🎯'), intent);
}

function onDestinations(st, intent) {
  const { c, catalog, L } = st;
  if (c.placeId) return onSummary(st, intent);
  const places = catalog.places.filter((p) => !p.region);
  const withOffers = places.filter((p) => C.offersFor(catalog, p.id).tours.length);
  const list = (withOffers.length ? withOffers : places).slice(0, MAX_LIST);
  return askChoose(st, list, 'SUMMARY', tr(L, 'Nos destinations 📍', 'Our destinations 📍', 'وجهاتنا 📍'), intent);
}

function needTopic(st, intent) {
  const { catalog, L } = st;
  return askChoose(st, topOffers(catalog), intent, tr(L, 'Pour quelle offre ?', 'For which offer?', 'على أي عرض؟'));
}

function onProgram(st) {
  const { catalog, L } = st;
  const item = st.topic();
  if (!item) return needTopic(st, 'PROGRAM');
  if (item.kind === 'place' && offerList(catalog, item).length > 1) return askChoose(st, offerList(catalog, item), 'PROGRAM', tr(L, 'Quel programme ?', 'Which programme?', 'أي برنامج؟'));
  const name = nameOf(item, L);
  const parts = [];
  if (item.itinerary?.length) parts.push(item.itinerary.slice(0, 8).map((d) => `• ${tr(L, 'Jour', 'Day', 'اليوم')} ${d.day} : ${pick(d.title, L)}`).join('\n'));
  if (item.includes?.length) parts.push(`${tr(L, '✅ Inclus :', '✅ Included:', '✅ يشمل:')}\n${item.includes.slice(0, 10).map((i) => `• ${pick(i, L)}`).join('\n')}`);
  if (!parts.length && pick(item.description, L)) parts.push(pick(item.description, L).slice(0, 500));
  if (!parts.length) {
    return offerContact(st, 'PROGRAM', tr(L, `Le programme détaillé de « ${name} » n’est pas encore publié.`, `The detailed programme of “${name}” is not published yet.`, `البرنامج المفصل لـ « ${name} » مازال ما تنشرش.`), `Programme : ${nameOf(item, 'fr')}`);
  }
  return offerBooking(st, 'PROGRAM', `📋 ${name}\n${parts.join('\n\n')}`, ['price', 'dates']);
}

function onField(st, intent, field, icon, unknownFr, unknownEn, unknownAr) {
  const { catalog, L } = st;
  const item = st.topic();
  if (!item) return needTopic(st, intent);
  if (item.kind === 'place' && offerList(catalog, item).length > 1) return askChoose(st, offerList(catalog, item), intent, tr(L, 'Pour quelle formule ?', 'Which package?', 'أي عرض؟'));
  const value = pick(item[field], L);
  const name = nameOf(item, L);
  if (!value) return offerContact(st, intent, tr(L, `${unknownFr} « ${name} ».`, `${unknownEn} “${name}”.`, `${unknownAr} « ${name} ».`), `${intent} : ${nameOf(item, 'fr')}`);
  return offerBooking(st, intent, `${icon} ${name} : ${value}`, ['price', 'program']);
}

function onDate(st) {
  const { catalog, L } = st;
  const item = st.topic();
  if (!item) return st.c.dates?.month ? onAvailability(st) : needTopic(st, 'DATE');
  const cal = C.calendarFor(catalog, item);
  if (cal?.mode === 'fixed' || pick(item.dates, L)) return onAvailability(st);
  return onField(st, 'DATE', 'bestTime', '🌤️', 'Les départs se font à la date de votre choix pour', 'Departures are on the date of your choice for', 'الانطلاق في التاريخ اللي تختارو لـ');
}

function onPayment(st) {
  const { L } = st;
  const methods = [
    tr(L, 'virement bancaire', 'bank transfer', 'تحويل بنكي'),
    'PayPal',
    tr(L, 'espèces à l’arrivée (EUR/DZD)', 'cash on arrival (EUR/DZD)', 'نقداً عند الوصول (EUR/DZD)'),
    ...(CARD_PAYMENT_ENABLED ? [tr(L, 'carte bancaire', 'bank card', 'بطاقة بنكية')] : []),
  ];
  const text = tr(
    L,
    `💳 Moyens de paiement : ${methods.join(', ')}.\nVous pouvez aussi envoyer une demande sans payer tout de suite : notre équipe confirme d’abord la disponibilité.`,
    `💳 Payment methods: ${methods.join(', ')}.\nYou can also send a request without paying now: our team confirms availability first.`,
    `💳 طرق الدفع: ${methods.join('، ')}.\nتقدر تبعث طلب بلا ما تخلص دركا: فريقنا يأكد التوفر أولاً.`
  );
  return out(st, 'PAYMENT', text, sugg(L, 'book', 'prices', 'human'));
}

function onContact(st, intent = 'CONTACT') {
  const { L } = st;
  const text = `${tr(L, 'Vous pouvez nous joindre 7j/7 :', 'You can reach us 7 days a week:', 'تقدر تتواصل معانا 7/7:')}\n${R.contactBlock(L)}\n📍 ${R.CONTACT.address}`;
  return out(st, intent, text, sugg(L, 'human', 'book'), { links: [{ label: 'WhatsApp', url: `https://wa.me/${R.CONTACT.whatsapp}` }] });
}

function onLocation(st) {
  if (st.ents[0]?.item) return onSummary(st, 'LOCATION');
  return onContact(st, 'LOCATION');
}

function onCancellation(st) {
  const { L } = st;
  const text = tr(
    L,
    'Les conditions d’annulation et de modification dépendent de l’offre ; elles vous sont précisées par notre équipe avec la confirmation de réservation. Pour annuler ou modifier une réservation existante, un conseiller doit traiter votre demande.',
    'Cancellation and change conditions depend on the offer; our team specifies them with the booking confirmation. To cancel or change an existing booking, an advisor needs to handle your request.',
    'شروط الإلغاء والتعديل تختلف حسب العرض، ويوضحها فريقنا مع تأكيد الحجز. لإلغاء أو تعديل حجز موجود لازم مستشار يعالج طلبك.'
  );
  return offerContact(st, 'CANCELLATION', text, 'Annulation / modification de réservation');
}

/* ── Conseiller humain ── */

async function startContact(st, note) {
  const { c, L } = st;
  c.humanRequested = true;
  st.flags.human = true;
  c.booking = null;
  const head = tr(L, 'Bien sûr 👤 Je transmets votre demande à un conseiller d’Algeria Travel.', 'Of course 👤 I’m forwarding your request to an Algeria Travel advisor.', 'أكيد 👤 راني نبعث طلبك لمستشار من Algeria Travel.');
  const links = [{ label: 'WhatsApp', url: `https://wa.me/${R.CONTACT.whatsapp}` }];
  if (c.profile.phone || c.profile.email) return submitContact(st, note, head);
  c.pending = { slot: 'contact_phone', note: note || null };
  const text = `${head}\n${tr(L, 'Vous pouvez aussi nous joindre directement :', 'You can also reach us directly:', 'تقدر تتواصل معانا مباشرة:')}\n${R.contactBlock(L)}\n\n${tr(L, 'Pour être rappelé, laissez-moi votre numéro de téléphone (ou votre email).', 'To be called back, leave me your phone number (or email).', 'باش نعاودو نتصلو بيك، خليلي رقم هاتفك (ولا الإيميل).')}`;
  return out(st, 'HUMAN_AGENT', text, sugg(L, 'skip'), { links });
}

async function submitContact(st, note, head = '') {
  const { c, L } = st;
  c.pending = null;
  let ref = null;
  try {
    const res = await st.actions.createContactRequest?.({
      name: c.profile.name || null,
      phone: c.profile.phone || null,
      email: c.profile.email || null,
      note: note || null,
      context: summaryForTeam(st),
    });
    ref = res?.reference || null;
  } catch (err) {
    console.warn('[Chatbot] demande de contact :', err.message);
  }
  const who = c.profile.phone || c.profile.email;
  const body = ref
    ? tr(L, `✅ C’est transmis (réf. ${ref}). Un conseiller vous recontacte rapidement au ${who}.`, `✅ Done (ref. ${ref}). An advisor will contact you shortly at ${who}.`, `✅ تم الإرسال (المرجع ${ref}). مستشار يتصل بيك قريباً على ${who}.`)
    : tr(L, `Je n’ai pas pu enregistrer votre demande. Merci de nous contacter directement :\n${R.contactBlock(L)}`, `I couldn’t save your request. Please contact us directly:\n${R.contactBlock(L)}`, `ما قدرتش نسجل طلبك. تواصل معانا مباشرة:\n${R.contactBlock(L)}`);
  return out(st, 'HUMAN_AGENT', [head, body].filter(Boolean).join('\n'), sugg(L, 'prices', 'destinations'), { links: [{ label: 'WhatsApp', url: `https://wa.me/${R.CONTACT.whatsapp}` }] });
}

function summaryForTeam(st) {
  const { c } = st;
  const item = st.topic();
  return {
    offer: item ? nameOf(item, 'fr') : null,
    offerKey: item?.key || null,
    dates: c.dates ? R.datesLabel(c.dates, 'fr') : null,
    persons: c.persons || null,
    rooms: c.rooms || null,
    language: c.lang,
  };
}

/* ── Réservation (collecte progressive) ── */

function startBooking(st, prefix = '') {
  const { c } = st;
  c.booking = { active: true, emailAsked: Boolean(c.profile.email), notesAsked: false, closedWarned: false };
  c.pending = null;
  return nextBookingStep(st, prefix);
}

function bookingItem(st) {
  const item = st.topic();
  if (!item) return null;
  if (item.kind === 'place' && offerList(st.catalog, item)[0] !== item) return null;
  return item;
}

async function nextBookingStep(st, prefix = '') {
  const { c, catalog, L } = st;
  const say = (text, suggestions = [], intent = 'BOOKING') => out(st, intent, [prefix, text].filter(Boolean).join('\n'), suggestions);
  const item = bookingItem(st);

  if (!item || (isStayCategory(c.category) && item.kind === 'place')) {
    const topic = st.topic();
    if (isStayCategory(c.category)) {
      const r = onStays(st, 'BOOKING');
      return { ...r, reply: [prefix, r.reply].filter(Boolean).join('\n') };
    }
    if (topic?.kind === 'place') {
      const r = askChoose(st, offerList(catalog, topic), 'BOOKING_NEXT', tr(L, `Quelle formule pour ${nameOf(topic, L)} ?`, `Which package for ${nameOf(topic, L)}?`, `أي عرض في ${nameOf(topic, L)}؟`));
      return { ...r, reply: [prefix, r.reply].filter(Boolean).join('\n') };
    }
    const inMonth = c.dates?.month ? offersInMonth(catalog, c.dates.month, c.dates.year).slice(0, MAX_LIST) : [];
    const others = topOffers(catalog).filter((t) => !inMonth.includes(t)).slice(0, MAX_LIST - inMonth.length);
    const list = [...inMonth, ...others];
    c.pending = { slot: 'choose', options: list.map((i) => i.key), then: 'BOOKING_NEXT' };
    const lines = (items, start) => items.map((i, n) => `${start + n + 1}. ${R.listLine(i, L).slice(2)}`).join('\n');
    const month = c.dates?.month ? R.monthName(c.dates.month, L) : '';
    let text;
    if (inMonth.length) {
      text = `${tr(L, `Avec plaisir 📝 Départs prévus en ${month} :`, `With pleasure 📝 Departures planned in ${month}:`, `بكل سرور 📝 الرحلات المبرمجة في ${month}:`)}\n${lines(inMonth, 0)}`;
      if (others.length) text += `\n\n${tr(L, 'Ces offres se réservent à la date de votre choix :', 'These offers can be booked on the date of your choice:', 'هذي العروض تتحجز في التاريخ اللي تختارو:')}\n${lines(others, inMonth.length)}`;
      text += `\n\n${tr(L, 'Laquelle vous intéresse ?', 'Which one interests you?', 'أي واحد يهمك؟')}`;
    } else {
      text = `${tr(L, 'Avec plaisir 📝 Quelle destination ou quelle offre souhaitez-vous réserver ?', 'With pleasure 📝 Which destination or offer would you like to book?', 'بكل سرور 📝 واش هي الوجهة ولا العرض اللي تحب تحجز؟')}\n${lines(list, 0)}`;
    }
    return out(st, 'BOOKING', [prefix, text].filter(Boolean).join('\n'), [...list.map((i) => option(nameOf(i, L))), ...sugg(L, 'human')]);
  }

  const name = nameOf(item, L);
  if (C.bookingOpenFor(catalog, item) === false && !c.booking.closedWarned) {
    c.booking.closedWarned = true;
    prefix = [prefix, tr(L, `ℹ️ Les réservations en ligne pour « ${name} » sont fermées pour le moment : je transmets votre demande à notre équipe, qui vous recontactera.`, `ℹ️ Online bookings for “${name}” are currently closed: I’ll forward your request to our team, who will get back to you.`, `ℹ️ الحجز عبر الإنترنت لـ « ${name} » مغلق حالياً: نبعث طلبك لفريقنا ويعاودو يتصلو بيك.`)].filter(Boolean).join('\n');
  }

  const cal = C.calendarFor(catalog, item);
  const periods = fixedPeriods(catalog, item) || [];
  const hasDates = c.dates?.start || c.dates?.label;
  if (!hasDates) {
    if (periods.length) {
      c.pending = { slot: 'period', periods: periods.slice(0, MAX_LIST) };
      const month = c.dates?.month;
      const inMonth = month ? periods.filter((p) => Number(p.start.slice(5, 7)) === month) : periods;
      const note = month && !inMonth.length ? tr(L, `Pas de départ en ${R.monthName(month, L)}. `, `No departure in ${R.monthName(month, L)}. `, `ما كاين حتى انطلاق في ${R.monthName(month, L)}. `) : '';
      return say(`${note}${tr(L, `📅 Dates ouvertes pour « ${name} » — laquelle choisissez-vous ?`, `📅 Open dates for “${name}” — which one?`, `📅 التواريخ المفتوحة لـ « ${name} » — أي واحد تختار؟`)}`, c.pending.periods.map((p) => option(R.fmtRange(p.start, p.end, L))));
    }
    if (pick(item.dates, L)) {
      c.pending = { slot: 'fixed_dates' };
      return say(tr(L, `📅 « ${name} » part à date fixe : ${pick(item.dates, L)}. Ces dates vous conviennent ?`, `📅 “${name}” runs on fixed dates: ${pick(item.dates, L)}. Do these dates suit you?`, `📅 « ${name} » بتاريخ ثابت: ${pick(item.dates, L)}. يناسبوك؟`), sugg(L, 'yes', 'no'));
    }
    c.pending = { slot: 'dates' };
    const q = c.dates?.month
      ? tr(L, `Quelles dates exactes en ${R.monthName(c.dates.month, L)} ? (ex. du 12 au 18)`, `Which exact dates in ${R.monthName(c.dates.month, L)}? (e.g. 12 to 18)`, `أي تواريخ بالضبط في ${R.monthName(c.dates.month, L)}؟ (مثلاً من 12 إلى 18)`)
      : tr(L, `📅 Pour « ${name} », quelles dates souhaitez-vous ? (ex. du 12 au 18 décembre)`, `📅 For “${name}”, which dates would you like? (e.g. 12 to 18 December)`, `📅 لـ « ${name} »، أي تواريخ تحب؟ (مثلاً من 12 إلى 18 ديسمبر)`);
    return say(q);
  }
  if (c.dates?.start && periods.length && !periods.some((p) => inPeriod(c.dates.start, p))) {
    c.dates = null;
    c.pending = { slot: 'period', periods: periods.slice(0, MAX_LIST) };
    return say(tr(L, `Cette date n’est pas ouverte pour « ${name} ». Dates disponibles :`, `This date is not open for “${name}”. Available dates:`, `هذا التاريخ ماشي مفتوح لـ « ${name} ». التواريخ المتاحة:`), c.pending.periods.map((p) => option(R.fmtRange(p.start, p.end, L))));
  }
  const blocked = c.dates?.start && cal?.blocked?.find((p) => inPeriod(c.dates.start, p));
  if (blocked) {
    c.dates = null;
    c.pending = { slot: 'dates' };
    return say(tr(L, `Les réservations sont fermées ${R.fmtRange(blocked.start, blocked.end, L)}. Quelle autre date ?`, `Bookings are closed ${R.fmtRange(blocked.start, blocked.end, L)}. Which other date?`, `الحجز مغلق ${R.fmtRange(blocked.start, blocked.end, L)}. أي تاريخ آخر؟`));
  }
  if (item.kind === 'stay' && c.dates?.start && !c.dates.end) {
    c.pending = { slot: 'dates_end' };
    return say(tr(L, `Arrivée le ${R.fmtDate(c.dates.start, L)} — et la date de départ (ou le nombre de nuits) ?`, `Check-in ${R.fmtDate(c.dates.start, L)} — and the check-out date (or number of nights)?`, `الوصول ${R.fmtDate(c.dates.start, L)} — وتاريخ المغادرة (ولا عدد الليالي)؟`));
  }
  if (!c.persons) {
    c.pending = { slot: 'persons' };
    return say(tr(L, '👥 Pour combien de personnes ?', '👥 For how many people?', '👥 لكم من شخص؟'), ['1', '2', '3', '4', '5', '6'].map((n) => option(n)));
  }
  if (item.kind === 'stay' && !c.rooms) {
    c.pending = { slot: 'rooms' };
    return say(tr(L, '🛏️ Combien de chambres ?', '🛏️ How many rooms?', '🛏️ كم من غرفة؟'), ['1', '2', '3'].map((n) => option(n)));
  }
  if (!c.profile.name) {
    c.pending = { slot: 'name' };
    return say(tr(L, '🙂 À quel nom dois-je enregistrer la demande ?', '🙂 What name should I put on the request?', '🙂 باسم من نسجل الطلب؟'));
  }
  if (!c.profile.phone) {
    c.pending = { slot: 'phone' };
    return say(tr(L, `📞 Merci ${c.profile.name} ! Votre numéro de téléphone (WhatsApp de préférence) ?`, `📞 Thanks ${c.profile.name}! Your phone number (WhatsApp preferably)?`, `📞 شكراً ${c.profile.name}! رقم هاتفك (واتساب من الأفضل)؟`));
  }
  if (!c.profile.email && !c.booking.emailAsked) {
    c.booking.emailAsked = true;
    c.pending = { slot: 'email' };
    return say(tr(L, '✉️ Votre email ? (facultatif)', '✉️ Your email? (optional)', '✉️ الإيميل تاعك؟ (اختياري)'), sugg(L, 'skip'));
  }
  if (!c.booking.notesAsked) {
    c.booking.notesAsked = true;
    c.pending = { slot: 'notes' };
    return say(tr(L, '💬 Une demande particulière ? (régime, chambre, transfert…)', '💬 Any special request? (diet, room, transfer…)', '💬 عندك طلب خاص؟ (أكل، غرفة، نقل…)'), sugg(L, 'none'));
  }
  c.pending = { slot: 'confirm' };
  return say(recapText(st, item), sugg(L, 'confirm', 'modify'));
}

function recapText(st, item) {
  const { c, L } = st;
  const row = (label, value) => `• ${label}${L === 'fr' ? ' : ' : ': '}${value}`;
  const lines = [
    tr(L, '📝 Récapitulatif de votre demande :', '📝 Summary of your request:', '📝 ملخص طلبك:'),
    row(tr(L, 'Offre', 'Offer', 'العرض'), nameOf(item, L)),
    row(tr(L, 'Dates', 'Dates', 'التواريخ'), R.datesLabel(c.dates, L)),
    row(tr(L, 'Voyageurs', 'Travellers', 'المسافرين'), R.personsLabel(c.persons, L)),
  ];
  if (c.rooms) lines.push(row(tr(L, 'Chambres', 'Rooms', 'الغرف'), c.rooms));
  lines.push(row(tr(L, 'Nom', 'Name', 'الاسم'), c.profile.name));
  lines.push(row(tr(L, 'Téléphone', 'Phone', 'الهاتف'), c.profile.phone));
  if (c.profile.email) lines.push(row('Email', c.profile.email));
  if (c.notes) lines.push(row(tr(L, 'Demande', 'Request', 'طلب'), c.notes));
  const price = R.priceText(item, L);
  if (price) {
    let p = row(tr(L, 'Prix indicatif', 'Indicative price', 'السعر التقريبي'), price);
    if (item.perPerson && item.price && c.persons) p += ` (≈ ${R.money(item.price * c.persons, L)})`;
    lines.push(p);
  }
  lines.push('', tr(L, 'Tout est correct ?', 'Is everything correct?', 'كلش صحيح؟'));
  return lines.join('\n');
}

async function submitBooking(st) {
  const { c, L } = st;
  const item = bookingItem(st);
  c.pending = null;
  let res = null;
  try {
    res = await st.actions.createBookingRequest?.({
      itemKey: item.key,
      itemType: item.kind,
      itemId: item.id,
      itemName: nameOf(item, 'fr'),
      placeId: item.placeId || null,
      pkg: item.pkg || null,
      startDate: c.dates?.start || null,
      endDate: c.dates?.end || null,
      datesLabel: R.datesLabel(c.dates, 'fr') || null,
      persons: c.persons,
      rooms: c.rooms || null,
      name: c.profile.name,
      phone: c.profile.phone,
      email: c.profile.email || null,
      notes: c.notes || null,
      unitPrice: item.price || null,
      language: c.lang,
    });
  } catch (err) {
    console.warn('[Chatbot] demande de réservation :', err.message);
  }
  c.booking = null;
  c.notes = null;
  if (!res?.reference) {
    return out(st, 'BOOKING', tr(L, `Je n’ai pas pu enregistrer votre demande. Merci de nous contacter directement :\n${R.contactBlock(L)}`, `I couldn’t save your request. Please contact us directly:\n${R.contactBlock(L)}`, `ما قدرتش نسجل طلبك. تواصل معانا مباشرة:\n${R.contactBlock(L)}`), sugg(L, 'human'));
  }
  const text = tr(
    L,
    `✅ Votre demande est enregistrée (réf. ${res.reference}).\n⚠️ Ce n’est pas encore une réservation confirmée : notre équipe vérifie la disponibilité et le prix, puis vous contacte au ${c.profile.phone} pour confirmer.`,
    `✅ Your request is saved (ref. ${res.reference}).\n⚠️ This is not a confirmed booking yet: our team checks availability and price, then contacts you at ${c.profile.phone} to confirm.`,
    `✅ طلبك تسجل (المرجع ${res.reference}).\n⚠️ هذا مازال ماشي حجز مؤكد: فريقنا يتحقق من التوفر والسعر ويتصل بيك على ${c.profile.phone} للتأكيد.`
  );
  return out(st, 'BOOKING', text, sugg(L, 'payment', 'contactInfo', 'destinations'));
}

const MODIFY_FIELDS = [
  { key: 'dates', re: /date|jour|day|تاريخ|وقت/, clear: (c) => { c.dates = null; } },
  { key: 'persons', re: /personne|voyageur|people|traveller|nombre|الاشخاص|اشخاص|شخص/, clear: (c) => { c.persons = null; } },
  { key: 'rooms', re: /chambre|room|غرف/, clear: (c) => { c.rooms = null; } },
  { key: 'offer', re: /offre|circuit|destination|hotel|formule|offer|tour|عرض|رحله/, clear: (c) => { c.topicKey = null; c.dates = null; } },
  { key: 'name', re: /nom|name|اسم/, clear: (c) => { c.profile.name = null; } },
  { key: 'phone', re: /tel|phone|numero|رقم|هاتف/, clear: (c) => { c.profile.phone = null; } },
  { key: 'email', re: /email|mail|ايميل/, clear: (c, b) => { c.profile.email = null; if (b) b.emailAsked = false; } },
  { key: 'notes', re: /demande|request|special|طلب/, clear: (c, b) => { c.notes = null; if (b) b.notesAsked = false; } },
];

function modifyMenu(st) {
  const { c, L } = st;
  c.pending = { slot: 'modify' };
  const labels = [
    tr(L, 'Dates', 'Dates', 'التاريخ'),
    tr(L, 'Personnes', 'People', 'الأشخاص'),
    tr(L, 'Offre', 'Offer', 'العرض'),
    tr(L, 'Nom', 'Name', 'الاسم'),
    tr(L, 'Téléphone', 'Phone', 'الهاتف'),
    'Email',
    tr(L, 'Demande spéciale', 'Special request', 'طلب خاص'),
  ];
  return out(st, 'BOOKING', tr(L, '✏️ Que souhaitez-vous modifier ?', '✏️ What would you like to change?', '✏️ واش تحب تبدل؟'), labels.map((label) => option(label)));
}

/* ── Réponses aux questions en attente ── */

async function handlePending(st) {
  const { c, a, catalog, L } = st;
  const p = c.pending;
  if (!p) return null;
  const strong = ['HUMAN_AGENT', 'PRICE', 'PAYMENT', 'CANCELLATION', 'CONTACT', 'LOCATION', 'PROGRAM'].some((k) => a.intents[k]);

  switch (p.slot) {
    case 'choose': {
      const opts = p.options.map((k) => catalog.byKey.get(k)).filter(Boolean);
      const text = a.text;
      let chosen = opts.find((o) => ['fr', 'en', 'ar'].some((l) => canonical(pick(o.name, l)) === text));
      if (!chosen) {
        for (const e of st.ents) {
          chosen = opts.find((o) => o.key === e.item.key) || (e.item.kind === 'place' ? opts.find((o) => o.placeId === e.item.id && opts.filter((x) => x.placeId === e.item.id).length === 1) : null);
          if (chosen) break;
        }
      }
      if (!chosen && /^\d$/.test(text)) chosen = opts[Number(text) - 1];
      if (!chosen && opts.length === 1 && a.yes) [chosen] = opts;
      if (!chosen && a.tokens.length && a.tokens.length <= 4) {
        const hits = opts.filter((o) => ['fr', 'en', 'ar'].some((l) => {
          const nameTokens = tokenize(canonical(pick(o.name, l)));
          return a.tokens.every((t) => t.length >= 3 && nameTokens.includes(t));
        }));
        if (hits.length === 1) [chosen] = hits;
      }
      if (!chosen) return null;
      c.topicKey = chosen.key;
      c.placeId = chosen.placeId || (chosen.kind === 'place' ? chosen.id : c.placeId);
      if (chosen.kind === 'stay') c.category = ['apartment', 'villa'].includes(chosen.stayType) ? 'apartment' : 'hotel';
      c.pending = null;
      const asked = ACTION_ORDER.find((k) => a.intents[k] && !['TOUR', 'DESTINATION', 'HOTEL', 'APARTMENT', 'ACTIVITY', 'GENERAL_INFORMATION'].includes(k));
      return route(st, asked || p.then);
    }
    case 'period': {
      const periods = p.periods || [];
      let chosen = null;
      if (a.dates?.start) chosen = periods.find((x) => inPeriod(a.dates.start, x));
      if (!chosen) chosen = periods.find((x) => canonical(R.fmtRange(x.start, x.end, L)) === a.text);
      if (!chosen && /^\d$/.test(a.text)) chosen = periods[Number(a.text) - 1];
      if (!chosen && periods.length === 1 && a.yes) [chosen] = periods;
      if (!chosen) return null;
      c.dates = { start: chosen.start, end: chosen.end, month: Number(chosen.start.slice(5, 7)), year: Number(chosen.start.slice(0, 4)) };
      c.pending = null;
      return nextBookingStep(st);
    }
    case 'fixed_dates': {
      const item = bookingItem(st);
      if (a.yes && item) {
        c.dates = { label: item.dates };
        c.pending = null;
        return nextBookingStep(st);
      }
      if (a.no) {
        c.pending = { slot: 'dates' };
        return out(st, 'BOOKING', tr(L, 'D’accord. Quelles dates souhaitez-vous ? Notre équipe vérifiera si un départ est possible.', 'OK. Which dates would you like? Our team will check whether a departure is possible.', 'مليح. أي تواريخ تحب؟ فريقنا يشوف إذا ممكن.'));
      }
      return null;
    }
    case 'dates':
    case 'dates_end':
      if (st.got.dates) {
        c.pending = null;
        return nextBookingStep(st);
      }
      return null;
    case 'persons':
      if (st.got.persons) {
        c.pending = null;
        return nextBookingStep(st);
      }
      return null;
    case 'rooms':
      if (st.got.rooms) {
        c.pending = null;
        return nextBookingStep(st);
      }
      return null;
    case 'name': {
      if (strong || a.yes || a.no || st.ents.some((e) => e.exact)) return null;
      const name = parseName(a.raw);
      if (!name) return null;
      c.profile.name = name.slice(0, 80);
      c.pending = null;
      return nextBookingStep(st);
    }
    case 'phone':
      if (st.got.phone) {
        c.pending = null;
        return nextBookingStep(st);
      }
      if (/\d{4,}/.test(a.raw.replace(/\s/g, ''))) {
        return out(st, 'BOOKING', tr(L, 'Ce numéro ne semble pas valide 🤔 Exemple : +213 555 12 34 56', 'This number doesn’t look valid 🤔 Example: +213 555 12 34 56', 'الرقم هذا ماشي صحيح 🤔 مثال: 213 555 12 34 56+'));
      }
      return null;
    case 'email':
      if (st.got.email || a.no) {
        c.pending = null;
        return nextBookingStep(st);
      }
      if (a.raw.includes('@')) return out(st, 'BOOKING', tr(L, 'Cet email ne semble pas valide. Réessayez, ou « passer ».', 'This email doesn’t look valid. Try again, or “skip”.', 'الإيميل هذا ماشي صحيح. عاود ولا « تخطي ».'), sugg(L, 'skip'));
      return null;
    case 'notes':
      if (strong) return null;
      c.notes = a.no ? null : a.raw.trim().slice(0, 500);
      c.pending = null;
      return nextBookingStep(st);
    case 'confirm':
      if (a.modify) return modifyMenu(st);
      if (a.yes) return submitBooking(st);
      if (a.no) return modifyMenu(st);
      return null;
    case 'modify': {
      const field = MODIFY_FIELDS.find((f) => f.re.test(a.text));
      if (!field) return null;
      field.clear(c, c.booking);
      c.pending = null;
      if (!c.booking) c.booking = { active: true, emailAsked: true, notesAsked: true };
      return nextBookingStep(st);
    }
    case 'offer_booking':
      if (a.yes) return startBooking(st);
      if (a.no) {
        c.pending = null;
        return menu(st, 'GENERAL_INFORMATION', tr(L, 'D’accord 🙂 Puis-je vous aider pour autre chose ?', 'OK 🙂 Can I help with anything else?', 'مليح 🙂 نقدر نعاونك في حاجة أخرى؟'));
      }
      return null;
    case 'offer_contact':
      if (a.yes) return startContact(st, p.note);
      if (a.no) {
        c.pending = null;
        return menu(st, 'GENERAL_INFORMATION', tr(L, 'D’accord 🙂 Puis-je vous aider pour autre chose ?', 'OK 🙂 Can I help with anything else?', 'مليح 🙂 نقدر نعاونك في حاجة أخرى؟'));
      }
      return null;
    case 'contact_phone':
      if (st.got.phone || st.got.email) return submitContact(st, p.note);
      if (a.no) {
        c.pending = null;
        return out(st, 'HUMAN_AGENT', tr(L, `D’accord. Votre demande est signalée à l’équipe ; vous pouvez aussi nous écrire directement :\n${R.contactBlock(L)}`, `OK. Your request has been flagged to the team; you can also write to us directly:\n${R.contactBlock(L)}`, `مليح. طلبك وصل للفريق؛ تقدر تكتبلنا مباشرة:\n${R.contactBlock(L)}`), sugg(L, 'prices', 'destinations'), { links: [{ label: 'WhatsApp', url: `https://wa.me/${R.CONTACT.whatsapp}` }] });
      }
      return null;
    case 'avail_dates':
      if (st.got.dates) {
        c.pending = null;
        return onAvailability(st);
      }
      return null;
    default:
      return null;
  }
}

/* ── Routage ── */

const ACTION_ORDER = [
  'HUMAN_AGENT', 'CANCELLATION', 'BOOKING', 'PRICE', 'AVAILABILITY', 'PROGRAM', 'DURATION', 'DATE', 'TRANSPORT',
  'PAYMENT', 'LOCATION', 'CONTACT', 'APARTMENT', 'HOTEL', 'ACTIVITY', 'TOUR', 'DESTINATION', 'GENERAL_INFORMATION',
];

async function route(st, intent) {
  const { L } = st;
  switch (intent) {
    case 'HUMAN_AGENT':
      return startContact(st, `Demande de conseiller : « ${st.a.raw.slice(0, 200)} »`);
    case 'CANCELLATION':
      return onCancellation(st);
    case 'BOOKING':
      return startBooking(st);
    case 'BOOKING_NEXT':
      if (!st.c.booking) st.c.booking = { active: true, emailAsked: Boolean(st.c.profile.email), notesAsked: false };
      return nextBookingStep(st);
    case 'PRICE':
      return onPrice(st);
    case 'AVAILABILITY':
      return onAvailability(st);
    case 'PROGRAM':
      return onProgram(st);
    case 'DURATION':
      return onField(st, 'DURATION', 'duration', '🕒', 'La durée n’est pas précisée pour', 'The duration is not specified for', 'المدة غير محددة لـ');
    case 'DATE':
      return onDate(st);
    case 'TRANSPORT':
      return onField(st, 'TRANSPORT', 'transport', '🚐', 'Le transport n’est pas précisé pour', 'Transport is not specified for', 'النقل غير محدد لـ');
    case 'PAYMENT':
      return onPayment(st);
    case 'LOCATION':
      return onLocation(st);
    case 'CONTACT':
      return onContact(st);
    case 'APARTMENT':
    case 'HOTEL':
      return onStays(st, intent);
    case 'ACTIVITY':
      if (st.topic()?.kind === 'activity' && st.ents.some((e) => e.item.kind === 'activity')) return onSummary(st, 'ACTIVITY');
      return onActivities(st, 'ACTIVITY');
    case 'TOUR':
    case 'DESTINATION':
      return st.topic() ? onSummary(st, intent) : onDestinations(st, intent);
    case 'SUMMARY':
      return onSummary(st, 'TOUR');
    case 'GENERAL_INFORMATION':
      return menu(st, intent, tr(L, 'Je peux vous renseigner sur :', 'I can help you with:', 'نقدر نعاونك في:'));
    default:
      return null;
  }
}

function fallback(st) {
  const { c, L } = st;
  c.fallbacks += 1;
  if (c.fallbacks > MAX_FALLBACKS) {
    c.fallbacks = 0;
    return offerContact(st, 'FALLBACK', tr(L, 'Je ne suis pas sûr de bien comprendre votre demande 🙏', 'I’m not sure I understand your request 🙏', 'ما فهمتش مليح طلبك 🙏'), `Question non comprise : « ${st.a.raw.slice(0, 200)} »`);
  }
  return menu(st, 'FALLBACK', tr(L, 'Je n’ai pas bien saisi 🙂 Vous cherchez plutôt :', 'I didn’t quite get that 🙂 Are you looking for:', 'ما فهمتش مليح 🙂 راك تحوس على:'));
}

/**
 * Traite un message client.
 * @param {object} params
 * @param {object} params.context  contexte précédent (ou null)
 * @param {string} params.message
 * @param {string} [params.language]  langue préférée de l’interface
 * @param {object} [params.actions]  { createBookingRequest, createContactRequest, classify }
 * @returns {Promise<{ reply, intent, suggestions, links, flags, context }>}
 */
async function handleMessage({ context, message, language, actions = {} }) {
  const catalog = await C.getCatalog();
  const c = { ...freshContext(['fr', 'en', 'ar'].includes(language) ? language : 'fr'), ...(context || {}) };
  c.profile = { ...(c.profile || {}) };
  const a = analyze(message, { expecting: c.pending?.slot, context: c.dates || {} });
  if (a.lang && (a.lang === 'ar' || a.tokens.length >= 2 || !context)) c.lang = a.lang;

  const st = {
    c,
    a,
    catalog,
    actions,
    flags: {},
    got: {},
    ents: C.findEntities(catalog, message),
    get L() {
      return c.lang;
    },
    topic: () => (c.topicKey ? catalog.byKey.get(c.topicKey) || null : null),
  };

  const msgCategory = categoryFrom(a);
  if (msgCategory) {
    const topic = st.topic();
    const topicFits = !topic || topic.kind === 'place'
      || (isStayCategory(msgCategory) ? topic.kind === 'stay' || (msgCategory !== 'apartment' && ['hotel', 'guesthouse'].includes(topic.pkg)) : msgCategory === 'activity' ? topic.kind === 'activity' : topic.kind === 'tour');
    if (!topicFits && !st.ents.length) {
      c.topicKey = null;
      c.placeId = null;
    }
    c.category = msgCategory;
  } else if (st.ents.length || a.intents.BOOKING) {
    if (!(a.intents.BOOKING && st.topic()?.kind === 'stay')) c.category = null;
  }
  absorbDetails(st);

  let result = null;
  const pendingBefore = c.pending;
  if (pendingBefore) result = await handlePending(st);

  if (!result) {
    if (st.ents.length) applyEntity(st, st.ents[0].item);
    const intents = Object.keys(a.intents);
    let action = ACTION_ORDER.find((k) => intents.includes(k));
    if (action === 'HOTEL' || action === 'APARTMENT') {
      if (a.intents.BOOKING) action = 'BOOKING';
    }

    if (!action && !intents.length && actions.classify && !st.ents.length && !a.yes && !a.no && !Object.keys(st.got).length) {
      const guess = await actions.classify(message, c.lang).catch(() => null);
      if (guess?.intent && ACTION_ORDER.includes(guess.intent)) {
        action = guess.intent;
        if (guess.destination) {
          const e = C.findEntities(catalog, guess.destination)[0];
          if (e) applyEntity(st, e.item);
        }
      }
    }

    if (action) {
      if (c.booking?.active && ['HOTEL', 'APARTMENT', 'TOUR', 'DESTINATION', 'ACTIVITY'].includes(action) && st.ents.length) {
        result = await nextBookingStep(st);
      } else {
        result = await route(st, action);
      }
    } else if (c.booking?.active && (Object.keys(st.got).length || st.ents.length)) {
      result = await nextBookingStep(st, st.got.persons || st.got.dates ? tr(st.L, 'Noté 👍', 'Got it 👍', 'تمام 👍') : '');
    } else if (st.ents.length) {
      result = c.booking?.active ? await nextBookingStep(st) : onSummary(st, 'TOUR');
    } else if (a.intents.GREETING) {
      c.pending = null;
      result = menu(st, 'GREETING', R.welcome(st.L));
    } else if (a.intents.THANKS) {
      result = out(st, 'THANKS', tr(st.L, 'Avec plaisir 😊 N’hésitez pas si vous avez d’autres questions.', 'You’re welcome 😊 Feel free to ask anything else.', 'بكل سرور 😊 إذا عندك أسئلة أخرى راني هنا.'), sugg(st.L, 'book', 'destinations', 'human'));
    } else if (a.intents.GOODBYE) {
      c.pending = null;
      result = out(st, 'GOODBYE', tr(st.L, 'Au revoir et à bientôt avec Algeria Travel 👋', 'Goodbye, see you soon with Algeria Travel 👋', 'مع السلامة، نتلاقاو قريب مع Algeria Travel 👋'), []);
    } else if (Object.keys(st.got).length) {
      const parts = [];
      if (st.got.persons) parts.push(R.personsLabel(c.persons, st.L));
      if (st.got.dates) parts.push(R.datesLabel(c.dates, st.L));
      if (st.got.phone) parts.push(c.profile.phone);
      if (st.got.email) parts.push(c.profile.email);
      const noted = `${tr(st.L, 'Noté', 'Noted', 'تمام')} : ${parts.filter(Boolean).join(', ')} 👍`;
      const topic = st.topic();
      if (topic && st.got.dates) result = await onAvailability(st);
      else if (topic) result = offerBooking(st, 'BOOKING', noted);
      else if (st.got.dates && c.dates?.month) {
        const r = await onAvailability(st);
        result = { ...r, reply: `${noted}\n${r.reply}` };
      } else {
        result = askChoose(st, topOffers(catalog), 'SUMMARY', `${noted}\n${tr(st.L, 'Quelle destination vous intéresse ?', 'Which destination are you interested in?', 'أي وجهة تهمك؟')}`);
      }
    } else if (a.yes || a.no) {
      if (c.booking?.active && a.no && ['choose', 'period'].includes(pendingBefore?.slot)) {
        c.booking = null;
        c.pending = null;
        result = menu(st, 'BOOKING', tr(st.L, 'D’accord, je mets la demande de réservation de côté 🙂 Que puis-je faire pour vous ?', 'OK, I’ve put the booking request aside 🙂 What can I do for you?', 'مليح، حبست طلب الحجز 🙂 كيفاش نقدر نعاونك؟'));
      } else if (c.booking?.active) result = await nextBookingStep(st, a.yes ? tr(st.L, 'Très bien 👍', 'Great 👍', 'مليح 👍') : '');
      else if (a.yes && st.topic()) result = startBooking(st);
      else if (a.no) result = menu(st, 'GENERAL_INFORMATION', tr(st.L, 'D’accord 🙂 Que puis-je faire pour vous ?', 'OK 🙂 What can I do for you?', 'مليح 🙂 كيفاش نقدر نعاونك؟'));
      else result = menu(st, 'GENERAL_INFORMATION', tr(st.L, 'Très bien 🙂 Que puis-je faire pour vous ?', 'Alright 🙂 What can I do for you?', 'مليح 🙂 كيفاش نقدر نعاونك؟'));
    }

    if (result && c.booking?.active && pendingBefore && (!c.pending || c.pending === pendingBefore) && result.intent !== 'BOOKING') {
      const next = await nextBookingStep(st);
      result = { ...result, reply: `${result.reply}\n\n${tr(st.L, 'Pour continuer votre demande :', 'To continue your request:', 'باش نكملو الطلب:')}\n${next.reply}`, suggestions: next.suggestions };
    }
  }

  if (!result) {
    if (c.booking?.active && pendingBefore) {
      c.fallbacks += 1;
      const next = await nextBookingStep(st);
      result = c.fallbacks > MAX_FALLBACKS
        ? { ...next, reply: `${next.reply}\n\n${tr(st.L, 'Si vous préférez, un conseiller peut prendre le relais.', 'If you prefer, an advisor can take over.', 'إذا تحب، مستشار يكمل معاك.')}`, suggestions: [...next.suggestions, ...sugg(st.L, 'human')] }
        : { ...next, reply: `${tr(st.L, 'Je n’ai pas bien saisi 🙂', 'I didn’t quite get that 🙂', 'ما فهمتش مليح 🙂')}\n${next.reply}` };
    } else {
      result = fallback(st);
    }
  } else if (result.intent !== 'FALLBACK') {
    c.fallbacks = 0;
  }

  if (a.intents.GREETING && result.intent !== 'GREETING') {
    result.reply = `${tr(st.L, 'Bonjour 👋', 'Hello 👋', 'مرحبا 👋')} ${result.reply}`;
  }
  c.lastIntent = result.intent;
  return { ...result, flags: st.flags, context: c };
}

module.exports = { handleMessage, freshContext };
