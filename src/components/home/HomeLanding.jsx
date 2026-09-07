import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../hooks/useLangHook';
import Icon from '../ui/Icon';
import ResponsiveImage from '../ui/ResponsiveImage';
import {
  HOME_CIRCUITS_BANNER,
  HOME_COUP_TAGHIT,
  HOME_DESTINATIONS,
  HOME_HERO,
  HOME_SHOWCASE_CARDS,
  HOME_SPOT_DESTINATIONS,
} from '../../data/homePage';
import { FEATURED_TOURS } from '../../data/tours';
import { getPlacePathFromTour } from '../../data/placeRoutes';
import {
  resolveSearchNavigation,
  suggestActivities,
  suggestDestinations,
} from '../../data/search';
import { api } from '../../services/api';
import './HomeLanding.css';

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
  const showcaseRef = useRef(null);
  const [search, setSearch] = useState({
    destination: '',
    dates: '',
    travelers: '2',
    activity: '',
  });
  const [openSuggest, setOpenSuggest] = useState(null); // 'destination' | 'activity' | null
  const [proposal, setProposal] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: '',
  });
  const [proposalGdpr, setProposalGdpr] = useState(false);
  const [proposalSending, setProposalSending] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const [proposalError, setProposalError] = useState('');
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

  const handleProposalChange = (e) => {
    const { name, value } = e.target;
    setProposal((prev) => ({ ...prev, [name]: value }));
  };

  const handleProposal = async (e) => {
    e.preventDefault();
    if (!proposalGdpr) {
      setProposalError(t('booking_gdpr_required'));
      return;
    }

    setProposalSending(true);
    setProposalError('');

    try {
      await api.sendContact({
        ...proposal,
        subject: 'proposition',
        gdpr_consent: true,
      });
      setProposalSent(true);
      setProposal({ name: '', email: '', phone: '', message: '', website: '' });
      setProposalGdpr(false);
    } catch (err) {
      setProposalError(err.message || 'Une erreur est survenue.');
    } finally {
      setProposalSending(false);
    }
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

      <section className="hv-spots" aria-label={t('home_spots_label')}>
        <div className="hv-container">
          <div className="hv-spots__track">
            {HOME_SPOT_DESTINATIONS.map((spot) => (
              <Link key={spot.id} to={spot.link} className="hv-spot">
                <span className="hv-spot__img">
                  <img
                    src={spot.image}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      if (spot.fallback) e.currentTarget.src = spot.fallback;
                    }}
                  />
                </span>
                <span className="hv-spot__name">{pick(spot.name, spot.name_en, spot.name_ar)}</span>
              </Link>
            ))}
            <Link to="/destinations" className="hv-spot hv-spot--more" aria-label={t('home_spots_more')}>
              <span className="hv-spot__img hv-spot__img--more">
                <Icon name="ArrowRight" size={20} strokeWidth={2} />
              </span>
              <span className="hv-spot__name">{t('home_spots_more')}</span>
            </Link>
          </div>
        </div>
      </section>

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

      <section className="hv-showcase" id="hotels" aria-label={t('home_showcase_label')}>
        <div className="hv-container">
          <div className="hv-showcase__carousel">
            <div className="hv-showcase__track" ref={showcaseRef}>
              {HOME_SHOWCASE_CARDS.map((card) => (
                <Link
                  key={card.key}
                  to={card.link}
                  className={`hv-showcase-card${card.featured ? ' hv-showcase-card--featured' : ''}`}
                  data-reveal
                >
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      if (card.fallback) e.currentTarget.src = card.fallback;
                    }}
                  />
                  <div className="hv-showcase-card__overlay" aria-hidden />
                  {card.badgeKey && (
                    <span className="hv-showcase-card__badge">
                      <Icon name="Star" size={11} strokeWidth={0} fill="currentColor" />
                      {t(card.badgeKey)}
                    </span>
                  )}
                  <div className="hv-showcase-card__body">
                    <h3>{pick(card.fr, card.en, card.ar)}</h3>
                    <p>{t(card.descKey)}</p>
                    <span className="hv-showcase-card__cta">
                      {t(card.ctaKey)}
                      <Icon name="ArrowRight" size={15} strokeWidth={2.25} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <button
              type="button"
              className="hv-showcase__nav"
              onClick={() => scrollTrack(showcaseRef, 1)}
              aria-label={t('carousel_next')}
            >
              <Icon name="ChevronRight" size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      <section className="hv-showcase-trust" aria-label={t('home_showcase_trust_label')}>
        <div className="hv-showcase-trust__grid">
          {[
            { icon: 'Tag', titleKey: 'home_showcase_trust_prices' },
            { icon: 'CalendarCheck', titleKey: 'home_showcase_trust_realtime' },
            { icon: 'ShieldCheck', titleKey: 'home_showcase_trust_secure' },
            { icon: 'Headphones', titleKey: 'home_showcase_trust_support' },
          ].map((item) => (
            <div key={item.titleKey} className="hv-showcase-trust__item">
              <span className="hv-showcase-trust__icon">
                <Icon name={item.icon} size={20} strokeWidth={1.75} />
              </span>
              <span>{t(item.titleKey)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="hv-news" id="blog">
        <div className="hv-container">
          <div className="hv-news__card" data-reveal="zoom">
            <div className="hv-news__visual">
              <img src="/images/home/algeria.webp" alt="" />
            </div>
            <div className="hv-news__body">
              <h2>{t('home_v2_news_title')}</h2>
              <p>{t('home_v2_news_text')}</p>

              {proposalSent ? (
                <div className="hv-news__success" role="status">
                  <Icon name="Check" size={22} />
                  <p>{t('contact_success')}</p>
                  <button type="button" onClick={() => setProposalSent(false)}>
                    {t('home_v2_proposal_again')}
                  </button>
                </div>
              ) : (
                <form className="hv-news__form" onSubmit={handleProposal}>
                  <input
                    type="text"
                    name="website"
                    value={proposal.website}
                    onChange={handleProposalChange}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hv-news__honeypot"
                  />
                  <div className="hv-news__fields">
                    <input
                      type="text"
                      name="name"
                      placeholder={t('contact_placeholder_name')}
                      value={proposal.name}
                      onChange={handleProposalChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder={t('contact_placeholder_email')}
                      value={proposal.email}
                      onChange={handleProposalChange}
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder={t('contact_placeholder_phone')}
                      value={proposal.phone}
                      onChange={handleProposalChange}
                      required
                    />
                    <textarea
                      name="message"
                      rows={3}
                      placeholder={t('home_v2_proposal_placeholder')}
                      value={proposal.message}
                      onChange={handleProposalChange}
                      required
                    />
                  </div>
                  <label className="hv-news__gdpr">
                    <input
                      type="checkbox"
                      checked={proposalGdpr}
                      onChange={(e) => setProposalGdpr(e.target.checked)}
                      required
                    />
                    <span>
                      {t('booking_gdpr_prefix')}{' '}
                      <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                        {t('footer_privacy')}
                      </Link>
                      .
                    </span>
                  </label>
                  {proposalError ? (
                    <p className="hv-news__error" role="alert">
                      {proposalError}
                    </p>
                  ) : null}
                  <button type="submit" className="hv-news__submit" disabled={proposalSending}>
                    {proposalSending ? t('contact_sending') : t('home_v2_proposal_submit')}
                    <Icon name="Send" size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeLanding;
