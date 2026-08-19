const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:3000';
const API_BASE = import.meta.env.VITE_API_URL || '';

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads/')) {
    return API_BASE ? `${API_BASE}${url}` : url;
  }
  if (url.startsWith('/')) {
    return `${SITE_URL}${url}`;
  }
  return url;
}
