import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { FEATURED_TOURS } from '../data/tours';
import { getPlacePathFromTour } from '../data/placeRoutes';
import SeoHead from '../components/SeoHead';
import './Activities.css';

const FILTERS = [
  { key: 'all', icon: 'Compass', fr: 'Tous', en: 'All', ar: 'الكل' },
  { key: 'desert', icon: 'Sun', fr: 'Désert', en: 'Desert', ar: 'صحراء' },
  { key: 'nature', icon: 'Mountain', fr: 'Nature', en: 'Nature', ar: 'طبيعة' },
  { key: 'culture', icon: 'Landmark', fr: 'Culture', en: 'Culture', ar: 'ثقافة' },
];

const HERO_FEATURES = [
  { icon: 'ShieldCheck', titleKey: 'tours_feat_secure', descKey: 'tours_feat_secure_desc' },
  { icon: 'MapPin', titleKey: 'tours_feat_guides', descKey: 'tours_feat_guides_desc' },
  { icon: 'Calendar', titleKey: 'tours_feat_itinerary', descKey: 'tours_feat_itinerary_desc' },
  { icon: 'Tag', titleKey: 'tours_feat_price', descKey: 'tours_feat_price_desc' },
];

const Tours = () => {
  const navigate = useNavigate();
  const { t, pick } = useLang();
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState(() => new Set());

  const filtered = useMemo(() => {
    if (filter === 'all') return FEATURED_TOURS;
    return FEATURED_TOURS.filter((tour) => tour.category === filter);
  }, [filter]);

  const toggleFav = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="acts-page">
      <SeoHead
        title={t('seo_tours_title')}
        description={t('seo_tours_desc')}
        path="/tours"
        image="/images/home/circuits-4x4.png"
      />
      <Navbar />

      <section className="acts-hero">
        <img
          className="acts-hero__bg"
          src="/images/home/circuits-4x4.png"
          alt=""
        />
        <div className="acts-hero__overlay" />
        <div className="acts-hero__inner" data-reveal="fade">
          <nav className="acts-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <span>{t('nav_tours')}</span>
          </nav>
          <h1 className="acts-hero__title">
            {t('tours_hero_title_before')}
            <em> {t('tours_hero_title_em')} </em>
            {t('tours_hero_title_after')}
          </h1>
          <p className="acts-hero__subtitle">{t('tours_hero_subtitle')}</p>
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

      <div className="acts-filters-wrap" data-reveal>
        <div className="acts-filters" role="tablist">
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

      <section className="acts-grid-section" id="tours-grid">
        <div className="acts-container">
          <div className="acts-grid">
            {filtered.map((tour, i) => (
              <article
                key={tour.id}
                className="acts-card"
                data-reveal
                data-delay={i * 60}
                onClick={() => navigate(getPlacePathFromTour(tour))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(getPlacePathFromTour(tour));
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <img src={tour.image} alt="" loading="lazy" />
                <button
                  type="button"
                  className={`acts-card__fav ${favorites.has(tour.id) ? 'is-on' : ''}`}
                  aria-label="Favorite"
                  onClick={(e) => toggleFav(e, tour.id)}
                >
                  <Icon
                    name="Heart"
                    size={16}
                    strokeWidth={2}
                    fill={favorites.has(tour.id) ? 'currentColor' : 'none'}
                  />
                </button>
                <div className="acts-card__body">
                  <h3>{pick(tour.name, tour.name_en, tour.name_ar)}</h3>
                  <p className="acts-card__tags">
                    {pick(tour.subtitle, tour.subtitle_en, tour.subtitle_ar)}
                  </p>
                  <div className="acts-card__meta">
                    <span>
                      <Icon name="MapPin" size={13} />
                      {pick(tour.location, tour.location_en, tour.location_ar)}
                    </span>
                    <span>
                      <Icon name="Clock" size={13} />
                      {pick(tour.duration, tour.duration_en, tour.duration_ar)}
                    </span>
                    <span>
                      <Icon name="Tag" size={13} />
                      {t('acts_from')} {tour.price.toLocaleString()} DA
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="acts-empty">{t('tours_empty')}</p>
          )}
        </div>
      </section>

      <section className="acts-promo">
        <div className="acts-container acts-promo__inner">
          <div className="acts-promo__text" data-reveal="left">
            <span className="acts-promo__eyebrow">{t('tours_promo_eyebrow')}</span>
            <h2>{t('tours_promo_title')}</h2>
            <p>{t('tours_promo_text')}</p>
            <button
              type="button"
              className="acts-promo__btn"
              onClick={() => navigate('/contact')}
            >
              {t('tours_promo_cta')} <Icon name="ArrowRight" size={16} />
            </button>
          </div>
          <div className="acts-promo__visual" data-reveal="right">
            <img src="/images/home/circuits-4x4.png" alt="" />
            <div className="acts-promo__stats">
              <div><strong>{FEATURED_TOURS.length}+</strong><span>{t('tours_stat_circuits')}</span></div>
              <div><strong>4.8</strong><span>{t('tours_stat_rating')}</span></div>
              <div><strong>100%</strong><span>{t('tours_stat_local')}</span></div>
              <div><strong>24/7</strong><span>{t('tours_stat_support')}</span></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tours;
