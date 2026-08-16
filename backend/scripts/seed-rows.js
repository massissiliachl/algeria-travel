const j = (v) => JSON.stringify(v ?? (Array.isArray(v) ? [] : {}));

function tourRow(t) {
  return [
    t.name, t.name_en, t.name_ar, t.subtitle, t.subtitle_en, t.subtitle_ar,
    t.description, t.description_en, t.fullDescription, t.fullDescription_en,
    t.location, t.location_en, t.location_ar,
    t.bestTime, t.bestTime_en, t.bestTime_ar,
    t.duration, t.duration_en, t.duration_ar,
    t.price, t.oldPrice ?? null, t.rating, t.reviews,
    t.image, t.category, j(t.activities), j(t.itinerary),
    t.placeSlug || null, t.pkg || null, t.badge || null,
  ];
}

function activityRow(a) {
  return [
    a.id, a.name, a.name_en, a.name_ar, a.desc, a.desc_en, a.desc_ar,
    a.fullDesc, a.fullDesc_en, a.fullDesc_ar,
    a.history, a.history_en, a.history_ar,
    a.visit, a.visit_en, a.visit_ar,
    a.icon, a.color, a.category,
    j(a.filters), j(a.places), j(a.tags || {}),
    a.durationShort, a.durationShort_en, a.durationShort_ar,
    a.image, j(a.gallery), a.price,
    a.duration, a.duration_en, a.duration_ar,
    a.location, a.location_en, a.location_ar,
    a.dates, a.dates_en, a.dates_ar,
    a.group, a.group_en, a.group_ar,
    a.rating,
    j(a.included), j(a.included_en), j(a.included_ar),
  ];
}

function stayRow(s) {
  return [
    s.id, s.type, s.placeId, s.name, s.name_en, s.name_ar,
    s.location, s.location_en, s.location_ar,
    s.desc, s.desc_en, s.desc_ar,
    s.image, j(s.gallery), s.price,
    s.pricePerPerson || false, s.rating, s.reviews,
    j(s.amenities || {}),
  ];
}

function placeRow(p) {
  return [
    p.id, p.name, p.name_en, p.name_ar,
    p.tagline, p.tagline_en, p.tagline_ar,
    p.rating, p.reviews, p.temp, p.image, j(p.gallery),
    p.description, p.description_en, p.description_ar,
    p.bestTime, p.bestTime_en, p.bestTime_ar,
    p.duration, p.duration_en, p.duration_ar,
    p.price, p.oldPrice ?? null,
    p.stay, p.stay_en, p.stay_ar,
    p.transport, p.transport_en, p.transport_ar,
    j(p.includes), j(p.highlights),
  ];
}

module.exports = { tourRow, activityRow, stayRow, placeRow };
