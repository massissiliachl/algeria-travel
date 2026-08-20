import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { useLang } from './useLangHook';
import { api } from '../services/api';
import { FIREBASE_VAPID_KEY, getFirebaseMessaging } from '../firebase';
import { registerPushServiceWorker } from '../utils/registerPushServiceWorker';
import { isIosSafariBrowser } from '../utils/isIosSafari';

const STORAGE_KEY = 'at_notify_last_seen';
const OPTIN_KEY = 'at_notify_optin';
const FCM_TOKEN_KEY = 'at_fcm_token';
const POLL_MS = 3 * 60 * 1000;

function isSecureContextForPush() {
  return window.isSecureContext || window.location.hostname === 'localhost';
}

const NotificationContext = createContext(null);

function pickTitle(item, language) {
  if (language === 'en') return item.titleEn || item.titleFr;
  if (language === 'ar') return item.titleAr || item.titleFr;
  return item.titleFr;
}

function pickBody(item, language) {
  if (language === 'en') return item.bodyEn || item.bodyFr;
  if (language === 'ar') return item.bodyAr || item.bodyFr;
  return item.bodyFr;
}

export function NotificationProvider({ children }) {
  const { language } = useLang();
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(OPTIN_KEY) === 'granted';
    } catch {
      return false;
    }
  });
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const fcmTokenRef = useRef(null);
  const onMessageBoundRef = useRef(false);

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, now);
    } catch {
      /* ignore */
    }
    setUnreadCount(0);
  }, []);

  const showBrowserNotification = useCallback(
    (title, body, link = '/') => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      try {
        const notification = new Notification(title, {
          body: body || '',
          icon: '/icons/icon-192.png',
        });
        notification.onclick = () => {
          window.focus();
          window.location.href = link;
        };
      } catch {
        /* ignore */
      }
    },
    []
  );

  const fetchFeed = useCallback(async ({ force = false } = {}) => {
    if (!enabled && !force) return true;
    try {
      const since = localStorage.getItem(STORAGE_KEY);
      const data = await api.getNotificationFeed();
      const feed = data.items || [];
      setItems(feed);

      if (since) {
        const newItems = feed.filter((item) => new Date(item.createdAt) > new Date(since));
        setUnreadCount(newItems.length);
        newItems.slice(0, 3).forEach((item) => {
          showBrowserNotification(
            pickTitle(item, language),
            pickBody(item, language),
            item.link || '/'
          );
        });
      } else if (feed.length) {
        setUnreadCount(feed.length);
      }
      return true;
    } catch (err) {
      console.warn('[notify] API feed indisponible:', err.message);
      return false;
    }
  }, [enabled, language, showBrowserNotification]);

  const registerFirebaseMessaging = useCallback(async () => {
    if (!isSecureContextForPush() || !('serviceWorker' in navigator)) {
      console.warn('[notify] Contexte non sécurisé ou service worker indisponible.');
      return false;
    }

    if (typeof Notification === 'undefined') return false;

    if (isIosSafariBrowser()) {
      console.warn('[notify] iPhone : ouvrez le site depuis l’icône écran d’accueil.');
      return { pushOk: false, apiOk: true, error: 'ios_standalone_required' };
    }

    if (Notification.permission === 'denied') {
      console.warn('[notify] Notifications bloquées dans le navigateur.');
      return false;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[notify] Permission notifications refusée.');
        return false;
      }
    }

    try {
      const registration = await registerPushServiceWorker();
      if (!registration) return false;
      await navigator.serviceWorker.ready;

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.warn('[notify] Firebase Messaging non supporté sur ce navigateur.');
        return false;
      }

      const token = await getToken(messaging, {
        vapidKey: FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        console.warn('[notify] Token FCM non obtenu.');
        return false;
      }

      const stored = localStorage.getItem(FCM_TOKEN_KEY);
      if (token !== fcmTokenRef.current || token !== stored) {
        await api.subscribeFcmToken(token, language, navigator.userAgent);
      }
      fcmTokenRef.current = token;
      try {
        localStorage.setItem(FCM_TOKEN_KEY, token);
      } catch {
        /* ignore */
      }

      if (!onMessageBoundRef.current) {
        onMessageBoundRef.current = true;
        onMessage(messaging, (payload) => {
          const title =
            payload.notification?.title || payload.data?.title || 'Algeria Travel';
          const body = payload.notification?.body || payload.data?.body || '';
          const link = payload.data?.link || '/';
          showBrowserNotification(title, body, link);
          fetchFeed({ force: true });
        });
      }

      return { pushOk: true, apiOk: true };
    } catch (err) {
      console.error('[notify] Échec abonnement FCM:', err);
      if (err.message?.includes('404') || err.message?.includes('Erreur API')) {
        return { pushOk: false, apiOk: false, error: 'api_offline' };
      }
      return { pushOk: false, apiOk: true, error: 'push_failed' };
    }
  }, [fetchFeed, language, showBrowserNotification]);

  const enableNotifications = useCallback(async () => {
    try {
      localStorage.setItem(OPTIN_KEY, 'granted');
    } catch {
      /* ignore */
    }
    setEnabled(true);

    let result = { pushOk: false, apiOk: true, error: null };
    if ('Notification' in window) {
      const reg = await registerFirebaseMessaging();
      if (typeof reg === 'object' && reg !== null) result = { ...result, ...reg };
      else result.pushOk = Boolean(reg);
    }

    const feedOk = await fetchFeed({ force: true });
    if (!feedOk) {
      result.apiOk = false;
      result.error = result.error || 'api_offline';
    }

    return result;
  }, [fetchFeed, registerFirebaseMessaging]);

  const declineNotifications = useCallback(() => {
    try {
      localStorage.setItem(OPTIN_KEY, 'declined');
    } catch {
      /* ignore */
    }
    setEnabled(false);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    fetchFeed();
    const id = setInterval(fetchFeed, POLL_MS);
    return () => clearInterval(id);
  }, [enabled, fetchFeed]);

  useEffect(() => {
    if (!enabled) return undefined;
    registerFirebaseMessaging().catch(() => {});
    return undefined;
  }, [enabled, registerFirebaseMessaging]);

  useEffect(() => {
    if (!enabled) return undefined;
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        registerFirebaseMessaging().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [enabled, registerFirebaseMessaging]);

  return (
    <NotificationContext.Provider
      value={{
        enabled,
        items,
        unreadCount,
        enableNotifications,
        declineNotifications,
        markAllRead,
        fetchFeed,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

export function shouldShowNotificationOptIn() {
  try {
    const cookies = localStorage.getItem('at_cookie_consent');
    const optin = localStorage.getItem(OPTIN_KEY);
    return cookies === 'all' && !optin;
  } catch {
    return false;
  }
}
