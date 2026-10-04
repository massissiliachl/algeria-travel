/** Réponses locales alignées sur les instructions système Algeria Travel (sections 1–63). */

function pick(lang, fr, en, ar) {
  if (lang === 'en') return en;
  if (lang === 'ar') return ar;
  return fr;
}

function buildTaghitIntro(lang) {
  return pick(
    lang,
    `🌵 **Taghit** est une magnifique destination du Sahara algérien.

Selon la formule choisie, vous pouvez profiter de :

🏜️ Dunes de sable
🐪 Balade en dromadaire
🚙 Excursion en 4×4
🌅 Coucher de soleil
🌴 Oasis
📸 Découverte des paysages
🏕️ Expérience saharienne
🎯 Activités selon programme.

Souhaitez-vous connaître les **circuits**, les **activités**, les **hébergements** ou les **tarifs** ?`,
    `🌵 **Taghit** is a stunning destination in the Algerian Sahara.

Depending on the package, you can enjoy:

🏜️ Sand dunes
🐪 Camel ride
🚙 4×4 excursion
🌅 Sunset
🌴 Oasis
📸 Landscapes
🏕️ Saharan experience
🎯 Activities per program.

Would you like **tours**, **activities**, **accommodation** or **prices**?`,
    `🌵 **تاغيت** وجهة رائعة في الصحراء الجزائرية.

حسب الصيغة، يمكنكم الاستمتاع بـ:

🏜️ الكثبان الرملية
🐪 ركوب الجمل
🚙 جولة 4×4
🌅 غروب الشمس
🌴 الواحات
📸 اكتشاف المناظر
🏕️ تجربة صحراوية
🎯 أنشطة حسب البرنامج.

هل تريدون **الدوائر**، **الأنشطة**، **الإقامة** أو **الأسعار**؟`,
  );
}

function buildActivityInquiry(activity, lang, session = {}) {
  const dest = session.destination;
  const destLine = dest
    ? pick(lang, `📍 Destination : ${dest}\n`, `📍 Destination: ${dest}\n`, `📍 الوجهة: ${dest}\n`)
    : pick(lang, '📍 destination ;\n', '📍 destination;\n', '📍 الوجهة؛\n');

  const templates = {
    quad: pick(
      lang,
      `🛻 Vous souhaitez faire du quad. Très bien !

Pour vérifier la disponibilité et le tarif, indiquez-moi :

${destLine}📅 date ;
👥 nombre de participants ;
⏱️ durée souhaitée si vous en avez une.`,
      `🛻 You'd like to go quad biking. Great!

To check availability and price, please share:

${destLine}📅 date;
👥 number of participants;
⏱️ duration if you have one in mind.`,
      `🛻 تريدون ركوب الكواد. ممتاز!

للتحقق من التوفر والسعر، أرسلوا:

${destLine}📅 التاريخ؛
👥 عدد المشاركين؛
⏱️ المدة إن وُجدت.`,
    ),
    boat: pick(
      lang,
      `🚤 Vous souhaitez une sortie en bateau.

Indiquez-moi :

${destLine}📅 date ;
👥 nombre de personnes.

Je pourrai ensuite vous orienter vers la formule disponible.`,
      `🚤 You'd like a boat trip.

Please share:

${destLine}📅 date;
👥 number of people.

I'll guide you to the available option.`,
      `🚤 تريدون رحلة بالقارب.

أرسلوا:

${destLine}📅 التاريخ؛
👥 عدد الأشخاص.

سأوجّهكم نحو الصيغة المتاحة.`,
    ),
    kayak: pick(
      lang,
      `🛶 Le kayak peut être proposé selon la destination et les disponibilités.

${dest ? '' : '📍 Où souhaitez-vous pratiquer ?\n'}📅 Quelle date ?
👥 Combien de personnes ?`,
      `🛶 Kayak depends on destination and availability.

${dest ? '' : '📍 Where would you like to go?\n'}📅 What date?
👥 How many people?`,
      `🛶 الكاياك يُقترح حسب الوجهة والتوفر.

${dest ? '' : '📍 أين تريدون الممارسة؟\n'}📅 أي تاريخ؟
👥 كم شخصاً؟`,
    ),
    camel: pick(
      lang,
      `🐪 Une balade à dos de dromadaire peut être proposée dans certaines destinations sahariennes.

Indiquez-moi votre destination, vos dates et le nombre de participants afin de vérifier la possibilité.`,
      `🐪 Camel rides may be available in some Saharan destinations.

Share destination, dates and number of participants so I can check.`,
      `🐪 يمكن اقتراح ركوب الجمل في بعض الوجهات الصحراوية.

أرسلوا الوجهة والتواريخ وعدد المشاركين للتحقق.`,
    ),
    horse: pick(
      lang,
      `🐎 Vous souhaitez une balade à cheval.

Indiquez-moi votre destination, votre date et le nombre de participants afin de vérifier les disponibilités.`,
      `🐎 You'd like a horseback ride.

Share destination, date and number of participants to check availability.`,
      `🐎 تريدون ركوب الخيل.

أرسلوا الوجهة والتاريخ وعدد المشاركين للتحقق من التوفر.`,
    ),
  };

  return templates[activity] || templates.quad;
}

