/**
 * Lexique du chatbot : abréviations / SMS / darija (latin et arabe) → forme canonique,
 * et mots-clés de chaque intention. Tout est écrit sous forme normalisée (voir text.normalize).
 */

/** Mot (ou abréviation) → remplacement canonique, appliqué mot par mot avant l’analyse. */
const EXPANSIONS = {
  // Salutations
  bjr: 'bonjour', bj: 'bonjour', bnjr: 'bonjour', bonjou: 'bonjour', bsr: 'bonsoir', slt: 'salut', cc: 'coucou',
  slm: 'salam', salem: 'salam', salut: 'salut', saha: 'salam', hlo: 'hello', hii: 'hi',
  // Politesse
  svp: 'sil vous plait', stp: 'sil te plait', pls: 'please', plz: 'please', mrc: 'merci', mrci: 'merci', thx: 'thanks',
  // Abréviations courantes
  pr: 'pour', pk: 'pourquoi', pq: 'pourquoi', qd: 'quand', cmt: 'comment', cmb: 'combien', cb: 'combien', comb: 'combien',
  ccombien: 'combien', cestcombien: 'combien', jv: 'je veux', jveux: 'je veux', jvoudrais: 'je voudrais', jsp: 'je sais pas',
  rdv: 'rendez vous', tel: 'telephone', num: 'numero', mail: 'email', msg: 'message', infos: 'informations', info: 'information',
  pers: 'personnes', perso: 'personnes', prs: 'personnes', ppl: 'personnes', adlt: 'adultes', enf: 'enfants',
  ok: 'ok', okk: 'ok', oki: 'ok', okay: 'ok', dac: 'daccord', dacc: 'daccord', daccord: 'daccord', ouais: 'oui', ouai: 'oui', wi: 'oui',
  nn: 'non', nan: 'non',
  // Voyage
  res: 'reservation', resa: 'reservation', rsa: 'reservation', reza: 'reservation', rez: 'reservation', reserv: 'reservation',
  booking: 'reservation', book: 'reserver', dispo: 'disponibilite', dispos: 'disponibilite', dispon: 'disponibilite', disp: 'disponibilite',
  apart: 'appartement', appart: 'appartement', apparte: 'appartement', appt: 'appartement', apt: 'appartement', apparts: 'appartement',
  studio: 'appartement', f2: 'appartement', f3: 'appartement', htl: 'hotel', hotl: 'hotel', otel: 'hotel', hotels: 'hotel', hotele: 'hotel',
  heberg: 'hebergement', hebergt: 'hebergement', logement: 'hebergement', loger: 'hebergement', dormir: 'hebergement',
  circ: 'circuit', circuits: 'circuit', voyaj: 'voyage', voy: 'voyage', vols: 'vol', prog: 'programme', progr: 'programme',
  px: 'prix', tarifs: 'tarif', act: 'activite', activ: 'activite', activites: 'activite', activities: 'activity', excursions: 'excursion',
  dest: 'destination', desti: 'destination', destinations: 'destination', chb: 'chambre', chbre: 'chambre', chambres: 'chambre',
  // Darija en lettres latines (arabizi)
  bsh7al: 'combien', bch7al: 'combien', b7al: 'combien', ch7al: 'combien', chhal: 'combien', sh7al: 'combien', bechhal: 'combien', bchhal: 'combien',
  n7ab: 'je veux', n7eb: 'je veux', nheb: 'je veux', nhab: 'je veux', bghit: 'je veux',
  nreservi: 'reserver', nreserver: 'reserver', nrizervi: 'reserver', nhjez: 'reserver', nehjez: 'reserver',
  kayen: 'il y a', kayn: 'il y a', kaine: 'il y a', kain: 'il y a', makanch: 'il n y a pas',
  blayes: 'places', blays: 'places', blasa: 'place',
  wach: 'quoi', wesh: 'quoi', wech: 'quoi', kifach: 'comment', kifah: 'comment', win: 'ou', wakteh: 'quand', waqtach: 'quand',
  nroh: 'aller', nrouh: 'aller', nsafer: 'voyager', nkhalas: 'payer', nkhales: 'payer', khlas: 'paiement',
  yatik: 'merci', ya3tik: 'merci',
  wah: 'oui', iyeh: 'oui', ih: 'oui',
  // Anglais compact
  u: 'you', ur: 'your', hw: 'how',
};

