import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import SeoHead from '../components/SeoHead';
import { useLang } from '../hooks/useLangHook';
import { useFavorites } from '../hooks/useFavorites';
import { HOTELS } from '../data/hotels';
import { getPlacePathFromTour } from '../data/placeRoutes';
import { useContentCatalog } from '../hooks/useContentCatalog';
import './Favorites.css';

function resolveFavoriteItem(item, pick, catalog) {
  const { activities, tours } = catalog;
  if (item.itemType === 'hotel') {
    const hotel = HOTELS.find((h) => h.id === item.itemId);
    if (!hotel) return null;
    return {
      key: `hotel-${hotel.id}`,
      title: pick(hotel.name, hotel.name_en, hotel.name_ar),
      subtitle: pick(hotel.location, hotel.location_en, hotel.location_ar),
      image: hotel.image,
      price: hotel.price,
      link: `/hotels/${hotel.id}`,
      type: 'hotel',
      id: hotel.id,
    };
  }

  if (item.itemType === 'activity') {
    const activity = activities.find((a) => a.id === item.itemId);
    if (!activity) {
      return {
        key: `activity-${item.itemId}`,
        title: item.itemId,
        subtitle: '',
        image: '/images/quad.jpg',
        price: null,
        link: `/activities`,
        type: 'activity',
        id: item.itemId,
      };
    }
    return {
      key: `activity-${activity.id}`,
      title: pick(activity.name, activity.name_en, activity.name_ar),
      subtitle: pick(activity.location, activity.location_en, activity.location_ar),
      image: activity.images?.[0] || activity.image,
      price: activity.price,
      link: `/activity/${activity.id}`,
      type: 'activity',
      id: activity.id,
    };
  }

  if (item.itemType === 'tour') {
    const tour = tours.find((t) => String(t.id) === String(item.itemId));
    if (!tour) return null;
    return {
      key: `tour-${tour.id}`,
      title: pick(tour.name, tour.name_en, tour.name_ar),
      subtitle: pick(tour.location, tour.location_en, tour.location_ar),
      image: tour.image,
      price: tour.price,
      link: getPlacePathFromTour(tour),
      type: 'tour',
      id: tour.id,
    };
  }

  return null;
}

export default function Favorites() {
  const { t, pick } = useLang();
  const { items, ready, toggleFavorite, isFavorite } = useFavorites();
  const catalog = useContentCatalog();

  const resolved = useMemo(
    () => items.map((item) => resolveFavoriteItem(item, pick, catalog)).filter(Boolean),
    [items, pick, catalog]
  );

  return (
    <div className="fav-page">
      <SeoHead
        title={t('favorites_page_title')}
        description={t('favorites_page_desc')}
        path="/favorites"
        noindex
      />
      <Navbar />

      <section className="fav-hero">
        <div className="fav-hero__inner">
          <span className="fav-hero__eyebrow">
            <Icon name="Heart" size={14} />
            {t('favorites_eyebrow')}
          </span>
          <h1>{t('favorites_page_title')}</h1>
          <p>{t('favorites_page_desc')}</p>
        </div>
      </section>

      <section className="fav-body">
        <div className="fav-body__inner">
          {!ready ? (
            <p className="fav-empty">{t('loader_text')}</p>
          ) : resolved.length === 0 ? (
            <div className="fav-empty">
              <Icon name="Heart" size={40} strokeWidth={1.5} />
              <h2>{t('favorites_empty_title')}</h2>
              <p>{t('favorites_empty_desc')}</p>
              <div className="fav-empty__links">
                <Link to="/hotels">{t('hotels_nav')}</Link>
                <Link to="/activities">{t('nav_activities')}</Link>
                <Link to="/tours">{t('nav_tours')}</Link>
              </div>
            </div>
          ) : (
            <div className="fav-grid">
              {resolved.map((entry) => (
                <article key={entry.key} className="fav-card">
                  <Link to={entry.link} className="fav-card__media">
                    <ResponsiveImage src={entry.image} alt="" />
                  </Link>
                  <div className="fav-card__body">
                    <span className="fav-card__type">{t(`favorites_type_${entry.type}`)}</span>
                    <Link to={entry.link} className="fav-card__title">
                      {entry.title}
                    </Link>
                    {entry.subtitle ? <p className="fav-card__sub">{entry.subtitle}</p> : null}
                    {entry.price != null ? (
                      <p className="fav-card__price">
                        {entry.price.toLocaleString()} DA
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className={`fav-card__fav${isFavorite(entry.type, entry.id) ? ' is-on' : ''}`}
                    aria-label={t('favorites_remove')}
                    onClick={() => toggleFavorite(entry.type, entry.id)}
                  >
                    <Icon
                      name="Heart"
                      size={18}
                      strokeWidth={2}
                      fill={isFavorite(entry.type, entry.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
