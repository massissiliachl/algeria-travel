import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href, navigate } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { responsiveImage } from '../core/ui.js';
import {
  HOME_ACCOMMODATIONS,
  HOME_CIRCUITS_BANNER,
  HOME_COUP_TAGHIT,
  HOME_DESTINATIONS,
  HOME_HERO,
} from '../data/homePage.js';
import { FEATURED_TOURS } from '../data/tours.js';
import { getPlacePathFromTour } from '../data/placeRoutes.js';
import { resolveSearchNavigation, suggestActivities, suggestDestinations } from '../data/search.js';
import { getAdminPageValue } from '../utils/adminContent.js';

const TRUST = [
  { icon: 'Calendar', title: 'home_trust_book', desc: 'home_trust_book_desc' },
  { icon: 'BadgePercent', title: 'home_trust_price', desc: 'home_trust_price_desc' },
  { icon: 'Sparkles', title: 'home_trust_auth', desc: 'home_trust_auth_desc' },
  {
    icon: 'MessageCircle',
    title: 'home_trust_whatsapp',
    desc: 'home_trust_whatsapp_desc',
    href: 'https://wa.me/33619501708?text=' + encodeURIComponent('Bonjour, je souhaite réserver une activité sur Algeria Travel'),
  },
];

const STATS = [
  { value: '+150', key: 'home_stat_acts' },
  { value: '+200', key: 'home_stat_dests' },
  { value: '+500', key: 'home_stat_partners' },
  { value: '+10K', key: 'home_stat_travelers' },
];

const WA_PATH =
  'M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.514 0-10 4.486-10 10 0 1.767.461 3.488 1.334 5.002L2 22l5.115-1.314c1.486.804 3.157 1.229 4.891 1.229 5.514 0 10-4.486 10-10 0-2.677-1.041-5.185-2.929-7.073zm-7.071 15.299c-1.519 0-3.005-.413-4.274-1.188l-.306-.181-3.036.779.81-2.959-.199-.317c-.859-1.363-1.313-2.926-1.313-4.535 0-4.597 3.741-8.338 8.338-8.338 2.226 0 4.319.867 5.891 2.439 1.572 1.572 2.439 3.665 2.439 5.891.001 4.597-3.74 8.338-8.35 8.338zm4.573-6.247c-.251-.125-1.485-.734-1.715-.817-.23-.084-.397-.125-.565.125-.167.25-.645.817-.791.985-.146.168-.293.188-.543.063-.25-.125-1.056-.39-2.012-1.242-.744-.66-1.246-1.476-1.392-1.726-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438s.167-.25.25-.417c.084-.167.042-.312-.021-.438-.062-.125-.564-1.361-.773-1.864-.203-.488-.411-.422-.565-.43-.146-.008-.312-.01-.479-.01s-.438.063-.668.313c-.229.25-.875.854-.875 2.083 0 1.229.896 2.416 1.021 2.583.125.167 1.761 2.688 4.266 3.77.596.256 1.062.41 1.426.525.599.191 1.145.163 1.576.099.481-.073 1.485-.607 1.694-1.193.209-.586.209-1.089.146-1.193-.062-.104-.229-.167-.479-.292z';

const state = {
  search: { destination: '', dates: '', travelers: '2', activity: '' },
  openSuggest: null,
};

const suggestionsFor = (field) =>
  field === 'destination' ? suggestDestinations(state.search.destination) : suggestActivities(state.search.activity);

const suggestHtml = (field) => {
  const items = state.openSuggest === field ? suggestionsFor(field) : [];
  if (!items.length) return '';
  return `
    <ul class="hv-suggest" role="listbox">
      ${items
        .map(
          (s, i) => `
        <li>
          <button type="button" role="option" aria-selected="false" data-suggest-pick="${field}" data-index="${i}">
            ${s.image ? `<img src="${esc(asset(s.image))}" alt="" />` : ''}
            <span>
              <strong>${esc(pick(s.label, s.label_en, s.label_ar))}</strong>
              <small>${esc(pick(s.hint, s.hint_en, s.hint_ar))}</small>
            </span>
            ${icon('ArrowRight', 14)}
          </button>
        </li>`
        )
        .join('')}
    </ul>`;
};

