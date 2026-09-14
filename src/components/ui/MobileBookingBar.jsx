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
  disabled = false,
}) => (
  <div
    className={`mobile-booking-bar ${disabled ? 'is-disabled' : ''} ${className}`.trim()}
    aria-label={ariaLabel || ctaLabel}
  >
    <div className="mobile-booking-bar__price">
      {priceLabel && <span>{priceLabel}</span>}
      <strong>{price}</strong>
    </div>
    <button
      type="button"
      className="mobile-booking-bar__btn"
      onClick={onCta}
      disabled={disabled}
    >
      {ctaLabel}
      {ctaIcon && !disabled && <Icon name={ctaIcon} size={16} />}
    </button>
  </div>
);

export default MobileBookingBar;
