import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../hooks/useLangHook';
import Icon from './ui/Icon';
import './TrackReservationBar.css';

export default function TrackReservationBar({ variant = 'inline', onDone, className = '' }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [ref, setRef] = useState('');
  const [token, setToken] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const normalizedRef = ref.trim().toUpperCase();
    const normalizedToken = token.trim();
    if (!normalizedRef || !normalizedToken) return;

    navigate(`/suivi?ref=${encodeURIComponent(normalizedRef)}`, {
      state: { token: normalizedToken },
    });
    onDone?.();
  };

  return (
    <form
      className={`track-bar-widget track-bar-widget--${variant} ${className}`.trim()}
      onSubmit={onSubmit}
    >
      <p className="track-bar-widget__title">{t('track_nav_title')}</p>
      <div className="track-bar-widget__row">
        <input
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value.toUpperCase())}
          placeholder={t('track_ref_label')}
          aria-label={t('track_ref_label')}
          autoComplete="off"
          spellCheck={false}
        />
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={t('track_token_ph')}
          aria-label={t('track_token_label')}
          autoComplete="off"
        />
        <button type="submit" aria-label={t('track_submit')}>
          <Icon name="Search" size={16} />
          <span>{t('track_submit')}</span>
        </button>
      </div>
    </form>
  );
}
