import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyC25Jj9QTMbuhQtmG8hohcB35IVgDFz0Hs',
  authDomain: 'algeria-travel.firebaseapp.com',
  projectId: 'algeria-travel',
  storageBucket: 'algeria-travel.firebasestorage.app',
  messagingSenderId: '101759537014',
  appId: '1:101759537014:web:a23c340cd40ec9c016b457',
};

export const FIREBASE_VAPID_KEY =
  process.env.REACT_APP_FIREBASE_VAPID_KEY ||
  'BEhwHkpMuA62eyXN2EzRn0TIZg8uC8bsU8OImw4E5skGnYCwTVgJ1QxQmbcmjaR6uQvXBnKPEgQAPvjjxBmfNt0';

const app = initializeApp(firebaseConfig);

export async function getFirebaseMessaging() {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
}

export default app;
