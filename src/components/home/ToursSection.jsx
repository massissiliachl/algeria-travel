import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../hooks/useLangHook';
import { FEATURED_TOURS } from '../../data/tours';
import Icon from '../ui/Icon';
import './Sections.css';

const TOUR_FILTERS = [
  { fr: '3 jours', en: '3 days', ar: '3 أيام' },
  { fr: '5 jours', en: '5 days', ar: '5 أيام' },
  { fr: '7 jours', en: '7 days', ar: '7 أيام' },
  { fr: '10 jours', en: '10 days', ar: '10 أيام' },
  { fr: 'Privé', en: 'Private', ar: 'خاص' },
  { fr: 'Luxe', en: 'Luxury', ar: 'فاخر' },
  { fr: 'Famille', en: 'Family', ar: 'عائلي' },
  { fr: 'Aventure', en: 'Adventure', ar: 'مغامرة' },
];

const ToursSection = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { t, pick } = useLang();

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <section className="premium-section premium-section--sand" id="tours">
      <div className="premium-container">
        <div className="premium-header premium-header--center" data-reveal>
          <span className="premium-badge">{t('home_tours_badge')}</span>
          <h2 className="premium-title">{t('home_tours_title')} <em>{t('home_tours_title_em')}</em></h2>
          <p className="premium-subtitle">{t('home_tours_subtitle')}</p>
        </div>

        <div className="tour-filters" data-reveal>
          {TOUR_FILTERS.map((f) => (
            <button key={f.fr} type="button" className="tour-filter">{pick(f.fr, f.en, f.ar)}</button>
          ))}
        </div>

        <div className="section-scroll-wrap">
          <button className="section-scroll-btn" onClick={() => scroll(-1)} type="button">
            <Icon name="ChevronLeft" size={20} />
          </button>
          <div className="tour-cards" ref={scrollRef}>
            {FEATURED_TOURS.map((tour) => (
              <article key={tour.id} className="tour-card premium-card" onClick={() => navigate(`/destination/${tour.id}`)}>
                <div className="tour-card__img">
                  <img src={tour.image} alt={tour.name} loading="lazy" />
                  <span className="premium-rating"><Icon name="Star" size={12} />{tour.rating}</span>
                  <span className="tour-card__duration">{pick(tour.duration, tour.duration_en, tour.duration_ar)}</span>
                </div>
                <div className="tour-card__body">
                  <span className="tour-card__location">{pick(tour.location, tour.location_en, tour.location_ar)}</span>
                  <h3>{pick(tour.name, tour.name_en, tour.name_ar)}</h3>
                  <p>{pick(tour.subtitle, tour.subtitle_en, tour.subtitle_ar)}</p>
                  <div className="tour-card__footer">
                    <div className="tour-card__price">{tour.price.toLocaleString()} <span>DA</span></div>
                    <button className="premium-btn premium-btn--primary" type="button" onClick={(e) => { e.stopPropagation(); navigate(`/destination/${tour.id}`); }}>
                      {t('btn_reserver')}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button className="section-scroll-btn" onClick={() => scroll(1)} type="button">
            <Icon name="ChevronRight" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ToursSection;
