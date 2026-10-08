import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href, navigate } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { FEATURED_TOURS } from '../data/tours.js';
import { getPlacePathFromTour } from '../data/placeRoutes.js';

const FILTERS = [
  { key: 'all', icon: 'Compass', fr: 'Tous', en: 'All', ar: 'الكل' },
  { key: 'desert', icon: 'Sun', fr: 'Désert', en: 'Desert', ar: 'صحراء' },
  { key: 'nature', icon: 'Mountain', fr: 'Nature', en: 'Nature', ar: 'طبيعة' },
  { key: 'culture', icon: 'Landmark', fr: 'Culture', en: 'Culture', ar: 'ثقافة' },
];

const HERO_FEATURES = [
  { icon: 'ShieldCheck', titleKey: 'tours_feat_secure', descKey: 'tours_feat_secure_desc' },
  { icon: 'MapPin', titleKey: 'tours_feat_guides', descKey: 'tours_feat_guides_desc' },
  { icon: 'Calendar', titleKey: 'tours_feat_itinerary', descKey: 'tours_feat_itinerary_desc' },
  { icon: 'Tag', titleKey: 'tours_feat_price', descKey: 'tours_feat_price_desc' },
];

const state = { filter: 'all', favorites: new Set() };

const filtered = () =>
  state.filter === 'all' ? FEATURED_TOURS : FEATURED_TOURS.filter((tour) => tour.category === state.filter);

const filtersHtml = () =>
  FILTERS.map(
    (f) => `
      <button type="button" role="tab" aria-selected="${state.filter === f.key}" class="acts-filters__btn ${
        state.filter === f.key ? 'is-active' : ''
      }" data-filter="${f.key}">
        ${icon(f.icon, 18, { strokeWidth: 1.75 })}
        <span>${esc(pick(f.fr, f.en, f.ar))}</span>
      </button>`
  ).join('');

const cardHtml = (tour, i) => {
  const fav = state.favorites.has(String(tour.id));
  const price = tour.priceOnRequest
    ? t('place_on_request')
    : `${t('acts_from')} ${tour.price.toLocaleString()} DA`;
  return `
    <article class="acts-card" data-reveal data-delay="${i * 60}" data-href="${esc(getPlacePathFromTour(tour))}" role="link" tabindex="0">
      <img src="${esc(asset(tour.image))}" alt="" loading="lazy" />
      <button type="button" class="acts-card__fav ${fav ? 'is-on' : ''}" aria-label="Favorite" data-fav="${esc(tour.id)}">
        ${icon('Heart', 16, { strokeWidth: 2, fill: fav ? 'currentColor' : 'none' })}
      </button>
      <div class="acts-card__body">
        <h3>${esc(pick(tour.name, tour.name_en, tour.name_ar))}</h3>
        <p class="acts-card__tags">${esc(pick(tour.subtitle, tour.subtitle_en, tour.subtitle_ar))}</p>
        <div class="acts-card__meta">
          <span>${icon('MapPin', 13)}${esc(pick(tour.location, tour.location_en, tour.location_ar))}</span>
          <span>${icon('Clock', 13)}${esc(pick(tour.duration, tour.duration_en, tour.duration_ar))}</span>
          <span>${icon('Tag', 13)}${esc(price)}</span>
          ${tour.bookingOpen === false ? `<span>${icon('Calendar', 13)}${esc(t('place_booking_closed'))}</span>` : ''}
        </div>
      </div>
    </article>`;
};

const gridHtml = () => {
  const items = filtered();
  return `
    <div class="acts-grid">${items.map(cardHtml).join('')}</div>
    ${items.length === 0 ? `<p class="acts-empty">${esc(t('tours_empty'))}</p>` : ''}`;
};

const render = () => `
  <div class="acts-page">
    ${navbar()}

    <section class="acts-hero">
      <img class="acts-hero__bg" src="${asset('/images/home/circuits-4x4.png')}" alt="" />
      <div class="acts-hero__overlay"></div>
      <div class="acts-hero__inner" data-reveal="fade">
        <nav class="acts-breadcrumb" aria-label="Breadcrumb">
          <a href="${href('/')}">${esc(t('nav_home'))}</a>
          <span>/</span>
          <span>${esc(t('nav_tours'))}</span>
        </nav>
        <h1 class="acts-hero__title">
          ${esc(t('tours_hero_title_before'))}
          <em> ${esc(t('tours_hero_title_em'))} </em>
          ${esc(t('tours_hero_title_after'))}
        </h1>
        <p class="acts-hero__subtitle">${esc(t('tours_hero_subtitle'))}</p>
        <div class="acts-hero__features">
          ${HERO_FEATURES.map(
            (f) => `
            <div class="acts-hero__feat">
              ${icon(f.icon, 22, { strokeWidth: 1.5 })}
              <strong>${esc(t(f.titleKey))}</strong>
              <span>${esc(t(f.descKey))}</span>
            </div>`
          ).join('')}
        </div>
      </div>
    </section>

    <div class="acts-filters-wrap" data-reveal>
      <div class="acts-filters" role="tablist" data-filters>${filtersHtml()}</div>
    </div>

    <section class="acts-grid-section" id="tours-grid">
      <div class="acts-container" data-grid>${gridHtml()}</div>
    </section>

    <section class="acts-promo">
      <div class="acts-container acts-promo__inner">
        <div class="acts-promo__text" data-reveal="left">
          <span class="acts-promo__eyebrow">${esc(t('tours_promo_eyebrow'))}</span>
          <h2>${esc(t('tours_promo_title'))}</h2>
          <p>${esc(t('tours_promo_text'))}</p>
          <button type="button" class="acts-promo__btn" data-href="/contact">
            ${esc(t('tours_promo_cta'))} ${icon('ArrowRight', 16)}
          </button>
        </div>
        <div class="acts-promo__visual" data-reveal="right">
          <img src="${asset('/images/home/circuits-4x4.png')}" alt="" />
          <div class="acts-promo__stats">
            <div><strong>${FEATURED_TOURS.length}+</strong><span>${esc(t('tours_stat_circuits'))}</span></div>
            <div><strong>4.8</strong><span>${esc(t('tours_stat_rating'))}</span></div>
            <div><strong>100%</strong><span>${esc(t('tours_stat_local'))}</span></div>
            <div><strong>24/7</strong><span>${esc(t('tours_stat_support'))}</span></div>
          </div>
        </div>
      </div>
    </section>

    ${footer()}
  </div>`;

const bind = (root) => {
  root.addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      e.stopPropagation();
      const id = fav.getAttribute('data-fav');
      if (state.favorites.has(id)) state.favorites.delete(id);
      else state.favorites.add(id);
      const on = state.favorites.has(id);
      fav.classList.toggle('is-on', on);
      fav.innerHTML = icon('Heart', 16, { strokeWidth: 2, fill: on ? 'currentColor' : 'none' });
      return;
    }
    const filterBtn = e.target.closest('[data-filter]');
    if (filterBtn) {
      state.filter = filterBtn.getAttribute('data-filter');
      root.querySelector('[data-filters]').innerHTML = filtersHtml();
      root.querySelector('[data-grid]').innerHTML = gridHtml();
      return;
    }
    const link = e.target.closest('[data-href]');
    if (link) navigate(link.getAttribute('data-href'));
  });

  root.addEventListener('keydown', (e) => {
    const link = e.target.closest('article[data-href]');
    if (link && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      navigate(link.getAttribute('data-href'));
    }
  });
};

mountPage({ route: '/tours', render, bind });
