/** Lien public vers une fiche publiée sur le site visiteur */

export function getPublicSiteBase() {
  return (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '');
}

export function buildPublicContentUrl(entityKey, payload, resourceId) {
  const base = getPublicSiteBase();
  if (!base || payload?.published === false) return null;

  const itemId = payload?.id || payload?.slug || resourceId;

  switch (entityKey) {
    case 'places':
      return itemId ? `${base}/place/${itemId}` : null;
    case 'activities':
      return itemId ? `${base}/activity/${itemId}` : null;
    case 'blog':
      return itemId ? `${base}/blog/${itemId}` : null;
    case 'tours':
      return `${base}/tours`;
    case 'hotels':
    case 'stays':
      return itemId ? `${base}/hotels/${itemId}` : null;
    case 'gallery':
      return `${base}/gallery`;
    default:
      return base;
  }
}
