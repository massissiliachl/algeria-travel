import { getPublicSiteBase } from './publicSiteUrl';
import { resolveApiBase } from './apiBase';

/** Chemin public (/images/… ou /uploads/…) à partir d’un basename ou d’une URL relative. */
export function normalizeMediaPath(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/images/')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return `/images/${trimmed.replace(/^\.\//, '')}`;
}

export function resolveMediaUrl(url) {
  const path = normalizeMediaPath(url);
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  if (path.startsWith('/images/')) {
    const site = getPublicSiteBase();
    const api = resolveApiBase();
    // Admin local + API prod : images depuis le site déployé
    if (site && api.includes('onrender.com')) return `${site}${path}`;
    return path;
  }

  const base = resolveApiBase();
  if (path.startsWith('/uploads/')) {
    return base ? `${base}${path}` : path;
  }
  return path;
}
