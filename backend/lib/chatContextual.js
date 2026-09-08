const { extractEntities, detectLanguage, normalizeQuery } = require('./chatNlp');
const {
  mergeSession,
  formatDestinationLabel,
  buildRecap,
  getMissingForBooking,
  checkDateContradiction,
} = require('./chatSession');
const { getSuggestions, WHATSAPP } = require('./chatUi');
const { buildItinerary } = require('./chatItinerary');
const { getTransportInfo, buildTransportReply } = require('./chatTransport');

function suggest(lang, session, intent) {
  return getSuggestions(lang, session, intent);
}

const PLACE_PATHS = {
  bejaia: '/place/bejaia',
  alger: '/place/alger',
  oran: '/place/oran',
  taghit: '/place/taghit?pkg=hotel',
  djanet: '/place/djanet',
  ghardaia: '/place/ghardaia',
  timimoun: '/place/timimoun',
  hoggar: '/place/hoggar',
  constantine: '/place/constantine',
  annaba: '/place/annaba',
  jijel: '/place/jijel',
  tipaza: '/place/tipaza',
  tlemcen: '/place/tlemcen',
  sahara: '/destinations',
  kabylie: '/place/bejaia',
};

function knowledge() {
  return require('./chatKnowledge');
}

function linksFor(session, lang) {
  const links = [];
  if (session.destination && PLACE_PATHS[session.destination]) {
    links.push({
      label: formatDestinationLabel(session.destination, lang),
      url: PLACE_PATHS[session.destination],
    });
  }
  links.push({ label: lang === 'en' ? 'Contact' : lang === 'ar' ? 'اتصل' : 'Contact', url: '/contact' });
  links.push({ label: 'WhatsApp', url: `https://wa.me/${WHATSAPP}` });
  return links;
}

