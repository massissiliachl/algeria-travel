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

  if (fromEnv && /localhost|127\.0\.0\.1/.test(fromEnv) && !isLocal) {
    return origin;
  }

  if (fromEnv) return fromEnv;

  // Site + API sur le même domaine Render
  if (!isLocal) return origin;

  // Dev local : proxy CRA
  return '';
}
