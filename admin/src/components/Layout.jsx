import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminNotificationBell from './AdminNotificationBell';
import {
  BrandIcon,
  DashboardIcon,
  ReservationsIcon,
  PlacesIcon,
  ToursIcon,
  ActivitiesIcon,
  StaysIcon,
  BlogIcon,
  GalleryIcon,
  ExternalLinkIcon,
  MenuIcon,
} from './icons';

const NAV = [
  { to: '/', label: 'Tableau de bord', end: true, icon: DashboardIcon },
  { to: '/reservations', label: 'Réservations', icon: ReservationsIcon },
  { to: '/comments', label: 'Commentaires', icon: BlogIcon },
  { to: '/places', label: 'Destinations', icon: PlacesIcon },
  { to: '/tours', label: 'Circuits', icon: ToursIcon },
  { to: '/activities', label: 'Activités', icon: ActivitiesIcon },
  { to: '/hotels', label: 'Hôtels', icon: StaysIcon },
  { to: '/stays', label: 'Hébergements', icon: StaysIcon },
  { to: '/blog', label: 'Blog', icon: BlogIcon },
  { to: '/gallery', label: 'Galerie', icon: GalleryIcon },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark">
            <div className="admin-brand-icon">
              <BrandIcon />
            </div>
            <div className="admin-brand-text">
              <strong>Algeria Travel</strong>
              <span>Administration</span>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={closeSidebar}>
                <Icon />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="http://localhost:3000" target="_blank" rel="noreferrer">
            <ExternalLinkIcon />
            Voir le site public
          </a>
          <a href="http://localhost:5175/partner/" target="_blank" rel="noreferrer" style={{ marginTop: 8, display: 'flex' }}>
            <ExternalLinkIcon />
            Portail hôtel (/partner)
          </a>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 12 }}
            onClick={onLogout}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <MenuIcon />
          </button>
          <strong style={{ fontFamily: 'var(--serif)', fontSize: '1rem' }}>Algeria Travel</strong>
          <AdminNotificationBell />
          <div style={{ width: 8 }} />
        </div>

        <div className={`admin-main-inner${location.pathname.includes('/hotels/') ? ' admin-main-inner--wide' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
