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

  // En dev local, toujours passer par le proxy Vite → backend localhost:5000
  if (isLocal) return '';

  if (fromEnv && /localhost|127\.0\.0\.1/.test(fromEnv)) {
    return origin;
  }

  if (fromEnv) return fromEnv;

  const mappedApi = RENDER_API_BY_HOST[hostname];
  if (!isLocal && mappedApi) return mappedApi;

  if (!isLocal) return origin;
  return '';
}
