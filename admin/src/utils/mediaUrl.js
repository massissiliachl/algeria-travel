import { getPublicSiteBase } from './publicSiteUrl';
import { resolveApiBase } from './apiBase';

/** Chemin public (/images/… ou /uploads/…) à partir d’un basename ou d’une URL relative. */
export function normalizeMediaPath(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/uploads/')) {
    return trimmed.replace(/^\/uploads\//, '/images/cms/');
  }
  if (trimmed.startsWith('/images/')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return `/images/${trimmed.replace(/^\.\//, '')}`;
}

export function resolveMediaUrl(url) {
  const path = normalizeMediaPath(url);
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const api = resolveApiBase();
  const site = getPublicSiteBase();
  const adminBase = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

  // CMS : backend local (proxy /images) ou API distante
  if (path.startsWith('/images/cms/')) {
    if (api) return `${api}${path}`;
    return path;
  }

  // Bibliothèque /images/… : site public déployé ou préfixe /admin en dev Vite
  if (path.startsWith('/images/')) {
    if (site) return `${site}${path}`;
    if (adminBase && adminBase !== '/') return `${adminBase}${path}`;
    return path;
  }

  if (path.startsWith('/uploads/')) {
    return api ? `${api}${path}` : path;
  }

  return path;
}
