import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { PageHeader, LoadingState } from '../components/ui';
import { StatIcons, InfoIcon } from '../components/icons';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <LoadingState label="Chargement du tableau de bord…" />;

  const cards = [
    { label: 'Réservations en attente', value: stats.reservations.pending, className: 'pending', to: '/reservations', icon: 'pending' },
    { label: 'Réservations confirmées', value: stats.reservations.confirmed, className: 'confirmed', to: '/reservations', icon: 'confirmed' },
    { label: 'Circuits', value: stats.tours, to: '/tours', icon: 'tours' },
    { label: 'Activités', value: stats.activities, to: '/activities', icon: 'activities' },
    { label: 'Hébergements', value: stats.stays, to: '/stays', icon: 'stays' },
    { label: 'Articles blog', value: stats.blogPosts, to: '/blog', icon: 'blog' },
    { label: 'Destinations', value: stats.places, to: '/places', icon: 'places' },
    { label: 'Photos galerie', value: stats.gallery, to: '/gallery', icon: 'gallery' },
  ];

  const totalContent = stats.tours + stats.activities + stats.stays + stats.blogPosts + stats.places + stats.gallery;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de votre plateforme Algeria Travel"
      />

      <div className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <h2>Bienvenue dans l'espace admin</h2>
          <p>
            Gérez vos réservations, contenus et médias depuis un seul endroit.
            Les modifications sont visibles immédiatement sur le site public.
          </p>
          <div className="dashboard-welcome-stats">
            <div className="dashboard-welcome-stat">
              <strong>{stats.reservations.pending + stats.reservations.confirmed}</strong>
              <span>Réservations</span>
            </div>
            <div className="dashboard-welcome-stat">
              <strong>{totalContent}</strong>
              <span>Contenus publiés</span>
            </div>
            <div className="dashboard-welcome-stat">
              <strong>{stats.reservations.pending}</strong>
              <span>En attente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((c) => {
          const Icon = StatIcons[c.icon];
          return (
            <Link key={c.label} to={c.to} className={`stat-card ${c.className || ''}`}>
              <div className="stat-card-icon">
                <Icon />
              </div>
              <div className="stat-card-body">
                <strong>{c.value}</strong>
                <span>{c.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Actions rapides</h2>
        </div>
        <div className="panel-body">
          <div className="quick-actions">
            <Link to="/reservations" className="btn btn-primary">Voir les réservations</Link>
            <Link to="/tours/new" className="btn btn-secondary">Nouveau circuit</Link>
            <Link to="/activities/new" className="btn btn-secondary">Nouvelle activité</Link>
            <Link to="/stays/new" className="btn btn-secondary">Nouvel hébergement</Link>
            <Link to="/blog/new" className="btn btn-secondary">Nouvel article</Link>
            <Link to="/gallery/new" className="btn btn-secondary">Nouvelle photo galerie</Link>
          </div>
          <p className="panel-note">
            <InfoIcon />
            Publier une photo galerie envoie automatiquement une notification aux abonnés.
          </p>
        </div>
      </div>
    </>
  );
}
