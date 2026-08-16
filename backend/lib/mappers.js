function num(v) {
  return v == null || v === '' ? null : Number(v);
}

function bool(v, fallback = true) {
  if (v === undefined || v === null) return fallback;
  return Boolean(v);
}

function json(v, fallback) {
  if (v == null || v === '') return fallback ?? null;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      return fallback ?? null;
    }
  }
  return v;
}

function jsonStr(v, fallback) {
  const parsed = json(v, fallback);
  return parsed == null ? null : JSON.stringify(parsed);
}

// ─── Places ───────────────────────────────────────────────────────────────────
const placeFields = [
  ['id', 'id'], ['name', 'name'], ['name_en', 'nameEn'], ['name_ar', 'nameAr'],
  ['tagline', 'tagline'], ['tagline_en', 'taglineEn'], ['tagline_ar', 'taglineAr'],
  ['rating', 'rating', num], ['reviews', 'reviews', num], ['temp', 'temp'],
  ['image', 'image'], ['gallery', 'gallery', (v) => jsonStr(v, [])],
  ['description', 'description'], ['description_en', 'descriptionEn'], ['description_ar', 'descriptionAr'],
  ['best_time', 'bestTime'], ['best_time_en', 'bestTimeEn'], ['best_time_ar', 'bestTimeAr'],
  ['duration', 'duration'], ['duration_en', 'durationEn'], ['duration_ar', 'durationAr'],
  ['price', 'price', num], ['old_price', 'oldPrice', num],
  ['stay', 'stay'], ['stay_en', 'stayEn'], ['stay_ar', 'stayAr'],
  ['transport', 'transport'], ['transport_en', 'transportEn'], ['transport_ar', 'transportAr'],
  ['includes', 'includes', (v) => jsonStr(v, [])], ['highlights', 'highlights', (v) => jsonStr(v, [])],
  ['published', 'published', bool],
];

