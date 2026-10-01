import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href, navigate, params } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { responsiveImage, openBottomSheet, openLightbox, mobileBookingBar } from '../core/ui.js';
import { STAY_PLACE_FILTERS, STAY_TYPES, filterStays } from '../data/stays.js';

const view = params().get('view') || '';
const typeFromPath = view.includes('guesthouse') ? 'guesthouse' : view.includes('hotel') ? 'hotel' : null;
const route = typeFromPath === 'guesthouse' ? '/guesthouses' : typeFromPath === 'hotel' ? '/hotels' : '/stays';

const readFilters = () => {
  const sp = params();
  const typeParam = sp.get('type') || typeFromPath || 'all';
  const placeParam = sp.get('place') || 'all';
  const type =
    typeParam === 'hotels'
      ? 'hotel'
      : typeParam === 'guesthouses'
        ? 'guesthouse'
        : typeParam === 'hotel' || typeParam === 'guesthouse' || typeParam === 'all'
          ? typeParam
          : 'all';
  const place = STAY_PLACE_FILTERS.some((p) => p.key === placeParam) ? placeParam : 'all';
  return { type, place };
};

const state = { ...readFilters(), selectedId: null };
let sheet = null;
let page = null;

const filtered = () => filterStays({ type: state.type, place: state.place });
const getSelected = () => filtered().find((s) => s.id === state.selectedId) || null;

const priceText = (stay) =>
  stay.pricePerPerson
    ? `${stay.price.toLocaleString()} DA ${t('per_person')}`
    : `${t('acts_from')} ${stay.price.toLocaleString()} DA`;

const typeLabel = (stay) => (stay.type === 'hotel' ? t('stays_type_hotel') : t('stays_type_guesthouse'));

const whatsapp = (stay) => {
  const name = pick(stay.name, stay.name_en, stay.name_ar);
  const msg = encodeURIComponent(
    `Bonjour, je souhaite réserver : ${name} (${pick(stay.location, stay.location_en, stay.location_ar)})`
  );
  window.open(`https://wa.me/213557664089?text=${msg}`, '_blank', 'noopener,noreferrer');
};

const cardHtml = (stay, i) => `
  <article class="acts-card stays-card ${state.selectedId === stay.id ? 'is-open' : ''}" data-reveal data-delay="${
    i * 50
  }" data-stay="${esc(stay.id)}" role="button" tabindex="0">
    <img src="${esc(asset(stay.image))}" alt="" loading="lazy" />
    <div class="acts-card__body">
      <span class="stays-card__type">${esc(typeLabel(stay))}</span>
      <h3>${esc(pick(stay.name, stay.name_en, stay.name_ar))}</h3>
      <p class="acts-card__tags">
        ${icon('MapPin', 13)} ${esc(pick(stay.location, stay.location_en, stay.location_ar))}
      </p>
      <div class="acts-card__meta">
        <span>
          ${icon('Star', 13)} ${esc(stay.rating)}${stay.reviews ? esc(` · ${stay.reviews}`) : ''}
        </span>
        <span class="acts-card__price">${esc(priceText(stay))}</span>
      </div>
    </div>
  </article>`;

