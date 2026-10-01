import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href, navigate, params } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { searchCatalog } from '../data/search.js';

const readQuery = () => {
  const p = params();
  return {
    q: p.get('q') || '',
    activity: p.get('activity') || '',
    dates: p.get('dates') || '',
    travelers: p.get('travelers') || '',
  };
};

const priceLabel = (item) =>
  item.priceOnRequest ? t('place_on_request') : `${t('acts_from')} ${item.price.toLocaleString()} DA`;

const cardHtml = (route, image, name, sub, price, i) => `
  <button type="button" class="search-card" data-reveal data-delay="${i * 60}" data-href="${esc(route)}">
    <img src="${esc(asset(image))}" alt="" loading="lazy" />
    <div>
      <strong>${esc(name)}</strong>
      <span>${esc(sub)}</span>
      <em>${esc(price)}</em>
    </div>
  </button>`;

const blockHtml = (titleKey, items, card) =>
  items.length > 0
    ? `<div class="search-block">
        <h2 data-reveal>${esc(t(titleKey))} <em>(${items.length})</em></h2>
        <div class="search-grid">${items.map(card).join('')}</div>
      </div>`
    : '';

const render = () => {
  const { q, activity, dates, travelers } = readQuery();
  const results = searchCatalog({ destination: q, activity });
  const places = results.filter((r) => r.type === 'place');
  const activities = results.filter((r) => r.type === 'activity');
  const tours = results.filter((r) => r.type === 'tour');
  const hasQuery = Boolean(q || activity);
  const empty = hasQuery && results.length === 0;

  const placeRoute = (path) => {
    const p = new URLSearchParams();
    if (dates) p.set('dates', dates);
    if (travelers) p.set('travelers', travelers);
    const qs = p.toString();
    return qs ? `${path}?${qs}` : path;
  };

  const body = empty
    ? `<div class="search-empty" data-reveal>
        ${icon('Search', 36)}
        <h2>${esc(t('search_empty_title'))}</h2>
        <p>${esc(t('search_empty_text'))}</p>
        <div class="search-empty__actions">
          <button type="button" data-href="/destinations">${esc(t('nav_destinations'))}</button>
          <button type="button" data-href="/activities">${esc(t('nav_activities'))}</button>
        </div>
      </div>`
    : `
      ${blockHtml('search_places', places, ({ item, path }, i) =>
        cardHtml(
          placeRoute(path),
          item.image,
          pick(item.name, item.name_en, item.name_ar),
          pick(item.tagline, item.tagline_en, item.tagline_ar),
          priceLabel(item),
          i
        )
      )}
      ${blockHtml('search_activities', activities, ({ item, path }, i) =>
        cardHtml(
          path,
          item.image,
          pick(item.name, item.name_en, item.name_ar),
          pick(item.desc, item.desc_en, item.desc_ar),
          `${t('acts_from')} ${item.price.toLocaleString()} DA`,
          i
        )
      )}
      ${blockHtml('search_tours', tours, ({ item, path }, i) =>
        cardHtml(
          path,
          item.image,
          pick(item.name, item.name_en, item.name_ar),
          pick(
            item.subtitle || item.location,
            item.subtitle_en || item.location_en,
            item.subtitle_ar || item.location_ar
          ),
          priceLabel(item),
          i
        )
      )}
      ${
        !hasQuery
          ? `<div class="search-empty search-empty--soft" data-reveal>
              <p>${esc(t('search_all_hint'))}</p>
              <div class="search-empty__actions">
                <button type="button" data-href="/">${esc(t('home_search_btn'))}</button>
              </div>
            </div>`
          : ''
      }`;

  return `
  <div class="acts-page search-page">
    ${navbar()}

    <section class="search-hero">
      <div class="acts-container" data-reveal="fade">
        <nav class="acts-breadcrumb" aria-label="Breadcrumb">
          <a href="${href('/')}">${esc(t('nav_home'))}</a>
          <span>/</span>
          <span>${esc(t('search_title'))}</span>
        </nav>
        <h1>${esc(t('search_title'))}</h1>
        <p class="search-hero__lead">${esc(
          hasQuery ? t('search_for').replace('{q}', [q, activity].filter(Boolean).join(' · ')) : t('search_all_hint')
        )}</p>
        ${
          dates || travelers
            ? `<div class="search-hero__meta">
                ${dates ? `<span>${icon('Calendar', 14)} ${esc(dates)}</span>` : ''}
                ${
                  travelers
                    ? `<span>${icon('Users', 14)} ${esc(travelers)} ${esc(
                        Number(travelers) > 1 ? t('people') : t('person')
                      )}</span>`
                    : ''
                }
              </div>`
            : ''
        }
      </div>
    </section>

    <section class="acts-container search-body">${body}</section>

    ${footer()}
  </div>`;
};

const bind = (root) => {
  root.addEventListener('click', (e) => {
    const link = e.target.closest('[data-href]');
    if (link) navigate(link.getAttribute('data-href'));
  });
};

const page = mountPage({ route: '/search', render, bind });

window.addEventListener('popstate', () => page.rerender());
