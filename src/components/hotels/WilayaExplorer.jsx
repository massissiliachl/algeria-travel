import React, { useRef } from 'react';
import Icon from '../ui/Icon';
import { WILAYAS } from '../../data/wilayas';
import { WILAYA_IMAGES, WILAYA_FALLBACK_IMAGE } from '../../data/hotelFilters';

const WilayaExplorer = ({ counts, activeWilaya, onSelect, t, pick }) => {
  const trackRef = useRef(null);
  const sorted = [...WILAYAS]
    .filter((w) => (counts[w.key] || 0) > 0)
    .sort((a, b) => (counts[b.key] || 0) - (counts[a.key] || 0));

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  return (
    <section className="htl-explore">
      <div className="htl-container">
        <div className="htl-explore__head">
          <h2>{t('hotels_explore_wilaya')}</h2>
          <div className="htl-explore__actions">
            <button type="button" className="htl-link htl-link--arrow" onClick={() => onSelect('all')}>
              {t('hotels_see_all_wilayas')}
              <Icon name="ArrowRight" size={14} />
            </button>
            <div className="htl-explore__nav">
              <button type="button" aria-label="Précédent" onClick={() => scroll(-1)}>
                <Icon name="ChevronLeft" size={18} />
              </button>
              <button type="button" aria-label="Suivant" onClick={() => scroll(1)}>
                <Icon name="ChevronRight" size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="htl-explore__track" ref={trackRef}>
          {sorted.map((w) => {
            const label = pick(w.fr, w.en, w.ar);
            const count = counts[w.key] || 0;
            const img = WILAYA_IMAGES[w.key] || WILAYA_FALLBACK_IMAGE;
            const isActive = activeWilaya === w.key;
            return (
              <button
                key={w.key}
                type="button"
                className={`htl-explore-card${isActive ? ' is-active' : ''}`}
                onClick={() => onSelect(w.key)}
              >
                <img src={img} alt="" loading="lazy" />
                <div className="htl-explore-card__body">
                  <strong>{label}</strong>
                  <span>
                    {count} {t('hotels_count')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WilayaExplorer;