const heroHtml = () => {
  const heroImage = getAdminPageValue('home_hero_image', HOME_HERO.image);
  const brandName = getAdminPageValue('home_brand', 'Algeria Travel');
  const titleBefore = getAdminPageValue('home_title_before', t('home_v2_title_before'));
  const titleEm = getAdminPageValue('home_title_em', t('home_v2_title_em'));
  const titleAfter = getAdminPageValue('home_title_after', t('home_v2_title_after'));
  const subtitle = getAdminPageValue('home_subtitle', t('home_v2_subtitle'));
  const ctaLabel = getAdminPageValue('home_cta', t('home_v2_cta'));
  return `
    <section class="hv-hero" id="hero">
      <div class="hv-hero__media">
        ${responsiveImage({ src: heroImage, alt: '', priority: true, sizes: '100vw', fallback: HOME_HERO.fallback })}
        <div class="hv-hero__overlay"></div>
      </div>

      <div class="hv-container hv-hero__content">
        <p class="hv-hero__brand hv-anim hv-anim--1">${esc(brandName)}</p>

        <h1 class="hv-hero__title hv-anim hv-anim--2">
          <span class="hv-hero__title-line">${esc(titleBefore)}</span>
          <span class="hv-hero__title-line"><em>${esc(titleEm)}</em></span>
          <span class="hv-hero__title-line">${esc(titleAfter)}</span>
        </h1>
        <span class="hv-hero__rule hv-anim hv-anim--2" aria-hidden="true"></span>
        <p class="hv-hero__subtitle hv-anim hv-anim--3">${esc(subtitle)}</p>
        <div class="hv-hero__actions hv-anim hv-anim--4">
          <button type="button" class="hv-hero__cta" data-href="/destinations">
            <span class="hv-hero__cta-text">${esc(ctaLabel)}</span>
            <span class="hv-hero__cta-icon" aria-hidden="true">${icon('ArrowRight', 18, { strokeWidth: 2 })}</span>
          </button>
        </div>
      </div>
    </section>`;
};

