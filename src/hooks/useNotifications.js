import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLang } from './useLangHook';
import { api } from '../services/api';

const STORAGE_KEY = 'at_notify_last_seen';
const OPTIN_KEY = 'at_notify_optin';
const POLL_MS = 3 * 60 * 1000;

function isSecureContextForPush() {
  return window.isSecureContext || window.location.hostname === 'localhost';
}

const NotificationContext = createContext(null);

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) arr[i] = raw.charCodeAt(i);
  return arr;
}

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
  const [vapidKey, setVapidKey] = useState(null);
  const subscriptionRef = useRef(null);

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
    (item) => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const title = pickTitle(item, language);
      const body = pickBody(item, language);
      try {
        new Notification(title, {
          body: body || '',
          icon: '/logo.png',
          tag: `at-${item.id}`,
        }).onclick = () => {
          window.focus();
          window.location.href = item.link || '/';
        };
      } catch {
        /* ignore */
      }
    },
    [language]
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
          newItems.slice(0, 3).forEach(showBrowserNotification);
        }
      } else if (feed.length) {
        setUnreadCount(feed.length);
      }
    } catch {
      /* API may be offline */
    }
  }, [enabled, showBrowserNotification]);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !isSecureContextForPush()) return null;
    try {
      return await navigator.serviceWorker.register('/sw.js');
    } catch {
      return null;
    }
  }, []);

  const subscribePush = useCallback(async () => {
    if (!isSecureContextForPush()) return false;
    const reg = await registerServiceWorker();
    if (!reg) return false;

    let publicKey = vapidKey;
    if (!publicKey) {
      const info = await api.getNotificationVapidKey();
      publicKey = info.publicKey;
      setVapidKey(publicKey);
      if (!publicKey) return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await api.subscribeNotifications(subscription.toJSON(), language);
    subscriptionRef.current = subscription;
    return true;
  }, [language, registerServiceWorker, vapidKey]);

  const enableNotifications = useCallback(async () => {
    try {
      localStorage.setItem(OPTIN_KEY, 'granted');
    } catch {
      /* ignore */
    }
    setEnabled(true);

    if ('Notification' in window) {
      await subscribePush();
    }

    await fetchFeed();
    return true;
  }, [fetchFeed, subscribePush]);

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
    api.getNotificationVapidKey().then((info) => setVapidKey(info.publicKey)).catch(() => {});
  }, []);

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
