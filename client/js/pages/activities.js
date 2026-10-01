import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href, navigate } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { responsiveImage } from '../core/ui.js';
import { ACTIVITIES, ACTIVITY_FILTERS } from '../data/activities.js';
import { FEATURED_TOURS } from '../data/tours.js';
import { getPlacePathFromTour } from '../data/placeRoutes.js';

const HERO_FEATURES = [
  { icon: 'ShieldCheck', titleKey: 'acts_feat_secure', descKey: 'acts_feat_secure_desc' },
  { icon: 'MapPin', titleKey: 'acts_feat_guides', descKey: 'acts_feat_guides_desc' },
  { icon: 'Tag', titleKey: 'acts_feat_price', descKey: 'acts_feat_price_desc' },
  { icon: 'RefreshCw', titleKey: 'acts_feat_cancel', descKey: 'acts_feat_cancel_desc' },
];

const TRUST_ITEMS = [
  { icon: 'Calendar', titleKey: 'acts_trust_book', descKey: 'acts_trust_book_desc' },
  { icon: 'CreditCard', titleKey: 'acts_trust_pay', descKey: 'acts_trust_pay_desc' },
  { icon: 'BadgePercent', titleKey: 'acts_trust_price', descKey: 'acts_trust_price_desc' },
  { icon: 'Users', titleKey: 'acts_trust_guides', descKey: 'acts_trust_guides_desc' },
];

const state = { filter: 'all', favorites: new Set() };

const filtered = () =>
  state.filter === 'all' ? ACTIVITIES : ACTIVITIES.filter((a) => a.filters?.includes(state.filter));

const destinations = FEATURED_TOURS.slice(0, 5);

const favIcon = (on) => icon('Heart', 16, { strokeWidth: 2, fill: on ? 'currentColor' : 'none' });

const filtersHtml = () =>
  ACTIVITY_FILTERS.map(
    (f) => `
      <button type="button" role="tab" aria-selected="${state.filter === f.key}" class="acts-filters__btn ${
        state.filter === f.key ? 'is-active' : ''
      }" data-filter="${esc(f.key)}">
        ${icon(f.icon, 18, { strokeWidth: 1.75 })}
        <span>${esc(pick(f.fr, f.en, f.ar))}</span>
      </button>`
  ).join('');

const cardHtml = (act, i) => {
  const fav = state.favorites.has(act.id);
  return `
    <article class="acts-card" data-reveal data-delay="${i * 60}" data-href="${esc(`/activity/${act.id}`)}" role="link" tabindex="0">
      <img src="${esc(asset(act.image))}" alt="" loading="lazy" />
      <button type="button" class="acts-card__fav ${fav ? 'is-on' : ''}" aria-label="Favorite" data-fav="${esc(act.id)}">
        ${favIcon(fav)}
      </button>
      <div class="acts-card__body">
        <h3>${esc(pick(act.name, act.name_en, act.name_ar))}</h3>
        <p class="acts-card__tags">${esc(pick(act.tags?.fr, act.tags?.en, act.tags?.ar))}</p>
        <div class="acts-card__meta">
          <span>${icon('Clock', 13)}${esc(pick(act.durationShort, act.durationShort_en, act.durationShort_ar))}</span>
          <span>${icon('Tag', 13)}${esc(`${t('acts_from')} ${act.price.toLocaleString()} DA`)}</span>
        </div>
      </div>
    </article>`;
};

const gridHtml = () => {
  const items = filtered();
  return `
    <div class="acts-grid">${items.map(cardHtml).join('')}</div>
    ${items.length === 0 ? `<p class="acts-empty">${esc(t('acts_empty'))}</p>` : ''}`;
};

