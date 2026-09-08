const WHATSAPP = '213557664089';

function getSuggestions(lang) {
  const s = {
    fr: ['Voyage / circuits', 'Tarif Taghit', 'Vol 23-28 oct.', 'Réserver', 'Sahara', 'Activités quad'],
    en: ['Trips / tours', 'Taghit price', 'Flight Oct 23–28', 'Book', 'Sahara', 'Quad activities'],
    ar: ['الرحلات', 'سعر تاغيت', 'رحلة 23-28', 'حجز', 'الصحراء', 'أنشطة'],
  };
  return s[lang] || s.fr;
}

module.exports = { WHATSAPP, getSuggestions };