const sheetHtml = (selected) => {
  const amenities = pick(selected.amenities.fr, selected.amenities.en, selected.amenities.ar) || [];
  return `
    <div class="stays-detail__media">
      <img src="${esc(asset(selected.image))}" alt="" />
    </div>
    <div class="stays-detail__body">
      <span class="stays-card__type">${esc(typeLabel(selected))}</span>
      <h2>${esc(pick(selected.name, selected.name_en, selected.name_ar))}</h2>
      <p class="stays-detail__loc">
        ${icon('MapPin', 16)} ${esc(pick(selected.location, selected.location_en, selected.location_ar))}
      </p>
      <p class="stays-detail__desc">${esc(pick(selected.desc, selected.desc_en, selected.desc_ar))}</p>
      <div class="stays-detail__meta">
        <span>
          ${icon('Star', 14)} ${esc(selected.rating)}${
            selected.reviews ? esc(` · ${selected.reviews} ${t('place_reviews')}`) : ''
          }
        </span>
        <strong>${esc(priceText(selected))}</strong>
      </div>
      <h3>${esc(t('stays_amenities'))}</h3>
      <ul class="stays-detail__amenities">
        ${amenities.map((a) => `<li>${icon('Check', 14)} ${esc(a)}</li>`).join('')}
      </ul>
      ${
        selected.gallery?.length > 1
          ? `
      <h3>${esc(t('stays_gallery'))}</h3>
      <div class="stays-detail__gallery clickable-gallery">
        ${selected.gallery
          .map(
            (src, i) => `
          <button type="button" data-gallery-idx="${i}" aria-label="${esc(`${t('stays_gallery')} ${i + 1}`)}">
            <img src="${esc(asset(src))}" alt="" loading="lazy" />
          </button>`
          )
          .join('')}
      </div>`
          : ''
      }
      <div class="stays-detail__actions stays-detail__actions--desktop">
        <button type="button" class="premium-btn premium-btn--primary" data-wa>
          ${icon('MessageCircle', 16)} ${esc(t('stays_book_wa'))}
        </button>
        <button type="button" class="premium-btn premium-btn--ghost" data-contact>
          ${esc(t('stays_contact'))}
        </button>
      </div>
    </div>`;
};

const barHtml = (selected) =>
  mobileBookingBar({
    priceLabel: selected.pricePerPerson ? t('home_v2_coup_per_person') : t('acts_from'),
    price: `${selected.price.toLocaleString()} DA`,
    ctaLabel: t('stays_book_wa'),
    ctaIcon: 'MessageCircle',
    className: 'stays-mobile-bar',
  });

