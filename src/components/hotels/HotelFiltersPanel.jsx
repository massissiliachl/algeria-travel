import React, { useState } from 'react';
import Icon from '../ui/Icon';
import { WILAYAS } from '../../data/wilayas';
import { AMENITY_FILTERS, PRICE_MAX, PRICE_MIN } from '../../data/hotelFilters';

const STAR_LEVELS = [5, 4, 3, 2, 1];
const AMENITY_VISIBLE = 4;

const HotelFiltersPanel = ({
  className = '',
  wilaya,
  priceRange,
  starFilters,
  amenityFilters,
  starCounts,
  onWilayaChange,
  onPriceChange,
  onStarToggle,
  onAmenityToggle,
  onReset,
  t,
  pick,
}) => {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const visibleAmenities = showAllAmenities ? AMENITY_FILTERS : AMENITY_FILTERS.slice(0, AMENITY_VISIBLE);

  return (
    <aside className={`htl-filters ${className}`.trim()}>
      <div className="htl-filters__head">
        <h3>
          <Icon name="Compass" size={16} />
          {t('hotels_filters')}
        </h3>
        <button type="button" className="htl-link" onClick={onReset}>
          {t('hotels_filters_reset')}
        </button>
      </div>

      <div className="htl-filters__block">
        <label className="htl-filters__label">{t('hotels_wilaya_label')}</label>
        <select
          className="htl-filters__select"
          value={wilaya}
          onChange={(e) => onWilayaChange(e.target.value)}
        >
          <option value="all">{t('hotels_wilaya_clear')}</option>
          {WILAYAS.map((w) => (
            <option key={w.key} value={w.key}>
              {w.code} — {pick(w.fr, w.en, w.ar)}
            </option>
          ))}
        </select>
      </div>

      <div className="htl-filters__block">
        <label className="htl-filters__label">{t('hotels_filter_price')}</label>
        <div className="htl-filters__range-values">
          <span>{priceRange[0].toLocaleString()} DA</span>
          <span>{priceRange[1].toLocaleString()} DA</span>
        </div>
        <input
          type="range"
          className="htl-filters__range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={500}
          value={priceRange[0]}
          onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
        />
        <input
          type="range"
          className="htl-filters__range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={500}
          value={priceRange[1]}
          onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
        />
      </div>

      <div className="htl-filters__block">
        <label className="htl-filters__label">{t('hotels_filter_category')}</label>
        <ul className="htl-filters__checks">
          {STAR_LEVELS.map((n) => (
            <li key={n}>
              <label className="htl-filters__check">
                <input
                  type="checkbox"
                  checked={starFilters.includes(n)}
                  onChange={() => onStarToggle(n)}
                />
                <span className="htl-filters__stars">
                  {Array.from({ length: n }, (_, i) => (
                    <Icon key={i} name="Star" size={13} className="htl-star-on" />
                  ))}
                </span>
                <span className="htl-filters__count">({starCounts[n] || 0})</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="htl-filters__block">
        <label className="htl-filters__label">{t('hotels_filter_amenities')}</label>
        <ul className="htl-filters__checks">
          {visibleAmenities.map((a) => (
            <li key={a.key}>
              <label className="htl-filters__check">
                <input
                  type="checkbox"
                  checked={amenityFilters.includes(a.key)}
                  onChange={() => onAmenityToggle(a.key)}
                />
                <span>{t(a.labelKey)}</span>
              </label>
            </li>
          ))}
        </ul>
        {AMENITY_FILTERS.length > AMENITY_VISIBLE && (
          <button
            type="button"
            className="htl-link htl-filters__more"
            onClick={() => setShowAllAmenities((v) => !v)}
          >
            {showAllAmenities ? t('hotels_show_less') : t('hotels_show_more')}
          </button>
        )}
      </div>
    </aside>
  );
};

export default HotelFiltersPanel;
