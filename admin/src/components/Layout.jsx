import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Tableau de bord', end: true },
  { to: '/reservations', label: 'Réservations' },
  { to: '/places', label: 'Destinations' },
  { to: '/tours', label: 'Circuits' },
  { to: '/activities', label: 'Activités' },
  { to: '/stays', label: 'Hébergements' },
  { to: '/blog', label: 'Blog' },
  { to: '/gallery', label: 'Galerie' },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          Algeria <span>Travel</span> Admin
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a href="http://localhost:3000" target="_blank" rel="noreferrer">
            Voir le site →
          </a>
          <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: 10 }} onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
