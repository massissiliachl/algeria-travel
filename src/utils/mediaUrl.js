import { resolveApiBase } from './apiBase';

/**
 * /images/* → fichiers statiques dans public/ (servis par le site React)
 * /uploads/* → fichiers uploadés via l'API backend
 * https://... → URL externe (Supabase, etc.)
 */

/** Chemin stocké en base → chemin public (/images/… ou /uploads/…) */
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

  if (path.startsWith('/images/')) return path;

  const base = resolveApiBase();
  if (path.startsWith('/uploads/')) {
    return base ? `${base}${path}` : path;
  }

  return path;
}

export const MEDIA_PLACEHOLDER = '/logo.svg';
