const WHATSAPP = '213557664089';

const BASE = {
  fr: ['Voyage / circuits', 'Tarif Taghit', '✈️ Vol aller-retour Taghit', 'Réserver', 'Sahara', 'Activités quad'],
  en: ['Trips / tours', 'Taghit price', '✈️ Round-trip flight Taghit', 'Book', 'Sahara', 'Quad activities'],
  ar: ['الرحلات', 'سعر تاغيت', 'رحلة 23-28', 'حجز', 'الصحراء', 'أنشطة'],
};

const CONTEXT = {
  fr: {
    missingDestination: ['Béjaïa', 'Taghit', 'Oran', 'Sahara'],
    missingDates: ['3 jours', '5 nuits', 'Du 10 au 15'],
    missingTravelers: ['2 personnes', '4 personnes', 'Couple'],
    missingAccommodation: ['Hôtel', 'Appartement', 'Programme complet'],
    taghit: ['Tarif Taghit', '✈️ Vol aller-retour Taghit', 'Programme Taghit'],
    bejaia: ['Plages Béjaïa', 'Programme 3 jours', 'Hôtel Béjaïa'],
    sahara: ['Djanet', 'Ghardaïa', 'Taghit'],
    itinerary: ['Programme complet', 'Réserver', 'Contact'],
    transport: ['Alger → Béjaïa', 'Alger → Oran', 'Vol intérieur'],
  },
  en: {
    missingDestination: ['Bejaia', 'Taghit', 'Oran', 'Sahara'],
    missingDates: ['3 days', '5 nights', 'Oct 10–15'],
    missingTravelers: ['2 people', '4 people', 'Couple'],
    missingAccommodation: ['Hotel', 'Apartment', 'Full program'],
    taghit: ['Taghit price', '✈️ Round-trip flight Taghit', 'Taghit program'],
    bejaia: ['Bejaia beaches', '3-day plan', 'Bejaia hotel'],
    sahara: ['Djanet', 'Ghardaïa', 'Taghit'],
    itinerary: ['Full program', 'Book', 'Contact'],
    transport: ['Algiers → Bejaia', 'Algiers → Oran', 'Domestic flight'],
  },
  ar: {
    missingDestination: ['بجاية', 'تاغيت', 'وهران', 'الصحراء'],
    missingDates: ['3 أيام', '5 ليالي'],
    missingTravelers: ['شخصان', '4 أشخاص'],
    missingAccommodation: ['فندق', 'شقة', 'برنامج كامل'],
    taghit: ['سعر تاغيت', '✈️ الجزائر→بشار', 'برنامج تاغيت'],
    bejaia: ['شواطئ بجاية', 'برنامج 3 أيام'],
    sahara: ['جانت', 'غرداية', 'تاغيت'],
    itinerary: ['برنامج كامل', 'حجز', 'اتصل'],
    transport: ['الجزائر → بجاية', 'الجزائر → وهران'],
  },
};

function getSuggestions(lang = 'fr', session = {}, intent = null) {
  const base = BASE[lang] || BASE.fr;
  const ctx = CONTEXT[lang] || CONTEXT.fr;
  const chips = [];

  if (intent === 'DESTINATIONS_AVAILABILITY') {
    chips.push(
      lang === 'en' ? 'Taghit Oct 23–28' : lang === 'ar' ? 'تاغيت 23–28' : 'Taghit 23–28 oct.',
      lang === 'en' ? 'Taghit price' : lang === 'ar' ? 'سعر تاغيت' : 'Tarif Taghit',
      lang === 'en' ? 'Book' : lang === 'ar' ? 'حجز' : 'Réserver',
    );
  }
  if (intent === 'INFO_REQUEST' || intent === 'GREETING') {
    chips.push(
      lang === 'en' ? 'Destinations' : lang === 'ar' ? 'الوجهات' : 'Destinations',
      lang === 'en' ? 'Taghit price' : lang === 'ar' ? 'سعر تاغيت' : 'Tarif Taghit',
      lang === 'en' ? 'Book' : lang === 'ar' ? 'حجز' : 'Réserver',
    );
  }
  if (intent === 'TRANSPORT') chips.push(...ctx.transport);
  else if (intent === 'ITINERARY') chips.push(...ctx.itinerary);

  if (session.destination === 'taghit') chips.push(...ctx.taghit);
  else if (session.destination === 'bejaia') chips.push(...ctx.bejaia);
  else if (session.destination === 'sahara') chips.push(...ctx.sahara);

  if (!session.destination) chips.push(...ctx.missingDestination.slice(0, 3));
  if (!session.days && !session.nights && !session.arrivalDay) chips.push(...ctx.missingDates.slice(0, 2));
  if (!session.travelers && !session.travelerType) chips.push(...ctx.missingTravelers.slice(0, 2));
  if (session.destination && !session.accommodation) chips.push(...ctx.missingAccommodation.slice(0, 2));

  return [...new Set([...chips, ...base])].slice(0, 6);
}

module.exports = { WHATSAPP, getSuggestions, BASE, CONTEXT };
