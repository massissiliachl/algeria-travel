import React, { useEffect, useState } from 'react';
import Icon from './ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { useNotifications, shouldShowNotificationOptIn } from '../hooks/useNotifications';
import './NotificationOptIn.css';

const COOKIE_EVENT = 'at-cookie-accepted';

export default function NotificationOptIn() {
  const { t } = useLang();
  const { enableNotifications, declineNotifications } = useNotifications();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const openIfNeeded = () => {
      if (shouldShowNotificationOptIn()) setVisible(true);
    };

    openIfNeeded();
    window.addEventListener(COOKIE_EVENT, openIfNeeded);
    return () => window.removeEventListener(COOKIE_EVENT, openIfNeeded);
  }, []);

  const onAccept = async () => {
    setLoading(true);
    await enableNotifications();
    setLoading(false);
    setVisible(false);
  };

  const onDecline = () => {
    declineNotifications();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="notify-optin" role="dialog" aria-labelledby="notify-optin-title">
      <div className="notify-optin__card">
        <div className="notify-optin__icon" aria-hidden>
          <Icon name="Sparkles" size={22} />
        </div>
        <div className="notify-optin__body">
          <p id="notify-optin-title" className="notify-optin__title">
            {t('notify_optin_title')}
          </p>
          <p className="notify-optin__text">{t('notify_optin_text')}</p>
          <ul className="notify-optin__list">
            <li>{t('notify_optin_tours')}</li>
            <li>{t('notify_optin_gallery')}</li>
            <li>{t('notify_optin_blog')}</li>
          </ul>
        </div>
        <div className="notify-optin__actions">
          <button type="button" className="notify-optin__btn notify-optin__btn--ghost" onClick={onDecline}>
            {t('notify_optin_decline')}
          </button>
          <button
            type="button"
            className="notify-optin__btn notify-optin__btn--primary"
            onClick={onAccept}
            disabled={loading}
          >
            {loading ? t('notify_optin_loading') : t('notify_optin_accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
