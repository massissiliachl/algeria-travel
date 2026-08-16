import React, { useEffect, useState } from 'react';
import { useLang } from '../hooks/useLangHook';
import './CookieBanner.css';

const STORAGE_KEY = 'at_cookie_consent';

const CookieBanner = () => {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      if (value === 'all') {
        window.dispatchEvent(new CustomEvent('at-cookie-accepted'));
      }
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-live="polite">
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <p id="cookie-banner-title" className="cookie-banner__title">
            {t('cookie_title')}
          </p>
          <p className="cookie-banner__desc">{t('cookie_text')}</p>
        </div>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--ghost"
            onClick={() => save('essential')}
          >
            {t('cookie_essential')}
          </button>
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--primary"
            onClick={() => save('all')}
          >
            {t('cookie_accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
