import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../hooks/useLangHook';
import { GUEST_HOUSES, GUEST_HOUSE_BENEFITS, MAISON_HOTE_IMAGES } from '../../data/guestHouses';
import Icon from '../ui/Icon';
import './GuestHousesSection.css';

const BENEFIT_KEYS = {
  welcome: 'home_gh_benefit_welcome',
  food: 'home_gh_benefit_food',
  nature: 'home_gh_benefit_nature',
  comfort: 'home_gh_benefit_comfort',
  authentic: 'home_gh_benefit_authentic',
};

const GuestHousesSection = () => {
  const { t, pick } = useLang();
  const house = GUEST_HOUSES[0];
  const photos = house?.gallery || MAISON_HOTE_IMAGES;

  return (
    <section className="guesthouses-section" id="guesthouses">
      <div className="guesthouses-intro-block premium-container" data-reveal>
        <span className="guesthouses-kicker">{t('home_gh_badge')}</span>
        <h2 className="guesthouses-title">
          {t('home_gh_title')} <em>{t('home_gh_title_em')}</em>
        </h2>
        <p className="guesthouses-lead">{t('home_gh_intro')}</p>

        <div className="guesthouses-pillars" data-reveal>
          <article className="guesthouses-pillar">
            <span className="guesthouses-pillar__icon" aria-hidden="true">
              <Icon name="Landmark" size={22} strokeWidth={1.5} />
            </span>
            <h3>{t('home_gh_culture_title')}</h3>
            <p>{t('home_gh_culture_text')}</p>
          </article>
          <article className="guesthouses-pillar">
            <span className="guesthouses-pillar__icon" aria-hidden="true">
              <Icon name="CalendarDays" size={22} strokeWidth={1.5} />
            </span>
            <h3>{t('home_gh_program_title')}</h3>
            <p>{t('home_gh_program_text')}</p>
          </article>
          <article className="guesthouses-pillar">
            <span className="guesthouses-pillar__icon" aria-hidden="true">
              <Icon name="House" size={22} strokeWidth={1.5} />
            </span>
            <h3>{t('home_gh_stay_title')}</h3>
            <p>{t('home_gh_stay_text')}</p>
          </article>
        </div>
      </div>

      <div className="guesthouses-showcase premium-container" data-reveal>
        <div className="guesthouses-showcase__main">
          <img
            src={photos[0]}
            alt={t('home_gh_photo_alt')}
            loading="lazy"
          />
          <div className="guesthouses-showcase__caption">
            <span>{t('home_gh_place')}</span>
            <strong>{t('home_gh_place_name')}</strong>
          </div>
        </div>
        <div className="guesthouses-showcase__side">
          <img
            src={photos[1] || photos[0]}
            alt={t('home_gh_photo_alt')}
            loading="lazy"
          />
          <div className="guesthouses-showcase__note">
            <p>{t('home_gh_note')}</p>
          </div>
        </div>
      </div>

      <div className="premium-container guesthouses-body">
        <div className="guesthouses-benefits" data-reveal>
          {GUEST_HOUSE_BENEFITS.map((b) => (
            <div key={b.id} className="guesthouses-benefit">
              <span className="guesthouses-benefit__icon" aria-hidden="true">
                <Icon name={b.icon} size={20} strokeWidth={1.5} />
              </span>
              <span>{t(BENEFIT_KEYS[b.id])}</span>
            </div>
          ))}
        </div>

        {house && (
          <article className="guesthouse-featured" data-reveal>
            <div className="guesthouse-featured__info">
              <span className="guesthouse-featured__loc">
                <Icon name="MapPin" size={14} />
                {pick(house.location, house.location_en, house.location_ar)}
              </span>
              <h3>{pick(house.name, house.name_en, house.name_ar)}</h3>
              <p>{pick(house.desc, house.desc_en, house.desc_ar)}</p>
              <div className="guesthouse-featured__meta">
                <span className="guesthouse-featured__rating">
                  <Icon name="Star" size={14} /> {house.rating}
                </span>
                <span className="guesthouse-featured__price">
                  {house.price.toLocaleString()} <small>DA {t('per_person')}</small>
                </span>
              </div>
              <Link to="/guesthouses" className="guesthouse-featured__btn">
                {t('home_discover')} <Icon name="ArrowRight" size={16} />
              </Link>
            </div>
            <div className="guesthouse-featured__gallery">
              {photos.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
              ))}
            </div>
          </article>
        )}

        <div className="guesthouses-cta" data-reveal>
          <Link to="/guesthouses" className="guesthouses-cta__btn">
            {t('home_gh_btn_all')} <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GuestHousesSection;
