import React from 'react';
import Icon from './Icon';

const MobileBookingBar = ({
  priceLabel,
  price,
  ctaLabel,
  onCta,
  ctaIcon = 'ArrowRight',
  className = '',
  ariaLabel,
}) => (
  <div
    className={`mobile-booking-bar ${className}`.trim()}
    aria-label={ariaLabel || ctaLabel}
  >
    <div className="mobile-booking-bar__price">
      {priceLabel && <span>{priceLabel}</span>}
      <strong>{price}</strong>
    </div>
    <button type="button" className="mobile-booking-bar__btn" onClick={onCta}>
      {ctaLabel}
      {ctaIcon && <Icon name={ctaIcon} size={16} />}
    </button>
  </div>
);

export default MobileBookingBar;