function buildDispoInquiry(lang) {
  return pick(
    lang,
    `Bien sûr 😊 Que souhaitez-vous vérifier ?

🏨 Un hébergement
🎯 Une activité
🚐 Un transport
🗺️ Un circuit

Indiquez-moi également la date et le nombre de personnes.`,
    `Of course 😊 What would you like to check?

🏨 Accommodation
🎯 Activity
🚐 Transport
🗺️ Tour

Also share the date and number of people.`,
    `بالطبع 😊 ماذا تريدون التحقق منه؟

🏨 إقامة
🎯 نشاط
🚐 نقل
🗺️ دائرة

أرسلوا أيضاً التاريخ وعدد الأشخاص.`,
  );
}

function buildDevisPrompt(lang) {
  return pick(
    lang,
    `📋 Avec plaisir !

Pour préparer votre devis, merci de préciser :

📍 Destination
📅 Date de départ
📅 Date de retour
👥 Nombre de personnes
🏨 Hébergement souhaité
🚐 Transport
🎯 Activités.

Nous pourrons ensuite vous orienter vers une formule adaptée.`,
    `📋 Happy to help!

For your quote, please share:

📍 Destination
📅 Departure date
📅 Return date
👥 Number of people
🏨 Preferred accommodation
🚐 Transport
🎯 Activities.

We'll suggest a suitable package.`,
    `📋 بكل سرور!

لإعداد عرض السعر، يرجى تحديد:

📍 الوجهة
📅 تاريخ المغادرة
📅 تاريخ العودة
👥 عدد الأشخاص
🏨 الإقامة المطلوبة
🚐 النقل
🎯 الأنشطة.`,
  );
}

function buildBookingPrompt(lang, recap) {
  const body = pick(
    lang,
    `📌 Avec plaisir ! Pour préparer votre réservation, merci de nous communiquer :

👤 Nom et prénom
📱 Numéro de téléphone
📍 Destination
📅 Date d'arrivée
📅 Date de départ
👥 Nombre de voyageurs
🏨 Formule ou hébergement souhaité.`,
    `📌 Happy to help! To prepare your booking, please share:

👤 Full name
📱 Phone number
📍 Destination
📅 Arrival date
📅 Departure date
👥 Number of travelers
🏨 Package or accommodation.`,
    `📌 بكل سرور! لتحضير الحجز، يرجى إرسال:

👤 الاسم الكامل
📱 رقم الهاتف
📍 الوجهة
📅 تاريخ الوصول
📅 تاريخ المغادرة
👥 عدد المسافرين
🏨 الصيغة أو الإقامة.`,
  );
  return recap ? `${recap}\n\n${body}` : body;
}

function buildPricePrompt(lang, session = {}) {
  if (session.destination) {
    return pick(
      lang,
      `💰 Le tarif pour ${session.destination} dépend des dates, du nombre de personnes et des prestations choisies.

Donnez-moi ces informations et je pourrai vous orienter vers la formule adaptée.`,
      `💰 The price for ${session.destination} depends on dates, travelers and services.

Share these details and I'll guide you to the right option.`,
      `💰 السعر لـ ${session.destination} يعتمد على التواريخ وعدد الأشخاص والخدمات.`,
    );
  }
  return pick(
    lang,
    `💰 Je peux vous renseigner. Pour calculer le tarif correctement, indiquez-moi :

📍 destination ;
📅 dates ;
👥 nombre de personnes ;
🎯 prestation souhaitée.`,
    `💰 I can help. To calculate the right price, share:

📍 destination;
📅 dates;
👥 number of people;
🎯 service needed.`,
    `💰 يمكنني مساعدتكم. لحساب السعر بدقة:

📍 الوجهة؛
📅 التواريخ؛
👥 عدد الأشخاص؛
🎯 الخدمة المطلوبة.`,
  );
}

