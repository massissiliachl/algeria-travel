import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../hooks/useLangHook';
import Icon from '../ui/Icon';
import ResponsiveImage from '../ui/ResponsiveImage';
import {
  HOME_ACCOMMODATIONS,
  HOME_CIRCUITS_BANNER,
  HOME_COUP_TAGHIT,
  HOME_DESTINATIONS,
  HOME_HERO,
} from '../../data/homePage';
import { FEATURED_TOURS } from '../../data/tours';
import { getPlacePathFromTour } from '../../data/placeRoutes';
import {
  resolveSearchNavigation,
  suggestActivities,
  suggestDestinations,
} from '../../data/search';
import './HomeLanding.css';

const TRUST = [
  { icon: 'Calendar', title: 'home_trust_book', desc: 'home_trust_book_desc' },
  { icon: 'BadgePercent', title: 'home_trust_price', desc: 'home_trust_price_desc' },
  { icon: 'Sparkles', title: 'home_trust_auth', desc: 'home_trust_auth_desc' },
  {
    icon: 'MessageCircle',
    title: 'home_trust_whatsapp',
    desc: 'home_trust_whatsapp_desc',
    href: 'https://wa.me/213557664089?text=' + encodeURIComponent('Bonjour, je souhaite réserver une activité sur Algeria Travel'),
  },
];

const STATS = [
  { value: '+150', key: 'home_stat_acts' },
  { value: '+200', key: 'home_stat_dests' },
  { value: '+500', key: 'home_stat_partners' },
  { value: '+10K', key: 'home_stat_travelers' },
];

