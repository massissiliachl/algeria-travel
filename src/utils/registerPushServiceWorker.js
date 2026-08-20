/** Enregistre le service worker FCM dès le chargement (requis pour push hors site). */
export function registerPushServiceWorker() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker
    .register('/firebase-messaging-sw.js', { scope: '/' })
    .catch((err) => {
      console.warn('[notify] Service worker FCM:', err.message);
      return null;
    });
}