function mapPlace(row) {
  return {
    id: row.id, name: row.name, nameEn: row.name_en, nameAr: row.name_ar,
    tagline: row.tagline, taglineEn: row.tagline_en, taglineAr: row.tagline_ar,
    rating: Number(row.rating), reviews: row.reviews, temp: row.temp,
    image: row.image, gallery: row.gallery,
    description: row.description, descriptionEn: row.description_en, descriptionAr: row.description_ar,
    bestTime: row.best_time, bestTimeEn: row.best_time_en, bestTimeAr: row.best_time_ar,
    duration: row.duration, durationEn: row.duration_en, durationAr: row.duration_ar,
    price: row.price, oldPrice: row.old_price,
    stay: row.stay, stayEn: row.stay_en, stayAr: row.stay_ar,
    transport: row.transport, transportEn: row.transport_en, transportAr: row.transport_ar,
    includes: row.includes, highlights: row.highlights,
    published: row.published, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

// ─── Tours ────────────────────────────────────────────────────────────────────
const tourFields = [
  ['name', 'name'], ['name_en', 'nameEn'], ['name_ar', 'nameAr'],
  ['subtitle', 'subtitle'], ['subtitle_en', 'subtitleEn'], ['subtitle_ar', 'subtitleAr'],
  ['description', 'description'], ['description_en', 'descriptionEn'],
  ['full_description', 'fullDescription'], ['full_description_en', 'fullDescriptionEn'],
  ['location', 'location'], ['location_en', 'locationEn'], ['location_ar', 'locationAr'],
  ['best_time', 'bestTime'], ['best_time_en', 'bestTimeEn'], ['best_time_ar', 'bestTimeAr'],
  ['duration', 'duration'], ['duration_en', 'durationEn'], ['duration_ar', 'durationAr'],
  ['price', 'price', num], ['old_price', 'oldPrice', num],
  ['rating', 'rating', num], ['reviews', 'reviews', num],
  ['image', 'image'], ['category', 'category'],
  ['activities', 'activities', (v) => jsonStr(v, [])], ['itinerary', 'itinerary', (v) => jsonStr(v, [])],
  ['place_slug', 'placeSlug'], ['pkg', 'pkg'], ['badge', 'badge'], ['published', 'published', bool],
];

function mapTour(row) {
  return {
    id: row.id, name: row.name, nameEn: row.name_en, nameAr: row.name_ar,
    subtitle: row.subtitle, subtitleEn: row.subtitle_en, subtitleAr: row.subtitle_ar,
    description: row.description, descriptionEn: row.description_en,
    fullDescription: row.full_description, fullDescriptionEn: row.full_description_en,
    location: row.location, locationEn: row.location_en, locationAr: row.location_ar,
    bestTime: row.best_time, bestTimeEn: row.best_time_en, bestTimeAr: row.best_time_ar,
    duration: row.duration, durationEn: row.duration_en, durationAr: row.duration_ar,
    price: row.price, oldPrice: row.old_price, rating: Number(row.rating), reviews: row.reviews,
    image: row.image, category: row.category, activities: row.activities, itinerary: row.itinerary,
    placeSlug: row.place_slug, pkg: row.pkg, badge: row.badge,
    published: row.published, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

// ─── Activities ───────────────────────────────────────────────────────────────
const activityFields = [
  ['id', 'id'], ['name', 'name'], ['name_en', 'nameEn'], ['name_ar', 'nameAr'],
  ['desc', 'desc'], ['desc_en', 'descEn'], ['desc_ar', 'descAr'],
  ['full_desc', 'fullDesc'], ['full_desc_en', 'fullDescEn'], ['full_desc_ar', 'fullDescAr'],
  ['history', 'history'], ['history_en', 'historyEn'], ['history_ar', 'historyAr'],
  ['visit', 'visit'], ['visit_en', 'visitEn'], ['visit_ar', 'visitAr'],
  ['icon', 'icon'], ['color', 'color'], ['category', 'category'],
  ['filters', 'filters', (v) => jsonStr(v, [])], ['places', 'places', (v) => jsonStr(v, [])],
  ['tags', 'tags', (v) => jsonStr(v, {})],
  ['duration_short', 'durationShort'], ['duration_short_en', 'durationShortEn'], ['duration_short_ar', 'durationShortAr'],
  ['image', 'image'], ['gallery', 'gallery', (v) => jsonStr(v, [])],
  ['price', 'price', num], ['duration', 'duration'], ['duration_en', 'durationEn'], ['duration_ar', 'durationAr'],
  ['location', 'location'], ['location_en', 'locationEn'], ['location_ar', 'locationAr'],
  ['dates', 'dates'], ['dates_en', 'datesEn'], ['dates_ar', 'datesAr'],
  ['group', 'group'], ['group_en', 'groupEn'], ['group_ar', 'groupAr'],
  ['rating', 'rating', num],
  ['included', 'included', (v) => jsonStr(v, [])], ['included_en', 'includedEn', (v) => jsonStr(v, [])], ['included_ar', 'includedAr', (v) => jsonStr(v, [])],
  ['published', 'published', bool],
];

function mapActivity(row) {
  return {
    id: row.id, name: row.name, nameEn: row.name_en, nameAr: row.name_ar,
    desc: row.desc, descEn: row.desc_en, descAr: row.desc_ar,
    fullDesc: row.full_desc, fullDescEn: row.full_desc_en, fullDescAr: row.full_desc_ar,
    history: row.history, historyEn: row.history_en, historyAr: row.history_ar,
    visit: row.visit, visitEn: row.visit_en, visitAr: row.visit_ar,
    icon: row.icon, color: row.color, category: row.category,
    filters: row.filters, places: row.places, tags: row.tags,
    durationShort: row.duration_short, durationShortEn: row.duration_short_en, durationShortAr: row.duration_short_ar,
    image: row.image, gallery: row.gallery, price: row.price,
    duration: row.duration, durationEn: row.duration_en, durationAr: row.duration_ar,
    location: row.location, locationEn: row.location_en, locationAr: row.location_ar,
    dates: row.dates, datesEn: row.dates_en, datesAr: row.dates_ar,
    group: row.group, groupEn: row.group_en, groupAr: row.group_ar,
    rating: Number(row.rating), included: row.included, includedEn: row.included_en, includedAr: row.included_ar,
    published: row.published, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

// ─── Stays ────────────────────────────────────────────────────────────────────
const stayFields = [
  ['id', 'id'], ['type', 'type'], ['place_id', 'placeId'],
  ['name', 'name'], ['name_en', 'nameEn'], ['name_ar', 'nameAr'],
  ['location', 'location'], ['location_en', 'locationEn'], ['location_ar', 'locationAr'],
  ['desc', 'desc'], ['desc_en', 'descEn'], ['desc_ar', 'descAr'],
  ['image', 'image'], ['gallery', 'gallery', (v) => jsonStr(v, [])],
  ['price', 'price', num], ['price_per_person', 'pricePerPerson', bool],
  ['rating', 'rating', num], ['reviews', 'reviews', num],
  ['amenities', 'amenities', (v) => jsonStr(v, {})], ['published', 'published', bool],
];

function mapStay(row) {
  return {
    id: row.id, type: row.type, placeId: row.place_id,
    name: row.name, nameEn: row.name_en, nameAr: row.name_ar,
    location: row.location, locationEn: row.location_en, locationAr: row.location_ar,
    desc: row.desc, descEn: row.desc_en, descAr: row.desc_ar,
    image: row.image, gallery: row.gallery, price: row.price,
    pricePerPerson: row.price_per_person, rating: Number(row.rating), reviews: row.reviews,
    amenities: row.amenities, published: row.published,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
const blogFields = [
  ['slug', 'slug'], ['title', 'title'], ['title_en', 'titleEn'], ['title_ar', 'titleAr'],
  ['excerpt', 'excerpt'], ['excerpt_en', 'excerptEn'], ['excerpt_ar', 'excerptAr'],
  ['body', 'body'], ['body_en', 'bodyEn'], ['body_ar', 'bodyAr'],
  ['category', 'category'], ['category_label', 'categoryLabel'],
  ['category_label_en', 'categoryLabelEn'], ['category_label_ar', 'categoryLabelAr'],
  ['published_at', 'publishedAt'], ['published_at_en', 'publishedAtEn'], ['published_at_ar', 'publishedAtAr'],
  ['read_time', 'readTime'], ['image', 'image'], ['featured', 'featured', bool], ['published', 'published', bool],
];

function mapBlog(row) {
  return {
    id: row.id, slug: row.slug, title: row.title, titleEn: row.title_en, titleAr: row.title_ar,
    excerpt: row.excerpt, excerptEn: row.excerpt_en, excerptAr: row.excerpt_ar,
    body: row.body, bodyEn: row.body_en, bodyAr: row.body_ar,
    category: row.category, categoryLabel: row.category_label,
    categoryLabelEn: row.category_label_en, categoryLabelAr: row.category_label_ar,
    publishedAt: row.published_at, publishedAtEn: row.published_at_en, publishedAtAr: row.published_at_ar,
    readTime: row.read_time, image: row.image, featured: row.featured,
    published: row.published, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
const galleryFields = [
  ['src', 'src'],
  ['alt', 'alt'],
  ['caption_fr', 'captionFr'],
  ['caption_en', 'captionEn'],
  ['caption_ar', 'captionAr'],
  ['sort_order', 'sortOrder', num],
  ['published', 'published', bool],
];

function mapGallery(row) {
  return {
    id: row.id,
    src: row.src,
    alt: row.alt || '',
    captionFr: row.caption_fr,
    captionEn: row.caption_en,
    captionAr: row.caption_ar,
    sortOrder: row.sort_order ?? 0,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildFromFields(body, fields, { requireId = false } = {}) {
  const columns = [];
  const values = [];
  for (const [col, key, transform] of fields) {
    if (body[key] === undefined) continue;
    if (col === 'id' && !body[key] && !requireId) continue;
    columns.push(col);
    values.push(transform ? transform(body[key]) : body[key]);
  }
  return { columns, values };
}

function makeBuilders(fields, opts) {
  return {
    buildInsert: (body) => buildFromFields(body, fields, opts),
    buildUpdate: (body) => buildFromFields(body, fields.filter(([col]) => col !== 'id')),
  };
}

module.exports = {
  mapPlace, mapTour, mapActivity, mapStay, mapBlog, mapGallery,
  placeFields, tourFields, activityFields, stayFields, blogFields, galleryFields,
  makeBuilders, buildFromFields,
};
