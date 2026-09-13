const RENDER_API_BY_HOST = {
  'algeria-travel-1.onrender.com': 'https://algeria-travel-7i7y.onrender.com',
  'algeria-travel-7i7y.onrender.com': 'https://algeria-travel-7i7y.onrender.com',
};

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

  const mappedApi = RENDER_API_BY_HOST[hostname];
  if (!isLocal && mappedApi) return mappedApi;

  if (!isLocal) return origin;
  return '';
}
