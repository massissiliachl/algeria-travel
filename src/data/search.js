import { PLACES } from './places';
import { ACTIVITIES } from './activities';
import { FEATURED_TOURS } from './tours';

/** Normalize for accent-insensitive matching */
export const normalizeQuery = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const PLACE_ALIASES = {
  bejaia: ['bejaya', 'kabylie', 'cap carbon', 'plage', 'mer', 'cote', 'coast'],
  djanet: ['tassili', 'tin merzouga', 'sahara', 'desert', 'touareg'],
  ghardaia: ['mzab', 'm zab', 'ksour', 'mozabite', 'oasis', 'sahara'],
  hoggar: ['assekrem', 'tamanrasset', 'tam', 'sahara', 'montagne', 'tuareg'],
};

const ACTIVITY_ALIASES = {
  quad: ['dune', 'moto', 'desert', 'sahara', 'aventure'],
  '4x4': ['safari', 'tout terrain', 'offroad', 'piste', 'desert', 'sahara'],
  camel: ['chameau', 'dromadaire', 'mehari', 'balade', 'desert'],
  kayak: ['paddle', 'eau', 'nautique', 'lac', 'mer', 'bateau'],
  ksars: ['ksour', 'patrimoine', 'culture', 'visite', 'architecture'],
};

const scoreText = (haystack, needle) => {
  if (!needle) return 0;
  const h = normalizeQuery(haystack);
  const n = normalizeQuery(needle);
  if (!h || !n) return 0;
  if (h === n) return 100;
  if (h.startsWith(n)) return 80;
  if (h.includes(n)) return 60;
  const parts = n.split(' ').filter(Boolean);
  const hit = parts.filter((p) => h.includes(p)).length;
  if (hit === 0) return 0;
  return Math.round((hit / parts.length) * 45);
};

const placeHaystack = (place) =>
  [
    place.name,
    place.name_en,
    place.name_ar,
    place.tagline,
    place.tagline_en,
    place.description,
    place.description_en,
    ...(PLACE_ALIASES[place.id] || []),
  ].join(' ');

const activityHaystack = (act) =>
  [
    act.name,
    act.name_en,
    act.name_ar,
    act.desc,
    act.desc_en,
    act.tags?.fr,
    act.tags?.en,
    act.location,
    act.category,
    ...(ACTIVITY_ALIASES[act.id] || []),
  ].join(' ');

const tourHaystack = (tour) =>
  [
    tour.name,
    tour.name_en,
    tour.name_ar,
    tour.subtitle,
    tour.subtitle_en,
    tour.description,
    tour.description_en,
    tour.location,
    tour.category,
  ].join(' ');

/**
 * @returns {{ type: 'place'|'activity'|'tour', id: string|number, score: number, item: object }[]}
 */
export const searchCatalog = ({ destination = '', activity = '', q = '' } = {}) => {
  const destQ = destination || q;
  const actQ = activity || q;
  const combined = [destination, activity, q].filter(Boolean).join(' ');

  const results = [];

  PLACES.forEach((place) => {
    const hay = placeHaystack(place);
    const score =
      scoreText(hay, destQ) * 1.2 +
      scoreText(hay, actQ) * 0.5 +
      scoreText(hay, combined) * 0.3;
    if (score > 0) {
      results.push({
        type: 'place',
        id: place.id,
        score,
        item: place,
        path: `/place/${place.id}`,
      });
    }
  });

  ACTIVITIES.forEach((act) => {
    const hay = activityHaystack(act);
    const score =
      scoreText(hay, actQ) * 1.2 +
      scoreText(hay, destQ) * 0.6 +
      scoreText(hay, combined) * 0.3;
    if (score > 0) {
      results.push({
        type: 'activity',
        id: act.id,
        score,
        item: act,
        path: `/activity/${act.id}`,
      });
    }
  });

  FEATURED_TOURS.forEach((tour) => {
    const hay = tourHaystack(tour);
    const score =
      scoreText(hay, destQ) * 1.1 +
      scoreText(hay, actQ) * 0.5 +
      scoreText(hay, combined) * 0.3;
    if (score > 0) {
      results.push({
        type: 'tour',
        id: tour.id,
        score,
        item: tour,
        path: `/destination/${tour.id}`,
      });
    }
  });

  return results.sort((a, b) => b.score - a.score);
};