const HomeLanding = () => {
  const navigate = useNavigate();
  const { t, pick } = useLang();
  const destRef = useRef(null);
  const toursRef = useRef(null);
  const accRef = useRef(null);
  const [search, setSearch] = useState({
    destination: '',
    dates: '',
    travelers: '2',
    activity: '',
  });
  const [openSuggest, setOpenSuggest] = useState(null); // 'destination' | 'activity' | null
  const [email, setEmail] = useState('');
  const searchWrapRef = useRef(null);

  const destSuggestions = suggestDestinations(search.destination);
  const actSuggestions = suggestActivities(search.activity);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!searchWrapRef.current?.contains(e.target)) {
        setOpenSuggest(null);
      }
    };
    document.addEventListener('pointerdown', onDocClick);
    return () => document.removeEventListener('pointerdown', onDocClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setOpenSuggest(null);
    const { path } = resolveSearchNavigation(search);
    navigate(path);
  };

  const pickSuggestion = (field, suggestion) => {
    if (field === 'destination') {
      setSearch((prev) => ({ ...prev, destination: suggestion.label }));
      setOpenSuggest(null);
      const params = new URLSearchParams();
      if (search.dates) params.set('dates', search.dates);
      if (search.travelers) params.set('travelers', search.travelers);
      const qs = params.toString();
      navigate(qs ? `${suggestion.path}?${qs}` : suggestion.path);
      return;
    }
    setSearch((prev) => ({ ...prev, activity: suggestion.label }));
    setOpenSuggest(null);
    navigate(suggestion.path);
  };

  const handleNews = (e) => {
    e.preventDefault();
    if (email.includes('@')) alert(t('footer_newsletter_success'));
    else alert(t('footer_newsletter_invalid'));
    setEmail('');
  };

  const scrollTrack = (ref, dir) => {
    ref.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  return (
    <div className="home-v2">
      <section className="hv-hero" id="hero">
        <div className="hv-hero__media">
          <ResponsiveImage
            src={HOME_HERO.image}
            alt=""
            priority
            sizes="100vw"
            onError={(e) => {
              e.currentTarget.src = HOME_HERO.fallback;
            }}
          />
          <div className="hv-hero__overlay" />
        </div>

        <div className="hv-container hv-hero__content">
          <p className="hv-hero__brand hv-anim hv-anim--1">
            Algeria Travel
          </p>

          <h1 className="hv-hero__title hv-anim hv-anim--2">
            <span className="hv-hero__title-line">{t('home_v2_title_before')}</span>
            <span className="hv-hero__title-line">
              <em>{t('home_v2_title_em')}</em>
            </span>
            <span className="hv-hero__title-line">{t('home_v2_title_after')}</span>
          </h1>
          <span className="hv-hero__rule hv-anim hv-anim--2" aria-hidden />
          <p className="hv-hero__subtitle hv-anim hv-anim--3">{t('home_v2_subtitle')}</p>
          <div className="hv-hero__actions hv-anim hv-anim--4">
            <button
              type="button"
              className="hv-hero__cta"
              onClick={() => navigate('/destinations')}
            >
              <span className="hv-hero__cta-text">{t('home_v2_cta')}</span>
              <span className="hv-hero__cta-icon" aria-hidden>
                <Icon name="ArrowRight" size={18} strokeWidth={2} />
              </span>
            </button>
          </div>
        </div>
      </section>

      <div className="hv-search-wrap" ref={searchWrapRef} data-reveal data-delay="80">
        <form className="hv-search" onSubmit={handleSearch} role="search">
          <div className={`hv-search__field ${openSuggest === 'destination' ? 'is-open' : ''}`}>
            <label htmlFor="hv-dest">
              <Icon name="MapPin" size={12} /> {t('home_search_destination')}
            </label>
            <input
              id="hv-dest"
              type="text"
              autoComplete="off"
              placeholder={t('home_search_ph_dest')}
              value={search.destination}
              onChange={(e) => {
                setSearch({ ...search, destination: e.target.value });
                setOpenSuggest('destination');
              }}
              onFocus={() => setOpenSuggest('destination')}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpenSuggest(null);
              }}
            />
            {openSuggest === 'destination' && destSuggestions.length > 0 && (
              <ul className="hv-suggest" role="listbox">
                {destSuggestions.map((s) => (
                  <li key={`${s.type}-${s.id}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => pickSuggestion('destination', s)}
                    >
                      {s.image && <img src={s.image} alt="" />}
                      <span>
                        <strong>{pick(s.label, s.label_en, s.label_ar)}</strong>
                        <small>{pick(s.hint, s.hint_en, s.hint_ar)}</small>
                      </span>
                      <Icon name="ArrowRight" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="hv-search__field">
            <label htmlFor="hv-dates">
              <Icon name="Calendar" size={12} /> {t('home_search_dates')}
            </label>
            <input
              id="hv-dates"
              type="date"
              placeholder={t('home_search_ph_dates')}
              value={search.dates}
              onChange={(e) => setSearch({ ...search, dates: e.target.value })}
            />
          </div>
          <div className="hv-search__field">
            <label htmlFor="hv-travelers">
              <Icon name="Users" size={12} /> {t('home_search_travelers')}
            </label>
            <select
              id="hv-travelers"
              value={search.travelers}
              onChange={(e) => setSearch({ ...search, travelers: e.target.value })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n > 1 ? t('people') : t('person')}
                </option>
              ))}
            </select>
          </div>
          <div className={`hv-search__field ${openSuggest === 'activity' ? 'is-open' : ''}`}>
            <label htmlFor="hv-act">
              <Icon name="Mountain" size={12} /> {t('home_search_activities')}
            </label>
            <input
              id="hv-act"
              type="text"
              autoComplete="off"
              placeholder={t('home_search_ph_act')}
              value={search.activity}
              onChange={(e) => {
                setSearch({ ...search, activity: e.target.value });
                setOpenSuggest('activity');
              }}
              onFocus={() => setOpenSuggest('activity')}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpenSuggest(null);
              }}
            />
            {openSuggest === 'activity' && actSuggestions.length > 0 && (
              <ul className="hv-suggest" role="listbox">
                {actSuggestions.map((s) => (
                  <li key={`${s.type}-${s.id}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => pickSuggestion('activity', s)}
                    >
                      {s.image && <img src={s.image} alt="" />}
                      <span>
                        <strong>{pick(s.label, s.label_en, s.label_ar)}</strong>
                        <small>{pick(s.hint, s.hint_en, s.hint_ar)}</small>
                      </span>
                      <Icon name="ArrowRight" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="hv-search__btn">
            <Icon name="Search" size={16} />
            {t('home_search_btn')}
          </button>
        </form>
      </div>

      <section className="hv-coup" aria-labelledby="hv-coup-title" data-reveal>
        <div className="hv-container">
          <div className="hv-coup__stage">
            <Link to={HOME_COUP_TAGHIT.link} className="hv-coup__banner">
              <span className="hv-coup__tag" aria-hidden>
                <svg viewBox="0 0 72 72" className="hv-coup__tag-svg">
                  <path
                    className="hv-coup__tag-shape"
                    d="M12 28 L36 8 L60 28 L52 58 L20 58 Z"
                  />
                  <circle cx="36" cy="22" r="3.5" className="hv-coup__tag-hole" />
                </svg>
                <span className="hv-coup__tag-label">{t('home_v2_coup_badge')}</span>
              </span>

              <div className="hv-coup__banner-copy">
                <p className="hv-coup__eyebrow">{t('home_v2_coup_eyebrow')}</p>
                <h2 id="hv-coup-title" className="hv-coup__title">
                  {t('home_v2_coup_headline')}
                </h2>
                <p className="hv-coup__text">{t('home_v2_coup_text')}</p>
              </div>

              <div className="hv-coup__banner-media">
                <img
                  src={HOME_COUP_TAGHIT.image}
                  alt={t('home_v2_coup_place')}
                  onError={(e) => {
                    e.currentTarget.src = HOME_COUP_TAGHIT.fallback;
                  }}
                />
              </div>
            </Link>

            <div className="hv-coup__formulas" aria-label={t('home_v2_coup_meta_label')}>
              {HOME_COUP_TAGHIT.packages.map((pkg) => (
                <article key={pkg.id} className={`hv-coup__formula hv-coup__formula--${pkg.id}`}>
                  <div className="hv-coup__formula-top">
                    <span className="hv-coup__formula-icon">
                      <Icon name={pkg.icon} size={20} strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3>{t(pkg.titleKey)}</h3>
                      <p>{t(pkg.transportKey)}</p>
                    </div>
                  </div>

                  <ul className="hv-coup__formula-list">
                    {pkg.includes.map((key) => (
                      <li key={key}>
                        <Icon name="Check" size={15} strokeWidth={2.25} />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.extraKey && (
                    <p className="hv-coup__formula-extra">{t(pkg.extraKey)}</p>
                  )}

                  <div className="hv-coup__formula-foot">
                    <div className="hv-coup__formula-price">
                      <strong>
                        {pkg.price.toLocaleString('fr-DZ')}
                        <span> {t('home_v2_coup_price_unit')}</span>
                      </strong>
                      <em>{t('home_v2_coup_per_person')}</em>
                    </div>
                    <Link
                      to={pkg.ctaPath || `${HOME_COUP_TAGHIT.link}?pkg=${pkg.id}`}
                      className="hv-coup__formula-cta"
                    >
                      {t('home_v2_coup_cta')}
                      <Icon name="ArrowRight" size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hv-trust" aria-label="Avantages">
        <div className="hv-trust__grid">
          {TRUST.map((item, i) => {
            const content = (
              <>
                <div className="hv-trust__icon">
                  {item.href ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
                      <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.514 0-10 4.486-10 10 0 1.767.461 3.488 1.334 5.002L2 22l5.115-1.314c1.486.804 3.157 1.229 4.891 1.229 5.514 0 10-4.486 10-10 0-2.677-1.041-5.185-2.929-7.073zm-7.071 15.299c-1.519 0-3.005-.413-4.274-1.188l-.306-.181-3.036.779.81-2.959-.199-.317c-.859-1.363-1.313-2.926-1.313-4.535 0-4.597 3.741-8.338 8.338-8.338 2.226 0 4.319.867 5.891 2.439 1.572 1.572 2.439 3.665 2.439 5.891.001 4.597-3.74 8.338-8.35 8.338zm4.573-6.247c-.251-.125-1.485-.734-1.715-.817-.23-.084-.397-.125-.565.125-.167.25-.645.817-.791.985-.146.168-.293.188-.543.063-.25-.125-1.056-.39-2.012-1.242-.744-.66-1.246-1.476-1.392-1.726-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438s.167-.25.25-.417c.084-.167.042-.312-.021-.438-.062-.125-.564-1.361-.773-1.864-.203-.488-.411-.422-.565-.43-.146-.008-.312-.01-.479-.01s-.438.063-.668.313c-.229.25-.875.854-.875 2.083 0 1.229.896 2.416 1.021 2.583.125.167 1.761 2.688 4.266 3.77.596.256 1.062.41 1.426.525.599.191 1.145.163 1.576.099.481-.073 1.485-.607 1.694-1.193.209-.586.209-1.089.146-1.193-.062-.104-.229-.167-.479-.292z" />
                    </svg>
                  ) : (
                    <Icon name={item.icon} size={24} strokeWidth={1.5} />
                  )}
                </div>
                <strong>{t(item.title)}</strong>
                <span>{t(item.desc)}</span>
              </>
            );

            return item.href ? (
              <a
                key={item.title}
                className="hv-trust__item hv-trust__item--link"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                data-reveal
                data-delay={i * 70}
              >
                {content}
              </a>
            ) : (
              <div
                key={item.title}
                className="hv-trust__item"
                data-reveal
                data-delay={i * 70}
              >
                {content}
              </div>
            );
          })}
        </div>
      </section>

      <section className="hv-dest" id="destinations">
        <div className="hv-container">
          <div className="hv-section-head" data-reveal>
            <div>
              <span className="hv-eyebrow">{t('home_v2_dest_eyebrow')}</span>
              <h2>{t('home_v2_dest_title')}</h2>
            </div>
            <Link to="/destinations" className="hv-link">
              {t('home_v2_dest_all')} <Icon name="ArrowRight" size={16} />
            </Link>
          </div>

          <div className="hv-carousel">
            <div className="hv-carousel__track" ref={destRef}>
              {HOME_DESTINATIONS.map((d, i) => (
                <article
                  key={d.id}
                  className="hv-dest-card"
                  data-reveal
                  data-delay={i * 60}
                  onClick={() => navigate(d.link)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(d.link);
                    }
                  }}
                >
                  <img src={d.image} alt="" loading="lazy" />
                  <div className="hv-dest-card__body">
                    <h3>{pick(d.name, d.name_en, d.name_ar)}</h3>
                    <p>{pick(d.tagline, d.tagline_en, d.tagline_ar)}</p>
                    <div className="hv-dest-card__meta">
                      <span>
                        <Icon name="Star" size={12} /> {d.rating}
                      </span>
                      <span>
                        <Icon name="Sun" size={12} /> {d.temp}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="hv-carousel__next"
              onClick={() => scrollTrack(destRef, 1)}
              aria-label="Suivant"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="hv-circuits" id="tours" data-reveal="fade">
        <div className="hv-circuits__bg">
          <img src={HOME_CIRCUITS_BANNER.image} alt="" />
        </div>
        <div className="hv-circuits__panel" data-reveal="right" data-delay="120">
          <span className="hv-eyebrow">{t('home_v2_circ_eyebrow')}</span>
          <h2>{t('home_v2_circ_title')}</h2>
          <p>{t('home_v2_circ_text')}</p>
          <button
            type="button"
            className="hv-circuits__btn"
            onClick={() => navigate('/tours')}
          >
            {t('home_v2_circ_cta')} <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </section>

      <section className="hv-dest hv-circuits-list" id="circuits">
        <div className="hv-container">
          <div className="hv-section-head" data-reveal>
            <div>
              <span className="hv-eyebrow">{t('home_tours_badge')}</span>
              <h2>
                {t('home_tours_title')} <em>{t('home_tours_title_em')}</em>
              </h2>
            </div>
            <Link to="/tours" className="hv-link">
              {t('home_v2_circ_cta')} <Icon name="ArrowRight" size={16} />
            </Link>
          </div>

          <div className="hv-carousel">
            <div className="hv-carousel__track" ref={toursRef}>
              {FEATURED_TOURS.map((tour, i) => (
                <article
                  key={tour.id}
                  className="hv-dest-card"
                  data-reveal
                  data-delay={i * 60}
                  onClick={() => navigate(getPlacePathFromTour(tour))}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(getPlacePathFromTour(tour));
                    }
                  }}
                >
                  <img src={tour.image} alt="" loading="lazy" />
                  <div className="hv-dest-card__body">
                    <h3>{pick(tour.name, tour.name_en, tour.name_ar)}</h3>
                    <p>{pick(tour.subtitle, tour.subtitle_en, tour.subtitle_ar)}</p>
                    <div className="hv-dest-card__meta">
                      <span>
                        <Icon name="Star" size={12} /> {tour.rating}
                      </span>
                      <span>
                        <Icon name="Clock" size={12} />{' '}
                        {pick(tour.duration, tour.duration_en, tour.duration_ar)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="hv-carousel__next"
              onClick={() => scrollTrack(toursRef, 1)}
              aria-label="Suivant"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="hv-stats">
        <div className="hv-stats__grid">
          {STATS.map((s, i) => (
            <div key={s.key} data-reveal data-delay={i * 80}>
              <strong>{s.value}</strong>
              <span>{t(s.key)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="hv-acc" id="guesthouses">
        <div className="hv-container">
          <div className="hv-section-head hv-section-head--center" data-reveal>
            <div>
              <span className="hv-eyebrow">{t('home_v2_acc_eyebrow')}</span>
              <h2>{t('home_v2_acc_title')}</h2>
            </div>
          </div>

          <div className="hv-carousel">
            <div className="hv-carousel__track hv-acc__track" ref={accRef}>
              {HOME_ACCOMMODATIONS.map((acc, i) => (
                <article
                  key={acc.key}
                  className="hv-acc-card"
                  data-reveal
                  data-delay={i * 70}
                  onClick={() => navigate(acc.link || '/stays')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(acc.link || '/stays');
                    }
                  }}
                  role="link"
                  tabIndex={0}
                >
                  <img src={acc.image} alt="" loading="lazy" />
                  <div className="hv-acc-card__body">
                    <h3>{pick(acc.fr, acc.en, acc.ar)}</h3>
                    <span>
                      {pick(acc.cta.fr, acc.cta.en, acc.cta.ar)}{' '}
                      <Icon name="ArrowRight" size={14} />
                    </span>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="hv-carousel__next"
              onClick={() => scrollTrack(accRef, 1)}
              aria-label="Suivant"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="hv-news" id="blog">
        <div className="hv-container">
          <div className="hv-news__card" data-reveal="zoom">
            <div className="hv-news__visual">
              <img src="/images/home/news-coast.jpg" alt="" />
            </div>
            <div className="hv-news__body">
              <h2>{t('home_v2_news_title')}</h2>
              <p>{t('home_v2_news_text')}</p>
              <form className="hv-news__form" onSubmit={handleNews}>
                <input
                  type="email"
                  placeholder={t('footer_email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" aria-label={t('footer_subscribe')}>
                  <Icon name="ArrowRight" size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeLanding;
