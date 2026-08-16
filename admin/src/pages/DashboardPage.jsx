import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { PageHeader } from '../components/ui';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');

  useEffect(() => {
    api.getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  const notifyGallery = async () => {
    try {
      await api.notifyGallery();
      setNotifyMsg('Notification galerie envoyée aux abonnés.');
    } catch (e) {
      setNotifyMsg(e.message);
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <p>Chargement…</p>;

  const cards = [
    { label: 'Réservations en attente', value: stats.reservations.pending, className: 'pending', to: '/reservations' },
    { label: 'Réservations confirmées', value: stats.reservations.confirmed, className: 'confirmed', to: '/reservations' },
    { label: 'Circuits', value: stats.tours, to: '/tours' },
    { label: 'Activités', value: stats.activities, to: '/activities' },
    { label: 'Hébergements', value: stats.stays, to: '/stays' },
    { label: 'Articles blog', value: stats.blogPosts, to: '/blog' },
    { label: 'Destinations', value: stats.places, to: '/places' },
  ];

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de Algeria Travel"
      />
      <div className="stats-grid">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`stat-card ${c.className || ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong>{c.value}</strong>
            <span>{c.label}</span>
          </Link>
        ))}
      </div>
      <div className="panel">
        <div className="panel-head">
          <h2>Actions rapides</h2>
        </div>
        <div style={{ padding: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/reservations" className="btn btn-primary">Voir les réservations</Link>
          <Link to="/tours/new" className="btn btn-secondary">Nouveau circuit</Link>
          <Link to="/activities/new" className="btn btn-secondary">Nouvelle activité</Link>
          <Link to="/stays/new" className="btn btn-secondary">Nouvel hébergement</Link>
          <Link to="/blog/new" className="btn btn-secondary">Nouvel article</Link>
          <button type="button" className="btn btn-secondary" onClick={notifyGallery}>
            Notifier galerie
          </button>
        </div>
        {notifyMsg && <p style={{ padding: '0 20px 20px', margin: 0 }}>{notifyMsg}</p>}
      </div>
    </>
  );
}
