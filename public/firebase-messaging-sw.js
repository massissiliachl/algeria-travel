/* Firebase Cloud Messaging — notifications sur téléphone même onglet fermé */
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC25Jj9QTMbuhQtmG8hohcB35IVgDFz0Hs',
  authDomain: 'algeria-travel.firebaseapp.com',
  projectId: 'algeria-travel',
  storageBucket: 'algeria-travel.firebasestorage.app',
  messagingSenderId: '101759537014',
  appId: '1:101759537014:web:a23c340cd40ec9c016b457',
});

const messaging = firebase.messaging();
const ICON = `${self.location.origin}/icons/icon-192.png`;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

function showPushNotification(payload) {
  const title = payload.notification?.title || payload.data?.title || 'Algeria Travel';
  const body = payload.notification?.body || payload.data?.body || '';
  const link = payload.data?.link || payload.fcmOptions?.link || '/';

  return self.registration.showNotification(title, {
    body,
    icon: ICON,
    badge: ICON,
    data: { link },
    tag: payload.data?.id || 'algeria-travel',
    renotify: true,
  });
}

/* Messages data-only (secours si le navigateur n'affiche pas automatiquement) */
messaging.onBackgroundMessage((payload) => {
  if (payload.notification?.title) return;
  return showPushNotification(payload);
});

/* Secours direct sur l'événement push (mobile) */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }
  if (payload.notification?.title) return;
  event.waitUntil(showPushNotification(payload));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  const target = link.startsWith('http') ? link : `${self.location.origin}${link}`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
      return null;
    })
  );
});