function buildPricePerPersonPrompt(lang) {
  return pick(
    lang,
    'Souhaitez-vous le tarif **par personne** ou le **prix total pour tout le groupe** ?',
    'Do you want the price **per person** or the **total for the whole group**?',
    'هل تريدون السعر **لكل شخص** أم **الإجمالي للمجموعة**؟',
  );
}

function buildAccommodationPrompt(lang) {
  return pick(
    lang,
    `🏨 Nous pouvons rechercher un hébergement adapté à votre séjour.

Merci de préciser :

📍 destination ;
📅 date d'arrivée ;
📅 date de départ ;
👥 nombre de personnes ;
🛏️ nombre de chambres ;
💰 budget approximatif si vous en avez un.`,
    `🏨 We can find accommodation for your stay.

Please share:

📍 destination;
📅 arrival;
📅 departure;
👥 number of people;
🛏️ number of rooms;
💰 approximate budget if any.`,
    `🏨 يمكننا البحث عن إقامة مناسبة.

يرجى تحديد:

📍 الوجهة؛
📅 الوصول؛
📅 المغادرة؛
👥 عدد الأشخاص؛
🛏️ عدد الغرف؛
💰 الميزانية التقريبية.`,
  );
}

function buildApartmentPrompt(lang) {
  return pick(
    lang,
    `🏠 Vous recherchez un appartement.

Indiquez-moi :

📍 ville ;
📅 arrivée ;
📅 départ ;
👥 nombre de personnes ;
🛏️ nombre de chambres souhaité.

Nous pourrons ensuite rechercher les disponibilités adaptées.`,
    `🏠 You're looking for an apartment.

Share:

📍 city;
📅 arrival;
📅 departure;
👥 number of people;
🛏️ number of bedrooms.

We'll check suitable availability.`,
    `🏠 تبحثون عن شقة.

أرسلوا:

📍 المدينة؛
📅 الوصول؛
📅 المغادرة؛
👥 عدد الأشخاص؛
🛏️ عدد الغرف.`,
  );
}

function buildPaymentPrompt(lang) {
  return pick(
    lang,
    `💳 Les modalités de paiement dépendent de la prestation et des conditions de réservation.

Avant tout paiement, vous recevrez :

💰 le montant à payer ;
📌 l'objet du paiement ;
📅 la réservation concernée ;
📋 les conditions applicables.

Ne jamais envoyer d'informations bancaires sensibles dans le chat.`,
    `💳 Payment terms depend on the service and booking conditions.

Before payment you'll receive amount, purpose, booking details and terms.

Never send sensitive bank details in the chat.`,
    `💳 شروط الدفع تعتمد على الخدمة وشروط الحجز.

قبل الدفع ستتلقون المبلغ والغرض وتفاصيل الحجز.

لا ترسلوا معلومات بنكية حساسة في المحادثة.`,
  );
}

function buildDepositPrompt(lang) {
  return pick(
    lang,
    'Le montant de l\'acompte dépend de la prestation réservée et de ses conditions.\n\nJe peux vous communiquer le montant applicable une fois la formule et les prestations confirmées.',
    'The deposit depends on the booked service and its terms.\n\nI can share the amount once the package is confirmed.',
    'مبلغ العربون يعتمد على الخدمة المحجوزة وشروطها.\n\nيمكنني إبلاغكم بالمبلغ بعد تأكيد الصيغة.',
  );
}

function buildCancellationPrompt(lang) {
  return pick(
    lang,
    'Les conditions d\'annulation dépendent de la prestation et du partenaire concerné.\n\nNous vous communiquerons les conditions applicables avant la confirmation de votre réservation.',
    'Cancellation terms depend on the service and partner.\n\nWe will share applicable terms before confirming your booking.',
    'شروط الإلغاء تعتمد على الخدمة والشريك.\n\nسنبلغكم بالشروط قبل تأكيد الحجز.',
  );
}

