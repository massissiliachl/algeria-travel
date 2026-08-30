import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

export default function HotelsOffersBanner({ t }) {
  return (
    <section className="htl-offers">
      <div className="htl-container">
        <div className="htl-offers__inner">
          <div className="htl-offers__icon" aria-hidden="true">
            <Icon name="BadgePercent" size={28} strokeWidth={2} />
          </div>
          <div className="htl-offers__copy">
            <h2>{t('hotels_offers_title')}</h2>
            <p>{t('hotels_offers_desc')}</p>
          </div>
          <Link to="/tours" className="htl-btn htl-btn--primary htl-offers__cta">
            {t('hotels_offers_cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