const searchHtml = () => {
  const s = state.search;
  const open = state.openSuggest;
  return `
    <div class="hv-search-wrap" data-search-wrap data-reveal data-delay="80">
      <form class="hv-search" role="search" data-search-form>
        <div class="hv-search__field ${open === 'destination' ? 'is-open' : ''}" data-suggest-field="destination">
          <label for="hv-dest">${icon('MapPin', 12)} ${esc(t('home_search_destination'))}</label>
          <input id="hv-dest" type="text" autocomplete="off" placeholder="${esc(t('home_search_ph_dest'))}" value="${esc(
    s.destination
  )}" data-search-input="destination" />
          ${suggestHtml('destination')}
        </div>
        <div class="hv-search__field">
          <label for="hv-dates">${icon('Calendar', 12)} ${esc(t('home_search_dates'))}</label>
          <input id="hv-dates" type="date" placeholder="${esc(t('home_search_ph_dates'))}" value="${esc(
    s.dates
  )}" data-search-input="dates" />
        </div>
        <div class="hv-search__field">
          <label for="hv-travelers">${icon('Users', 12)} ${esc(t('home_search_travelers'))}</label>
          <select id="hv-travelers" data-search-input="travelers">
            ${[1, 2, 3, 4, 5, 6, 7, 8]
              .map(
                (n) =>
                  `<option value="${n}"${String(n) === s.travelers ? ' selected' : ''}>${n} ${esc(
                    n > 1 ? t('people') : t('person')
                  )}</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="hv-search__field ${open === 'activity' ? 'is-open' : ''}" data-suggest-field="activity">
          <label for="hv-act">${icon('Mountain', 12)} ${esc(t('home_search_activities'))}</label>
          <input id="hv-act" type="text" autocomplete="off" placeholder="${esc(t('home_search_ph_act'))}" value="${esc(
    s.activity
  )}" data-search-input="activity" />
          ${suggestHtml('activity')}
        </div>
        <button type="submit" class="hv-search__btn">
          ${icon('Search', 16)}
          ${esc(t('home_search_btn'))}
        </button>
      </form>
    </div>`;
};

const coupHtml = () => `
  <section class="hv-coup" aria-labelledby="hv-coup-title" data-reveal>
    <div class="hv-container">
      <div class="hv-coup__stage">
        <a href="${href(HOME_COUP_TAGHIT.link)}" class="hv-coup__banner">
          <span class="hv-coup__tag" aria-hidden="true">
            <svg viewBox="0 0 72 72" class="hv-coup__tag-svg">
              <path class="hv-coup__tag-shape" d="M12 28 L36 8 L60 28 L52 58 L20 58 Z"></path>
              <circle cx="36" cy="22" r="3.5" class="hv-coup__tag-hole"></circle>
            </svg>
            <span class="hv-coup__tag-label">${esc(t('home_v2_coup_badge'))}</span>
          </span>

          <div class="hv-coup__banner-copy">
            <p class="hv-coup__eyebrow">${esc(t('home_v2_coup_eyebrow'))}</p>
            <h2 id="hv-coup-title" class="hv-coup__title">${esc(t('home_v2_coup_headline'))}</h2>
            <p class="hv-coup__text">${esc(t('home_v2_coup_text'))}</p>
          </div>

          <div class="hv-coup__banner-media">
            <img src="${esc(asset(HOME_COUP_TAGHIT.image))}" alt="${esc(t('home_v2_coup_place'))}" onerror="this.onerror=null;this.src='${esc(
  asset(HOME_COUP_TAGHIT.fallback)
)}'" />
          </div>
        </a>

        <div class="hv-coup__formulas" aria-label="${esc(t('home_v2_coup_meta_label'))}">
          ${HOME_COUP_TAGHIT.packages
            .map(
              (pkg) => `
            <article class="hv-coup__formula hv-coup__formula--${esc(pkg.id)}">
              <div class="hv-coup__formula-top">
                <span class="hv-coup__formula-icon">${icon(pkg.icon, 20, { strokeWidth: 1.6 })}</span>
                <div>
                  <h3>${esc(t(pkg.titleKey))}</h3>
                  <p>${esc(t(pkg.transportKey))}</p>
                  ${pkg.datesKey ? `<p class="hv-coup__formula-dates">${esc(t(pkg.datesKey))}</p>` : ''}
                </div>
              </div>

              <ul class="hv-coup__formula-list">
                ${pkg.includes
                  .map((key) => `<li>${icon('Check', 15, { strokeWidth: 2.25 })}<span>${esc(t(key))}</span></li>`)
                  .join('')}
              </ul>

              ${pkg.extraKey ? `<p class="hv-coup__formula-extra">${esc(t(pkg.extraKey))}</p>` : ''}

              <div class="hv-coup__formula-foot">
                <div class="hv-coup__formula-price">
                  ${
                    pkg.priceOnRequest || pkg.price == null
                      ? `<strong>${esc(t('home_v2_coup_on_request'))}</strong>
                         <em>${esc(t('home_v2_coup_pkg_brezina_dates'))}</em>`
                      : `<strong>${esc(pkg.price.toLocaleString('fr-DZ'))}<span> ${esc(t('home_v2_coup_price_unit'))}</span></strong>
                         <em>${esc(t('home_v2_coup_per_person'))}</em>`
                  }
                </div>
                <a href="${href(pkg.ctaPath || `${HOME_COUP_TAGHIT.link}?pkg=${pkg.id}`)}" class="hv-coup__formula-cta">
                  ${esc(t('home_v2_coup_cta'))}
                  ${icon('ArrowRight', 16)}
                </a>
              </div>
            </article>`
            )
            .join('')}
        </div>
      </div>
    </div>
  </section>`;

const trustHtml = () => `
  <section class="hv-trust" aria-label="Avantages">
    <div class="hv-trust__grid">
      ${TRUST.map((item, i) => {
        const content = `
          <div class="hv-trust__icon">
            ${
              item.href
                ? `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="${WA_PATH}"></path></svg>`
                : icon(item.icon, 24, { strokeWidth: 1.5 })
            }
          </div>
          <strong>${esc(t(item.title))}</strong>
          <span>${esc(t(item.desc))}</span>`;
        return item.href
          ? `<a class="hv-trust__item hv-trust__item--link" href="${esc(
              item.href
            )}" target="_blank" rel="noopener noreferrer" data-reveal data-delay="${i * 70}">${content}</a>`
          : `<div class="hv-trust__item" data-reveal data-delay="${i * 70}">${content}</div>`;
      }).join('')}
    </div>
  </section>`;

const carouselNext = (track) => `
  <button type="button" class="hv-carousel__next" data-scroll-track="${track}" aria-label="Suivant">
    ${icon('ChevronRight', 20)}
  </button>`;

const destHtml = () => `
  <section class="hv-dest" id="destinations">
    <div class="hv-container">
      <div class="hv-section-head" data-reveal>
        <div>
          <span class="hv-eyebrow">${esc(t('home_v2_dest_eyebrow'))}</span>
          <h2>${esc(t('home_v2_dest_title'))}</h2>
        </div>
        <a href="${href('/destinations')}" class="hv-link">${esc(t('home_v2_dest_all'))} ${icon('ArrowRight', 16)}</a>
      </div>

      <div class="hv-carousel">
        <div class="hv-carousel__track" data-track="dest">
          ${HOME_DESTINATIONS.map(
            (d, i) => `
            <article class="hv-dest-card" data-reveal data-delay="${i * 60}" data-href="${esc(d.link)}" role="link" tabindex="0">
              <img src="${esc(asset(d.image))}" alt="" loading="lazy" />
              <div class="hv-dest-card__body">
                <h3>${esc(pick(d.name, d.name_en, d.name_ar))}</h3>
                <p>${esc(pick(d.tagline, d.tagline_en, d.tagline_ar))}</p>
                <div class="hv-dest-card__meta">
                  <span>${icon('Star', 12)} ${esc(d.rating)}</span>
                  <span>${icon('Sun', 12)} ${esc(d.temp)}</span>
                </div>
              </div>
            </article>`
          ).join('')}
        </div>
        ${carouselNext('dest')}
      </div>
    </div>
  </section>`;

const circuitsHtml = () => `
  <section class="hv-circuits" id="tours" data-reveal="fade">
    <div class="hv-circuits__bg">
      <img src="${esc(asset(HOME_CIRCUITS_BANNER.image))}" alt="" />
    </div>
    <div class="hv-circuits__panel" data-reveal="right" data-delay="120">
      <span class="hv-eyebrow">${esc(t('home_v2_circ_eyebrow'))}</span>
      <h2>${esc(t('home_v2_circ_title'))}</h2>
      <p>${esc(t('home_v2_circ_text'))}</p>
      <button type="button" class="hv-circuits__btn" data-href="/tours">
        ${esc(t('home_v2_circ_cta'))} ${icon('ArrowRight', 16)}
      </button>
    </div>
  </section>`;

const toursHtml = () => `
  <section class="hv-dest hv-circuits-list" id="circuits">
    <div class="hv-container">
      <div class="hv-section-head" data-reveal>
        <div>
          <span class="hv-eyebrow">${esc(t('home_tours_badge'))}</span>
          <h2>${esc(t('home_tours_title'))} <em>${esc(t('home_tours_title_em'))}</em></h2>
        </div>
        <a href="${href('/tours')}" class="hv-link">${esc(t('home_v2_circ_cta'))} ${icon('ArrowRight', 16)}</a>
      </div>

      <div class="hv-carousel">
        <div class="hv-carousel__track" data-track="tours">
          ${FEATURED_TOURS.map(
            (tour, i) => `
            <article class="hv-dest-card" data-reveal data-delay="${i * 60}" data-href="${esc(
              getPlacePathFromTour(tour)
            )}" role="link" tabindex="0">
              <img src="${esc(asset(tour.image))}" alt="" loading="lazy" />
              <div class="hv-dest-card__body">
                <h3>${esc(pick(tour.name, tour.name_en, tour.name_ar))}</h3>
                <p>${esc(pick(tour.subtitle, tour.subtitle_en, tour.subtitle_ar))}</p>
                <div class="hv-dest-card__meta">
                  <span>${icon('Star', 12)} ${esc(tour.rating)}</span>
                  <span>${icon('Clock', 12)} ${esc(pick(tour.duration, tour.duration_en, tour.duration_ar))}</span>
                </div>
              </div>
            </article>`
          ).join('')}
        </div>
        ${carouselNext('tours')}
      </div>
    </div>
  </section>`;

const statsHtml = () => `
  <section class="hv-stats">
    <div class="hv-stats__grid">
      ${STATS.map(
        (s, i) => `
        <div data-reveal data-delay="${i * 80}">
          <strong>${esc(s.value)}</strong>
          <span>${esc(t(s.key))}</span>
        </div>`
      ).join('')}
    </div>
  </section>`;

const accHtml = () => `
  <section class="hv-acc" id="guesthouses">
    <div class="hv-container">
      <div class="hv-section-head hv-section-head--center" data-reveal>
        <div>
          <span class="hv-eyebrow">${esc(t('home_v2_acc_eyebrow'))}</span>
          <h2>${esc(t('home_v2_acc_title'))}</h2>
        </div>
      </div>

      <div class="hv-carousel">
        <div class="hv-carousel__track hv-acc__track" data-track="acc">
          ${HOME_ACCOMMODATIONS.map(
            (acc, i) => `
            <article class="hv-acc-card" data-reveal data-delay="${i * 70}" data-href="${esc(
              acc.link || '/stays'
            )}" role="link" tabindex="0">
              <img src="${esc(asset(acc.image))}" alt="" loading="lazy" />
              <div class="hv-acc-card__body">
                <h3>${esc(pick(acc.fr, acc.en, acc.ar))}</h3>
                <span>${esc(pick(acc.cta.fr, acc.cta.en, acc.cta.ar))} ${icon('ArrowRight', 14)}</span>
              </div>
            </article>`
          ).join('')}
        </div>
        ${carouselNext('acc')}
      </div>
    </div>
  </section>`;

const newsHtml = () => `
  <section class="hv-news" id="blog">
    <div class="hv-container">
      <div class="hv-news__card" data-reveal="zoom">
        <div class="hv-news__visual">
          <img src="${asset('/images/home/news-coast.jpg')}" alt="" />
        </div>
        <div class="hv-news__body">
          <h2>${esc(t('home_v2_news_title'))}</h2>
          <p>${esc(t('home_v2_news_text'))}</p>
          <form class="hv-news__form" data-news-form>
            <input type="email" placeholder="${esc(t('footer_email_placeholder'))}" required />
            <button type="submit" aria-label="${esc(t('footer_subscribe'))}">${icon('ArrowRight', 18)}</button>
          </form>
        </div>
      </div>
    </div>
  </section>`;

const render = () => `
  <div class="home-page-root">
    ${navbar()}
    <main>
      <div class="home-v2">
        ${heroHtml()}
        ${searchHtml()}
        ${coupHtml()}
        ${trustHtml()}
        ${destHtml()}
        ${circuitsHtml()}
        ${toursHtml()}
        ${statsHtml()}
        ${accHtml()}
        ${newsHtml()}
      </div>
    </main>
    ${footer()}
  </div>`;

/* Met à jour uniquement les listes de suggestions (sans toucher aux champs, pour garder le focus). */
const paintSuggest = (root) => {
  root.querySelectorAll('[data-suggest-field]').forEach((field) => {
    const name = field.getAttribute('data-suggest-field');
    field.classList.toggle('is-open', state.openSuggest === name);
    field.querySelector('.hv-suggest')?.remove();
    const html = suggestHtml(name);
    if (html) field.insertAdjacentHTML('beforeend', html);
  });
};

const setOpenSuggest = (root, value) => {
  state.openSuggest = value;
  paintSuggest(root);
};

const pickSuggestion = (root, field, suggestion) => {
  if (field === 'destination') {
    state.search.destination = suggestion.label;
    setOpenSuggest(root, null);
    const qs = new URLSearchParams();
    if (state.search.dates) qs.set('dates', state.search.dates);
    if (state.search.travelers) qs.set('travelers', state.search.travelers);
    const str = qs.toString();
    navigate(str ? `${suggestion.path}?${str}` : suggestion.path);
    return;
  }
  state.search.activity = suggestion.label;
  setOpenSuggest(root, null);
  navigate(suggestion.path);
};

const bind = (root) => {
  document.addEventListener('pointerdown', (e) => {
    const wrap = root.querySelector('[data-search-wrap]');
    if (state.openSuggest && !wrap?.contains(e.target)) setOpenSuggest(root, null);
  });

  root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('[data-suggest-pick]')) e.preventDefault();
  });

  root.addEventListener('input', (e) => {
    const input = e.target.closest('[data-search-input]');
    if (!input) return;
    const name = input.getAttribute('data-search-input');
    state.search[name] = input.value;
    if (name === 'destination' || name === 'activity') setOpenSuggest(root, name);
  });

  root.addEventListener('change', (e) => {
    const input = e.target.closest('[data-search-input]');
    if (input) state.search[input.getAttribute('data-search-input')] = input.value;
  });

  root.addEventListener('focusin', (e) => {
    const input = e.target.closest('[data-search-input="destination"], [data-search-input="activity"]');
    if (input) setOpenSuggest(root, input.getAttribute('data-search-input'));
  });

  root.addEventListener('submit', (e) => {
    if (e.target.closest('[data-search-form]')) {
      e.preventDefault();
      setOpenSuggest(root, null);
      const { path } = resolveSearchNavigation(state.search);
      navigate(path);
      return;
    }
    const news = e.target.closest('[data-news-form]');
    if (news) {
      e.preventDefault();
      const input = news.querySelector('input');
      if (input.value.includes('@')) alert(t('footer_newsletter_success'));
      else alert(t('footer_newsletter_invalid'));
      input.value = '';
    }
  });

  root.addEventListener('click', (e) => {
    const pickBtn = e.target.closest('[data-suggest-pick]');
    if (pickBtn) {
      const field = pickBtn.getAttribute('data-suggest-pick');
      const suggestion = suggestionsFor(field)[Number(pickBtn.getAttribute('data-index'))];
      if (suggestion) pickSuggestion(root, field, suggestion);
      return;
    }
    const next = e.target.closest('[data-scroll-track]');
    if (next) {
      const track = root.querySelector(`[data-track="${next.getAttribute('data-scroll-track')}"]`);
      track?.scrollBy({ left: 260, behavior: 'smooth' });
      return;
    }
    const link = e.target.closest('[data-href]');
    if (link) navigate(link.getAttribute('data-href'));
  });

  root.addEventListener('keydown', (e) => {
    const input = e.target.closest('[data-search-input="destination"], [data-search-input="activity"]');
    if (input && e.key === 'Escape') {
      setOpenSuggest(root, null);
      return;
    }
    const link = e.target.closest('article[data-href]');
    if (link && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      navigate(link.getAttribute('data-href'));
    }
  });
};

window.scrollTo(0, 0);
mountPage({ route: '/', render, bind });
