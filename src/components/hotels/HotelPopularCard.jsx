import React from 'react';
import Icon from '../ui/Icon';
import ResponsiveImage from '../ui/ResponsiveImage';
import HotelScoreBadge from './HotelScoreBadge';
import { getRatingLabel } from '../../utils/hotelRating';

const AVAIL_KEYS = {
  available: 'hotels_avail_available',
  limited: 'hotels_avail_limited',
  unavailable: 'hotels_avail_unavailable',
};

export default function HotelPopularCard({
  hotel,
  pick,
  t,
  lang = 'fr',
  isFavorite,
  onToggleFavorite,
  onOpen,
  nights = 0,
}) {
  const name = pick(hotel.name, hotel.name_en, hotel.name_ar);
  const location = pick(hotel.location, hotel.location_en, hotel.location_ar);
  const desc = pick(hotel.desc, hotel.desc_en, hotel.desc_ar);
  const amenities = hotel.amenities?.[lang] || hotel.amenities?.fr || [];
  const stayTotal = nights > 0 ? (hotel.price || 0) * nights : null;
  const displayPrice = stayTotal ?? hotel.price;
  const avail = hotel.availability || 'available';
  const availKey = AVAIL_KEYS[avail] || AVAIL_KEYS.available;
  const discount =
    hotel.oldPrice && hotel.price && hotel.oldPrice > hotel.price
      ? Math.round((1 - hotel.price / hotel.oldPrice) * 100)
      : null;

  return (
    <article
      className="htl-pop-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      <div className="htl-pop-card__media">
        <ResponsiveImage
          src={hotel.image}
          alt={name}
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 200px, 280px"
          onError={(e) => {
            e.currentTarget.src = '/images/hotels/hotel.avif';
          }}
        />
        {discount ? (
          <span className="htl-pop-card__promo">−{discount}%</span>
        ) : null}
        {(hotel.rating || 0) >= 4.5 ? (
          <span className="htl-pop-card__badge">{t('hotels_card_popular')}</span>
        ) : null}
        <button
          type="button"
          className={`htl-pop-card__fav${isFavorite ? ' is-on' : ''}`}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(hotel.id);
          }}
        >
          <Icon name="Heart" size={16} strokeWidth={2} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="htl-pop-card__body">
        <div className="htl-pop-card__head">
          <h3>{name}</h3>
          <span className={`htl-pop-card__avail htl-pop-card__avail--${avail}`}>
            {t(availKey)}
          </span>
        </div>

        <p className="htl-pop-card__loc">
          <Icon name="MapPin" size={14} />
          {location}
        </p>

        <div className="htl-pop-card__meta">
          <span className="htl-pop-card__stars">
            {Array.from({ length: hotel.stars || 0 }, (_, i) => (
              <Icon key={i} name="Star" size={12} className="htl-star-on" />
            ))}
          </span>
          <span className="htl-pop-card__rating-text">
            <strong>{hotel.rating?.toFixed(1)}</strong> · {getRatingLabel(hotel.rating, t)}
            {hotel.reviews ? ` · ${hotel.reviews} ${t('hotels_reviews')}` : ''}
          </span>
        </div>

        {desc ? <p className="htl-pop-card__desc">{desc}</p> : null}

        {amenities.length > 0 ? (
          <ul className="htl-pop-card__amenities">
            {amenities.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        <div className="htl-pop-card__score-mobile">
          <HotelScoreBadge rating={hotel.rating} reviews={hotel.reviews} t={t} size="sm" />
        </div>
      </div>

      <div className="htl-pop-card__side">
        <HotelScoreBadge rating={hotel.rating} reviews={hotel.reviews} t={t} size="card" />
        <div className="htl-pop-card__price">
          {hotel.oldPrice && !stayTotal ? (
            <s className="htl-pop-card__old">{hotel.oldPrice.toLocaleString()} DA</s>
          ) : null}
          <small>{stayTotal ? t('hotels_total_stay') : t('acts_from')}</small>
          <strong>{displayPrice?.toLocaleString()} DA</strong>
          {!stayTotal ? <span>{t('hotels_per_night')}</span> : null}
        </div>
        <button
          type="button"
          className="htl-btn htl-btn--gold htl-pop-card__cta"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          {t('hotels_card_cta')}
          <Icon name="ArrowRight" size={16} />
        </button>
      </div>
    </article>
  );
}
