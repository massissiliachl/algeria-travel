import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandIcon } from './icons';
import PartnerHeader from './PartnerHeader';
import { PublishedBadge } from './ui';

const NAV = [
  { to: '/', label: 'Tableau de bord', end: true, icon: '▣' },
  { to: '/hotel', label: 'Informations hôtel', icon: '⌂' },
  { to: '/chambres', label: 'Chambres', icon: '🛏' },
  { to: '/tarifs', label: 'Tarifs & saisons', icon: '◈' },
  { to: '/chambres', label: 'Disponibilités', icon: '▦' },
  { to: '/reservations', label: 'Réservations', icon: '📋' },
  { to: '/photos', label: 'Photos', icon: '📷' },
  { to: '/publication', label: 'Paramètres', icon: '⚙' },
];

export default function PartnerLayout() {
  const { hotel, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="partner-shell">
      <div
        className={`partner-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside className={`partner-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="partner-sidebar__brand">
          <div className="partner-sidebar__logo">
            <BrandIcon size={22} />
          </div>
          <div>
            <strong>Algeria Travel</strong>
            <span>Espace Hôtel</span>
          </div>
        </div>

        {hotel?.name && (
          <div className="partner-sidebar__hotel">
            <p>{hotel.name}</p>
            <PublishedBadge published={hotel.published} />
          </div>
        )}

        <nav className="partner-sidebar__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="partner-sidebar__icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="partner-sidebar__footer">
          <a href="http://localhost:3000/hotels" target="_blank" rel="noreferrer">
            Voir le site public ↗
          </a>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="partner-main-wrap">
        <PartnerHeader
          onMenuOpen={() => setSidebarOpen(true)}
          onLogout={() => navigate('/login')}
        />
        <main className={`partner-main${location.pathname.includes('/chambres') ? ' partner-main--wide' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