function buildModificationPrompt(lang) {
  return pick(
    lang,
    `🔄 Nous pouvons vérifier si la modification est possible.

Merci de nous indiquer :

📅 date actuellement réservée ;
📅 nouvelle date souhaitée ;
📌 réservation concernée.

La modification dépendra des disponibilités et des conditions applicables.`,
    `🔄 We can check if a change is possible.

Please share:

📅 current booking date;
📅 new preferred date;
📌 booking reference.

Changes depend on availability and terms.`,
    `🔄 يمكننا التحقق من إمكانية التعديل.

أرسلوا:

📅 التاريخ المحجوز؛
📅 التاريخ الجديد؛
📌 الحجز المعني.`,
  );
}

function buildDiscountPrompt(lang) {
  return pick(
    lang,
    '😊 Les tarifs dépendent des prestations, des partenaires et de la période.\n\nNous ne pouvons pas toujours appliquer une réduction, mais nous pouvons rechercher la formule la plus adaptée à votre budget.',
    '😊 Rates depend on services, partners and season.\n\nWe can\'t always offer a discount, but we\'ll find the best fit for your budget.',
    '😊 الأسعار تعتمد على الخدمات والشركاء والفترة.\n\nلا يمكننا دائماً تطبيق تخفيض، لكن نبحث عن الأنسب لميزانيتكم.',
  );
}

function buildBudgetAck(amount, lang) {
  return pick(
    lang,
    `Très bien 👍 Votre budget est de **${amount.toLocaleString('fr-DZ')} DA**.

Pour rechercher une formule adaptée, indiquez-moi :

📍 destination ;
📅 durée ;
👥 nombre de personnes ;
🎯 activités souhaitées.

Nous chercherons une option correspondant au mieux à votre budget.`,
    `Great 👍 Your budget is **${amount.toLocaleString('en-US')} DZD**.

Share destination, duration, travelers and activities to find the best fit.`,
    `حسناً 👍 ميزانيتكم **${amount.toLocaleString('ar-DZ')} دج**.

أرسلوا الوجهة والمدة وعدد الأشخاص والأنشطة.`,
  );
}

function buildFamilyPrompt(lang) {
  return pick(
    lang,
    `👨‍👩‍👧‍👦 Avec plaisir !

Nous pouvons rechercher une formule adaptée aux familles.

Merci de préciser :

👨 nombre d'adultes ;
👧 nombre d'enfants ;
🎂 âge des enfants ;
📍 destination ;
📅 dates.`,
    `👨‍👩‍👧‍👦 Happy to help!

We can find a family-friendly package.

Please share:

👨 adults;
👧 children;
🎂 children's ages;
📍 destination;
📅 dates.`,
    `👨‍👩‍👧‍👦 بكل سرور!

يمكننا إيجاد صيغة مناسبة للعائلات.

يرجى تحديد:

👨 البالغون؛
👧 الأطفال؛
🎂 أعمار الأطفال؛
📍 الوجهة؛
📅 التواريخ.`,
  );
}

function buildCouplePrompt(lang) {
  return pick(
    lang,
    `❤️ Avec plaisir !

Nous pouvons rechercher une formule adaptée aux couples : hébergement, découverte, activités et excursions selon la destination.

📅 Quelles sont vos dates ?
👥 2 personnes ou plus ?
📍 Quelle destination souhaitez-vous découvrir ?`,
    `❤️ Happy to help!

We can suggest a couple-friendly package: stay, discovery, activities and excursions.

📅 What dates?
👥 2 people or more?
📍 Which destination?`,
    `❤️ بكل سرور!

يمكننا اقتراح صيغة للأزواج: إقامة، اكتشاف، أنشطة ورحلات.

📅 ما التواريخ؟
👥 شخصان أم أكثر؟
📍 أي وجهة؟`,
  );
}

function buildGroupPrompt(travelers, lang) {
  const n = travelers || '';
  return pick(
    lang,
    `Super 👥 ! Pour un groupe${n ? ` de ${n} personnes` : ''}, nous pouvons étudier une formule adaptée.

Indiquez-moi :

📍 destination ;
📅 dates ;
🗓️ durée ;
🏨 hébergement ;
🎯 activités souhaitées.`,
    `Great 👥! For a group${n ? ` of ${n}` : ''}, we can tailor a package.

Share destination, dates, duration, accommodation and activities.`,
    `رائع 👥! لمجموعة${n ? ` من ${n} أشخاص` : ''}، يمكننا دراسة صيغة مناسبة.

أرسلوا الوجهة والتواريخ والمدة والإقامة والأنشطة.`,
  );
}

