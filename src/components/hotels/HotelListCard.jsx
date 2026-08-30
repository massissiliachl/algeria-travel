import React from 'react';
import Icon from '../ui/Icon';
import { AMENITY_FILTERS } from '../../data/hotelFilters';
import HotelScoreBadge from './HotelScoreBadge';
import { getRatingLabel } from '../../utils/hotelRating';

const AMENITY_ICON_MAP = {
  wifi: 'Globe',
  pool: 'Waves',
  spa: 'Sparkles',
  restaurant: 'UtensilsCrossed',
  parking: 'Car',
  ac: 'ThermometerSun',
};

function getAmenityIcons(amenities, lang) {
  const list = amenities?.[lang] || amenities?.fr || [];
  const icons = [];
  for (const a of AMENITY_FILTERS) {
    const found = list.some((item) => a.match.some((m) => item.toLowerCase().includes(m)));
    if (found) icons.push(a.key);
  }
  return icons.slice(0, 4);
}

const AVAIL_DOT = {
  available: 'is-ok',
  limited: 'is-warn',
  unavailable: 'is-off',
};

const HotelListCard = ({
  hotel,
  pick,
  t,
  lang,
  isFavorite,
  onToggleFavorite,
  onOpen,
  isPopular,
  nights = 0,
}) => {
  const name = pick(hotel.name, hotel.name_en, hotel.name_ar);
  const location = pick(hotel.location, hotel.location_en, hotel.location_ar);
  const desc = pick(hotel.desc, hotel.desc_en, hotel.desc_ar);
  const amenityLang = lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : 'fr';
  const amenityIcons = getAmenityIcons(hotel.amenities, amenityLang);
  const stayTotal = nights > 0 ? (hotel.price || 0) * nights : null;
  const discount =
    hotel.oldPrice && hotel.price
      ? Math.round(((hotel.oldPrice - hotel.price) / hotel.oldPrice) * 100)
      : null;

  return (
    <article
      className="htl-list-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      <div className="htl-list-card__media">
        <img src={hotel.image} alt={name} loading="lazy" />
        {isPopular && <span className="htl-list-card__badge">{t('hotels_card_popular')}</span>}
        {discount > 0 && <span className="htl-list-card__promo">-{discount}%</span>}
        <button
          type="button"
          className={`htl-list-card__fav${isFavorite ? ' is-on' : ''}`}
          aria-label="Favori"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(hotel.id);
          }}
        >
          <Icon name="Heart" size={18} strokeWidth={2} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="htl-list-card__body">
        <div className="htl-list-card__meta">
          {hotel.stars > 0 && (
            <span className="htl-list-card__category">
              {Array.from({ length: hotel.stars }, (_, i) => (
                <Icon key={i} name="Star" size={11} className="htl-star-on" />
              ))}
            </span>
          )}
          <span className={`htl-list-card__dot ${AVAIL_DOT[hotel.availability] || 'is-ok'}`} />
          <span className="htl-list-card__avail-text">
            {t(`hotels_avail_${hotel.availability}`)}
          </span>
        </div>

        <h3>{name}</h3>

        <p className="htl-list-card__loc">
          <Icon name="MapPin" size={14} />
          {location}
          <span className="htl-list-card__rating-label">{getRatingLabel(hotel.rating, t)}</span>
        </p>

        {amenityIcons.length > 0 && (
          <div className="htl-list-card__amenities">
            {amenityIcons.map((key) => (
              <span key={key}>
                <Icon name={AMENITY_ICON_MAP[key]} size={14} />
              </span>
            ))}
          </div>
        )}

        {desc && <p className="htl-list-card__desc">{desc}</p>}
      </div>

      <div className="htl-list-card__side">
        <HotelScoreBadge rating={hotel.rating} reviews={hotel.reviews} t={t} size="card" />

        <div className="htl-list-card__price">
          {stayTotal ? (
            <>
              <span className="htl-list-card__price-label">
                {nights} {nights > 1 ? t('hotels_nights') : t('hotels_night')}
              </span>
              <strong>{stayTotal.toLocaleString()} DA</strong>
              <small>
                {hotel.price?.toLocaleString()} DA / {t('hotels_per_night')}
              </small>
            </>
          ) : (
            <>
              <span className="htl-list-card__price-label">{t('acts_from')}</span>
              {hotel.oldPrice && (
                <s className="htl-list-card__old">{hotel.oldPrice.toLocaleString()} DA</s>
              )}
              <strong>{hotel.price?.toLocaleString()} DA</strong>
              <small>{t('hotels_per_night')}</small>
            </>
          )}
        </div>

        <button
          type="button"
          className="htl-btn htl-btn--gold htl-list-card__cta"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          {t('hotels_card_cta')}
        </button>
      </div>
    </article>
  );
};

export default HotelListCard;
