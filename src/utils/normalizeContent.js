/** Normalise les réponses API (camelCase) vers le format attendu par le front */

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const asObject = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) || {};
    } catch {
      return {};
    }
  }
  return {};
};

function withI18n(row, pairs) {
  const out = { ...row };
  pairs.forEach(([camel, snake]) => {
    if (out[snake] == null && out[camel] != null) out[snake] = out[camel];
  });
  return out;
}

export function normalizePlace(row) {
  if (!row) return null;
  return withI18n(
    {
      ...row,
      gallery: asArray(row.gallery),
      includes: asArray(row.includes),
      highlights: asArray(row.highlights),
      bookingOpen: Boolean(row.bookingOpen ?? row.booking_open),
    },
    [
      ['nameEn', 'name_en'],
      ['nameAr', 'name_ar'],
      ['taglineEn', 'tagline_en'],
      ['taglineAr', 'tagline_ar'],
      ['descriptionEn', 'description_en'],
      ['descriptionAr', 'description_ar'],
      ['bestTimeEn', 'best_time_en'],
      ['bestTimeAr', 'best_time_ar'],
      ['durationEn', 'duration_en'],
      ['durationAr', 'duration_ar'],
      ['oldPrice', 'old_price'],
      ['stayEn', 'stay_en'],
      ['stayAr', 'stay_ar'],
      ['transportEn', 'transport_en'],
      ['transportAr', 'transport_ar'],
    ]
  );
}

export function normalizeTour(row) {
  if (!row) return null;
  return withI18n(
    {
      ...row,
      activities: asArray(row.activities),
      itinerary: asArray(row.itinerary),
      placeSlug: row.placeSlug ?? row.place_slug,
    },
    [
      ['nameEn', 'name_en'],
      ['nameAr', 'name_ar'],
      ['subtitleEn', 'subtitle_en'],
      ['subtitleAr', 'subtitle_ar'],
      ['descriptionEn', 'description_en'],
      ['fullDescription', 'fullDescription'],
      ['fullDescriptionEn', 'fullDescription_en'],
      ['locationEn', 'location_en'],
      ['locationAr', 'location_ar'],
      ['bestTimeEn', 'best_time_en'],
      ['bestTimeAr', 'best_time_ar'],
      ['durationEn', 'duration_en'],
      ['durationAr', 'duration_ar'],
      ['oldPrice', 'old_price'],
    ]
  );
}

export function normalizeActivity(row) {
  if (!row) return null;
  return withI18n(
    {
      ...row,
      filters: asArray(row.filters),
      places: asArray(row.places),
      tags: asObject(row.tags),
      gallery: asArray(row.gallery),
      included: asArray(row.included),
      included_en: asArray(row.includedEn ?? row.included_en),
      included_ar: asArray(row.includedAr ?? row.included_ar),
      image: row.image,
      images: asArray(row.gallery).length ? asArray(row.gallery) : row.image ? [row.image] : [],
    },
    [
      ['nameEn', 'name_en'],
      ['nameAr', 'name_ar'],
      ['descEn', 'desc_en'],
      ['descAr', 'desc_ar'],
      ['fullDescEn', 'fullDesc_en'],
      ['fullDescAr', 'fullDesc_ar'],
      ['historyEn', 'history_en'],
      ['historyAr', 'history_ar'],
      ['visitEn', 'visit_en'],
      ['visitAr', 'visit_ar'],
      ['durationShortEn', 'durationShort_en'],
      ['durationShortAr', 'durationShort_ar'],
      ['durationEn', 'duration_en'],
      ['durationAr', 'duration_ar'],
      ['locationEn', 'location_en'],
      ['locationAr', 'location_ar'],
      ['datesEn', 'dates_en'],
      ['datesAr', 'dates_ar'],
      ['groupEn', 'group_en'],
      ['groupAr', 'group_ar'],
    ]
  );
}

export function normalizeBlog(row) {
  if (!row) return null;
  const normalized = withI18n(
    {
      ...row,
      date: row.date ?? row.publishedAt ?? row.published_at,
      date_en: row.date_en ?? row.publishedAtEn ?? row.published_at_en,
      date_ar: row.date_ar ?? row.publishedAtAr ?? row.published_at_ar,
      categoryLabel: row.categoryLabel ?? row.category_label,
      categoryLabel_en: row.categoryLabel_en ?? row.category_label_en,
      categoryLabel_ar: row.categoryLabel_ar ?? row.category_label_ar,
      readTime: row.readTime ?? row.read_time,
    },
    [
      ['titleEn', 'title_en'],
      ['titleAr', 'title_ar'],
      ['excerptEn', 'excerpt_en'],
      ['excerptAr', 'excerpt_ar'],
      ['bodyEn', 'body_en'],
      ['bodyAr', 'body_ar'],
    ]
  );
  return normalized;
}

export function normalizeStay(row) {
  if (!row) return null;
  return withI18n(
    {
      ...row,
      placeId: row.placeId ?? row.place_id,
      gallery: asArray(row.gallery),
      amenities: asObject(row.amenities),
      pricePerPerson: row.pricePerPerson ?? row.price_per_person,
      roomsAvailable: row.roomsAvailable ?? row.rooms_available,
      wilayaKey: row.wilayaKey ?? row.wilaya_key,
      oldPrice: row.oldPrice ?? row.old_price,
      checkIn: row.checkIn ?? row.check_in,
      checkOut: row.checkOut ?? row.check_out,
    },
    [
      ['nameEn', 'name_en'],
      ['nameAr', 'name_ar'],
      ['locationEn', 'location_en'],
      ['locationAr', 'location_ar'],
      ['descEn', 'desc_en'],
      ['descAr', 'desc_ar'],
      ['addressEn', 'address_en'],
      ['addressAr', 'address_ar'],
    ]
  );
}

export function mergeCatalog(staticItems, apiItems, key = 'id') {
  if (!apiItems?.length) return staticItems;
  const map = new Map(staticItems.map((item) => [String(item[key]), item]));
  apiItems.forEach((item) => {
    const k = String(item[key]);
    map.set(k, { ...(map.get(k) || {}), ...item });
  });
  return [...map.values()];
}

export function normalizePlaces(rows) {
  return (rows || []).map(normalizePlace).filter(Boolean);
}

export function normalizeTours(rows) {
  return (rows || []).map(normalizeTour).filter(Boolean);
}

export function normalizeActivities(rows) {
  return (rows || []).map(normalizeActivity).filter(Boolean);
}

export function normalizeBlogPosts(rows) {
  return (rows || []).map(normalizeBlog).filter(Boolean);
}

export function normalizeStays(rows) {
  return (rows || []).map(normalizeStay).filter(Boolean);
}
