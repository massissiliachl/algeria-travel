/** Itinéraires jour par jour — réponses locales intelligentes */

const { formatDestinationLabel } = require('./chatSession');

const ITINERARIES = {
  bejaia: {
    fr: [
      { day: 1, title: 'Cap Carbon & centre', items: ['🏛️ Vieux port & casbah', '🌊 Cap Carbon', '🍽️ Poisson grillé'] },
      { day: 2, title: 'Plages & mer', items: ['🏖️ Plage de Tichy / El Kseur', '🚤 Sortie bateau (si dispo)', '🌅 Coucher de soleil'] },
      { day: 3, title: 'Nature & montagne', items: ['🥾 Randonnée Djurdjura', '🌲 Forêt de cèdres', '🍽️ Cuisine kabyle'] },
      { day: 4, title: 'Détente', items: ['🏖️ Plage calme', '🛍️ Artisanat local', '☕ Café bord de mer'] },
    ],
    en: [
      { day: 1, title: 'Cap Carbon & town', items: ['🏛️ Old port & casbah', '🌊 Cap Carbon', '🍽️ Grilled fish'] },
      { day: 2, title: 'Beaches', items: ['🏖️ Tichy / El Kseur', '🚤 Boat trip', '🌅 Sunset'] },
      { day: 3, title: 'Nature', items: ['🥾 Djurdjura hike', '🌲 Cedar forest', '🍽️ Kabyle cuisine'] },
      { day: 4, title: 'Relax', items: ['🏖️ Quiet beach', '🛍️ Local crafts', '☕ Seaside café'] },
    ],
  },
  alger: {
    fr: [
      { day: 1, title: 'Alger centre', items: ['🏛️ Casbah UNESCO', '🌊 Front de mer', '🍽️ Restaurant vue mer'] },
      { day: 2, title: 'Tipaza', items: ['🏛️ Ruines romaines', '🏖️ Plage', '🍽️ Poisson'] },
      { day: 3, title: 'Culture', items: ['🏛️ Musée des Beaux-Arts', '🕌 Grande Poste', '🛍️ Didouche Mourad'] },
    ],
    en: [
      { day: 1, title: 'Algiers centre', items: ['🏛️ UNESCO Casbah', '🌊 Seaside promenade', '🍽️ Seafood'] },
      { day: 2, title: 'Tipaza', items: ['🏛️ Roman ruins', '🏖️ Beach', '🍽️ Fish lunch'] },
      { day: 3, title: 'Culture', items: ['🏛️ Fine Arts Museum', '🕌 Grande Poste', '🛍️ Didouche Mourad'] },
    ],
  },
  taghit: {
    fr: [
      { day: 1, title: 'Arrivée & dunes', items: ['✈️ Vol Alger – Béchar', '🏜️ Dunes de Taghit', '🌅 Coucher de soleil'] },
      { day: 2, title: 'Aventure', items: ['🛻 4×4 dunes', '🏂 Ski sur sable', '🐪 Dromadaire'] },
      { day: 3, title: 'Patrimoine', items: ['🏛️ Ksars & oasis', '🚶 Balade village', '⭐ Ciel étoilé'] },
    ],
    en: [
      { day: 1, title: 'Arrival', items: ['✈️ Algiers – Béchar flight', '🏜️ Taghit dunes', '🌅 Sunset'] },
      { day: 2, title: 'Adventure', items: ['🛻 4×4', '🏂 Sandboarding', '🐪 Camel ride'] },
      { day: 3, title: 'Heritage', items: ['🏛️ Ksars & oasis', '🚶 Village walk', '⭐ Stargazing'] },
    ],
  },
  oran: {
    fr: [
      { day: 1, title: 'Oran centre', items: ['🏛️ Front de mer & Santa Cruz', '🕌 Sacré-Cœur', '🍽️ Resto vue mer'] },
      { day: 2, title: 'Plages', items: ['🏖️ Ain El Turck', '🌊 Bord de mer', '🎵 Ambiance oranaise'] },
    ],
    en: [
      { day: 1, title: 'Oran centre', items: ['🏛️ Seafront & Santa Cruz', '🕌 Sacred Heart', '🍽️ Seaside restaurant'] },
      { day: 2, title: 'Beaches', items: ['🏖️ Ain El Turck', '🌊 Coast', '🎵 Local vibes'] },
    ],
  },
  constantine: {
    fr: [
      { day: 1, title: 'Ponts & casbah', items: ['🌉 Pont Sidi M\'Cid', '🏛️ Casbah', '📸 Vue panoramique'] },
      { day: 2, title: 'Patrimoine', items: ['🏛️ Palais du Bey', '🕌 Mosquée Emir Abdelkader', '🚶 Médina'] },
    ],
    en: [
      { day: 1, title: 'Bridges', items: ['🌉 Sidi M\'Cid bridge', '🏛️ Casbah', '📸 Panorama'] },
      { day: 2, title: 'Heritage', items: ['🏛️ Bey Palace', '🕌 Emir Abdelkader mosque', '🚶 Old town'] },
    ],
  },
  jijel: {
    fr: [
      { day: 1, title: 'Plages', items: ['🏖️ Plages de Jijel', '🌊 Eau cristalline', '🍽️ Fruits de mer'] },
      { day: 2, title: 'Nature', items: ['🌲 Forêt de Kaala', '🥾 Randonnée côtière', '📸 Criques'] },
    ],
    en: [
      { day: 1, title: 'Beaches', items: ['🏖️ Jijel beaches', '🌊 Crystal water', '🍽️ Seafood'] },
      { day: 2, title: 'Nature', items: ['🌲 Kaala forest', '🥾 Coastal hike', '📸 Coves'] },
    ],
  },
};

function buildItinerary(destination, days = 3, lang = 'fr', interests = []) {
  const destId = destination === 'bechar' ? 'taghit' : destination;
  const plan = ITINERARIES[destId];
  if (!plan) return null;

  const langPlan = plan[lang] || plan.fr;
  const numDays = Math.min(Math.max(days || 3, 1), 7);
  const selected = langPlan.slice(0, numDays);
  const destLabel = formatDestinationLabel(destId, lang);

  const L = {
    fr: { title: '🗺️ Programme proposé', day: 'JOUR', note: 'Adaptable selon budget, transport et préférences.' },
    en: { title: '🗺️ Suggested itinerary', day: 'DAY', note: 'Adjustable based on budget and preferences.' },
    ar: { title: '🗺️ برنامج مقترح', day: 'يوم', note: 'قابل للتعديل.' },
  };
  const t = L[lang] || L.fr;

  const lines = [`${t.title} — ${destLabel} (${numDays} ${lang === 'en' ? 'days' : lang === 'ar' ? 'أيام' : 'jours'})`, ''];

  for (const d of selected) {
    lines.push(`### ${t.day} ${d.day} — ${d.title}`);
    d.items.forEach((item) => lines.push(`• ${item}`));
    lines.push('');
  }

  if (interests.length) {
    lines.push(lang === 'en' ? `Focus: ${interests.join(', ')}` : `Centres d'intérêt : ${interests.join(', ')}`, '');
  }

  lines.push(t.note);
  return lines.join('\n');
}

module.exports = { buildItinerary, ITINERARIES };
