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

const AVION = {
  duration: L('4 jours / 3 nuits', '4 days / 3 nights', '4 أيام / 3 ليالٍ'),
  dates: L(
    'Départs : 17–20 nov., 24–27 nov., 1er–4 déc., 8–11 déc., 15–18 déc., 22–25 déc., 29 déc.–1er janv. 2027',
    'Departures: 17–20 Nov, 24–27 Nov, 1–4 Dec, 8–11 Dec, 15–18 Dec, 22–25 Dec, 29 Dec–1 Jan 2027',
    'الرحلات: 17–20 نوفمبر، 24–27 نوفمبر، 1–4 ديسمبر، 8–11 ديسمبر، 15–18 ديسمبر، 22–25 ديسمبر، 29 ديسمبر–1 يناير 2027'
  ),
  transport: L('Vol aller-retour + transport sur place inclus', 'Round-trip flight + local transport included', 'رحلة ذهاب وإياب + النقل المحلي مشمول'),
  stay: L('Hébergement 3 nuits · pension complète', '3 nights accommodation · full board', 'إقامة 3 ليالٍ · إقامة كاملة'),
  includes: [
    L('Kayak, 4×4 dans les dunes, dromadaire, ski sur sable', 'Kayak, 4×4 in the dunes, camel ride, sand skiing', 'كاياك، دفع رباعي، جمل، تزلج على الرمال'),
    L('Peintures rupestres, ksar de Taghit, Djebel Baroun, soirée musicale', 'Rock art, Taghit ksar, Djebel Baroun, music evening', 'رسوم صخرية، قصر تاغيت، جبل بارون، سهرة موسيقية'),
    L('Tarifs : 75 000 DA (+ 10 ans) · 55 000 DA (2 à 10 ans) · 30 000 DA (- 2 ans)', 'Prices: 75,000 DZD (over 10) · 55,000 DZD (2–10) · 30,000 DZD (under 2)', 'الأسعار: 75000 دج (+10 سنوات) · 55000 دج (2–10) · 30000 دج (أقل من سنتين)'),
  ],
  description: L(
    'Séjour Taghit 4 jours / 3 nuits par avion : grande dune, ski sur sable, kayak au lac, dromadaire, ksar, Djebel Baroun et sortie 4×4 au coucher du soleil.',
    'Taghit 4-day / 3-night stay by plane: great dune, sand skiing, lake kayak, camel ride, ksar, Djebel Baroun and a 4×4 sunset outing.',
    'إقامة تاغيت 4 أيام / 3 ليالٍ بالطائرة: الكثيب الكبير، تزلج على الرمال، كاياك، جمل، القصر، جبل بارون وجولة دفع رباعي عند الغروب.'
  ),
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
  if (placeSlug === 'taghit' && pkg === 'avion') return AVION;
  if (placeSlug === 'taghit' && (pkg === 'hotel' || pkg === 'guesthouse')) return taghitPackage(pkg);
  return null;
}

module.exports = { siteDetailsFor, L };
