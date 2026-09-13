function normalizeUrl(url) {
  if (!url) return '';
  return String(url).replace(/\/$/, '');
}

export function resolvePublicSiteUrl() {
  const fromEnv = normalizeUrl(import.meta.env.VITE_PUBLIC_SITE_URL);
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const { origin, pathname } = window.location;
    if (pathname.startsWith('/admin')) {
      return origin;
    }
    return origin;
  }

  return 'http://localhost:3000';
}

export function resolvePartnerPortalUrl() {
  const fromEnv = normalizeUrl(import.meta.env.VITE_PARTNER_URL);
  if (fromEnv) return fromEnv.endsWith('/') ? fromEnv : `${fromEnv}/`;

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/partner/`;
  }

  return 'http://localhost:5175/partner/';
}
