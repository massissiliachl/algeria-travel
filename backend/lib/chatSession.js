/** Mémoire conversationnelle — contexte multi-messages */

function emptySession() {
  return {
    destination: null,
    accommodation: null,
    activity: null,
    interests: [],
    travelers: null,
    travelerType: null,
    days: null,
    nights: null,
    arrivalDay: null,
    departureDay: null,
    budgetLevel: null,
    budgetAmount: null,
    language: 'fr',
    lastIntent: null,
  };
}

function mergeSession(session = {}, entities = {}) {
  const next = { ...emptySession(), ...session };

  const scalarKeys = [
    'destination', 'accommodation', 'activity', 'travelers', 'travelerType',
    'days', 'nights', 'arrivalDay', 'departureDay', 'budgetLevel', 'budgetAmount',
  ];

  for (const key of scalarKeys) {
    if (key === 'days' || key === 'nights') continue;
    if (entities[key] != null && entities[key] !== '') {
      next[key] = entities[key];
    }
  }

  if (entities.nights != null && entities.nights !== '') {
    next.nights = entities.nights;
    if (entities.days == null) next.days = null;
  }
  if (entities.days != null && entities.days !== '') {
    next.days = entities.days;
    if (entities.nights == null && !entities.arrivalDay) next.nights = null;
  }
  if (entities.arrivalDay != null) next.arrivalDay = entities.arrivalDay;
  if (entities.departureDay != null) next.departureDay = entities.departureDay;

  if (entities.interests?.length) {
    next.interests = [...new Set([...(next.interests || []), ...entities.interests])];
  }

  return next;
}

function formatDestinationLabel(id, lang) {
  const names = {
    bejaia: { fr: 'Béjaïa', en: 'Bejaia', ar: 'بجاية' },
    alger: { fr: 'Alger', en: 'Algiers', ar: 'الجزائر' },
    oran: { fr: 'Oran', en: 'Oran', ar: 'وهران' },
    taghit: { fr: 'Taghit', en: 'Taghit', ar: 'تاغيت' },
    djanet: { fr: 'Djanet', en: 'Djanet', ar: 'جانت' },
    ghardaia: { fr: 'Ghardaïa', en: 'Ghardaia', ar: 'غرداية' },
    timimoun: { fr: 'Timimoun', en: 'Timimoun', ar: 'تيميمون' },
    constantine: { fr: 'Constantine', en: 'Constantine', ar: 'قسنطينة' },
    annaba: { fr: 'Annaba', en: 'Annaba', ar: 'عنابة' },
    jijel: { fr: 'Jijel', en: 'Jijel', ar: 'جijel' },
    hoggar: { fr: 'Hoggar', en: 'Hoggar', ar: 'الhoggar' },
    sahara: { fr: 'Sahara', en: 'Sahara', ar: 'الصحراء' },
    kabylie: { fr: 'Kabylie', en: 'Kabylia', ar: 'القبail' },
  };
  return names[id]?.[lang] || names[id]?.fr || id;
}

function buildRecap(session, lang) {
  const lines = [];
  const L = {
    fr: { title: '📋 Récapitulatif', dest: '📍 Destination', days: '📅 Durée', nights: '🌙 Nuits', travelers: '👥 Voyageurs', stay: '🏨 Hébergement', activity: '🎯 Activité', budget: '💰 Budget' },
    en: { title: '📋 Summary', dest: '📍 Destination', days: '📅 Duration', nights: '🌙 Nights', travelers: '👥 Travelers', stay: '🏨 Stay', activity: '🎯 Activity', budget: '💰 Budget' },
    ar: { title: '📋 ملخص', dest: '📍 الوجهة', days: '📅 المدة', nights: '🌙 الليالي', travelers: '👥 المسافرون', stay: '🏨 الإقامة', activity: '🎯 النشاط', budget: '💰 الم budget' },
  };
  const t = L[lang] || L.fr;

  if (session.destination) lines.push(`${t.dest} : ${formatDestinationLabel(session.destination, lang)}`);
  if (session.days) lines.push(`${t.days} : ${session.days} ${lang === 'en' ? 'days' : lang === 'ar' ? 'أيام' : 'jours'}`);
  if (session.nights != null) lines.push(`${t.nights} : ${session.nights}`);
  if (session.arrivalDay && session.departureDay) {
    lines.push(`📅 ${lang === 'en' ? 'Dates' : lang === 'ar' ? 'التواريخ' : 'Dates'} : ${session.arrivalDay} → ${session.departureDay}`);
  }
  if (session.travelers) lines.push(`${t.travelers} : ${session.travelers}`);
  if (session.travelerType === 'couple') lines.push(`${t.travelers} : ${lang === 'en' ? 'Couple' : lang === 'ar' ? 'زوجان' : 'Couple'}`);
  if (session.travelerType === 'family') lines.push(`${t.travelers} : ${lang === 'en' ? 'Family' : lang === 'ar' ? 'عائلة' : 'Famille'}`);
  if (session.accommodation) lines.push(`${t.stay} : ${session.accommodation}`);
  if (session.activity) lines.push(`${t.activity} : ${session.activity}`);
  if (session.budgetLevel) lines.push(`${t.budget} : ${session.budgetLevel}`);
  if (session.budgetAmount) lines.push(`${t.budget} : ${session.budgetAmount.toLocaleString()} DA`);

  if (lines.length === 0) return null;
  return `${t.title}\n${lines.join('\n')}`;
}

function getMissingForBooking(session) {
  const missing = [];
  if (!session.destination) missing.push('destination');
  if (!session.travelers && !session.travelerType) missing.push('travelers');
  if (session.nights == null && !session.days && !(session.arrivalDay && session.departureDay)) {
    missing.push('dates');
  }
  return missing;
}

function checkDateContradiction(session) {
  if (session.arrivalDay && session.departureDay && session.nights != null) {
    const computed = session.departureDay - session.arrivalDay;
    if (computed !== session.nights && computed > 0) {
      return { arrivalDay: session.arrivalDay, departureDay: session.departureDay, statedNights: session.nights, computedNights: computed };
    }
  }
  return null;
}

module.exports = {
  emptySession,
  mergeSession,
  formatDestinationLabel,
  buildRecap,
  getMissingForBooking,
  checkDateContradiction,
};
