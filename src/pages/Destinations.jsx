import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import { useLang } from '../hooks/useLangHook';
import { FEATURED_TOURS } from '../data/tours';
import { getPlacePathFromTour } from '../data/placeRoutes';
import './Activities.css';
import './Destinations.css';

const FILTERS = [
  { key: 'all', icon: 'Compass', fr: 'Toutes', en: 'All', ar: 'الكل' },
  { key: 'desert', icon: 'Sun', fr: 'Sahara', en: 'Sahara', ar: 'الصحراء' },
  { key: 'nature', icon: 'Mountain', fr: 'Nature', en: 'Nature', ar: 'طبيعة' },
  { key: 'culture', icon: 'Landmark', fr: 'Culture', en: 'Culture', ar: 'ثقافة' },
];

const HERO_FEATURES = [
  { icon: 'MapPin', titleKey: 'dest_feat_places', descKey: 'dest_feat_places_desc' },
  { icon: 'Camera', titleKey: 'dest_feat_views', descKey: 'dest_feat_views_desc' },
  { icon: 'Users', titleKey: 'dest_feat_local', descKey: 'dest_feat_local_desc' },
  { icon: 'Star', titleKey: 'dest_feat_rated', descKey: 'dest_feat_rated_desc' },
];

export default function Destinations() {
  const navigate = useNavigate();
  const { t, pick } = useLang();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return FEATURED_TOURS;
    return FEATURED_TOURS.filter((d) => d.category === filter);
  }, [filter]);

  return (
    <div className="acts-page dest-page">
      <Navbar />

      <section className="acts-hero">
        <ResponsiveImage
          className="acts-hero__bg"
          src="/images/djanet.jpeg"
          alt=""
          priority
          sizes="100vw"
        />
        <div className="acts-hero__overlay" />
        <div className="acts-hero__inner" data-reveal="fade">
          <nav className="acts-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <span>{t('nav_destinations')}</span>
          </nav>
          <h1 className="acts-hero__title">
            {t('dest_page_title_before')}
            <em> {t('dest_page_title_em')} </em>
            {t('dest_page_title_after')}
          </h1>
          <p className="acts-hero__subtitle">{t('dest_page_subtitle')}</p>
          <div className="acts-hero__features">
            {HERO_FEATURES.map((f) => (
              <div key={f.titleKey} className="acts-hero__feat">
                <Icon name={f.icon} size={22} strokeWidth={1.5} />
                <strong>{t(f.titleKey)}</strong>
                <span>{t(f.descKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="acts-filters-wrap filter-pills-wrap is-scrollable" data-reveal>
        <div className="acts-filters filter-pills" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`acts-filters__btn ${filter === f.key ? 'is-active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              <Icon name={f.icon} size={18} strokeWidth={1.75} />
              <span>{pick(f.fr, f.en, f.ar)}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="acts-grid-section" id="dest-grid">
        <div className="acts-container">
          <div className="acts-grid">
            {filtered.map((dest, i) => (
              <article
                key={dest.id}
                className="acts-card"
                data-reveal
                data-delay={i * 60}
                onClick={() => navigate(getPlacePathFromTour(dest))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(getPlacePathFromTour(dest));
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <img
                  src={dest.image}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/images/djanet.jpeg';
                  }}
                />
                {dest.badge && (
                  <span className="acts-card__new">
                    {pick(dest.badge.fr, dest.badge.en, dest.badge.ar)}
                  </span>
                )}
                <div className="acts-card__body">
                  <h3>{pick(dest.name, dest.name_en, dest.name_ar)}</h3>
                  <p className="acts-card__tags">
                    {pick(dest.subtitle, dest.subtitle_en, dest.subtitle_ar)}
                  </p>
                  <div className="acts-card__meta">
                    <span>
                      <Icon name="MapPin" size={13} />
                      {pick(dest.location, dest.location_en, dest.location_ar)}
                    </span>
                    <span>
                      <Icon name="Star" size={13} />
                      {dest.rating}
                    </span>
                    <span className="acts-card__price">
                      {dest.price.toLocaleString('fr-DZ')} DA
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="acts-empty">{t('dest_page_empty')}</p>
          )}
        </div>
      </section>

      <section className="acts-promo">
        <div className="acts-container acts-promo__inner">
          <div className="acts-promo__text" data-reveal="left">
            <span className="acts-promo__eyebrow">{t('dest_promo_eyebrow')}</span>
            <h2>{t('dest_promo_title')}</h2>
            <p>{t('dest_promo_text')}</p>
            <button
              type="button"
              className="acts-promo__btn"
              onClick={() => navigate('/tours')}
            >
              {t('dest_promo_cta')} <Icon name="ArrowRight" size={16} />
            </button>
          </div>
          <div className="acts-promo__visual" data-reveal="right">
            <img src="/images/ghardaia.jpeg" alt="" />
            <div className="acts-promo__stats">
              <div>
                <strong>{FEATURED_TOURS.length}+</strong>
                <span>{t('dest_stat_places')}</span>
              </div>
              <div>
                <strong>4.8</strong>
                <span>{t('dest_stat_rating')}</span>
              </div>
              <div>
                <strong>50+</strong>
                <span>{t('dest_stat_experiences')}</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>{t('dest_stat_support')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