const render = () => {
  const items = filtered();
  const selected = getSelected();
  const heroTitle =
    state.type === 'hotel'
      ? t('stays_hero_hotels')
      : state.type === 'guesthouse'
        ? t('stays_hero_guesthouses')
        : t('stays_hero_all');
  const heroSrc = state.type === 'guesthouse' ? '/images/maison-hote-sud-1.png' : '/images/home/acc-hotel.jpg';

  return `
  <div class="acts-page stays-page${selected ? ' has-mobile-bar' : ''}" data-stays-page>
    ${navbar()}

    <section class="acts-hero">
      ${responsiveImage({ className: 'acts-hero__bg', src: heroSrc, alt: '', priority: true, sizes: '100vw' })}
      <div class="acts-hero__overlay"></div>
      <div class="acts-hero__inner" data-reveal="fade">
        <nav class="acts-breadcrumb" aria-label="Breadcrumb">
          <a href="${href('/')}">${esc(t('nav_home'))}</a>
          <span>/</span>
          <span>${esc(t('stays_nav'))}</span>
        </nav>
        <h1 class="acts-hero__title">
          ${esc(heroTitle)}
          <em> ${esc(t('stays_hero_em'))}</em>
        </h1>
        <p class="acts-hero__subtitle">${esc(t('stays_hero_subtitle'))}</p>
      </div>
    </section>

    <div class="acts-filters-wrap filter-pills-wrap is-scrollable" data-reveal>
      <div class="acts-filters filter-pills" role="tablist" aria-label="${esc(t('stays_type_label'))}">
        ${STAY_TYPES.map(
          (f) => `
          <button type="button" role="tab" aria-selected="${state.type === f.key}" class="acts-filters__btn ${
            state.type === f.key ? 'is-active' : ''
          }" data-type="${esc(f.key)}">
            ${icon(f.icon, 18, { strokeWidth: 1.75 })}
            <span>${esc(pick(f.fr, f.en, f.ar))}</span>
          </button>`
        ).join('')}
      </div>
    </div>

    <div class="stays-places acts-container" data-reveal>
      <p class="stays-places__label">${esc(t('stays_place_label'))}</p>
      <div class="filter-pills-wrap is-scrollable">
        <div class="stays-places__list filter-pills" role="tablist">
          ${STAY_PLACE_FILTERS.map(
            (p) => `
            <button type="button" role="tab" aria-selected="${state.place === p.key}" class="stays-places__btn ${
              state.place === p.key ? 'is-active' : ''
            }" data-place="${esc(p.key)}">${esc(pick(p.fr, p.en, p.ar))}</button>`
          ).join('')}
        </div>
      </div>
    </div>

    <section class="acts-grid-section" id="stays-grid">
      <div class="acts-container">
        <p class="stays-count" data-reveal>${items.length} ${esc(t('stays_count'))}</p>
        ${
          items.length === 0
            ? `<p class="stays-empty" data-reveal>${esc(t('stays_empty'))}</p>`
            : `<div class="acts-grid">${items.map(cardHtml).join('')}</div>`
        }
      </div>
    </section>

    ${footer()}
  </div>`;
};

/* Feuille de détail, barre mobile et état "is-open" des cartes */
const syncSelection = (root) => {
  const selected = getSelected();
  if (!selected) state.selectedId = null;

  root.querySelector('[data-stays-page]')?.classList.toggle('has-mobile-bar', !!selected);
  root.querySelectorAll('[data-stay]').forEach((card) => {
    card.classList.toggle('is-open', card.getAttribute('data-stay') === state.selectedId);
  });

  root.querySelector('.stays-mobile-bar')?.remove();
  if (selected) root.querySelector('.site-footer')?.insertAdjacentHTML('beforebegin', barHtml(selected));

  const label = selected ? pick(selected.name, selected.name_en, selected.name_ar) : '';
  if (selected && !sheet) {
    sheet = openBottomSheet({
      content: sheetHtml(selected),
      className: 'stays-detail bottom-sheet',
      panelClassName: 'stays-detail__panel',
      ariaLabel: label,
      onClose: () => {
        if (!sheet) return;
        sheet = null;
        state.selectedId = null;
        syncSelection(root);
      },
    });
    sheet.panel.addEventListener('click', (e) => {
      const current = getSelected();
      if (!current) return;
      const galleryBtn = e.target.closest('[data-gallery-idx]');
      if (galleryBtn) {
        openLightbox(current.gallery, Number(galleryBtn.getAttribute('data-gallery-idx')));
        return;
      }
      if (e.target.closest('[data-wa]')) {
        whatsapp(current);
        return;
      }
      if (e.target.closest('[data-contact]')) navigate('/contact');
    });
  } else if (selected && sheet) {
    sheet.setContent(sheetHtml(selected));
    sheet.panel.setAttribute('aria-label', label);
  } else if (!selected && sheet) {
    const s = sheet;
    sheet = null;
    s.close();
  }
};

const updateUrl = (key, value) => {
  const next = params();
  if (value === 'all') next.delete(key);
  else next.set(key, value);
  const search = next.toString();
  window.history.pushState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`);
};

const applyFilters = () => {
  const prev = { type: state.type, place: state.place };
  Object.assign(state, readFilters());
  state.selectedId = null;
  page.rerender();
  if (prev.type !== state.type || prev.place !== state.place) window.scrollTo(0, 0);
};

const toggleStay = (root, id) => {
  state.selectedId = state.selectedId === id ? null : id;
  syncSelection(root);
};

const bind = (root) => {
  root.addEventListener('click', (e) => {
    const typeBtn = e.target.closest('[data-type]');
    if (typeBtn) {
      const key = typeBtn.getAttribute('data-type');
      updateUrl('type', key === 'hotel' ? 'hotels' : key === 'guesthouse' ? 'guesthouses' : key);
      applyFilters();
      return;
    }
    const placeBtn = e.target.closest('[data-place]');
    if (placeBtn) {
      updateUrl('place', placeBtn.getAttribute('data-place'));
      applyFilters();
      return;
    }
    if (e.target.closest('.stays-mobile-bar .mobile-booking-bar__btn')) {
      const selected = getSelected();
      if (selected) whatsapp(selected);
      return;
    }
    const card = e.target.closest('[data-stay]');
    if (card) toggleStay(root, card.getAttribute('data-stay'));
  });

  root.addEventListener('keydown', (e) => {
    const card = e.target.closest('[data-stay]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleStay(root, card.getAttribute('data-stay'));
    }
  });

  window.addEventListener('popstate', applyFilters);
};

page = mountPage({ route, render, bind, afterRender: syncSelection });
window.scrollTo(0, 0);
