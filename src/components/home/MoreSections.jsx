import React, { useRef } from 'react';
import { useLang } from '../../hooks/useLangHook';
import { ACCOMMODATIONS, TRAVEL_STORIES, REVIEWS, GALLERY_IMAGES } from '../../data/experiences';
import Icon from '../ui/Icon';
import './Sections.css';

const TYPE_KEYS = {
  hotel: 'type_hotel',
  guesthouse: 'type_guesthouse',
  desert: 'type_desert',
  villa: 'type_villa',
  eco: 'type_eco',
  apartment: 'type_apartment',
};

export const AccommodationsSection = () => {
  const scrollRef = useRef(null);
  const { t, pick } = useLang();

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <section className="premium-section" id="accommodations">
      <div className="premium-container">
        <div className="premium-header premium-header--center" data-reveal>
          <span className="premium-badge">{t('home_acc_badge')}</span>
          <h2 className="premium-title">{t('home_acc_title')} <em>{t('home_acc_title_em')}</em></h2>
          <p className="premium-subtitle">{t('home_acc_subtitle')}</p>
        </div>

        <div className="section-scroll-wrap">
          <button className="section-scroll-btn" onClick={() => scroll(-1)} type="button"><Icon name="ChevronLeft" size={20} /></button>
          <div className="acc-cards" ref={scrollRef}>
            {ACCOMMODATIONS.map((acc) => (
              <article key={acc.id} className="acc-card premium-card">
                <div className="acc-card__img">
                  <img src={acc.image} alt={acc.name} loading="lazy" />
                  <span className="acc-card__type">{t(TYPE_KEYS[acc.type])}</span>
                  <span className="premium-rating"><Icon name="Star" size={12} />{acc.rating}</span>
                </div>
                <div className="acc-card__body">
                  <h3>{acc.name}</h3>
                  <p className="acc-card__loc"><Icon name="MapPin" size={14} /> {pick(acc.location, acc.location_en, acc.location_ar)}</p>
                  <div className="acc-card__amenities">{acc.amenities.map((a) => <span key={a}>{a}</span>)}</div>
                  <div className="acc-card__footer">
                    <div className="acc-card__price">{acc.price.toLocaleString()} <span>DA/{t('home_per_night')}</span></div>
                    <button className="premium-btn premium-btn--primary" type="button">{t('btn_reserver')}</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button className="section-scroll-btn" onClick={() => scroll(1)} type="button"><Icon name="ChevronRight" size={20} /></button>
        </div>
      </div>
    </section>
  );
};

export const StoriesSection = () => {
  const { t, pick } = useLang();

  return (
    <section className="premium-section premium-section--sand" id="blog">
      <div className="premium-container">
        <div className="premium-header" data-reveal>
          <span className="premium-badge">{t('home_stories_badge')}</span>
          <h2 className="premium-title">{t('home_stories_title')} <em>{t('home_stories_title_em')}</em></h2>
          <p className="premium-subtitle">{t('home_stories_subtitle')}</p>
        </div>
        <div className="stories-grid">
          {TRAVEL_STORIES.map((story) => (
            <article key={story.id} className="story-card premium-card" data-reveal>
              <div className="story-card__img">
                <img src={story.image} alt={pick(story.title, story.title_en, story.title_ar)} loading="lazy" />
                <span className="story-card__cat">{pick(story.category, story.category_en, story.category_ar)}</span>
              </div>
              <div className="story-card__body">
                <time>{pick(story.date, story.date_en, story.date_ar)}</time>
                <h3>{pick(story.title, story.title_en, story.title_ar)}</h3>
                <p>{pick(story.excerpt, story.excerpt_en, story.excerpt_ar)}</p>
                <a href="/blog" className="story-card__link">{t('home_read_more')} <Icon name="ArrowRight" size={14} /></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ReviewsSection = () => {
  const { t, pick } = useLang();

  return (
    <section className="premium-section premium-section--ocean" id="reviews">
      <div className="premium-container">
        <div className="premium-header premium-header--center" data-reveal>
          <span className="premium-badge">{t('home_reviews_badge')}</span>
          <h2 className="premium-title">{t('home_reviews_title')} <em>{t('home_reviews_title_em')}</em></h2>
        </div>
        <div className="reviews-grid">
          {REVIEWS.map((r) => (
            <article key={r.id} className="review-card" data-reveal>
              <div className="review-card__img"><img src={r.image} alt="" loading="lazy" /></div>
              <div className="review-card__body">
                <div className="review-card__stars">{Array.from({ length: r.rating }, (_, i) => <Icon key={i} name="Star" size={14} className="star-filled" />)}</div>
                <p>"{pick(r.text, r.text_en, r.text_ar)}"</p>
                <div className="review-card__author">
                  <div className="review-card__avatar">{r.photo}</div>
                  <div><strong>{r.name}</strong><span>{pick(r.country, r.country_en, r.country_ar)}</span></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const GallerySection = () => {
  const { t } = useLang();
  return (
    <section className="premium-section" id="gallery">
      <div className="premium-container">
        <div className="premium-header premium-header--center" data-reveal>
          <span className="premium-badge">{t('home_gallery_badge')}</span>
          <h2 className="premium-title">{t('home_gallery_title')} <em>{t('home_gallery_title_em')}</em></h2>
        </div>
        <div className="gallery-masonry" data-reveal>
          {GALLERY_IMAGES.map((img, i) => (
            <a key={i} href="/gallery" className={`gallery-item gallery-item--${(i % 3) + 1}`}>
              <img src={img} alt="" loading="lazy" />
            </a>
          ))}
        </div>
        <div className="gallery-cta" data-reveal>
          <a href="/gallery" className="premium-btn premium-btn--ghost">{t('home_gallery_btn')} <Icon name="ArrowRight" size={16} /></a>
        </div>
      </div>
    </section>
  );
};

export const NewsletterSection = () => {
  const { t } = useLang();
  return (
    <section className="newsletter-premium" id="newsletter">
      <div className="premium-container">
        <div className="newsletter-premium__inner" data-reveal>
          <div>
            <h2 className="premium-title">{t('home_newsletter_title')}</h2>
            <p className="premium-subtitle">{t('home_newsletter_subtitle')}</p>
          </div>
          <form className="newsletter-premium__form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder={t('home_newsletter_placeholder')} required />
            <button type="submit" className="premium-btn premium-btn--sunset">{t('home_newsletter_btn')}</button>
          </form>
        </div>
      </div>
    </section>
  );
};
