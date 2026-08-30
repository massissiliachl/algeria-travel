import React from 'react';
import Icon from '../ui/Icon';

const FEATURES = [
  { icon: 'BadgeCheck', titleKey: 'hotels_feat_selected', descKey: 'hotels_feat_selected_desc' },
  { icon: 'MapPin', titleKey: 'hotels_feat_wilaya', descKey: 'hotels_feat_wilaya_desc' },
  { icon: 'Tag', titleKey: 'hotels_feat_price', descKey: 'hotels_feat_price_desc' },
  { icon: 'CalendarCheck', titleKey: 'hotels_feat_avail', descKey: 'hotels_feat_avail_desc' },
];

const HotelsTrustSection = ({ t }) => (
  <section className="htl-trust">
    <div className="htl-container">
      <h2 className="htl-trust__title">{t('hotels_trust_title')}</h2>
      <div className="htl-trust__grid">
        {FEATURES.map((f) => (
          <article key={f.titleKey} className="htl-trust__card">
            <span className="htl-trust__icon">
              <Icon name={f.icon} size={22} />
            </span>
            <h3>{t(f.titleKey)}</h3>
            <p>{t(f.descKey)}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default HotelsTrustSection;
