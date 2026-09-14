import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import MobileBookingBar from '../components/ui/MobileBookingBar';
import ImageLightbox from '../components/ui/ImageLightbox';
import BookingSheet from '../components/booking/BookingSheet';
import { useLang } from '../hooks/useLangHook';
import { getPlaceById, PLACES } from '../data/places';
import { TAGHIT_BOOKING_WINDOW } from '../data/taghitPackages';
import { api } from '../services/api';
import { ACTIVITY_CATEGORIES, getActivitiesForPlace } from '../data/activities';
import SeoHead from '../components/SeoHead';
import './Activities.css';
import './PlaceDetail.css';

const TRUST_ITEMS = [
  { icon: 'CreditCard', key: 'place_trust_pay' },
  { icon: 'Zap', key: 'place_trust_confirm' },
  { icon: 'Headphones', key: 'place_trust_support' },
];

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, pick } = useLang();
  const pkgParam = searchParams.get('pkg');
  // Taghit destination page always resolves to hotel package
  const place = getPlaceById(id, id === 'taghit' ? 'hotel' : pkgParam);
  const placeActivities = place ? getActivitiesForPlace(place.id) : [];

  const [bookingOpen, setBookingOpen] = useState(false);
  const [canBook, setCanBook] = useState(Boolean(place?.bookingOpen));
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!place?.id) return undefined;
    setCanBook(Boolean(place.bookingOpen));
    let cancelled = false;
    api
      .getPlace(place.id)
      .then((data) => {
        if (!cancelled) setCanBook(Boolean(data.bookingOpen));
      })
      .catch(() => {
        if (!cancelled) setCanBook(Boolean(place.bookingOpen));
      });
    return () => {
      cancelled = true;
    };
  }, [place?.id, place?.bookingOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!place) {
      navigate('/destinations', { replace: true });
      return undefined;
    }
    if (id === 'taghit' && searchParams.get('pkg') === 'guesthouse') {
      navigate('/guesthouses', { replace: true });
      return undefined;
    }
    // Taghit destination = toujours formule hôtel
    if (id === 'taghit' && searchParams.get('pkg') && searchParams.get('pkg') !== 'hotel') {
      navigate('/place/taghit?pkg=hotel', { replace: true });
      return undefined;
    }
    const raf = window.requestAnimationFrame(() => {
      document
        .querySelectorAll('.place-page [data-reveal]')
        .forEach((el) => el.classList.add('is-in', 'revealed'));
    });
    return () => window.cancelAnimationFrame(raf);
  }, [place, navigate, id, searchParams]);

  useEffect(() => {
    document.body.style.overflow = bookingOpen || lightboxIndex != null ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [bookingOpen, lightboxIndex]);

  if (!place) return null;

  const isPerPerson = place.id === 'taghit' || place.pricePerPerson;
  const priceLabel = isPerPerson ? t('home_v2_coup_per_person') : t('acts_from');
  const placeName = pick(place.name, place.name_en, place.name_ar);
  const seoTitle = pick(place.seoTitle, place.seoTitle_en, place.seoTitle_ar) || placeName;
  const seoDescription =
    pick(place.seoDescription, place.seoDescription_en, place.seoDescription_ar)
    || pick(place.description, place.description_en, place.description_ar);
  const whyItems = place.whyVisit?.length ? place.whyVisit : place.highlights || [];
  const gallery = place.gallery?.length ? place.gallery : [place.image];
  const region = pick(
    place.region || `${placeName}, Algérie`,
    place.region_en || `${placeName}, Algeria`,
    place.region_ar || `${placeName}، الجزائر`
  );
  const weather = pick(
    place.weather || 'Ensoleillé',
    place.weather_en || 'Sunny',
    place.weather_ar || 'مشمس'
  );
  const idealFor = pick(
    place.idealFor || 'Détente & Découverte',
    place.idealFor_en || 'Relaxation & Discovery',
    place.idealFor_ar || 'استرخاء واكتشاف'
  );
  const duration = pick(
    place.recommendedDuration || place.duration,
    place.recommendedDuration_en || place.duration_en,
    place.recommendedDuration_ar || place.duration_ar
  );
  const difficulty = pick(
    place.difficulty || 'Facile à modérée',
    place.difficulty_en || 'Easy to moderate',
    place.difficulty_ar || 'سهل إلى متوسط'
  );
  const audience = pick(
    place.audience || 'En couple, famille, amis',
    place.audience_en || 'Couples, families, friends',
    place.audience_ar || 'أزواج، عائلات، أصدقاء'
  );

  const quickFacts = [
    { icon: 'MapPin', label: t('place_fact_location'), value: region },
    { icon: 'Clock', label: t('place_fact_duration'), value: duration },
    { icon: 'Activity', label: t('place_fact_difficulty'), value: difficulty },
    { icon: 'Users', label: t('place_fact_travelers'), value: audience },
  ];

  const similar = PLACES.filter((p) => p.id !== place.id).slice(0, 3);
  const stayField = id === 'taghit' ? 'hotel-only' : 'full';
  const defaultStay = id === 'taghit' ? 'hotel' : '';

  return (
    <div className="acts-page place-page has-mobile-bar">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        path={`/place/${place.id}`}
        image={place.image}
      />
      <Navbar />

      <section className="place-hero">
        <ResponsiveImage
          className="place-hero__bg"
          src={place.image}
          alt=""
          priority
          sizes="100vw"
        />
        <div className="place-hero__overlay" />
        <div className="place-hero__inner" data-reveal="fade">
          <Link to="/destinations" className="place-back">
            <Icon name="ChevronLeft" size={18} /> {t('nav_destinations')}
          </Link>
          <p className="place-hero__tag">
            {pick(place.tagline, place.tagline_en, place.tagline_ar)}
          </p>
          <h1>{placeName}</h1>
          <div className="place-hero__meta">
            <span>
              <Icon name="Star" size={14} /> {place.rating} · {place.reviews}{' '}
              {t('place_reviews')}
            </span>
            <span>
              <Icon name="Sun" size={14} /> {place.temp} · {weather}
            </span>
            <span>
              <Icon name="Users" size={14} /> {idealFor}
            </span>
          </div>
        </div>
      </section>

      <section className="place-main acts-container">
        <div className="place-layout">
          <div className="place-layout__content">
        <div className="place-why" data-reveal>
          <div className="place-why__copy">
            <h2>
              {t('place_why')} <em>{placeName}</em> ?
            </h2>
            <p>
              {pick(place.description, place.description_en, place.description_ar)}
            </p>
            <ul className="place-why__list">
              {whyItems.map((item, i) => (
                <li key={item.fr || i} data-reveal data-delay={i * 60}>
                  <span className="place-why__icon" aria-hidden="true">
                    <Icon name={item.icon || 'Check'} size={18} strokeWidth={1.5} />
                  </span>
                  <span>{pick(item.fr, item.en, item.ar)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="place-why__gallery">
            <button
              type="button"
              className="place-why__shot place-why__shot--main"
              onClick={() => setLightboxIndex(0)}
              aria-label={t('place_gallery_see')}
            >
              <img src={gallery[0]} alt="" loading="lazy" />
              <span className="place-why__gallery-btn">
                {t('place_gallery_see')} ({gallery.length})
              </span>
            </button>
            {gallery[1] && (
              <button
                type="button"
                className="place-why__shot"
                onClick={() => setLightboxIndex(1)}
              >
                <img src={gallery[1]} alt="" loading="lazy" />
              </button>
            )}
            {gallery[2] && (
              <button
                type="button"
                className="place-why__shot"
                onClick={() => setLightboxIndex(2)}
              >
                <img src={gallery[2]} alt="" loading="lazy" />
              </button>
            )}
          </div>
        </div>

        <div className="place-quick" data-reveal>
          {quickFacts.map((fact) => (
            <article key={fact.label} className="place-quick__item">
              <Icon name={fact.icon} size={20} />
              <div>
                <strong>{fact.label}</strong>
                <span>{fact.value}</span>
              </div>
              <Icon name="ChevronRight" size={16} className="place-quick__chevron" />
            </article>
          ))}
        </div>

        {place.includes?.length > 0 && (
          <div className="place-includes-block" data-reveal>
            <div className="place-includes-block__head">
              {place.pkgTitle && (
                <span className="place-includes-block__badge">
                  <Icon name={place.pkgIcon || 'Hotel'} size={14} />
                  {pick(place.pkgTitle, place.pkgTitle_en, place.pkgTitle_ar)}
                </span>
              )}
              <h2>{t('place_includes')}</h2>
            </div>
            <ul className="place-includes">
              {place.includes.map((item) => (
                <li key={item.fr}>
                  <Icon name="Check" size={16} />
                  {pick(item.fr, item.en, item.ar)}
                </li>
              ))}
            </ul>
            {(place.stay || place.transport) && (
              <div className="place-includes-meta">
                {place.stay && (
                  <p>
                    <Icon name="Hotel" size={16} />
                    {pick(place.stay, place.stay_en, place.stay_ar)}
                  </p>
                )}
                {place.transport && (
                  <p>
                    <Icon name="Plane" size={16} />
                    {pick(place.transport, place.transport_en, place.transport_ar)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {placeActivities.length > 0 && (
          <div className="place-activities-block" data-reveal>
            <h2>{t('place_activities')}</h2>
            <p className="place-activities__lead">{t('place_activities_lead')}</p>
            <div className="place-activities">
              {placeActivities.map((act, i) => {
                const cat = ACTIVITY_CATEGORIES[act.category];
                return (
                  <button
                    key={act.id}
                    type="button"
                    className="place-act-card"
                    data-reveal
                    data-delay={i * 60}
                    onClick={() => navigate(`/activity/${act.id}`)}
                  >
                    <div className="place-act-card__media">
                      <img src={act.image} alt="" loading="lazy" />
                      {cat && (
                        <span className="place-act-card__badge">
                          {pick(cat.fr, cat.en, cat.ar)}
                        </span>
                      )}
                    </div>
                    <div className="place-act-card__body">
                      <h3>{pick(act.name, act.name_en, act.name_ar)}</h3>
                      <p>{pick(act.desc, act.desc_en, act.desc_ar)}</p>
                      <div className="place-act-card__meta">
                        <span>
                          <Icon name="Clock" size={13} />{' '}
                          {pick(
                            act.durationShort,
                            act.durationShort_en,
                            act.durationShort_ar
                          )}
                        </span>
                        <span className="place-act-card__price">
                          {act.price.toLocaleString()} DA
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <aside className="place-help" data-reveal>
          <span className="place-help__icon" aria-hidden="true">
            <Icon name="Headphones" size={22} />
          </span>
          <div className="place-help__text">
            <strong>{t('place_help_title')}</strong>
            <p>{t('place_help_text')}</p>
          </div>
          <Link to="/contact" className="place-help__cta">
            {t('place_help_cta')} <Icon name="ArrowRight" size={16} />
          </Link>
        </aside>

        <div className="place-similar">
          <h2 data-reveal>{t('place_similar')}</h2>
          <div className="place-similar__grid">
            {similar.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="place-similar__card"
                data-reveal
                data-delay={i * 60}
                onClick={() => navigate(`/place/${p.id}`)}
              >
                <img src={p.image} alt="" />
                <div>
                  <strong>{pick(p.name, p.name_en, p.name_ar)}</strong>
                  <span>{pick(p.tagline, p.tagline_en, p.tagline_ar)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
          </div>

          <aside className="place-aside" data-reveal="right">
            <div className="place-book">
              {place.pkgTitle && (
                <p className="place-book__pkg">
                  <Icon name={place.pkgIcon || 'Hotel'} size={15} />
                  {pick(place.pkgTitle, place.pkgTitle_en, place.pkgTitle_ar)}
                </p>
              )}
              <div className="place-book__price">
                <span>{priceLabel}</span>
                <strong>
                  {place.price.toLocaleString()} <small>DA</small>
                </strong>
                {isPerPerson && <em>{t('per_person')}</em>}
                {place.oldPrice && (
                  <s>{place.oldPrice.toLocaleString()} DA</s>
                )}
              </div>
              <div className="place-book__period">
                <Icon name="Calendar" size={16} />
                <div>
                  <span>{t('place_dates')}</span>
                  <strong>
                    {pick(place.bestTime, place.bestTime_en, place.bestTime_ar)}
                  </strong>
                </div>
              </div>
              {!canBook && (
                <div className="place-book__closed" role="status">
                  <Icon name="AlertCircle" size={18} />
                  <div>
                    <strong>{t('place_booking_closed')}</strong>
                    <span>{t('place_booking_closed_hint')}</span>
                  </div>
                </div>
              )}
              <button
                type="button"
                className="place-book__cta"
                onClick={() => setBookingOpen(true)}
                disabled={!canBook}
              >
                {canBook ? t('place_book') : t('place_booking_closed')}{' '}
                {canBook && <Icon name="ArrowRight" size={16} />}
              </button>
              <ul className="place-book__trust">
                {TRUST_ITEMS.map((item) => (
                  <li key={item.key}>
                    <Icon name={item.icon} size={14} />
                    {t(item.key)}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="place-book__link">
                {t('place_help_cta')} <Icon name="ArrowRight" size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <MobileBookingBar
        priceLabel={priceLabel}
        price={`${place.price.toLocaleString()} DA`}
        ctaLabel={canBook ? t('btn_reserver') : t('place_booking_closed')}
        onCta={() => canBook && setBookingOpen(true)}
        disabled={!canBook}
        className="place-mobile-bar"
        ariaLabel={canBook ? t('place_book') : t('place_booking_closed')}
      />

      {lightboxIndex != null && (
        <ImageLightbox
          images={gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <BookingSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        itemType="place"
        itemId={place.id}
        itemName={placeName}
        unitPrice={place.price}
        pricePerPerson={isPerPerson}
        stayField={stayField}
        defaultStay={defaultStay}
        titleEm={placeName}
        dateMin={id === 'taghit' ? TAGHIT_BOOKING_WINDOW.start : ''}
        dateMax={id === 'taghit' ? TAGHIT_BOOKING_WINDOW.end : ''}
        fixedDateWindow={id === 'taghit'}
      />

      <Footer />
    </div>
  );
};

export default PlaceDetail;
