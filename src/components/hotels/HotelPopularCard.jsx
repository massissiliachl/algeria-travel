import React from 'react';
import Icon from '../ui/Icon';
import { getRatingLabel } from '../../utils/hotelRating';

export default function HotelPopularCard({
  hotel,
  pick,
  t,
  isFavorite,
  onToggleFavorite,
  onOpen,
  nights = 0,
}) {
  const name = pick(hotel.name, hotel.name_en, hotel.name_ar);
  const location = pick(hotel.location, hotel.location_en, hotel.location_ar);
  const stayTotal = nights > 0 ? (hotel.price || 0) * nights : null;
  const displayPrice = stayTotal ?? hotel.price;

  return (
    <article
      className="htl-pop-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      <div className="htl-pop-card__media">
        <img src={hotel.image} alt={name} loading="lazy" />
        <button
          type="button"
          className={`htl-pop-card__fav${isFavorite ? ' is-on' : ''}`}
          aria-label="Favori"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(hotel.id);
          }}
        >
          <Icon name="Heart" size={16} strokeWidth={2} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="htl-pop-card__body">
        <h3>{name}</h3>
        <p className="htl-pop-card__loc">
          <Icon name="MapPin" size={14} />
          {location}
        </p>
        <div className="htl-pop-card__rating">
          <span className="htl-pop-card__stars">
            {Array.from({ length: hotel.stars || 0 }, (_, i) => (
              <Icon key={i} name="Star" size={12} className="htl-star-on" />
            ))}
          </span>
          <strong>{hotel.rating?.toFixed(1)}</strong>
          <span>{getRatingLabel(hotel.rating, t)}</span>
        </div>
      </div>

      <div className="htl-pop-card__price">
        <small>{stayTotal ? t('hotels_total_stay') : t('acts_from')}</small>
        <strong>{displayPrice?.toLocaleString()} DA</strong>
        {!stayTotal && <span>{t('hotels_per_night')}</span>}
      </div>
    </article>
  );
}
