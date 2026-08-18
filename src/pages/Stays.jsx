import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import MobileBookingBar from '../components/ui/MobileBookingBar';
import BottomSheet from '../components/ui/BottomSheet';
import ImageLightbox from '../components/ui/ImageLightbox';
import { useLang } from '../hooks/useLangHook';
import {
  STAY_PLACE_FILTERS,
  STAY_TYPES,
  filterStays,
} from '../data/stays';
import SeoHead from '../components/SeoHead';
import './Activities.css';
import './Stays.css';

const Stays = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, pick } = useLang();

  const typeFromPath =
    location.pathname.includes('guesthouse')
      ? 'guesthouse'
      : location.pathname.includes('hotel')
        ? 'hotel'
        : null;

  const typeParam = searchParams.get('type') || typeFromPath || 'all';
  const placeParam = searchParams.get('place') || 'all';

  const type =
    typeParam === 'hotels'
      ? 'hotel'
      : typeParam === 'guesthouses'
        ? 'guesthouse'
        : typeParam === 'hotel' || typeParam === 'guesthouse' || typeParam === 'all'
          ? typeParam
          : 'all';
  const place = STAY_PLACE_FILTERS.some((p) => p.key === placeParam)
    ? placeParam
    : 'all';

  const [selectedId, setSelectedId] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type, place]);

  const filtered = useMemo(
    () => filterStays({ type, place }),
    [type, place]
  );

  const selected = filtered.find((s) => s.id === selectedId) || null;

  const setType = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key === 'all') next.delete('type');
    else next.set('type', key === 'hotel' ? 'hotels' : key === 'guesthouse' ? 'guesthouses' : key);
    setSearchParams(next);
    setSelectedId(null);
  };

  const setPlace = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key === 'all') next.delete('place');
    else next.set('place', key);
    setSearchParams(next);
    setSelectedId(null);
  };

  const whatsapp = (stay) => {
    const name = pick(stay.name, stay.name_en, stay.name_ar);
    const msg = encodeURIComponent(
      `Bonjour, je souhaite réserver : ${name} (${pick(stay.location, stay.location_en, stay.location_ar)})`
    );
    window.open(`https://wa.me/213557664089?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const heroTitle =
    type === 'hotel'
      ? t('stays_hero_hotels')
      : type === 'guesthouse'
        ? t('stays_hero_guesthouses')
        : t('stays_hero_all');

  const heroSrc =
    type === 'guesthouse'
      ? '/images/maison-hote-sud-1.png'
      : '/images/home/acc-hotel.jpg';

  return (
    <div className={`acts-page stays-page${selected ? ' has-mobile-bar' : ''}`}>
      <SeoHead
        title={t('seo_stays_title')}
        description={t('seo_stays_desc')}
        path="/stays"
        image={heroSrc}
      />
      <Navbar />

      <section className="acts-hero">
        <ResponsiveImage
          className="acts-hero__bg"
          src={heroSrc}
          alt=""
          priority
          sizes="100vw"
        />
        <div className="acts-hero__overlay" />
        <div className="acts-hero__inner" data-reveal="fade">
          <nav className="acts-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <span>{t('stays_nav')}</span>
          </nav>
          <h1 className="acts-hero__title">
            {heroTitle}
            <em> {t('stays_hero_em')}</em>
          </h1>
          <p className="acts-hero__subtitle">{t('stays_hero_subtitle')}</p>
        </div>
      </section>

      <div className="acts-filters-wrap filter-pills-wrap is-scrollable" data-reveal>
        <div className="acts-filters filter-pills" role="tablist" aria-label={t('stays_type_label')}>
          {STAY_TYPES.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={type === f.key}
              className={`acts-filters__btn ${type === f.key ? 'is-active' : ''}`}
              onClick={() => setType(f.key)}
            >
              <Icon name={f.icon} size={18} strokeWidth={1.75} />
              <span>{pick(f.fr, f.en, f.ar)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stays-places acts-container" data-reveal>
        <p className="stays-places__label">{t('stays_place_label')}</p>
        <div className="filter-pills-wrap is-scrollable">
          <div className="stays-places__list filter-pills" role="tablist">
            {STAY_PLACE_FILTERS.map((p) => (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={place === p.key}
                className={`stays-places__btn ${place === p.key ? 'is-active' : ''}`}
                onClick={() => setPlace(p.key)}
              >
                {pick(p.fr, p.en, p.ar)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="acts-grid-section" id="stays-grid">
        <div className="acts-container">
          <p className="stays-count" data-reveal>
            {filtered.length} {t('stays_count')}
          </p>

          {filtered.length === 0 ? (
            <p className="stays-empty" data-reveal>
              {t('stays_empty')}
            </p>
          ) : (
            <div className="acts-grid">
              {filtered.map((stay, i) => (
                <article
                  key={stay.id}
                  className={`acts-card stays-card ${
                    selectedId === stay.id ? 'is-open' : ''
                  }`}
                  data-reveal
                  data-delay={i * 50}
                  onClick={() =>
                    setSelectedId((id) => (id === stay.id ? null : stay.id))
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId((id) => (id === stay.id ? null : stay.id));
                    }
                  }}
                >
                  <img src={stay.image} alt="" loading="lazy" />
                  <div className="acts-card__body">
                    <span className="stays-card__type">
                      {stay.type === 'hotel'
                        ? t('stays_type_hotel')
                        : t('stays_type_guesthouse')}
                    </span>
                    <h3>{pick(stay.name, stay.name_en, stay.name_ar)}</h3>
                    <p className="acts-card__tags">
                      <Icon name="MapPin" size={13} />{' '}
                      {pick(stay.location, stay.location_en, stay.location_ar)}
                    </p>
                    <div className="acts-card__meta">
                      <span>
                        <Icon name="Star" size={13} /> {stay.rating}
                        {stay.reviews ? ` · ${stay.reviews}` : ''}
                      </span>
                      <span className="acts-card__price">
                        {stay.pricePerPerson
                          ? `${stay.price.toLocaleString()} DA ${t('per_person')}`
                          : `${t('acts_from')} ${stay.price.toLocaleString()} DA`}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <BottomSheet
        open={!!selected}
        onClose={() => setSelectedId(null)}
        ariaLabel={selected ? pick(selected.name, selected.name_en, selected.name_ar) : undefined}
        panelClassName="stays-detail__panel"
        className="stays-detail bottom-sheet"
      >
        {selected && (
          <>
            <div className="stays-detail__media">
              <img src={selected.image} alt="" />
            </div>
            <div className="stays-detail__body">
              <span className="stays-card__type">
                {selected.type === 'hotel'
                  ? t('stays_type_hotel')
                  : t('stays_type_guesthouse')}
              </span>
              <h2>{pick(selected.name, selected.name_en, selected.name_ar)}</h2>
              <p className="stays-detail__loc">
                <Icon name="MapPin" size={16} />{' '}
                {pick(
                  selected.location,
                  selected.location_en,
                  selected.location_ar
                )}
              </p>
              <p className="stays-detail__desc">
                {pick(selected.desc, selected.desc_en, selected.desc_ar)}
              </p>
              <div className="stays-detail__meta">
                <span>
                  <Icon name="Star" size={14} /> {selected.rating}
                  {selected.reviews ? ` · ${selected.reviews} ${t('place_reviews')}` : ''}
                </span>
                <strong>
                  {selected.pricePerPerson
                    ? `${selected.price.toLocaleString()} DA ${t('per_person')}`
                    : `${t('acts_from')} ${selected.price.toLocaleString()} DA`}
                </strong>
              </div>
              <h3>{t('stays_amenities')}</h3>
              <ul className="stays-detail__amenities">
                {(
                  pick(
                    selected.amenities.fr,
                    selected.amenities.en,
                    selected.amenities.ar
                  ) || []
                ).map((a) => (
                  <li key={a}>
                    <Icon name="Check" size={14} /> {a}
                  </li>
                ))}
              </ul>
              {selected.gallery?.length > 1 && (
                <>
                  <h3>{t('stays_gallery')}</h3>
                  <div className="stays-detail__gallery clickable-gallery">
                    {selected.gallery.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`${t('stays_gallery')} ${i + 1}`}
                      >
                        <img src={src} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="stays-detail__actions stays-detail__actions--desktop">
                <button
                  type="button"
                  className="premium-btn premium-btn--primary"
                  onClick={() => whatsapp(selected)}
                >
                  <Icon name="MessageCircle" size={16} /> {t('stays_book_wa')}
                </button>
                <button
                  type="button"
                  className="premium-btn premium-btn--ghost"
                  onClick={() => navigate('/contact')}
                >
                  {t('stays_contact')}
                </button>
              </div>
            </div>
          </>
        )}
      </BottomSheet>

      {selected && (
        <MobileBookingBar
          priceLabel={selected.pricePerPerson ? t('home_v2_coup_per_person') : t('acts_from')}
          price={`${selected.price.toLocaleString()} DA`}
          ctaLabel={t('stays_book_wa')}
          ctaIcon="MessageCircle"
          onCta={() => whatsapp(selected)}
          className="stays-mobile-bar"
        />
      )}

      {selected?.gallery && lightboxIndex != null && (
        <ImageLightbox
          images={selected.gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Stays;