/** Autocomplete suggestions for destination field */
export const suggestDestinations = (query, limit = 6) => {
  const n = normalizeQuery(query);
  if (!n) {
    return PLACES.slice(0, limit).map((place) => ({
      type: 'place',
      id: place.id,
      label: place.name,
      label_en: place.name_en,
      label_ar: place.name_ar,
      hint: place.tagline,
      hint_en: place.tagline_en,
      hint_ar: place.tagline_ar,
      image: place.image,
      path: `/place/${place.id}`,
    }));
  }

  return searchCatalog({ destination: query })
    .filter((r) => r.type === 'place' || r.type === 'tour')
    .slice(0, limit)
    .map((r) => ({
      type: r.type,
      id: r.id,
      label: r.item.name,
      label_en: r.item.name_en,
      label_ar: r.item.name_ar,
      hint: r.item.tagline || r.item.subtitle || r.item.location,
      hint_en: r.item.tagline_en || r.item.subtitle_en || r.item.location_en,
      hint_ar: r.item.tagline_ar || r.item.subtitle_ar || r.item.location_ar,
      image: r.item.image,
      path: r.path,
    }));
};

/** Autocomplete suggestions for activity field */
export const suggestActivities = (query, limit = 6) => {
  const n = normalizeQuery(query);
  if (!n) {
    return ACTIVITIES.slice(0, limit).map((act) => ({
      type: 'activity',
      id: act.id,
      label: act.name,
      label_en: act.name_en,
      label_ar: act.name_ar,
      hint: act.tags?.fr,
      hint_en: act.tags?.en,
      hint_ar: act.tags?.ar,
      image: act.image,
      path: `/activity/${act.id}`,
    }));
  }

  return searchCatalog({ activity: query })
    .filter((r) => r.type === 'activity')
    .slice(0, limit)
    .map((r) => ({
      type: r.type,
      id: r.id,
      label: r.item.name,
      label_en: r.item.name_en,
      label_ar: r.item.name_ar,
      hint: r.item.tags?.fr,
      hint_en: r.item.tags?.en,
      hint_ar: r.item.tags?.ar,
      image: r.item.image,
      path: r.path,
    }));
};

/** Resolve navigation after form submit */
export const resolveSearchNavigation = ({ destination, activity, dates, travelers }) => {
  const params = new URLSearchParams();
  if (destination.trim()) params.set('q', destination.trim());
  if (activity.trim()) params.set('activity', activity.trim());
  if (dates) params.set('dates', dates);
  if (travelers) params.set('travelers', travelers);

  const results = searchCatalog({ destination, activity });

  // Exact / strong unique place match from destination field
  if (destination.trim()) {
    const placeHits = results.filter((r) => r.type === 'place');
    const top = placeHits[0];
    const nDest = normalizeQuery(destination);
    if (
      top &&
      (normalizeQuery(top.item.name) === nDest ||
        normalizeQuery(top.item.name_en) === nDest ||
        top.score >= 90)
    ) {
      const p = new URLSearchParams();
      if (dates) p.set('dates', dates);
      if (travelers) p.set('travelers', travelers);
      const qs = p.toString();
      return { path: qs ? `${top.path}?${qs}` : top.path, direct: true };
    }
  }

  // Strong unique activity match when only activity filled (or both but activity wins)
  if (activity.trim() && !destination.trim()) {
    const actHits = results.filter((r) => r.type === 'activity');
    const top = actHits[0];
    const nAct = normalizeQuery(activity);
    if (
      top &&
      (normalizeQuery(top.item.name) === nAct ||
        normalizeQuery(top.item.name_en) === nAct ||
        top.score >= 90)
    ) {
      return { path: top.path, direct: true };
    }
  }

  const qs = params.toString();
  if (!destination.trim() && !activity.trim()) {
    return { path: '/destinations', direct: true };
  }
  return { path: qs ? `/search?${qs}` : '/search', direct: false, results };
};