/** Expressions sur plusieurs mots → forme canonique (appliquées avant les expansions mot à mot). */
const PHRASES = [
  [/\bc ?est combien\b/g, 'combien'], [/\bc combien\b/g, 'combien'], [/\bca coute combien\b/g, 'combien'],
  [/\bcombien ca coute\b/g, 'combien'], [/\bprix combien\b/g, 'prix'], [/\bhow much\b/g, 'price'],
  [/\bil reste des places\b/g, 'disponibilite'], [/\bvous avez des places\b/g, 'disponibilite'], [/\by a de la dispo\b/g, 'disponibilite'],
  [/\bc dispo\b/g, 'disponibilite'], [/\bil y a des places\b/g, 'disponibilite'],
  [/\bfaire une reservation\b/g, 'reserver'], [/\bfaire une resa\b/g, 'reserver'],
  [/\bmaison d ?hote\b/g, 'maison dhote'], [/\bguest ?house\b/g, 'maison dhote'],
];

/**
 * Intentions → mots-clés. Un mot simple tolère les fautes (≥ 4 lettres) ; une expression doit apparaître telle quelle.
 * weight : 1 = indice fort, 0.5 = indice faible.
 */
const INTENTS = {
  GREETING: {
    words: ['bonjour', 'bonsoir', 'salut', 'coucou', 'salam', 'hello', 'hi', 'hey', 'marhaba', 'ahlan', 'سلام', 'مرحبا', 'اهلا', 'السلام'],
    phrases: ['salam alikoum', 'salam alaykoum', 'salam alikom', 'good morning', 'good evening', 'السلام عليكم', 'صباح الخير', 'مساء الخير'],
  },
  THANKS: {
    words: ['merci', 'thanks', 'thank', 'شكرا', 'يعطيك', 'صحيت'],
    phrases: ['thank you', 'يعطيك الصحه'],
  },
  GOODBYE: {
    words: ['bye', 'goodbye', 'aurevoir', 'ciao', 'بسلامه'],
    phrases: ['au revoir', 'a bientot', 'bonne journee', 'bonne soiree', 'see you'],
  },
  PRICE: {
    words: ['prix', 'tarif', 'combien', 'cout', 'coute', 'couter', 'price', 'prices', 'cost', 'budget', 'cher', 'بشحال', 'شحال', 'السعر', 'سعر', 'الثمن', 'ثمن', 'تمن', 'الاسعار', 'اسعار', 'بقداش', 'قداش'],
    phrases: ['a partir de', 'pas cher'],
  },
  AVAILABILITY: {
    words: ['disponibilite', 'disponible', 'disponibles', 'available', 'availability', 'places', 'complet', 'libre', 'بلايص', 'بلاصه', 'متوفر', 'متاح', 'متاحه'],
    phrases: ['il y a de la place', 'reste de la place', 'any room', 'any place', 'كاين بلايص', 'كاين بلاصه', 'كاين disponibilite', 'il y a places', 'il y a place'],
  },
  BOOKING: {
    words: ['reserver', 'reservation', 'reserve', 'booker', 'book', 'نحجز', 'حجز', 'الحجز', 'احجز', 'نريزرفي', 'نريزارفي'],
    phrases: ['je veux partir', 'je prends', 'on prend', 'je confirme la reservation', 'نحب نحجز'],
  },
  HOTEL: {
    words: ['hotel', 'hebergement', 'chambre', 'room', 'accommodation', 'فندق', 'اوتيل', 'الفندق', 'لوطيل'],
    phrases: ['maison dhote', 'ou dormir', 'where to stay'],
  },
  APARTMENT: {
    words: ['appartement', 'apartment', 'flat', 'villa', 'location', 'شقه', 'ابارتمو', 'ابارتمان', 'دار'],
    phrases: ['a louer', 'for rent'],
  },
  ACTIVITY: {
    words: ['activite', 'activity', 'excursion', 'quad', '4x4', 'chameau', 'dromadaire', 'camel', 'kayak', 'randonnee', 'rando', 'balade', 'نشاط', 'انشطه', 'نشاطات'],
    phrases: ['quoi faire', 'que faire', 'things to do', 'vous faites quoi', 'faites quoi'],
  },
  TOUR: {
    words: ['circuit', 'voyage', 'tour', 'tours', 'sejour', 'trip', 'formule', 'offre', 'offres', 'package', 'rihla', 'رحله', 'رحلات', 'الرحلات', 'جوله', 'جولات', 'سفريه', 'العروض', 'عروض', 'عرض'],
    phrases: ['partir en voyage'],
  },
  DESTINATION: {
    words: ['destination', 'visiter', 'visit', 'endroit', 'region', 'ville', 'وجهه', 'وجهات'],
    phrases: ['ou aller', 'where to go', 'quelles destinations'],
  },
  PROGRAM: {
    words: ['programme', 'itineraire', 'inclus', 'compris', 'include', 'included', 'includes', 'program', 'planning', 'contenu', 'البرنامج', 'برنامج'],
    phrases: ['ce qui est inclus', 'quest ce qui est inclus', 'what is included', 'non inclus', 'pas inclus', 'details du circuit'],
  },
  DATE: {
    words: ['date', 'dates', 'quand', 'when', 'depart', 'periode', 'calendrier', 'تاريخ', 'وقتاش', 'امتى', 'وقت'],
    phrases: ['quelle date', 'quelles dates', 'prochain depart'],
  },
  DURATION: {
    words: ['duree', 'duration', 'long', 'المده', 'مده'],
    phrases: ['combien de jours', 'combien de nuits', 'how long', 'how many days', 'شحال من يوم', 'قداش من يوم'],
  },
  TRANSPORT: {
    words: ['transport', 'vol', 'avion', 'flight', 'bus', 'navette', 'transfert', 'aeroport', 'airport', 'train', 'voiture', 'van', 'طياره', 'الطياره', 'نقل', 'كار', 'حافله'],
    phrases: ['comment y aller', 'how to get'],
  },
  PAYMENT: {
    words: ['payer', 'paiement', 'payment', 'pay', 'carte', 'cash', 'especes', 'virement', 'ccp', 'baridimob', 'acompte', 'avance', 'الدفع', 'نخلص', 'خلاص'],
    phrases: ['moyen de paiement', 'moyens de paiement', 'comment payer', 'je peux payer'],
  },
  CONTACT: {
    words: ['contact', 'contacter', 'telephone', 'numero', 'email', 'whatsapp', 'appeler', 'call', 'phone', 'رقم', 'الهاتف', 'تواصل', 'اتصل', 'نعيطلكم'],
    phrases: ['vous joindre', 'votre numero', 'votre email'],
  },
  LOCATION: {
    words: ['adresse', 'address', 'agence', 'bureau', 'situe', 'situes', 'located', 'العنوان', 'عنوان'],
    phrases: ['ou etes vous', 'ou vous etes', 'vous etes ou', 'where are you', 'ou se trouve', 'votre adresse', 'وين راكم', 'وين كاينين', 'win rakom', 'win rakoum'],
  },
  CANCELLATION: {
    words: ['annuler', 'annulation', 'cancel', 'cancellation', 'rembourser', 'remboursement', 'refund', 'conditions', 'الغاء', 'نلغي', 'نبطل'],
    phrases: ['changer ma reservation', 'modifier ma reservation'],
  },
  HUMAN_AGENT: {
    words: ['conseiller', 'conseillere', 'agent', 'humain', 'human', 'operateur', 'quelquun', 'personne reelle', 'موظف', 'انسان'],
    phrases: [
      'parler a quelqu un', 'parler a quelquun', 'parler a une personne', 'quelqu un peut m aider', 'quelquun peut maider',
      'je veux appeler', 'un agent', 'real person', 'talk to someone', 'speak to someone', 'parler a un conseiller',
      'نهدر مع', 'نتكلم مع', 'واحد يعاوني',
    ],
  },
  GENERAL_INFORMATION: {
    words: ['information', 'informations', 'renseignement', 'renseignements', 'renseigner', 'question', 'aide', 'help', 'معلومات', 'استفسار'],
    phrases: ['je veux savoir', 'besoin d aide', 'comment ca marche', 'vous proposez quoi', 'vous faites quoi'],
  },
};

