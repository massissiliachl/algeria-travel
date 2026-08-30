import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { PublishedBadge } from './ui';
import NotificationPanel from './NotificationPanel';
import { usePartnerNotificationsContext } from '../context/PartnerNotificationsContext';

export default function PartnerHeader({ onMenuOpen, onLogout }) {
  const { hotel, logout } = useAuth();
  const { unreadCount } = usePartnerNotificationsContext();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const logoUrl = resolveMediaUrl(hotel?.image);

  return (
    <header className="partner-header">
      <div className="partner-header__left">
        <button type="button" className="partner-menu-btn" onClick={onMenuOpen} aria-label="Menu">
          ☰
        </button>
        <div className="partner-header__profile">
          <div className="partner-header__avatar">
            {logoUrl ? <img src={logoUrl} alt="" /> : <span>🏨</span>}
          </div>
          <div className="partner-header__info">
            <strong>{hotel?.name || 'Mon hôtel'}</strong>
            <PublishedBadge published={hotel?.published} />
          </div>
        </div>
      </div>

      <div className="partner-header__actions">
        <div className="partner-header__notif-wrap">
          <button
            type="button"
            className="partner-header__bell"
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="partner-header__bell-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <div className="partner-header__user-wrap">
          <button
            type="button"
            className="partner-header__user"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <span className="partner-header__user-avatar">
              {logoUrl ? <img src={logoUrl} alt="" /> : '👤'}
            </span>
          </button>
          {profileOpen && (
            <div className="partner-header__dropdown">
              <p><strong>{hotel?.name}</strong></p>
              <a href="http://localhost:3000/hotels" target="_blank" rel="noreferrer">Voir le site public ↗</a>
              <button type="button" onClick={() => { logout(); onLogout?.(); }}>Déconnexion</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
