const { publishNotification } = require('./notificationService');

const TYPE_LABELS = {
  tours: {
    fr: 'Nouveau circuit',
    en: 'New tour',
    ar: 'جولة جديدة',
  },
  activities: {
    fr: 'Nouvelle activité',
    en: 'New activity',
    ar: 'نشاط جديد',
  },
  stays: {
    fr: 'Nouvel hébergement',
    en: 'New stay',
    ar: 'إقامة جديدة',
  },
  blog_posts: {
    fr: 'Nouvel article',
    en: 'New blog post',
    ar: 'مقال جديد',
  },
  places: {
    fr: 'Nouvelle destination',
    en: 'New destination',
    ar: 'وجهة جديدة',
  },
  gallery: {
    fr: 'Nouvelle galerie',
    en: 'New gallery',
    ar: 'معرض جديد',
  },
};

function buildLink(contentType, row) {
  switch (contentType) {
    case 'tours':
      return '/tours';
    case 'activities':
      return `/activity/${row.id}`;
    case 'stays':
      return '/stays';
    case 'blog_posts':
      return `/blog/${row.slug || row.id}`;
    case 'places':
      return `/place/${row.id}`;
    case 'gallery':
      return '/gallery';
    default:
      return '/';
  }
}

function pickName(row) {
  return row.name || row.title || row.id || '';
}

async function notifyContentPublished(contentType, row) {
  if (!row || row.published === false) return null;

  const labels = TYPE_LABELS[contentType] || TYPE_LABELS.places;
  const name = pickName(row);

  return publishNotification({
    contentType,
    contentId: row.id || row.slug || '',
    titleFr: `${labels.fr} : ${name}`,
    titleEn: `${labels.en}: ${name}`,
    titleAr: `${labels.ar}: ${name}`,
    bodyFr: row.subtitle || row.tagline || row.description?.slice(0, 120) || null,
    bodyEn: row.subtitle_en || row.tagline_en || row.description_en?.slice(0, 120) || null,
    bodyAr: row.subtitle_ar || row.tagline_ar || row.description_ar?.slice(0, 120) || null,
    link: buildLink(contentType, row),
  });
}

module.exports = { notifyContentPublished, TYPE_LABELS, buildLink };
