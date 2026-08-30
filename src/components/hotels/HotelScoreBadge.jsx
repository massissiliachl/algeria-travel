import React from 'react';
import { getRatingLabel } from '../../utils/hotelRating';

const HotelScoreBadge = ({ rating, reviews, t, size = 'md', showLabel = true }) => {
  const label = getRatingLabel(rating, t);
  const display = Number(rating).toFixed(1);

  if (size === 'card') {
    return (
      <div className="htl-score htl-score--card">
        <div className="htl-score__box" aria-label={`${display} / 5`}>
          {display}
        </div>
        <div className="htl-score__text">
          <strong>{label}</strong>
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
    <div className={`htl-score htl-score--${size}`}>
      {showLabel && (
        <div className="htl-score__text">
          <strong>{label}</strong>
          {reviews != null && (
            <span>
              {reviews} {t('hotels_reviews')}
            </span>
          )}
        </div>
      )}
      <div className="htl-score__box" aria-label={`${display} / 5`}>
        {display}
      </div>
    </div>
  );
};

export default HotelScoreBadge;
