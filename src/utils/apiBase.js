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

  const { hostname, origin, port } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  // Build avec localhost:5000 mais site ouvert en prod → même origine
  if (fromEnv && /localhost|127\.0\.0\.1/.test(fromEnv) && !isLocal) {
    return origin;
  }

  // Dev CRA (npm start, port 3000) → proxy setupProxy.js vers le backend
  if (isLocal && port === '3000') {
    return '';
  }

  if (fromEnv) return fromEnv;

  // Prod : API sur le même domaine (Render)
  if (!isLocal) return origin;

  return '';
}
