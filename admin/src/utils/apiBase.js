export function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  if (typeof window === 'undefined') {
    return fromEnv;
  }

  const { hostname, origin } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  if (fromEnv && /localhost|127\.0\.0\.1/.test(fromEnv) && !isLocal) {
    return origin;
  }

  if (fromEnv) return fromEnv;
  if (!isLocal) return origin;
  return '';
}
