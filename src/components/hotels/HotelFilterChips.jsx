import React from 'react';
import Icon from '../ui/Icon';
import { AMENITY_FILTERS, PRICE_MAX, PRICE_MIN } from '../../data/hotelFilters';

const HotelFilterChips = ({
  wilaya,
  wilayaLabel,
  priceRange,
  starFilters,
  amenityFilters,
  checkIn,
  checkOut,
  nights,
  t,
  onClearWilaya,
  onClearStars,
  onClearAmenity,
  onClearPrice,
  onClearDates,
  onResetAll,
}) => {
  const chips = [];

  if (wilaya !== 'all' && wilayaLabel) {
    chips.push({ key: 'wilaya', label: wilayaLabel, onRemove: onClearWilaya });
  }
  if (starFilters.length) {
    starFilters.forEach((s) => {
      chips.push({
        key: `star-${s}`,
        label: `${s} ★`,
        onRemove: () => onClearStars(s),
      });
    });
  }
  amenityFilters.forEach((key) => {
    const amenity = AMENITY_FILTERS.find((a) => a.key === key);
    chips.push({
      key: `amenity-${key}`,
      label: t(amenity?.labelKey || key),
      onRemove: () => onClearAmenity(key),
    });
  });
  if (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) {
    chips.push({
      key: 'price',
      label: `${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()} DA`,
      onRemove: onClearPrice,
    });
  }
  if (checkIn && checkOut && nights > 0) {
    chips.push({
      key: 'dates',
      label: `${nights} ${nights > 1 ? t('hotels_nights') : t('hotels_night')}`,
      onRemove: onClearDates,
    });
  }

  if (!chips.length) return null;

  return (
    <div className="htl-chips">
      {chips.map((chip) => (
        <button key={chip.key} type="button" className="htl-chips__item" onClick={chip.onRemove}>
          {chip.label}
          <Icon name="X" size={14} />
        </button>
      ))}
      <button type="button" className="htl-chips__reset" onClick={onResetAll}>
        {t('hotels_filters_reset')}
      </button>
    </div>
  );
};

export default HotelFilterChips;