function buildCircuitCompletePrompt(lang) {
  return pick(
    lang,
    `Un circuit complet peut regrouper plusieurs prestations selon la formule :

🚐 Transport
🏨 Hébergement
🎯 Activités
📍 Visites
🏜️ Excursions
🍽️ Repas si prévus
👨‍🏫 Guide/accompagnement si prévu.

Les prestations exactes dépendent du circuit choisi.`,
    `A full tour may include:

🚐 Transport
🏨 Accommodation
🎯 Activities
📍 Visits
🏜️ Excursions
🍽️ Meals if included
👨‍🏫 Guide if included.

Exact inclusions depend on the chosen tour.`,
    `الدائرة الكاملة قد تشمل:

🚐 النقل
🏨 الإقامة
🎯 الأنشطة
📍 الزيارات
🏜️ الرحلات
🍽️ الوجبات إن وُجدت
👨‍🏫 المرشد إن وُجد.`,
  );
}

function buildDetailPrompt(lang) {
  return pick(
    lang,
    `Bien sûr 😊 Je peux vous donner le détail concernant :

🗺️ Programme
🏨 Hébergement
🚐 Transport
🍽️ Repas
🎯 Activités
💰 Tarif
📋 Inclus / non inclus
📅 Dates
📌 Conditions de réservation.

Quel élément souhaitez-vous détailler ?`,
    `Sure 😊 I can detail:

🗺️ Program
🏨 Accommodation
🚐 Transport
🍽️ Meals
🎯 Activities
💰 Price
📋 Included / not included
📅 Dates
📌 Booking terms.

What would you like?`,
    `بالطبع 😊 يمكنني التفصيل في:

🗺️ البرنامج
🏨 الإقامة
🚐 النقل
🍽️ الوجبات
🎯 الأنشطة
💰 السعر
📋 المشمول / غير المشمول
📅 التواريخ
📌 شروط الحجز.

ما العنصر الذي تريدونه؟`,
  );
}

function buildTransportPrompt(lang) {
  return pick(
    lang,
    `🚐 Vous souhaitez des informations sur le transport.

Précisez :

📍 départ ;
📍 destination ;
📅 date ;
👥 nombre de personnes.

Nous vérifierons les possibilités selon le circuit ou le séjour.`,
    `🚐 Transport information.

Share:

📍 departure;
📍 destination;
📅 date;
👥 number of people.`,
    `🚐 معلومات عن النقل.

أرسلوا:

📍 المغadرة؛
📍 الوجهة؛
📅 التاريخ؛
👥 عدد الأشخاص.`,
  );
}

function buildAirportTransferPrompt(lang) {
  return pick(
    lang,
    `✈️ Un transfert peut être organisé selon la destination et la disponibilité.

Merci de préciser :

✈️ aéroport ;
📅 date ;
⏰ heure d'arrivée ;
📍 destination finale ;
👥 nombre de personnes.`,
    `✈️ Airport transfer may be arranged depending on destination and availability.

Share airport, date, arrival time, final destination and number of people.`,
    `✈️ يمكن تنظيم نقل من المطار.

أرسلوا المطار والتاريخ ووقت الوصول والوجهة النهائية وعدد الأشخاص.`,
  );
}

function buildHumanAgentPrompt(lang) {
  return pick(
    lang,
    `Bien sûr 👤. Votre demande peut être transmise à notre équipe.

Merci de laisser votre :

👤 Nom & prénom
📱 Numéro de téléphone
📝 Demande.

Un conseiller pourra ensuite vous répondre.`,
    `Sure 👤. Your request can be forwarded to our team.

Please leave:

👤 Name
📱 Phone
📝 Request.

An advisor will get back to you.`,
    `بالطبع 👤. يمكن تحويل طلبكم للفريق.

اتركوا:

👤 الاسم
📱 الهاتف
📝 الطلب.`,
  );
}

function buildThinkingPrompt(lang) {
  return pick(
    lang,
    'Bien sûr 😊 Prenez votre temps. Lorsque vous serez prêt, vous pourrez revenir vers nous pour vérifier les disponibilités et finaliser votre projet.',
    'Sure 😊 Take your time. When ready, come back to check availability and finalize your trip.',
    'بالطبع 😊 خذوا وقتكم. عندما تكونون جاهزين، عدوا للتحقق من التوفر وإتمام مشروعكم.',
  );
}

