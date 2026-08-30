import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useHotelFormContext } from '../context/HotelFormContext';
import { PageHeader } from '../components/ui';

const AVAIL_LABELS = {
  available: 'Disponible',
  limited: 'Places limitées',
  unavailable: 'Complet',
};

export default function DashboardPage() {
  const { form, loading } = useHotelFormContext();
  const [planningStats, setPlanningStats] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date();
    end.setDate(end.getDate() + 30);
    api
      .getAvailability({ from: today, to: end.toISOString().slice(0, 10) })
      .then((data) => {
        const days = data.days || [];
        const open = days.filter((d) => !d.closed && d.roomsLeft > 0).length;
        const full = days.filter((d) => d.closed || d.roomsLeft <= 0).length;
        setPlanningStats({ open, full, total: days.length });
      })
      .catch(() => setPlanningStats(null));
  }, []);

  const galleryCount = useMemo(() => {
    try {
      const g = JSON.parse(form.gallery || '[]');
      return Array.isArray(g) ? g.length : 0;
    } catch {
      return 0;
    }
  }, [form.gallery]);

  if (loading) return <p className="partner-loading">Chargement du tableau de bord…</p>;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d’ensemble de votre établissement sur Algeria Travel."
      />

      <div className="partner-stats">
        <article className="partner-stat-card">
          <span className="partner-stat-card__label">Statut en ligne</span>
          <strong className={`partner-stat-card__value ${form.published ? 'is-ok' : ''}`}>
            {form.published ? 'Publié' : 'Brouillon'}
          </strong>
          <p>{form.published ? 'Visible sur /hotels' : 'Non visible des voyageurs'}</p>
        </article>

        <article className="partner-stat-card">
          <span className="partner-stat-card__label">Prix / nuit</span>
          <strong className="partner-stat-card__value">
            {form.price ? `${Number(form.price).toLocaleString()} DA` : '—'}
          </strong>
          <p>{form.stars ? `${form.stars} étoiles` : 'Catégorie non renseignée'}</p>
        </article>

        <article className="partner-stat-card">
          <span className="partner-stat-card__label">Chambres (stock)</span>
          <strong className="partner-stat-card__value">{form.roomsAvailable || '—'}</strong>
          <p>{AVAIL_LABELS[form.availability] || form.availability}</p>
        </article>

        <article className="partner-stat-card">
          <span className="partner-stat-card__label">Planning 30 j.</span>
          <strong className="partner-stat-card__value">
            {planningStats ? `${planningStats.open} j. ouverts` : '—'}
          </strong>
          <p>
            {planningStats
              ? `${planningStats.full} j. complets / fermés`
              : 'Configurez votre calendrier'}
          </p>
        </article>
      </div>

      <div className="partner-quick">
        <h2>Actions rapides</h2>
        <div className="partner-quick__grid">
          <Link to="/chambres" className="partner-quick__card">
            <span>▦</span>
            <strong>Gestion des chambres</strong>
            <p>Disponibilités, tarifs et calendrier</p>
          </Link>
          <Link to="/tarifs" className="partner-quick__card">
            <span>◈</span>
            <strong>Tarifs & disponibilité</strong>
            <p>Prix, chambres, horaires d’arrivée</p>
          </Link>
          <Link to="/photos" className="partner-quick__card">
            <span>▣</span>
            <strong>Photos ({galleryCount + (form.image ? 1 : 0)})</strong>
            <p>Photo principale et galerie</p>
          </Link>
          <Link to="/publication" className="partner-quick__card">
            <span>●</span>
            <strong>Publication</strong>
            <p>{form.published ? 'Gérer la visibilité' : 'Publier sur le site'}</p>
          </Link>
        </div>
      </div>

      {form.image && (
        <div className="panel partner-preview">
          <h3>Aperçu</h3>
          <div className="partner-preview__card">
            <img src={form.image} alt="" />
            <div>
              <strong>{form.name}</strong>
              <p>{form.location}</p>
              <span>{form.price ? `${Number(form.price).toLocaleString()} DA / nuit` : ''}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
