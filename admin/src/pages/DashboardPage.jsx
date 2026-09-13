import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { PageHeader, LoadingState } from '../components/ui';
import { StatIcons, InfoIcon } from '../components/icons';

function FavoritesTopTable({ title, rows, editPathPrefix, emptyLabel }) {
  if (!rows.length) {
    return (
      <div className="fav-stats-block">
        <h3>{title}</h3>
        <p className="fav-stats-empty">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="fav-stats-block">
      <h3>{title}</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>ID</th>
              <th>Favoris</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.itemId}>
                <td>{index + 1}</td>
                <td>
                  <Link to={`${editPathPrefix}/${row.itemId}`} className="fav-stats-link">
                    {row.name}
                  </Link>
                </td>
                <td><code>{row.itemId}</code></td>
                <td><strong>{row.count}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getStats()
      .then(async (contentStats) => {
        if (!contentStats.favorites) {
          try {
            contentStats.favorites = await api.getFavoriteStats();
          } catch {
            contentStats.favorites = {
              ready: false,
              message:
                'Backend à redémarrer — dans un terminal : cd backend puis npm run dev. Ensuite rechargez cette page.',
              totals: { favorites: 0, uniqueVisitors: 0 },
              byType: {},
              topActivities: [],
              topHotels: [],
              topTours: [],
            };
          }
        }
        setStats(contentStats);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <LoadingState label="Chargement du tableau de bord…" />;

  const favoriteStats = stats.favorites || {
    ready: false,
    message: 'Statistiques favoris indisponibles.',
    totals: { favorites: 0, uniqueVisitors: 0 },
    byType: {},
    topActivities: [],
    topHotels: [],
    topTours: [],
  };

  const cards = [
    { label: 'Réservations en attente', value: stats.reservations.pending, className: 'pending', to: '/reservations', icon: 'pending' },
    { label: 'Commentaires en attente', value: stats.commentsPending || 0, className: 'pending', to: '/comments', icon: 'blog' },
    { label: 'Messages contact non lus', value: stats.contactMessages?.unread || 0, className: 'pending', to: '/contact', icon: 'blog' },
    { label: 'Réservations confirmées', value: stats.reservations.confirmed, className: 'confirmed', to: '/reservations', icon: 'confirmed' },
    { label: 'Circuits', value: stats.tours, to: '/tours', icon: 'tours' },
    { label: 'Activités', value: stats.activities, to: '/activities', icon: 'activities' },
    { label: 'Hôtels', value: stats.hotels, to: '/hotels', icon: 'stays' },
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
            Gérez réservations, messages contact, contenus et médias depuis un seul endroit.
            Les hôtels, la galerie et les réservations se synchronisent avec le site public.
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
              <strong>{favoriteStats.totals.favorites}</strong>
              <span>Favoris visiteurs</span>
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

      <div className="panel fav-stats-panel">
        <div className="panel-head">
          <h2>Favoris visiteurs (sans compte)</h2>
          <span className="fav-stats-summary">
            {favoriteStats.totals.uniqueVisitors} visiteur{favoriteStats.totals.uniqueVisitors > 1 ? 's' : ''} · {favoriteStats.totals.favorites} favori{favoriteStats.totals.favorites > 1 ? 's' : ''}
          </span>
        </div>
        <div className="panel-body">
          {!favoriteStats.ready ? (
            <p className="panel-note">
              <InfoIcon />
              {favoriteStats.message}
            </p>
          ) : (
            <>
              <div className="fav-stats-types">
                {Object.entries(favoriteStats.byType).map(([type, count]) => (
                  <span key={type} className="fav-stats-type-chip">
                    {type} · <strong>{count}</strong>
                  </span>
                ))}
              </div>

              <FavoritesTopTable
                title="Top activités favorites"
                rows={favoriteStats.topActivities}
                editPathPrefix="/activities"
                emptyLabel="Aucune activité en favori pour le moment."
              />

              <div className="fav-stats-grid">
                <FavoritesTopTable
                  title="Top hôtels favorites"
                  rows={favoriteStats.topHotels}
                  editPathPrefix="/hotels"
                  emptyLabel="Aucun hôtel en favori."
                />
                <FavoritesTopTable
                  title="Top circuits favorites"
                  rows={favoriteStats.topTours}
                  editPathPrefix="/tours"
                  emptyLabel="Aucun circuit en favori."
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Actions rapides</h2>
        </div>
        <div className="panel-body">
          <div className="quick-actions">
            <Link to="/reservations" className="btn btn-primary">Voir les réservations</Link>
            <Link to="/contact" className="btn btn-secondary">Messages contact</Link>
            <Link to="/media" className="btn btn-secondary">Bibliothèque médias</Link>
            <Link to="/tours/new" className="btn btn-secondary">Nouveau circuit</Link>
            <Link to="/activities/new" className="btn btn-secondary">Nouvelle activité</Link>
            <Link to="/hotels/new" className="btn btn-secondary">Nouvel hôtel</Link>
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
