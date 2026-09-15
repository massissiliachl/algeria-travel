import { getPublicSiteBase } from './publicSiteUrl';
import { resolveApiBase } from './apiBase';

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/images/')) {
    const site = getPublicSiteBase();
    const api = resolveApiBase();
    // Admin local + API prod : images depuis le site déployé
    if (site && api.includes('onrender.com')) return `${site}${url}`;
    return url;
  }

  const base = resolveApiBase();
  if (url.startsWith('/uploads/')) {
    return base ? `${base}${url}` : url;
  }
  return url;
}
