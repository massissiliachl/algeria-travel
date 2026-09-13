/** Déploiement Render split : frontend statique → API Node séparée. */
const RENDER_API_BY_HOST = {
  'algeria-travel-1.onrender.com': 'https://algeria-travel-7i7y.onrender.com',
};

/**
 * URL de l'API :
 * - Render (prod) : REACT_APP_API_URL ou même origine que le site
 * - Local : REACT_APP_API_URL ou proxy CRA (chaîne vide)
 */
export function resolveApiBase() {
  const fromEnv = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

  if (typeof window === 'undefined') {
    return fromEnv;
  }

  const { hostname, origin } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const runtimeApi = window.__AT_CONFIG__?.apiBase?.replace(/\/$/, '');

  if (!isLocal && runtimeApi) return runtimeApi;

  // Build avec localhost:5000 mais site ouvert en prod → même origine
  if (fromEnv && /localhost|127\.0\.0\.1/.test(fromEnv) && !isLocal) {
    return origin;
  }

  // Dev CRA (npm start, ports 3000+) → proxy setupProxy.js vers le backend
  if (isLocal && !fromEnv) {
    return '';
  }

  if (fromEnv) return fromEnv;

  const mappedApi = RENDER_API_BY_HOST[hostname];
  if (!isLocal && mappedApi) return mappedApi;

  // Prod : API sur le même domaine (Render)
  if (!isLocal) return origin;

  return '';
}
