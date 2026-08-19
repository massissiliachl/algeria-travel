/* Firebase Cloud Messaging — service worker (background notifications) */
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

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Algeria Travel';
  const body = payload.notification?.body || payload.data?.body || '';
  const link = payload.data?.link || payload.fcmOptions?.link || '/';

  self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: { link },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
      return null;
    })
  );
});
