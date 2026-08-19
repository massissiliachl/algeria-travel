import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { useLang } from './useLangHook';
import { api } from '../services/api';
import { FIREBASE_VAPID_KEY, getFirebaseMessaging } from '../firebase';

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
          icon: '/logo.png',
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

  const fetchFeed = useCallback(async () => {
    if (!enabled) return;
    try {
      const since = localStorage.getItem(STORAGE_KEY);
      const data = await api.getNotificationFeed(since || undefined);
      const feed = data.items || [];
      setItems(feed);

      if (since) {
        const newItems = feed.filter((item) => new Date(item.createdAt) > new Date(since));
        if (newItems.length) {
          setUnreadCount((c) => c + newItems.length);
          newItems.slice(0, 3).forEach((item) => {
            showBrowserNotification(
              pickTitle(item, language),
              pickBody(item, language),
              item.link || '/'
            );
          });
        }
      } else if (feed.length) {
        setUnreadCount(feed.length);
      }
    } catch {
      /* API may be offline */
    }
  }, [enabled, language, showBrowserNotification]);

  const registerFirebaseMessaging = useCallback(async () => {
    if (!isSecureContextForPush() || !('serviceWorker' in navigator)) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return false;

    const token = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) return false;

    await api.subscribeFcmToken(token, language, navigator.userAgent);
    fcmTokenRef.current = token;
    try {
      localStorage.setItem(FCM_TOKEN_KEY, token);
    } catch {
      /* ignore */
    }

    onMessage(messaging, (payload) => {
      const title =
        payload.notification?.title || payload.data?.title || 'Algeria Travel';
      const body = payload.notification?.body || payload.data?.body || '';
      const link = payload.data?.link || '/';
      showBrowserNotification(title, body, link);
      fetchFeed();
    });

    return true;
  }, [fetchFeed, language, showBrowserNotification]);

  const enableNotifications = useCallback(async () => {
    try {
      localStorage.setItem(OPTIN_KEY, 'granted');
    } catch {
      /* ignore */
    }
    setEnabled(true);

    let pushOk = false;
    if ('Notification' in window) {
      pushOk = await registerFirebaseMessaging();
    }

    await fetchFeed();
    return pushOk || true;
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
    if (!enabled || fcmTokenRef.current) return undefined;
    registerFirebaseMessaging().catch(() => {});
    return undefined;
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
