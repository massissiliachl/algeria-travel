import { resolveApiBase } from './apiBase';

/**
 * /images/*     → fichiers statiques public/ (bundlés avec le site)
 * /images/cms/* → uploads admin (servis par l'API en prod)
 * /uploads/*    → legacy, redirigé vers /images/cms/
 */

function isLocalHost() {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

/** Chemin stocké en base → chemin public (/images/… ou /uploads/…) */
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

  const apiBase = resolveApiBase();
  const local = isLocalHost();

  // Images importées via l'admin → dossier cms, servies par le backend
  if (path.startsWith('/images/cms/')) {
    if (!local) {
      return apiBase ? `${apiBase}${path}` : path;
    }
    if (apiBase && !/localhost|127\.0\.0\.1/.test(apiBase)) {
      return `${apiBase}${path}`;
    }
    return path;
  }

  if (path.startsWith('/images/')) return path;

  if (path.startsWith('/uploads/')) {
    return apiBase ? `${apiBase}${path}` : path;
  }

  return path;
}

export const MEDIA_PLACEHOLDER = '/logo.svg';
