import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../hooks/useLangHook';
import Icon from '../ui/Icon';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const [search, setSearch] = useState({ destination: '', dates: '', travelers: '2', activity: '' });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/destinations');
  };

  return (
    <section className="hero-premium" id="hero">
      <div className="hero-premium__media">
        <img
          className="hero-premium__poster"
          src="https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-560126657.jpg?c=original"
          alt="Sahara Algeria"
        />
        <div className="hero-premium__overlay" />
      </div>

      <div className="hero-premium__content premium-container">
        <span className="hero-premium__badge" data-reveal>{t('home_hero_badge')}</span>
        <h1 className="hero-premium__title" data-reveal>
          {t('home_hero_title')}<br />
          <em>{t('home_hero_title_em')}</em>
        </h1>
        <p className="hero-premium__subtitle" data-reveal>{t('home_hero_subtitle')}</p>

        <form className="hero-premium__search" onSubmit={handleSearch} data-reveal>
          <div className="hero-premium__search-grid">
            <div className="hero-premium__field">
              <label><Icon name="MapPin" size={14} /> {t('home_search_destination')}</label>
              <input
                type="text"
                placeholder={t('home_search_ph_dest')}
                value={search.destination}
                onChange={(e) => setSearch({ ...search, destination: e.target.value })}
              />
            </div>
            <div className="hero-premium__field">
              <label><Icon name="Calendar" size={14} /> {t('home_search_dates')}</label>
              <input
                type="text"
                placeholder={t('home_search_ph_dates')}
                value={search.dates}
                onChange={(e) => setSearch({ ...search, dates: e.target.value })}
              />
            </div>
            <div className="hero-premium__field">
              <label><Icon name="User" size={14} /> {t('home_search_travelers')}</label>
              <select value={search.travelers} onChange={(e) => setSearch({ ...search, travelers: e.target.value })}>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} {n > 1 ? t('people') : t('person')}</option>
                ))}
              </select>
            </div>
            <div className="hero-premium__field">
              <label><Icon name="Waves" size={14} /> {t('home_search_activities')}</label>
              <input
                type="text"
                placeholder={t('home_search_ph_act')}
                value={search.activity}
                onChange={(e) => setSearch({ ...search, activity: e.target.value })}
              />
            </div>
            <button type="submit" className="hero-premium__search-btn">
              <Icon name="Search" size={18} />
              {t('home_search_btn')}
            </button>
          </div>
        </form>

        <div className="hero-premium__stats" data-reveal>
          <div><strong>50+</strong><span>{t('home_stat_destinations')}</span></div>
          <div><strong>4.9</strong><span>{t('home_stat_rating')}</span></div>
          <div><strong>10K+</strong><span>{t('home_stat_experiences')}</span></div>
        </div>
      </div>

      <div className="hero-premium__scroll">
        <span>{t('home_scroll')}</span>
        <div className="hero-premium__scroll-line" />
      </div>
    </section>
  );
};

export default HeroSection;