const render = () => `
  <div class="acts-page">
    ${navbar()}

    <section class="acts-hero">
      ${responsiveImage({ className: 'acts-hero__bg', src: '/images/quad.jpg', alt: '', priority: true, sizes: '100vw' })}
      <div class="acts-hero__overlay"></div>
      <div class="acts-hero__inner" data-reveal="fade">
        <nav class="acts-breadcrumb" aria-label="Breadcrumb">
          <a href="${href('/')}">${esc(t('nav_home'))}</a>
          <span>/</span>
          <span>${esc(t('nav_activities'))}</span>
        </nav>
        <h1 class="acts-hero__title">
          ${esc(t('acts_hero_title_before'))}
          <em> ${esc(t('acts_hero_title_em'))} </em>
          ${esc(t('acts_hero_title_after'))}
        </h1>
        <p class="acts-hero__subtitle">${esc(t('acts_hero_subtitle'))}</p>
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

    <section class="acts-grid-section" id="acts-grid">
      <div class="acts-container" data-grid>${gridHtml()}</div>
    </section>

    <section class="acts-promo">
      <div class="acts-container acts-promo__inner">
        <div class="acts-promo__text" data-reveal="left">
          <span class="acts-promo__eyebrow">${esc(t('acts_promo_eyebrow'))}</span>
          <h2>${esc(t('acts_promo_title'))}</h2>
          <p>${esc(t('acts_promo_text'))}</p>
          <button type="button" class="acts-promo__btn" data-scroll-grid>
            ${esc(t('acts_promo_cta'))} ${icon('ArrowRight', 16)}
          </button>
        </div>
        <div class="acts-promo__visual" data-reveal="right">
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&amp;q=80" alt="" />
          <div class="acts-promo__stats">
            <div><strong>+150</strong><span>${esc(t('acts_stat_activities'))}</span></div>
            <div><strong>25+</strong><span>${esc(t('acts_stat_destinations'))}</span></div>
            <div><strong>100%</strong><span>${esc(t('acts_stat_satisfaction'))}</span></div>
            <div><strong>24/7</strong><span>${esc(t('acts_stat_support'))}</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="acts-dest">
      <div class="acts-container">
        <div class="acts-dest__head" data-reveal>
          <div>
            <span class="acts-dest__eyebrow">${esc(t('acts_dest_eyebrow'))}</span>
            <h2>
              ${esc(t('acts_dest_title'))} <em>${esc(t('acts_dest_title_em'))}</em>
            </h2>
          </div>
          <div class="acts-dest__nav">
            <button type="button" aria-label="Previous" data-dest-scroll="-1">${icon('ChevronLeft', 18)}</button>
            <button type="button" aria-label="Next" data-dest-scroll="1">${icon('ChevronRight', 18)}</button>
          </div>
        </div>
        <div class="acts-dest__track" data-dest-track>
          ${destinations
            .map(
              (d, i) => `
            <article class="acts-dest-card" data-reveal data-delay="${i * 60}" data-href="${esc(
                getPlacePathFromTour(d)
              )}" role="link" tabindex="0">
              <img src="${esc(asset(d.image))}" alt="" loading="lazy" />
              <div class="acts-dest-card__body">
                <h3>${esc(pick(d.name, d.name_en, d.name_ar))}</h3>
                <span>${esc(pick(d.subtitle, d.subtitle_en, d.subtitle_ar))}</span>
              </div>
            </article>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="acts-trust">
      <div class="acts-container">
        <h2 data-reveal>${esc(t('acts_trust_title'))}</h2>
        <div class="acts-trust__grid">
          ${TRUST_ITEMS.map(
            (item, i) => `
            <div class="acts-trust__item" data-reveal data-delay="${i * 80}">
              <div class="acts-trust__icon">${icon(item.icon, 22, { strokeWidth: 1.6 })}</div>
              <h3>${esc(t(item.titleKey))}</h3>
              <p>${esc(t(item.descKey))}</p>
            </div>`
          ).join('')}
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
      fav.innerHTML = favIcon(on);
      return;
    }
    const filterBtn = e.target.closest('[data-filter]');
    if (filterBtn) {
      state.filter = filterBtn.getAttribute('data-filter');
      root.querySelector('[data-filters]').innerHTML = filtersHtml();
      root.querySelector('[data-grid]').innerHTML = gridHtml();
      return;
    }
    const scrollBtn = e.target.closest('[data-dest-scroll]');
    if (scrollBtn) {
      const dir = Number(scrollBtn.getAttribute('data-dest-scroll'));
      root.querySelector('[data-dest-track]')?.scrollBy({ left: dir * 280, behavior: 'smooth' });
      return;
    }
    if (e.target.closest('[data-scroll-grid]')) {
      document.getElementById('acts-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

mountPage({ route: '/activities', render, bind });