function buildThanksReply(lang) {
  return pick(
    lang,
    'Avec plaisir 😊🇩🇿 ! Algeria Travel reste à votre disposition pour votre prochain voyage.',
    'You\'re welcome 😊🇩🇿! Algeria Travel is here for your next trip.',
    'على الرحب والسعة 😊🇩🇿! Algeria Travel في خدمتكم لرحلتكم القادمة.',
  );
}

function buildOkReply(lang) {
  return pick(lang, 'Parfait 👍😊', 'Perfect 👍😊', 'ممتاز 👍😊');
}

function buildActivitiesOverview(lang) {
  return pick(
    lang,
    `🎯 Les activités dépendent de la destination.

Nous pouvons proposer selon les lieux :

🐪 Dromadaire
🛻 Quad
🚙 4×4
🚤 Bateau
🛶 Kayak
🐎 Équitation
🥾 Randonnée
🌅 Coucher de soleil
🏕️ Bivouac
🌊 Activités nautiques
📸 Visites et découvertes.

Dites-moi votre destination et je pourrai vous orienter.`,
    `🎯 Activities depend on the destination.

We may offer:

🐪 Camel
🛻 Quad
🚙 4×4
🚤 Boat
🛶 Kayak
🐎 Horseback
🥾 Hiking
🌅 Sunset
🏕️ Bivouac
🌊 Water sports
📸 Sightseeing.

Tell me your destination and I'll guide you.`,
    `🎯 الأنشطة تعتمد على الوجهة.

يمكننا اقتراح:

🐪 الجمل
🛻 الكواد
🚙 4×4
🚤 القارب
🛶 الكاياك
🐎 الفروسية
🥾 المشي
🌅 الغروب
🏕️ Bivouac
🌊 أنشطة مائية
📸 الزيارات.

حدّدوا الوجهة وسأوجّهكم.`,
  );
}

function buildDefaultMenu(lang) {
  return pick(
    lang,
    `😊 Je peux vous aider pour votre voyage en Algérie.

Vous recherchez plutôt :

🗺️ Circuit
🏨 Hébergement
🎯 Activité
🚐 Transport
💰 Tarif
📅 Disponibilité
📌 Réservation ?

Dites-moi simplement ce que vous recherchez.`,
    `😊 I can help with your trip to Algeria.

Are you looking for:

🗺️ Tour
🏨 Accommodation
🎯 Activity
🚐 Transport
💰 Price
📅 Availability
📌 Booking?

Just tell me what you need.`,
    `😊 يمكنني مساعدتكم في رحلتكم إلى الجزائر.

هل تبحثون عن:

🗺️ دائرة
🏨 إقامة
🎯 نشاط
🚐 نقل
💰 سعر
📅 توفر
📌 حجز؟

أخبروني بما تحتاجون.`,
  );
}

function detectActivityFromMessage(message) {
  const n = String(message || '').toLowerCase().trim();
  if (/^quad/.test(n)) return 'quad';
  if (/^bateau|^boat/.test(n)) return 'boat';
  if (/^kayak/.test(n)) return 'kayak';
  if (/^dromadaire|^drom|^chameau|^camel/.test(n)) return 'camel';
  if (/^cheval|^equitation/.test(n)) return 'horse';
  return null;
}

module.exports = {
  buildTaghitIntro,
  buildActivityInquiry,
  buildDispoInquiry,
  buildDevisPrompt,
  buildBookingPrompt,
  buildPricePrompt,
  buildPricePerPersonPrompt,
  buildAccommodationPrompt,
  buildApartmentPrompt,
  buildPaymentPrompt,
  buildDepositPrompt,
  buildCancellationPrompt,
  buildModificationPrompt,
  buildDiscountPrompt,
  buildBudgetAck,
  buildFamilyPrompt,
  buildCouplePrompt,
  buildGroupPrompt,
  buildCircuitCompletePrompt,
  buildDetailPrompt,
  buildTransportPrompt,
  buildAirportTransferPrompt,
  buildHumanAgentPrompt,
  buildThinkingPrompt,
  buildThanksReply,
  buildOkReply,
  buildActivitiesOverview,
  buildDefaultMenu,
  detectActivityFromMessage,
};
