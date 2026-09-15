import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { useFavorites } from '../hooks/useFavorites';
import { useContentCatalog } from '../hooks/useContentCatalog';
import { api } from '../services/api';
import { normalizeTour } from '../utils/normalizeContent';
import { getTourDestinationPath } from '../data/placeRoutes';
import { resolveMediaUrl } from '../utils/mediaUrl';
import SeoHead from '../components/SeoHead';
import BookingSheet from '../components/booking/BookingSheet';
import './ActivityDetail.css';

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, pick } = useLang();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getTour, tours } = useContentCatalog();
  const [tour, setTour] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const found = getTour(id);
    if (found) {
      setTour(found);
      window.scrollTo(0, 0);
      return undefined;
    }

    api
      .getTour(id)
      .then((row) => {
        if (cancelled) return;
        const normalized = normalizeTour(row);
        if (!normalized) {
          navigate('/tours', { replace: true });
          return;
        }
        setTour(normalized);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        if (!cancelled) navigate('/tours', { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [id, navigate, getTour]);

  if (!tour) {
    return (
      <>
        <Navbar />
        <div className="act-page-loading">{t('loader_text') || '…'}</div>
        <Footer />
      </>
    );
  }

  const destinationPath = getTourDestinationPath(tour);
  const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
  const highlights = Array.isArray(tour.activities) ? tour.activities : [];
  const seoTitle = pick(tour.name, tour.name_en, tour.name_ar);
  const seoDesc =
    pick(tour.fullDescription, tour.fullDescription_en, tour.fullDescription_ar) ||
    pick(tour.description, tour.description_en, tour.description_ar);
  const tourIsFavorite = isFavorite('tour', tour.id);
  const others = tours.filter((item) => String(item.id) !== String(tour.id)).slice(0, 3);

  return (
    <div className="act-page">
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        path={`/tours/${tour.id}`}
        image={resolveMediaUrl(tour.image)}
      />
      <Navbar />

      <section className="act-page-hero">
        <img src={resolveMediaUrl(tour.image)} alt="" className="act-page-hero__bg" />
        <div className="act-page-hero__overlay" />
        <div className="act-page-hero__content" data-reveal="fade">
          <Link to="/tours" className="act-page-back">
            <Icon name="ChevronLeft" size={18} /> {t('nav_tours')}
          </Link>
          <h1>{pick(tour.name, tour.name_en, tour.name_ar)}</h1>
          <p>{pick(tour.subtitle, tour.subtitle_en, tour.subtitle_ar)}</p>
          <div className="act-page-hero__meta">
            {tour.rating != null && (
              <span>
                <Icon name="Star" size={14} /> {tour.rating}
              </span>
            )}
            <span>
              <Icon name="MapPin" size={14} />{' '}
              {pick(tour.location, tour.location_en, tour.location_ar)}
            </span>
            <span>
              <Icon name="Clock" size={14} />{' '}
              {pick(tour.duration, tour.duration_en, tour.duration_ar)}
            </span>
          </div>
        </div>
      </section>

      <div className="act-page-body">
        <div className="act-page-main" data-reveal="left">
          <div className="act-page-panel">
            <h2>{t('tours_feat_itinerary')}</h2>
            <p>
              {pick(tour.fullDescription, tour.fullDescription_en, tour.fullDescription_ar) ||
                pick(tour.description, tour.description_en, tour.description_ar)}
            </p>

            {highlights.length > 0 && (
              <>
                <h3>{t('act_page_experience')}</h3>
                <ul className="act-page-included">
                  {highlights.map((item, i) => (
                    <li key={item.label || i}>
                      <Icon name={item.icon || 'Check'} size={16} />{' '}
                      {pick(item.label, item.label_en, item.label_ar)}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {itinerary.length > 0 && (
              <>
                <h3>{t('tours_feat_itinerary_desc')}</h3>
                <ul className="act-page-included">
                  {itinerary.map((step) => (
                    <li key={step.day || step.title}>
                      <Icon name="Calendar" size={16} />{' '}
                      <strong>Jour {step.day}</strong>{' '}
                      — {pick(step.title, step.title_en, step.title_ar)} ·{' '}
                      {pick(step.desc, step.desc_en, step.desc_ar)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {others.length > 0 && (
            <div className="act-page-related">
              <h2 data-reveal>{t('home_tours_title')}</h2>
              <div className="act-page-related__grid">
                {others.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    className="act-page-related__card"
                    data-reveal
                    data-delay={i * 60}
                    onClick={() => navigate(`/tours/${item.id}`)}
                  >
                    <img src={resolveMediaUrl(item.image)} alt="" />
                    <span>{pick(item.name, item.name_en, item.name_ar)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="act-page-aside" data-reveal="right">
          <div className="act-page-book">
            <div className="act-page-book__price">
              <span>{t('act_modal_from')}</span>
              <strong>
                {tour.price != null ? (
                  <>
                    {Number(tour.price).toLocaleString('fr-DZ')} <small>DA</small>
                  </>
                ) : (
                  '—'
                )}
              </strong>
              <em>{pick(tour.bestTime, tour.bestTime_en, tour.bestTime_ar)}</em>
            </div>
            <button
              type="button"
              className={`act-page-book__fav${tourIsFavorite ? ' is-on' : ''}`}
              onClick={() => toggleFavorite('tour', tour.id)}
              aria-label={tourIsFavorite ? t('favorites_remove') : t('favorites_add')}
            >
              <Icon
                name="Heart"
                size={18}
                strokeWidth={2}
                fill={tourIsFavorite ? 'currentColor' : 'none'}
              />
            </button>
            <button type="button" className="act-page-book__btn" onClick={() => setBookingOpen(true)}>
              {t('tours_promo_cta')}
            </button>
            {destinationPath && (
              <Link to={destinationPath} className="act-page-book__link">
                {t('nav_destinations')} →
              </Link>
            )}
          </div>
        </aside>
      </div>

      <BookingSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        itemType="tour"
        itemId={String(tour.id)}
        title={pick(tour.name, tour.name_en, tour.name_ar)}
        unitPrice={tour.price ?? 0}
        pricePerPerson
      />

      <Footer />
    </div>
  );
};

export default TourDetail;
