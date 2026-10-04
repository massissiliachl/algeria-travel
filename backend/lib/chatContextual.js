const {
  extractEntities, detectLanguage, normalizeQuery, isEveningGreeting, isInfoRequest,
} = require('./chatNlp');
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
const scenarios = require('./chatScenarios');

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

const COASTAL_DESTINATIONS = new Set(['bejaia', 'jijel', 'oran', 'annaba', 'tipaza', 'mostaganem', 'skikda']);
const SAHARA_DESTINATIONS = new Set(['taghit', 'bechar', 'djanet', 'ghardaia', 'timimoun', 'hoggar', 'tamanrasset', 'adrar', 'touggourt', 'sahara']);

function normalizeDestId(destId) {
  return destId === 'bechar' ? 'taghit' : destId;
}

function buildDestinationOptionsPrompt(destId, destLabel, lang, tone = 'excellent') {
  const id = normalizeDestId(destId);
  const intro = tone === 'excellent'
    ? (lang === 'en' ? `Excellent choice 😊 ${destLabel}!` : lang === 'ar' ? `اختيار ممتاز 😊 ${destLabel}!` : `Excellent choix 😊 ${destLabel} !`)
    : (lang === 'en' ? `Got it 😊 ${destLabel}!` : lang === 'ar' ? `فهمت 😊 ${destLabel}!` : `Compris 😊 ${destLabel} !`);

  if (SAHARA_DESTINATIONS.has(id)) {
    if (lang === 'en') return `${intro} 🏨 Stay, 🏜️ dunes & Sahara, 🎯 activities (4×4, camel…) or 🗺️ full program?`;
    if (lang === 'ar') return `${intro} 🏨 إقامة، 🏜️ كثبان وصحراء، 🎯 أنشطة (دفع رباعي، جمل…) أو 🗺️ برنامج كامل؟`;
    return `${intro} 🏨 Hébergement, 🏜️ dunes & Sahara, 🎯 activités (4×4, dromadaire…) ou 🗺️ programme complet ?`;
  }

  if (COASTAL_DESTINATIONS.has(id)) {
    if (lang === 'en') return `${intro} 🏨 Stay, 🏖️ beaches, 🎯 activities or 🗺️ full program?`;
    if (lang === 'ar') return `${intro} 🏨 إقامة، 🏖️ شواطئ، 🎯 أنشطة أو 🗺️ برنامج كامل؟`;
    return `${intro} 🏨 Hébergement, 🏖️ plages, 🎯 activités ou 🗺️ programme complet ?`;
  }

  if (lang === 'en') return `${intro} 🏨 Stay, 🏛️ heritage, 🎯 activities or 🗺️ full program?`;
  if (lang === 'ar') return `${intro} 🏨 إقامة، 🏛️ تراث، 🎯 أنشطة أو 🗺️ برنامج كامل؟`;
  return `${intro} 🏨 Hébergement, 🏛️ patrimoine, 🎯 activités ou 🗺️ programme complet ?`;
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
  const merged = mergeSession(session, { ...entities, lastIntent: intent });
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
    const evening = isEveningGreeting(message);
    const greetings = {
      fr: evening
        ? 'Bonsoir 😊 Comment puis-je vous aider pour votre voyage en Algérie ? Destinations, hôtels, activités, circuits, Taghit…'
        : 'Bonjour 😊 Comment puis-je vous aider pour votre voyage en Algérie ? Destinations, hôtels, activités, circuits, Taghit…',
      en: evening
        ? 'Good evening 😊 How can I help with your trip to Algeria? Destinations, hotels, activities, tours, Taghit…'
        : 'Hello 😊 How can I help with your trip to Algeria? Destinations, hotels, activities, tours, Taghit…',
      ar: evening
        ? 'مساء الخير 😊 كيف يمكنني مساعدتك في رحلتك إلى الجزائر؟'
        : 'مرحباً 😊 كيف يمكنني مساعدتك في رحلتك إلى الجزائر؟',
    };
    return {
      reply: greetings[replyLang] || greetings.fr,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Circuits', url: '/tours' }],
    };
  }

  if (intent === 'INFO_REQUEST') {
    const evening = isEveningGreeting(message);
    const hasGreeting = isInfoRequest(message) && /^(bjr|bj|bsr|bs|slt|salut|cc|coucou|bonjour|bonsoir|slm|salam|marhaba|ahlan|hello|hi|hey)/.test(normalizeQuery(message));
    const hello = replyLang === 'en'
      ? (evening ? 'Good evening' : hasGreeting ? 'Hello' : '')
      : replyLang === 'ar'
        ? (evening ? 'مساء الخير' : hasGreeting ? 'مرحباً' : '')
        : (evening ? 'Bonsoir' : hasGreeting ? 'Bonjour' : '');

    if (merged.destination) {
      const { hits } = knowledge().searchKnowledge(
        merged.destination,
        replyLang,
        { destination: merged.destination },
      );
      const placeHit = hits.find((h) => h.id === `place-${merged.destination}`);
      if (placeHit) {
        const dest = formatDestinationLabel(merged.destination, replyLang);
        const intro = hello
          ? `${hello} 😊 ${replyLang === 'en' ? 'Here is what I know about' : replyLang === 'ar' ? 'إليك ما أعرفه عن' : 'Voici ce que je peux vous dire sur'} ${dest} :\n\n`
          : '';
        return {
          reply: `${intro}${placeHit.text}`,
          session: merged,
          suggestions: suggest(replyLang, merged, intent),
          links: placeHit.links?.length ? placeHit.links : linksFor(merged, replyLang),
        };
      }
    }

    const menu = replyLang === 'en'
      ? `${hello ? `${hello} 😊 ` : ''}Happy to help! I can tell you about:\n• 🗺️ Destinations (Bejaia, Taghit, Oran, Sahara…)\n• 🏨 Hotels & stays\n• 🎯 Activities (quad, 4×4, kayak…)\n• ✈️ Tours & offers (Taghit from 75,000 DZD…)\n• 📅 Booking\n\nWhat would you like to explore?`
      : replyLang === 'ar'
        ? `${hello ? `${hello} 😊 ` : ''}بكل سرور! يمكنني إطلاعك على:\n• 🗺️ الوجهات (بجاية، تاغيت، وهران، الصحراء…)\n• 🏨 الفنادق والإقامات\n• 🎯 الأنشطة (كواد، دفع رباعي…)\n• ✈️ الجولات والعروض\n• 📅 الحجز\n\nماذا تريد أن تكتشف؟`
        : `${hello ? `${hello} 😊 ` : ''}Avec plaisir ! Je peux vous renseigner sur :\n• 🗺️ Destinations (Béjaïa, Taghit, Oran, Sahara…)\n• 🏨 Hôtels & séjours\n• 🎯 Activités (quad, 4×4, kayak…)\n• ✈️ Circuits & offres (Taghit 75 000 DA…)\n• 📅 Réservation\n\nQue souhaitez-vous découvrir ?`;

    return {
      reply: menu,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [
        { label: replyLang === 'en' ? 'Destinations' : 'Destinations', url: '/destinations' },
        { label: 'Taghit', url: '/place/taghit?pkg=hotel' },
        { label: replyLang === 'en' ? 'Tours' : 'Circuits', url: '/tours' },
      ],
    };
  }

  if (intent === 'ACK') {
    const trimmedAck = normalizeQuery(message).trim();
    if (/^(merci|thx|mrc|thanks)(\s*[!?.…]*)$/.test(trimmedAck)) {
      return {
        reply: scenarios.buildThanksReply(replyLang),
        session: merged,
        suggestions: suggest(replyLang, merged, intent),
        links: linksFor(merged, replyLang),
      };
    }
    const isOkOnly = /^(ok|okk|oki|dac|dacc|daccord|parfait|c bon|c est bon)(\s*[!?.…]*)$/.test(trimmedAck);
    if (isOkOnly && getMissingForBooking(merged).length === 0) {
      return {
        reply: scenarios.buildOkReply(replyLang),
        session: merged,
        suggestions: suggest(replyLang, merged, intent),
        links: linksFor(merged, replyLang),
      };
    }
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
    const wantsHuman = /humain|agent|conseiller|parler a quelqu|quelqu un/.test(normalizeQuery(message));
    return {
      reply: wantsHuman
        ? scenarios.buildHumanAgentPrompt(replyLang)
        : (replyLang === 'en'
          ? `📞 Reach us:\n• WhatsApp: +${WHATSAPP}\n• /contact\n• travelalgeriadz@gmail.com`
          : replyLang === 'ar'
            ? `📞 تواصل:\n• WhatsApp: +${WHATSAPP}\n• /contact`
            : `📞 Contactez-nous :\n• WhatsApp : +${WHATSAPP}\n• /contact\n• travelalgeriadz@gmail.com`),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'WhatsApp', url: `https://wa.me/${WHATSAPP}` }, { label: 'Contact', url: '/contact' }],
    };
  }

  if (intent === 'DEVIS') {
    return {
      reply: scenarios.buildDevisPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Contact', url: '/contact' }, { label: 'WhatsApp', url: `https://wa.me/${WHATSAPP}` }],
    };
  }

  if (intent === 'DEPOSIT') {
    return {
      reply: scenarios.buildDepositPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (intent === 'MODIFICATION') {
    return {
      reply: scenarios.buildModificationPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Suivi', url: '/suivi' }, { label: 'Contact', url: '/contact' }],
    };
  }

  if (intent === 'DISCOUNT') {
    return {
      reply: scenarios.buildDiscountPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (intent === 'THINKING') {
    return {
      reply: scenarios.buildThinkingPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [],
    };
  }

  if (intent === 'CIRCUIT_COMPLETE') {
    return {
      reply: scenarios.buildCircuitCompletePrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Circuits', url: '/tours' }],
    };
  }

  if (intent === 'DETAIL_REQUEST') {
    return {
      reply: scenarios.buildDetailPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (intent === 'PRICE_PER_PERSON') {
    return {
      reply: scenarios.buildPricePerPersonPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (intent === 'FAMILY_TRIP') {
    return {
      reply: scenarios.buildFamilyPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (intent === 'COUPLE_TRIP') {
    return {
      reply: scenarios.buildCouplePrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (intent === 'AIRPORT_TRANSFER') {
    return {
      reply: scenarios.buildAirportTransferPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Contact', url: '/contact' }],
    };
  }

  if (intent === 'ACTIVITY_INQUIRY') {
    const act = entities.activity || scenarios.detectActivityFromMessage(message) || 'quad';
    return {
      reply: scenarios.buildActivityInquiry(act, replyLang, merged),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (merged.travelers >= 6 && intent === 'TRIP_PLANNING') {
    return {
      reply: scenarios.buildGroupPrompt(merged.travelers, replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (entities.budgetAmount && !entities.destination) {
    return {
      reply: scenarios.buildBudgetAck(entities.budgetAmount, replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: linksFor(merged, replyLang),
    };
  }

  if (intent === 'PAYMENT') {
    return {
      reply: scenarios.buildPaymentPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Contact', url: '/contact' }],
    };
  }

  if (intent === 'CANCELLATION') {
    return {
      reply: scenarios.buildCancellationPrompt(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Contact', url: '/contact' }, { label: 'Suivi', url: '/suivi' }],
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
      reply: scenarios.buildPricePrompt(replyLang, merged),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Taghit', url: '/place/taghit?pkg=hotel' }],
    };
  }

  if (intent === 'DESTINATIONS_AVAILABILITY') {
    return { ...knowledge().buildDestinationsAvailabilityReply(replyLang, merged), session: merged };
  }

  if (intent === 'FOLLOWUP_AVAILABILITY') {
    const recap = buildRecap(merged, replyLang);
    if (!merged.destination) {
      const dispo = scenarios.buildDispoInquiry(replyLang);
      return {
        reply: recap ? `${recap}\n\n${dispo}` : dispo,
        session: merged,
        suggestions: suggest(replyLang, merged, intent),
        links: [{ label: 'Taghit', url: '/place/taghit?pkg=hotel' }, { label: 'Contact', url: '/contact' }],
      };
    }
    return {
      reply: `${recap ? `${recap}\n\n` : ''}${replyLang === 'en'
        ? 'I can check availability via /contact or WhatsApp. Our confirmed dated offer is Taghit Oct 23–28.'
        : replyLang === 'ar'
          ? 'يمكنني التحقق من التوفر عبر /contact أو WhatsApp. عرضنا المؤكد: تاغيت 23–28 أكتوبر.'
          : 'Je peux vérifier la disponibilité via /contact ou WhatsApp. Notre offre datée confirmée : Taghit du 23 au 28 octobre.'}`,
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Taghit', url: '/place/taghit?pkg=hotel' }, { label: 'Contact', url: '/contact' }, { label: 'WhatsApp', url: `https://wa.me/${WHATSAPP}` }],
    };
  }

  if (intent === 'ACCOMMODATION_SEARCH') {
    if (/appart|apt\b|appt/.test(normalizeQuery(message)) && !merged.destination) {
      return {
        reply: scenarios.buildApartmentPrompt(replyLang),
        session: merged,
        suggestions: suggest(replyLang, merged, intent),
        links: [{ label: 'Séjours', url: '/stays' }],
      };
    }
    if (!merged.destination && /^(hotel|ht|htl|heberg|logement)\??$/.test(normalizeQuery(message).trim())) {
      return {
        reply: scenarios.buildAccommodationPrompt(replyLang),
        session: merged,
        suggestions: suggest(replyLang, merged, intent),
        links: [{ label: 'Hôtels', url: '/hotels' }, { label: 'Séjours', url: '/stays' }],
      };
    }
    if (merged.destination) {
      const { hits } = knowledge().searchKnowledge(
        `${merged.destination} ${merged.accommodation || 'hotel'}`,
        replyLang,
        { destination: merged.destination },
      );
      const placeHit = hits.find((h) => h.id === `place-${merged.destination}`);
      if (placeHit) {
        const dest = formatDestinationLabel(merged.destination, replyLang);
        return {
          reply: replyLang === 'en'
            ? `Hotels in ${dest}:\n\n${placeHit.text}`
            : replyLang === 'ar'
              ? `فنادق في ${dest}:\n\n${placeHit.text}`
              : `Hôtels à ${dest} :\n\n${placeHit.text}`,
          session: merged,
          suggestions: suggest(replyLang, merged, intent),
          links: placeHit.links?.length ? placeHit.links : linksFor(merged, replyLang),
        };
      }
    }
    return {
      reply: replyLang === 'en'
        ? 'Which destination are you looking for a hotel in? (Bejaia, Oran, Taghit, Algiers…)'
        : replyLang === 'ar'
          ? 'في أي وجهة تبحث عن فندق؟ (بجاية، وهران، تاغيت، الجزائر…)'
          : 'Pour quelle destination cherchez-vous un hôtel ? (Béjaïa, Oran, Taghit, Alger…)',
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Hôtels', url: '/hotels' }, { label: 'Séjours', url: '/stays' }],
    };
  }

  if (intent === 'TRANSPORT') {
    if (/^(transport|transp|trajet)\??$/.test(normalizeQuery(message).trim()) && !merged.destination) {
      return {
        reply: scenarios.buildTransportPrompt(replyLang),
        session: merged,
        suggestions: suggest(replyLang, merged, intent),
        links: [{ label: 'Circuits', url: '/tours' }, { label: 'Contact', url: '/contact' }],
      };
    }
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
    const bookingReply = scenarios.buildBookingPrompt(replyLang, recap);
    return {
      reply: missing.length
        ? `${bookingReply}\n\n${replyLang === 'en' ? 'Still missing' : replyLang === 'ar' ? 'ما ينقص' : 'Il me manque'} : ${missing.join(', ')}.`
        : bookingReply,
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
    const destId = normalizeDestId(merged.destination);
    if (destId === 'taghit') {
      return {
        reply: scenarios.buildTaghitIntro(replyLang),
        session: merged,
        suggestions: suggest(replyLang, merged, intent),
        links: linksFor(merged, replyLang),
      };
    }
    const dest = formatDestinationLabel(merged.destination, replyLang);
    return {
      reply: buildDestinationOptionsPrompt(merged.destination, dest, replyLang, 'excellent'),
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
      replyLang,
      { destination: merged.destination },
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
  const { hits } = knowledge().searchKnowledge(message, replyLang, {
    destination: merged.destination || entities.destination,
  });
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
      reply: buildDestinationOptionsPrompt(merged.destination, dest, replyLang, 'gotit'),
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

  if (intent === 'ACTIVITY_SEARCH' && /quelles activ|quoi faire|qqch|activites\b|activités\b|activities\b/.test(normalizeQuery(message)) && !merged.destination) {
    return {
      reply: scenarios.buildActivitiesOverview(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [{ label: 'Destinations', url: '/destinations' }],
    };
  }

  if (intent === 'GENERAL_QUESTION') {
    return {
      reply: scenarios.buildDefaultMenu(replyLang),
      session: merged,
      suggestions: suggest(replyLang, merged, intent),
      links: [
        { label: 'Circuits', url: '/tours' },
        { label: 'Taghit', url: '/place/taghit?pkg=hotel' },
        { label: 'Contact', url: '/contact' },
      ],
    };
  }

  return null;
}

module.exports = { tryContextualReply };
