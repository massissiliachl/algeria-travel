import React from 'react';
import Icon from '../ui/Icon';

const ITEMS = [
  { icon: 'MapPin', titleKey: 'hotels_value_everywhere', tone: 'navy' },
  { icon: 'Tag', titleKey: 'hotels_value_prices', tone: 'teal' },
  { icon: 'Zap', titleKey: 'hotels_value_realtime', tone: 'teal' },
];

export default function HotelsValueBar({ t }) {
  return (
    <section className="htl-value-bar" aria-label={t('hotels_trust_title')}>
      <div className="htl-container htl-value-bar__inner">
        {ITEMS.map((item) => (
          <div key={item.titleKey} className="htl-value-bar__item">
            <span className={`htl-value-bar__icon htl-value-bar__icon--${item.tone}`}>
              <Icon name={item.icon} size={20} strokeWidth={2} />
            </span>
            <strong>{t(item.titleKey)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
