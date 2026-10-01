import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href, navigate } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { responsiveImage } from '../core/ui.js';
import { FEATURED_TOURS } from '../data/tours.js';
import { getPlacePathFromTour } from '../data/placeRoutes.js';
import { getPlaces } from '../data/places.js';

const FILTERS = [
  { key: 'all', icon: 'Compass', fr: 'Toutes', en: 'All', ar: 'الكل' },
  { key: 'desert', icon: 'Sun', fr: 'Sahara', en: 'Sahara', ar: 'الصحراء' },
  { key: 'nature', icon: 'Mountain', fr: 'Nature', en: 'Nature', ar: 'طبيعة' },
  { key: 'culture', icon: 'Landmark', fr: 'Culture', en: 'Culture', ar: 'ثقافة' },
];

const HERO_FEATURES = [
  { icon: 'MapPin', titleKey: 'dest_feat_places', descKey: 'dest_feat_places_desc' },
  { icon: 'Camera', titleKey: 'dest_feat_views', descKey: 'dest_feat_views_desc' },
  { icon: 'Users', titleKey: 'dest_feat_local', descKey: 'dest_feat_local_desc' },
  { icon: 'Star', titleKey: 'dest_feat_rated', descKey: 'dest_feat_rated_desc' },
];

const adminPlacesAsCards = () =>
  getPlaces()
    .filter((p) => p.fromAdmin)
    .map((p) => ({
      id: `admin-${p.id}`,
      placeSlug: p.id,
      name: p.name,
      name_en: p.name_en,
      name_ar: p.name_ar,
      subtitle: p.tagline,
      subtitle_en: p.tagline_en,
      subtitle_ar: p.tagline_ar,
      location: p.name,
      location_en: p.name_en,
      location_ar: p.name_ar,
      rating: p.rating || 4.8,
      image: p.image,
      price: p.price || 0,
      category: 'all',
      link: `/place/${p.id}`,
      badge: { fr: 'NOUVEAU', en: 'NEW', ar: 'جديد' },
    }));

const state = { filter: 'all' };

const filtered = () => {
  const adminCards = adminPlacesAsCards();
  const tours =
    state.filter === 'all' ? FEATURED_TOURS : FEATURED_TOURS.filter((d) => d.category === state.filter);
  if (state.filter === 'all') return [...tours, ...adminCards];
  return tours;
};

const destPath = (dest) => dest.link || getPlacePathFromTour(dest);

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

const cardHtml = (dest, i) => {
  const price = dest.priceOnRequest ? t('place_on_request') : `${dest.price.toLocaleString('fr-DZ')} DA`;
  return `
    <article class="acts-card" data-reveal data-delay="${i * 60}" data-href="${esc(destPath(dest))}" role="link" tabindex="0">
      <img src="${esc(asset(dest.image))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${asset(
        '/images/djanet.jpeg'
      )}'" />
      ${dest.badge ? `<span class="acts-card__new">${esc(pick(dest.badge.fr, dest.badge.en, dest.badge.ar))}</span>` : ''}
      <div class="acts-card__body">
        <h3>${esc(pick(dest.name, dest.name_en, dest.name_ar))}</h3>
        <p class="acts-card__tags">${esc(pick(dest.subtitle, dest.subtitle_en, dest.subtitle_ar))}</p>
        <div class="acts-card__meta">
          <span>${icon('MapPin', 13)}${esc(pick(dest.location, dest.location_en, dest.location_ar))}</span>
          <span>${icon('Star', 13)}${esc(dest.rating)}</span>
          <span class="acts-card__price">${esc(price)}</span>
        </div>
      </div>
    </article>`;
};

const gridHtml = () => {
  const items = filtered();
  return `
    <div class="acts-grid">${items.map(cardHtml).join('')}</div>
    ${items.length === 0 ? `<p class="acts-empty">${esc(t('dest_page_empty'))}</p>` : ''}`;
};

const render = () => `
  <div class="acts-page dest-page">
    ${navbar()}

    <section class="acts-hero">
      ${responsiveImage({ className: 'acts-hero__bg', src: '/images/djanet.jpeg', alt: '', priority: true, sizes: '100vw' })}
      <div class="acts-hero__overlay"></div>
      <div class="acts-hero__inner" data-reveal="fade">
        <nav class="acts-breadcrumb" aria-label="Breadcrumb">
          <a href="${href('/')}">${esc(t('nav_home'))}</a>
          <span>/</span>
          <span>${esc(t('nav_destinations'))}</span>
        </nav>
        <h1 class="acts-hero__title">
          ${esc(t('dest_page_title_before'))}
          <em> ${esc(t('dest_page_title_em'))} </em>
          ${esc(t('dest_page_title_after'))}
        </h1>
        <p class="acts-hero__subtitle">${esc(t('dest_page_subtitle'))}</p>
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

    <div class="acts-filters-wrap filter-pills-wrap is-scrollable" data-reveal>
      <div class="acts-filters filter-pills" role="tablist" data-filters>${filtersHtml()}</div>
    </div>

    <section class="acts-grid-section" id="dest-grid">
      <div class="acts-container" data-grid>${gridHtml()}</div>
    </section>

    <section class="acts-promo">
      <div class="acts-container acts-promo__inner">
        <div class="acts-promo__text" data-reveal="left">
          <span class="acts-promo__eyebrow">${esc(t('dest_promo_eyebrow'))}</span>
          <h2>${esc(t('dest_promo_title'))}</h2>
          <p>${esc(t('dest_promo_text'))}</p>
          <button type="button" class="acts-promo__btn" data-href="/tours">
            ${esc(t('dest_promo_cta'))} ${icon('ArrowRight', 16)}
          </button>
        </div>
        <div class="acts-promo__visual" data-reveal="right">
          <img src="${asset('/images/ghardaia.jpeg')}" alt="" />
          <div class="acts-promo__stats">
            <div><strong>${FEATURED_TOURS.length}+</strong><span>${esc(t('dest_stat_places'))}</span></div>
            <div><strong>4.8</strong><span>${esc(t('dest_stat_rating'))}</span></div>
            <div><strong>50+</strong><span>${esc(t('dest_stat_experiences'))}</span></div>
            <div><strong>24/7</strong><span>${esc(t('dest_stat_support'))}</span></div>
          </div>
        </div>
      </div>
    </section>

    ${footer()}
  </div>`;

const bind = (root) => {
  root.addEventListener('click', (e) => {
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

mountPage({ route: '/destinations', render, bind });