function tryContextualReply(message, lang, session) {
  const { entities, intent } = extractEntities(message);
  const merged = mergeSession(session, entities);
  if (intent === 'TRANSPORT' && session.destination) {
    merged.destination = session.destination;
  }
  const detectedLang = detectLanguage(message);
  const replyLang = lang || detectedLang;

  const contradiction = checkDateContradiction(merged);
  if (contradiction) {
    return {
      reply: replyLang === 'en'
        ? `Quick check 😊 From ${contradiction.arrivalDay} to ${contradiction.departureDay} is ${contradiction.computedNights} nights, not ${contradiction.statedNights}. Which dates do you prefer?`
        : replyLang === 'ar'
          ? `تأكيد سريع 😊 من ${contradiction.arrivalDay} إلى ${contradiction.departureDay} = ${contradiction.computedNights} ليالي وليس ${contradiction.statedNights}.`
          : `Petite vérification 😊 Du ${contradiction.arrivalDay} au ${contradiction.departureDay} = ${contradiction.computedNights} nuits, pas ${contradiction.statedNights}. Quelles dates souhaitez-vous ?`,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (intent === 'GREETING') {
    const greetings = {
      fr: 'Bonjour 😊 Comment puis-je vous aider pour votre voyage en Algérie ? Destinations, hôtels, activités, circuits, Taghit…',
      en: 'Hello 😊 How can I help with your trip to Algeria? Destinations, hotels, activities, tours, Taghit…',
      ar: 'مرحباً 😊 كيف يمكنني مساعدتك في رحلتك إلى الجزائر؟',
    };
    return {
      reply: greetings[replyLang] || greetings.fr,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Circuits', url: '/tours' }],
    };
  }

  if (intent === 'ACK') {
    const missing = getMissingForBooking(merged);
    if (missing.length > 0) {
      const labels = { fr: { destination: 'la destination', travelers: 'le nombre de personnes', dates: 'les dates' }, en: { destination: 'destination', travelers: 'travelers', dates: 'dates' }, ar: { destination: 'الوجهة', travelers: 'عدد الأشخاص', dates: 'التواريخ' } };
      const L = labels[replyLang] || labels.fr;
      return {
        reply: `${replyLang === 'en' ? 'Great 😊 Still need' : replyLang === 'ar' ? 'ما ينقص' : 'Parfait 😊 Il me manque'} : ${missing.map((m) => L[m]).join(', ')}.`,
        session: merged,
        suggestions: suggest(replyLang, merged, intent),
        links: linksFor(merged, replyLang),
      };
    }
    return {
      reply: replyLang === 'en' ? 'Perfect 😊 Shall I help you book?' : replyLang === 'ar' ? 'ممتاز 😊 نكمل الحجز؟' : 'Parfait 😊 On continue vers la réservation ?',
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (intent === 'CONTACT') {
    return {
      reply: replyLang === 'en'
        ? `Reach us:\n• WhatsApp: +${WHATSAPP}\n• /contact\n• travelalgeriadz@gmail.com`
        : `Contactez-nous :\n• WhatsApp : +${WHATSAPP}\n• /contact\n• travelalgeriadz@gmail.com`,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'WhatsApp', url: `https://wa.me/${WHATSAPP}` }, { label: 'Contact', url: '/contact' }],
    };
  }

  if (intent === 'GENERAL_INFORMATION' && /capitale|capital/.test(message.toLowerCase())) {
    return {
      reply: replyLang === 'en' ? '🇩🇿 The capital of Algeria is Algiers.' : replyLang === 'ar' ? '🇩🇿 عاصمة الجزائر هي الجزائر.' : '🇩🇿 La capitale de l\'Algérie est Alger.',
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Alger', url: '/place/alger' }],
    };
  }

  if (intent === 'WEATHER') {
    return {
      reply: replyLang === 'en'
        ? 'For live weather use a real-time source. Generally: coast mild Mar–Nov; Sahara best Oct–Apr.'
        : 'Pour la météo actuelle, consultez une source temps réel. Côte : mars–nov ; Sahara : oct–avr.',
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Destinations', url: '/destinations' }],
    };
  }

  if (intent === 'FOLLOWUP_PRICE') {
    if (merged.destination) {
      const { hits } = knowledge().searchKnowledge(formatDestinationLabel(merged.destination, 'fr'), replyLang);
      if (hits[0] && !hits[0].text.startsWith('__') && !['contact', 'payment', 'reservation'].includes(hits[0].id)) {
        return {
          reply: `${replyLang === 'en' ? 'For' : 'Pour'} ${formatDestinationLabel(merged.destination, replyLang)} :\n\n${hits[0].text}`,
          session: merged,
          suggestions: suggest(replyLang, merged, intent),
          links: hits[0].links || linksFor(merged, replyLang),
        };
      }
    }
    if (entities.wantsPrice || intent === 'FOLLOWUP_PRICE') {
      if (merged.destination) {
        return {
          reply: replyLang === 'en'
            ? `For ${formatDestinationLabel(merged.destination, replyLang)}, hotel rates depend on dates and availability. I prefer to verify rather than give wrong prices — share your dates and I can help check.`
            : `Pour ${formatDestinationLabel(merged.destination, replyLang)}, le tarif dépend de la date et de la prestation. Je préfère vérifier plutôt que de vous donner un mauvais prix — indiquez vos dates 😊`,
          session: merged,
          suggestions: suggest(replyLang, merged, intent),
          links: linksFor(merged, replyLang),
        };
      }
    }
    return {
      reply: replyLang === 'en' ? 'Price for which destination? (Taghit, Béjaïa, Oran…)' : 'Le prix de quelle destination ? (Taghit, Béjaïa, Oran…)',
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Taghit', url: '/place/taghit?pkg=hotel' }],
    };
  }

  if (intent === 'FOLLOWUP_AVAILABILITY') {
    const recap = buildRecap(merged, replyLang);
    return {
      reply: `${recap ? `${recap}\n\n` : ''}Je peux vous aider à vérifier la disponibilité via /contact ou WhatsApp — je ne confirme pas sans vérification.`,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Contact', url: '/contact' }, { label: 'WhatsApp', url: `https://wa.me/${WHATSAPP}` }],
    };
  }

  if (intent === 'TRANSPORT') {
    let transportText = buildTransportReply(message, replyLang, merged);
    if (!transportText && merged.destination) {
      transportText = getTransportInfo('alger', merged.destination, replyLang);
    }
    if (transportText) {
      return {
        reply: transportText,
        session: merged,
        suggestions: suggest(replyLang, merged, 'TRANSPORT'),
        links: [{ label: 'Circuits', url: '/tours' }, { label: 'Contact', url: '/contact' }],
      };
    }
  }

  if (intent === 'ITINERARY' || (merged.destination && merged.days && /programme|plan|itineraire|organiser|prog/.test(normalizeQuery(message)))) {
    const days = merged.days || merged.nights || 3;
    const itin = buildItinerary(merged.destination, days, replyLang, merged.interests);
    if (itin) {
      const recap = buildRecap(merged, replyLang);
      return {
        reply: `${recap ? `${recap}\n\n` : ''}${itin}`,
        session: merged,
        suggestions: suggest(replyLang, merged, 'ITINERARY'),
        links: linksFor(merged, replyLang),
      };
    }
  }

  if (intent === 'BOOKING') {
    const recap = buildRecap(merged, replyLang);
    const missing = getMissingForBooking(merged);
    const bookingReply = replyLang === 'en'
      ? `${recap ? `${recap}\n\n` : ''}To book:\n1. Open the destination page\n2. Click « Book »\n3. Or contact us on WhatsApp`
      : `${recap ? `${recap}\n\n` : ''}Pour réserver :\n1. Ouvrez la fiche destination\n2. Cliquez « Réserver »\n3. Ou contactez-nous sur WhatsApp`;
    return {
      reply: missing.length ? `${bookingReply}\n\nIl me manque : ${missing.join(', ')}.` : bookingReply,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'WhatsApp', url: `https://wa.me/${WHATSAPP}` }, { label: 'Contact', url: '/contact' }, { label: 'Suivi', url: '/suivi' }],
    };
  }

  // Mise à jour partielle du contexte (ex: "4 jours", "2 pers", "hotel")
  const isPartialUpdate = !merged.destination ? false : (
    (merged.days || merged.nights || merged.travelers || merged.accommodation || merged.budgetLevel)
    && message.trim().length < 35
  );
  if (isPartialUpdate && intent !== 'GREETING') {
    const recap = buildRecap(merged, replyLang);
    const missing = getMissingForBooking(merged);
    let reply = recap ? `${recap}\n\n` : '';
    if (missing.length > 0) {
      reply += replyLang === 'en'
        ? `Noted 😊 Still need: ${missing.join(', ')}.`
        : `Bien noté 😊 Il me manque : ${missing.join(', ')}.`;
    } else {
      reply += replyLang === 'en'
        ? 'Perfect 😊 I have everything. Shall I suggest a program or help you book?'
        : 'Parfait 😊 J\'ai toutes les infos. Je vous propose un programme ou on passe à la réservation ?';
      const itin = buildItinerary(merged.destination, merged.days || merged.nights || 3, replyLang, merged.interests);
      if (itin && (merged.days || merged.nights)) reply += `\n\n${itin}`;
    }
    return {
      reply,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (merged.destination === 'sahara' && intent === 'TRIP_PLANNING') {
    return { ...knowledge().buildSaharaOverview(replyLang, merged), session: merged };
  }

  if (merged.destination && intent === 'DESTINATION_SEARCH' && !merged.accommodation && !merged.activity && !merged.days && !merged.travelers) {
    const dest = formatDestinationLabel(merged.destination, replyLang);
    return {
      reply: `Excellent choix 😊 ${dest} ! 🏨 Hébergement, 🏖️ plages, 🎯 activités ou 🗺️ programme complet ?`,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (merged.destination && (merged.accommodation || merged.activity || merged.travelers || merged.days || merged.nights || merged.budgetLevel)) {
    const recap = buildRecap(merged, replyLang);
    const missing = getMissingForBooking(merged);
    const { hits } = knowledge().searchKnowledge(
      [merged.destination, merged.accommodation, merged.activity].filter(Boolean).join(' '),
      replyLang
    );

    let reply = '';
    if (/^(slm|salam|السلام)/i.test(message.trim())) reply += 'Wa ʿalaykoum salam 😊\n\n';
    if (recap) reply += `${recap}\n\n`;
    const destId = merged.destination;
    const goodHit = hits.find((h) => {
      if (h.text.startsWith('__') || ['contact', 'payment', 'reservation'].includes(h.id)) return false;
      if (h.id.startsWith('place-')) return h.id === `place-${destId}`;
      if (h.id.startsWith('taghit')) return destId === 'taghit' || destId === 'bechar';
      if (h.id.startsWith('tour-') || h.id.startsWith('activity-')) {
        return (h.keywords || []).some((kw) => normalizeQuery(String(kw)).includes(destId));
      }
      return false;
    });
    if (goodHit) reply += goodHit.text;
    else if (entities.wantsPrice) {
      reply += replyLang === 'en'
        ? `Hotel rates in ${formatDestinationLabel(merged.destination, replyLang)} depend on dates — I prefer to verify before quoting.`
        : `Le tarif hôtel à ${formatDestinationLabel(merged.destination, replyLang)} dépend des dates — je préfère vérifier avant de vous donner un prix.`;
    } else reply += `Demande notée pour ${formatDestinationLabel(merged.destination, replyLang)}.`;

    if (missing.length > 0) {
      reply += `\n\nIl me manque : ${missing.join(', ')}.`;
    } else {
      reply += '\n\nPrêt à réserver ? Utilisez la fiche destination ou contactez-nous 😊';
    }

    return {
      reply,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: goodHit?.links?.length ? goodHit.links : linksFor(merged, replyLang),
    };
  }

  if (intent === 'TRIP_PLANNING' && !merged.destination) {
    return { ...knowledge().buildCatalogOverview(replyLang, merged), session: merged };
  }

  // Réponse intelligente même pour messages courts / abréviations
  const { hits } = knowledge().searchKnowledge(message, replyLang);
  const goodHit = hits.find(
    (h) => h.score >= 14 && !h.text.startsWith('__') && !['contact', 'payment', 'reservation'].includes(h.id)
  );
  if (goodHit) {
    let reply = goodHit.text;
    if (merged.destination && !reply.includes(formatDestinationLabel(merged.destination, replyLang))) {
      const recap = buildRecap(merged, replyLang);
      if (recap) reply = `${recap}\n\n${reply}`;
    }
    return {
      reply,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: goodHit.links?.length ? goodHit.links : linksFor(merged, replyLang),
    };
  }

  if (merged.destination) {
    const dest = formatDestinationLabel(merged.destination, replyLang);
    return {
      reply: replyLang === 'en'
        ? `Got it 😊 ${dest}! 🏨 Hotel, 🏖️ beaches, 🎯 activities or 🗺️ full trip?`
        : replyLang === 'ar'
          ? `فهمت 😊 ${dest}! 🏨 فندق، 🏖️ شواطئ، 🎯 أنشطة أو 🗺️ برنامج كامل؟`
          : `Compris 😊 ${dest} ! 🏨 Hôtel, 🏖️ plages, 🎯 activités ou 🗺️ programme complet ?`,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (entities.wantsPrice || entities.wantsAvailability || entities.accommodation || entities.activity) {
    const recap = buildRecap(merged, replyLang);
    return {
      reply: `${recap ? `${recap}\n\n` : ''}${replyLang === 'en' ? 'Tell me the destination and dates so I can help 😊' : 'Indiquez la destination et les dates pour que je vous aide 😊'}`,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Taghit', url: '/place/taghit?pkg=hotel' }, { label: 'Circuits', url: '/tours' }],
    };
  }

  return null;
}

module.exports = { tryContextualReply };
