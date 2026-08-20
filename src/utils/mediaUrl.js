import { resolveApiBase } from './apiBase';

/**
 * /images/* → fichiers statiques dans public/ (servis par le site React)
 * /uploads/* → fichiers uploadés via l'API backend
 * https://... → URL externe (Supabase, etc.)
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith('/images/')) return url;

  const base = resolveApiBase();
  if (url.startsWith('/uploads/')) {
    return base ? `${base}${url}` : url;
  }

  return url;
}

export const MEDIA_PLACEHOLDER = '/logo.svg';
