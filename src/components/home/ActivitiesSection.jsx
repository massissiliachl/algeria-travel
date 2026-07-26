import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../hooks/useLangHook';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../../data/activities';
import Icon from '../ui/Icon';
import './ActivitiesSection.css';

const ActivitiesSection = () => {
  const trackRef = useRef(null);
  const navigate = useNavigate();
  const { t, pick } = useLang();

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(320, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section className="act-section" id="activities">
      <div className="act-section__inner">
        <div className="act-section__header">
          <span className="premium-badge">{t('home_act_badge')}</span>
          <h2 className="premium-title">
            {t('home_act_title')} <em>{t('home_act_title_em')}</em>
          </h2>
          <p className="premium-subtitle">{t('home_act_subtitle')}</p>
          <button
            type="button"
            className="act-section__all"
            onClick={() => navigate('/activities')}
          >
            {t('home_act_see_all')} <Icon name="ArrowRight" size={16} />
          </button>
        </div>

        <div className="act-carousel">
          <button
            type="button"
            className="act-carousel__btn act-carousel__btn--prev"
            onClick={() => scrollBy(-1)}
            aria-label="Précédent"
          >
            <Icon name="ChevronLeft" size={22} />
          </button>

          <div className="act-carousel__track" ref={trackRef}>
            {ACTIVITIES.map((act) => {
              const cat = ACTIVITY_CATEGORIES[act.category];
              return (
                <article
                  key={act.id}
                  className="act-slide"
                  onClick={() => navigate(`/activity/${act.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/activity/${act.id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="act-slide__media">
                    <img
                      src={act.image}
                      alt={pick(act.name, act.name_en, act.name_ar)}
                      loading="lazy"
                    />
                    {cat && (
                      <span className="act-slide__badge">
                        {pick(cat.fr, cat.en, cat.ar)}
                      </span>
                    )}
                    <span className="act-slide__price">
                      {act.price.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="act-slide__body">
                    <h3 className="act-slide__title">
                      {pick(act.name, act.name_en, act.name_ar)}
                    </h3>
                    <p className="act-slide__desc">
                      {pick(act.desc, act.desc_en, act.desc_ar)}
                    </p>
                    <span className="act-slide__cta">{t('home_discover')} →</span>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            className="act-carousel__btn act-carousel__btn--next"
            onClick={() => scrollBy(1)}
            aria-label="Suivant"
          >
            <Icon name="ChevronRight" size={22} />
          </button>
        </div>

        <p className="act-carousel__hint">{t('home_act_swipe')}</p>
      </div>
    </section>
  );
};

export default ActivitiesSection;
