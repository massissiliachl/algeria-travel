/**
 * Détails affichés sur le site public (client/js/data) mais absents des colonnes de la base pour certains circuits.
 * Utilisés uniquement pour compléter un champ vide : la base reste prioritaire (prix, publication, ouverture).
 */
const { TAGHIT_PACKAGES } = require('../../scripts/data/taghitPackages.cjs');

const L = (fr, en, ar) => ({ fr, en: en || fr, ar: ar || fr });

const TADRART = {
  duration: L('6 jours / 6 nuits', '6 days / 6 nights', '6 أيام / 6 ليالٍ'),
  dates: L('Du 17 au 24 décembre 2026', '17–24 December 2026', 'من 17 إلى 24 ديسمبر 2026'),
  transport: L('Vols Alger – Djanet – Alger + 4×4 pendant tout le séjour', 'Algiers – Djanet – Algiers flights + 4×4 throughout', 'رحلات الجزائر – جانت – الجزائر + دفع رباعي طوال الإقامة'),
  stay: L('Bivouac ou lodge selon le programme', 'Bivouac or lodge depending on the programme', 'مخيم أو نُزل حسب البرنامج'),
  includes: [
    L('Billets d’avion Alger – Djanet – Alger', 'Algiers – Djanet – Algiers flights', 'تذاكر الطيران الجزائر – جانت – الجزائر'),
    L('4×4 pendant tout le séjour', '4×4 throughout the stay', 'دفع رباعي طوال الإقامة'),
    L('Bivouac ou lodge selon le programme', 'Bivouac or lodge depending on the programme', 'مخيم أو نُزل حسب البرنامج'),
    L('Pension complète, cuisine locale', 'Full board, local cuisine', 'إقامة كاملة، مطبخ محلي'),
    L('Guides locaux expérimentés', 'Experienced local guides', 'مرشدون محليون ذوو خبرة'),
  ],
  description: L(
    'Circuit en 4×4 dans la Tadrart Rouge, au sud-est de Djanet : dunes orangées, arches de grès et art rupestre de plus de 12 000 ans.',
    '4×4 circuit in the Tadrart Rouge, south-east of Djanet: orange dunes, sandstone arches and rock art over 12,000 years old.',
    'جولة بالدفع الرباعي في تادرارت الحمراء جنوب شرق جانت: كثبان برتقالية وأقواس حجرية وفن صخري عمره أكثر من 12000 سنة.'
  ),
  perPerson: true,
};

const BREZINA = {
  duration: L('5 jours / 4 nuits', '5 days / 4 nights', '5 أيام / 4 ليالٍ'),
  dates: L('Du 16 au 21 novembre', '16–21 November', 'من 16 إلى 21 نوفمبر'),
  transport: L('Van Mercedes VIP', 'Mercedes VIP van', 'فان مرسيدس VIP'),
  stay: L('1 nuit bivouac à Brezina + 3 nuits en maison d’hôte · pension complète', '1 night Brezina bivouac + 3 nights guesthouse · full board', 'ليلة تخييم في بريزينا + 3 ليالٍ في بيت ضيافة · إقامة كاملة'),
  includes: [
    L('1 nuit en bivouac à Brezina (tentes & matériel fournis)', '1 night Brezina bivouac (tents & gear provided)', 'ليلة تخييم في بريزينا (خيام ومعدات متوفرة)'),
    L('3 nuits en maison d’hôte traditionnelle', '3 nights in a traditional guesthouse', '3 ليالٍ في بيت ضيافة تقليدي'),
    L('Van Mercedes VIP + pension complète', 'Mercedes VIP van + full board', 'فان مرسيدس VIP + إقامة كاملة'),
    L('Safari 4×4, thé & qaada, kayak, dromadaire, peintures rupestres, soirée musicale', '4×4 safari, tea & qaada, kayak, camel, rock art, musical evening', 'سفاري 4×4، شاي وقعدة، كاياك، جمل، رسوم صخرية، سهرة موسيقية'),
    L('Visite de l’ancienne caserne et des ksars · guides francophones et locaux', 'Old barracks & ksars visit · French-speaking & local guides', 'زيارة الثكنة القديمة والقصور · مرشدون ناطقون بالفرنسية ومحليون'),
  ],
  perPerson: true,
};

function taghitPackage(pkg) {
  const p = TAGHIT_PACKAGES[pkg];
  if (!p) return null;
  return {
    duration: L(p.duration, p.duration_en, p.duration_ar),
    transport: L(p.transport, p.transport_en, p.transport_ar),
    stay: L(p.stay, p.stay_en, p.stay_ar),
    includes: [...p.includes, ...(p.extra ? [p.extra] : [])].map((i) => L(i.fr, i.en, i.ar)),
    perPerson: true,
  };
}

/** Détails du site pour un circuit (place + formule), ou null. */
function siteDetailsFor(placeSlug, pkg) {
  if (placeSlug === 'tadrart') return TADRART;
  if (placeSlug === 'taghit' && pkg === 'brezina') return BREZINA;
  if (placeSlug === 'taghit' && (pkg === 'hotel' || pkg === 'guesthouse')) return taghitPackage(pkg);
  return null;
}

module.exports = { siteDetailsFor, L };