/** Réponses oui / non (messages très courts, dans un contexte de question fermée). */
const YES = new Set(['oui', 'ok', 'daccord', 'yes', 'yep', 'yeah', 'sure', 'parfait', 'go', 'vas y', 'confirmer', 'confirme', 'je confirme', 'valider', 'envoyer', 'نعم', 'اي', 'ايه', 'واه', 'صح', 'اكيد', 'موافق', 'oui svp', 'oui sil vous plait', 'ok sil vous plait', 'bien sur', 'avec plaisir', 'cest bon', 'c bon', 'ca marche']);
const NO = new Set(['non', 'no', 'nope', 'pas maintenant', 'non merci', 'no thanks', 'لا', 'لالا', 'لا شكرا', 'rien', 'aucune', 'aucun', 'nothing', 'none', 'pas de demande', 'cest tout', 'ras']);

/** Mois (fr, en, arabe standard et algérien) → numéro. */
const MONTHS = {
  janvier: 1, janv: 1, jan: 1, january: 1, 'جانفي': 1, 'يناير': 1,
  fevrier: 2, fev: 2, feb: 2, february: 2, 'فيفري': 2, 'فبراير': 2,
  mars: 3, mar: 3, march: 3, 'مارس': 3,
  avril: 4, avr: 4, apr: 4, april: 4, 'افريل': 4, 'ابريل': 4,
  mai: 5, may: 5, 'ماي': 5, 'مايو': 5,
  juin: 6, jun: 6, june: 6, 'جوان': 6, 'يونيو': 6,
  juillet: 7, juil: 7, jul: 7, july: 7, 'جويليه': 7, 'يوليو': 7,
  aout: 8, aug: 8, august: 8, 'اوت': 8, 'اغسطس': 8,
  septembre: 9, sept: 9, sep: 9, september: 9, 'سبتمبر': 9,
  octobre: 10, oct: 10, october: 10, 'اكتوبر': 10,
  novembre: 11, nov: 11, november: 11, 'نوفمبر': 11,
  decembre: 12, dec: 12, december: 12, 'ديسمبر': 12, 'دجنبر': 12,
};

