import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import { POPULAR_DESTINATIONS } from '../../data/hotelDestinations';

export default function PopularDestinations({ activeWilaya, onSelect, t, pick }) {
  return (
    <section className="htl-dest">
      <div className="htl-container">
        <div className="htl-section-head">
          <h2>{t('hotels_popular_destinations')}</h2>
          <Link to="/destinations" className="htl-link htl-link--arrow">
            {t('hotels_see_all')}
            <Icon name="ArrowRight" size={14} />
          </Link>
        </div>
        <div className="htl-dest__grid">
          {POPULAR_DESTINATIONS.map((dest) => {
            const label = pick(dest.fr, dest.en, dest.ar);
            const isActive = activeWilaya === dest.wilayaKey;
            return (
              <button
                key={dest.key}
                type="button"
                className={`htl-dest-card${isActive ? ' is-active' : ''}`}
                onClick={() => onSelect(dest.wilayaKey)}
              >
                <img src={dest.image} alt="" loading="lazy" />
                <div className="htl-dest-card__overlay">
                  <strong>{label}</strong>
                  <span>
                    {t('acts_from')} {dest.priceFrom.toLocaleString()} DA
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
