import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../hooks/useLangHook';
import { POPULAR_DESTINATIONS } from '../../data/destinations';
import Icon from '../ui/Icon';
import './Sections.css';

const DestinationsSection = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { t, pick } = useLang();

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <section className="premium-section" id="destinations">
      <div className="premium-container">
        <div className="premium-header premium-header--center" data-reveal>
          <span className="premium-badge">{t('home_dest_badge')}</span>
          <h2 className="premium-title">{t('home_dest_title')} <em>{t('home_dest_title_em')}</em></h2>
          <p className="premium-subtitle">{t('home_dest_subtitle')}</p>
        </div>

        <div className="section-scroll-wrap">
          <button className="section-scroll-btn" onClick={() => scroll(-1)} aria-label="Previous">
            <Icon name="ChevronLeft" size={20} />
          </button>
          <div className="dest-cards" ref={scrollRef}>
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <article
                key={dest.id}
                className="dest-card premium-card"
                data-reveal
                style={{ transitionDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/destination/${dest.id}`)}
              >
                <div className="dest-card__img-wrap">
                  <img src={dest.image} alt={pick(dest.name, dest.name_en, dest.name_ar)} loading="lazy" />
                  <span className="premium-rating"><Icon name="Star" size={12} />{dest.rating}</span>
                  <span className="dest-card__duration">{pick(dest.duration, dest.duration_en, dest.duration_ar)}</span>
                </div>
                <div className="dest-card__body">
                  <span className="dest-card__region">{pick(dest.region, dest.region_en, dest.region_ar)}</span>
                  <h3>{pick(dest.name, dest.name_en, dest.name_ar)}</h3>
                  <p>{pick(dest.desc, dest.desc_en, dest.desc_ar)}</p>
                  <div className="dest-card__meta">
                    <span><Icon name="Calendar" size={14} /> {pick(dest.season, dest.season_en, dest.season_ar)}</span>
                    <span className="dest-card__price">{dest.price.toLocaleString()} DA</span>
                  </div>
                  <button className="premium-btn premium-btn--ghost dest-card__btn">
                    {t('home_discover')} <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <button className="section-scroll-btn" onClick={() => scroll(1)} aria-label="Next">
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