/** Nombres écrits en lettres (fr, en, darija). */
const NUMBER_WORDS = {
  un: 1, une: 1, one: 1, seul: 1, seule: 1, alone: 1, wahed: 1, wahda: 1, 'واحد': 1, 'وحدي': 1,
  deux: 2, two: 2, couple: 2, zouj: 2, 'زوج': 2, 'جوج': 2, 'اثنين': 2,
  trois: 3, three: 3, tlata: 3, 'ثلاثه': 3, 'تلاته': 3,
  quatre: 4, four: 4, rb3a: 4, arba: 4, 'اربعه': 4,
  cinq: 5, five: 5, khamsa: 5, 'خمسه': 5,
  six: 6, sitta: 6, setta: 6, 'سته': 6,
  sept: 7, seven: 7, sab3a: 7, 'سبعه': 7,
  huit: 8, eight: 8, tmanya: 8, 'ثمانيه': 8,
  neuf: 9, nine: 9, 'تسعه': 9,
  dix: 10, ten: 10, 'عشره': 10,
};

/** Indices de langue anglaise (mots qui n’existent pas en français). */
const ENGLISH_HINTS = new Set([
  'hi', 'hello', 'hey', 'the', 'is', 'are', 'do', 'does', 'you', 'your', 'i', 'want', 'would', 'like', 'price', 'prices', 'cost',
  'how', 'much', 'many', 'what', 'where', 'when', 'book', 'available', 'please', 'thanks', 'thank', 'need', 'looking', 'for',
  'trip', 'tour', 'can', 'there', 'any', 'people', 'persons', 'room', 'rooms', 'stay', 'have', 'with', 'from', 'to', 'and',
]);
const FRENCH_HINTS = new Set([
  'je', 'vous', 'le', 'la', 'les', 'des', 'un', 'une', 'pour', 'est', 'et', 'prix', 'combien', 'bonjour', 'salut', 'veux',
  'voudrais', 'reserver', 'reservation', 'merci', 'oui', 'non', 'personnes', 'quel', 'quelle', 'avez', 'au', 'du', 'en', 'sil', 'plait',
]);

module.exports = { EXPANSIONS, PHRASES, INTENTS, YES, NO, MONTHS, NUMBER_WORDS, ENGLISH_HINTS, FRENCH_HINTS };
