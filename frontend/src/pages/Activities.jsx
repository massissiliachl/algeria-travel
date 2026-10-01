import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import { useLang } from '../hooks/useLangHook';
import { ACTIVITIES, ACTIVITY_FILTERS } from '../data/activities';
import { FEATURED_TOURS } from '../data/tours';
import { getPlacePathFromTour } from '../data/placeRoutes';
import './Activities.css';

const HERO_FEATURES = [
  { icon: 'ShieldCheck', titleKey: 'acts_feat_secure', descKey: 'acts_feat_secure_desc' },
  { icon: 'MapPin', titleKey: 'acts_feat_guides', descKey: 'acts_feat_guides_desc' },
  { icon: 'Tag', titleKey: 'acts_feat_price', descKey: 'acts_feat_price_desc' },
  { icon: 'RefreshCw', titleKey: 'acts_feat_cancel', descKey: 'acts_feat_cancel_desc' },
];

const TRUST_ITEMS = [
  { icon: 'Calendar', titleKey: 'acts_trust_book', descKey: 'acts_trust_book_desc' },
  { icon: 'CreditCard', titleKey: 'acts_trust_pay', descKey: 'acts_trust_pay_desc' },
  { icon: 'BadgePercent', titleKey: 'acts_trust_price', descKey: 'acts_trust_price_desc' },
  { icon: 'Users', titleKey: 'acts_trust_guides', descKey: 'acts_trust_guides_desc' },
];

const Activities = () => {
  const navigate = useNavigate();
  const { t, pick } = useLang();
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState(() => new Set());
  const destTrackRef = useRef(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return ACTIVITIES;
    return ACTIVITIES.filter((a) => a.filters?.includes(filter));
  }, [filter]);

  const destinations = FEATURED_TOURS.slice(0, 5);

  const toggleFav = (e, id) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollDest = (dir) => {
    const el = destTrackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const scrollToGrid = () => {
    document.getElementById('acts-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="acts-page">
      <Navbar />

      <section className="acts-hero">
        <ResponsiveImage
          className="acts-hero__bg"
          src="/images/quad.jpg"
          alt=""
          priority
          sizes="100vw"
        />
        <div className="acts-hero__overlay" />
        <div className="acts-hero__inner" data-reveal="fade">
          <nav className="acts-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <span>{t('nav_activities')}</span>
          </nav>
          <h1 className="acts-hero__title">
            {t('acts_hero_title_before')}
            <em> {t('acts_hero_title_em')} </em>
            {t('acts_hero_title_after')}
          </h1>
          <p className="acts-hero__subtitle">{t('acts_hero_subtitle')}</p>
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
          {ACTIVITY_FILTERS.map((f) => (
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

      <section className="acts-grid-section" id="acts-grid">
        <div className="acts-container">
          <div className="acts-grid">
            {filtered.map((act, i) => (
              <article
                key={act.id}
                className="acts-card"
                data-reveal
                data-delay={i * 60}
                onClick={() => navigate(`/activity/${act.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/activity/${act.id}`);
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <img src={act.image} alt="" loading="lazy" />
                <button
                  type="button"
                  className={`acts-card__fav ${favorites.has(act.id) ? 'is-on' : ''}`}
                  aria-label="Favorite"
                  onClick={(e) => toggleFav(e, act.id)}
                >
                  <Icon name="Heart" size={16} strokeWidth={2} fill={favorites.has(act.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="acts-card__body">
                  <h3>{pick(act.name, act.name_en, act.name_ar)}</h3>
                  <p className="acts-card__tags">{pick(act.tags?.fr, act.tags?.en, act.tags?.ar)}</p>
                  <div className="acts-card__meta">
                    <span>
                      <Icon name="Clock" size={13} />
                      {pick(act.durationShort, act.durationShort_en, act.durationShort_ar)}
                    </span>
                    <span>
                      <Icon name="Tag" size={13} />
                      {t('acts_from')} {act.price.toLocaleString()} DA
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="acts-empty">{t('acts_empty')}</p>
          )}
        </div>
      </section>

      <section className="acts-promo">
        <div className="acts-container acts-promo__inner">
          <div className="acts-promo__text" data-reveal="left">
            <span className="acts-promo__eyebrow">{t('acts_promo_eyebrow')}</span>
            <h2>{t('acts_promo_title')}</h2>
            <p>{t('acts_promo_text')}</p>
            <button type="button" className="acts-promo__btn" onClick={scrollToGrid}>
              {t('acts_promo_cta')} <Icon name="ArrowRight" size={16} />
            </button>
          </div>
          <div className="acts-promo__visual" data-reveal="right">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80"
              alt=""
            />
            <div className="acts-promo__stats">
              <div><strong>+150</strong><span>{t('acts_stat_activities')}</span></div>
              <div><strong>25+</strong><span>{t('acts_stat_destinations')}</span></div>
              <div><strong>100%</strong><span>{t('acts_stat_satisfaction')}</span></div>
              <div><strong>24/7</strong><span>{t('acts_stat_support')}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="acts-dest">
        <div className="acts-container">
          <div className="acts-dest__head" data-reveal>
            <div>
              <span className="acts-dest__eyebrow">{t('acts_dest_eyebrow')}</span>
              <h2>
                {t('acts_dest_title')} <em>{t('acts_dest_title_em')}</em>
              </h2>
            </div>
            <div className="acts-dest__nav">
              <button type="button" aria-label="Previous" onClick={() => scrollDest(-1)}>
                <Icon name="ChevronLeft" size={18} />
              </button>
              <button type="button" aria-label="Next" onClick={() => scrollDest(1)}>
                <Icon name="ChevronRight" size={18} />
              </button>
            </div>
          </div>
          <div className="acts-dest__track" ref={destTrackRef}>
            {destinations.map((d, i) => (
              <article
                key={d.id}
                className="acts-dest-card"
                data-reveal
                data-delay={i * 60}
                onClick={() => navigate(getPlacePathFromTour(d))}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(getPlacePathFromTour(d));
                  }
                }}
              >
                <img src={d.image} alt="" loading="lazy" />
                <div className="acts-dest-card__body">
                  <h3>{pick(d.name, d.name_en, d.name_ar)}</h3>
                  <span>{pick(d.subtitle, d.subtitle_en, d.subtitle_ar)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="acts-trust">
        <div className="acts-container">
          <h2 data-reveal>{t('acts_trust_title')}</h2>
          <div className="acts-trust__grid">
            {TRUST_ITEMS.map((item, i) => (
              <div
                key={item.titleKey}
                className="acts-trust__item"
                data-reveal
                data-delay={i * 80}
              >
                <div className="acts-trust__icon">
                  <Icon name={item.icon} size={22} strokeWidth={1.6} />
                </div>
                <h3>{t(item.titleKey)}</h3>
                <p>{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Activities;
