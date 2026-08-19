import React, { useState } from 'react';
import { useLang } from '../hooks/useLangHook';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationEnableButton.css';

export default function NotificationEnableButton({ className = '' }) {
  const { t } = useLang();
  const { enabled, enableNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (enabled || done) return null;

  const onClick = async () => {
    setLoading(true);
    try {
      const ok = await enableNotifications();
      if (ok) setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`notify-enable-btn ${className}`.trim()}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? t('notify_optin_loading') : t('notify_enable_btn')}
    </button>
  );
}
