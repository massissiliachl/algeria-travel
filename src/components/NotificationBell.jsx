import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationBell.css';

function pickTitle(item, language) {
  if (language === 'en') return item.titleEn || item.titleFr;
  if (language === 'ar') return item.titleAr || item.titleFr;
  return item.titleFr;
}

export default function NotificationBell() {
  const { language, t } = useLang();
  const { enabled, items, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!enabled) return null;

  const onOpen = () => {
    setOpen((o) => !o);
    if (!open) markAllRead();
  };

  return (
    <div className="notify-bell" ref={ref}>
      <button
        type="button"
        className="premium-nav__icon-btn notify-bell__btn"
        aria-label={t('notify_bell_label')}
        aria-expanded={open}
        onClick={onOpen}
      >
        <Icon name="Sparkles" size={18} />
        {unreadCount > 0 && (
          <span className="notify-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notify-bell__panel">
          <p className="notify-bell__head">{t('notify_bell_title')}</p>
          {items.length === 0 ? (
            <p className="notify-bell__empty">{t('notify_bell_empty')}</p>
          ) : (
            <ul className="notify-bell__list">
              {items.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <Link to={item.link || '/'} onClick={() => setOpen(false)}>
                    <strong>{pickTitle(item, language)}</strong>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
