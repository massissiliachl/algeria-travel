import React from 'react';
import Icon from '../ui/Icon';
import { getRatingLabel } from '../../utils/hotelRating';

export default function HotelReviewsSummary({ rating, reviews, bars, t, variant = 'full' }) {
  const label = getRatingLabel(rating, t);
  const display = Number(rating).toFixed(1);
  const filledStars = Math.min(5, Math.max(0, Math.round(Number(rating))));

  if (variant === 'inline') {
    return (
      <div className="htl-reviews htl-reviews--inline">
        <p className="htl-reviews__score" aria-label={`${display} / 5`}>
          {display}
        </p>
        <div className="htl-reviews__meta">
          <strong>{label}</strong>
          <div className="htl-reviews__stars" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <Icon
                key={i}
                name="Star"
                size={13}
                strokeWidth={1.5}
                className={i < filledStars ? 'htl-reviews__star-on' : 'htl-reviews__star-off'}
                fill={i < filledStars ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          {reviews != null && (
            <span>
              {reviews} {t('hotels_reviews')}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="htl-reviews">
      <div className="htl-reviews__summary">
        <p className="htl-reviews__score" aria-label={`${display} / 5`}>
          {display}
        </p>
        <div className="htl-reviews__meta">
          <strong>{label}</strong>
          <div className="htl-reviews__stars" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <Icon
                key={i}
                name="Star"
                size={15}
                strokeWidth={1.5}
                className={i < filledStars ? 'htl-reviews__star-on' : 'htl-reviews__star-off'}
                fill={i < filledStars ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          {reviews != null && (
            <span>
              {reviews} {t('hotels_reviews')}
            </span>
          )}
        </div>
      </div>

      <ul className="htl-reviews__dist">
        {bars.map(({ star, pct }) => (
          <li key={star}>
            <span className="htl-reviews__label">
              {star}
              <Icon name="Star" size={11} strokeWidth={2} />
            </span>
            <div className="htl-reviews__track">
              <div className="htl-reviews__fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="htl-reviews__pct">{pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
