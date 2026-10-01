import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href, navigate, params } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../data/activities.js';

const id = params().get('id');
const activity = ACTIVITIES.find((a) => a.id === id) || null;

const state = { activeImage: 0, tab: 'overview', date: '', people: 2 };

const gallery = () => (activity.gallery?.length ? activity.gallery : [activity.image]);

const tabs = () => [
  { key: 'overview', label: t('act_page_tab_overview') },
  { key: 'history', label: t('act_page_tab_history') },
  { key: 'visit', label: t('act_page_tab_visit') },
];

const thumbsHtml = () =>
  gallery()
    .map(
      (src, i) => `
      <button type="button" class="${i === state.activeImage ? 'is-active' : ''}" data-thumb="${i}">
        <img src="${esc(asset(src))}" alt="" />
      </button>`
    )
    .join('');

const tabsHtml = () =>
  tabs()
    .map(
      (item) =>
        `<button type="button" class="${state.tab === item.key ? 'is-active' : ''}" data-tab="${item.key}">${esc(
          item.label
        )}</button>`
    )
    .join('');

const fact = (iconName, labelKey, value) => `
  <div>
    ${icon(iconName, 18)}
    <div>
      <span>${esc(t(labelKey))}</span>
      <strong>${esc(value)}</strong>
    </div>
  </div>`;

const panelHtml = () => {
  if (state.tab === 'overview') {
    const included = pick(activity.included, activity.included_en, activity.included_ar) || [];
    return `
      <h2>${esc(t('act_page_experience'))}</h2>
      <p>${esc(pick(activity.fullDesc, activity.fullDesc_en, activity.fullDesc_ar))}</p>
      <h3>${esc(t('act_modal_included'))}</h3>
      <ul class="act-page-included">
        ${included.map((item) => `<li>${icon('Check', 16)} ${esc(item)}</li>`).join('')}
      </ul>`;
  }
  if (state.tab === 'history') {
    return `
      <h2>${esc(t('act_page_tab_history'))}</h2>
      <p class="act-page-history">${esc(pick(activity.history, activity.history_en, activity.history_ar))}</p>`;
  }
  return `
    <h2>${esc(t('act_page_tab_visit'))}</h2>
    <p>${esc(pick(activity.visit, activity.visit_en, activity.visit_ar))}</p>
    <div class="act-page-facts">
      ${fact('Calendar', 'act_modal_season', pick(activity.dates, activity.dates_en, activity.dates_ar))}
      ${fact('Users', 'act_modal_group', pick(activity.group, activity.group_en, activity.group_ar))}
      ${fact('MapPin', 'act_modal_location', pick(activity.location, activity.location_en, activity.location_ar))}
    </div>`;
};

const renderLoading = () => `
  ${navbar()}
  <div class="act-page-loading">${esc(t('loader_text') || '…')}</div>
  ${footer()}`;

const render = () => {
  if (!activity) return renderLoading();

  const cat = ACTIVITY_CATEGORIES[activity.category];
  const current = gallery()[state.activeImage];
  const others = ACTIVITIES.filter((a) => a.id !== activity.id).slice(0, 3);

  return `
  <div class="act-page">
    ${navbar()}

    <section class="act-page-hero">
      <img src="${esc(asset(current))}" alt="" class="act-page-hero__bg" data-hero-img />
      <div class="act-page-hero__overlay"></div>
      <div class="act-page-hero__content" data-reveal="fade">
        <a href="${href('/activities')}" class="act-page-back">
          ${icon('ChevronLeft', 18)} ${esc(t('act_page_back'))}
        </a>
        ${cat ? `<span class="act-page-badge">${esc(pick(cat.fr, cat.en, cat.ar))}</span>` : ''}
        <h1>${esc(pick(activity.name, activity.name_en, activity.name_ar))}</h1>
        <p>${esc(pick(activity.desc, activity.desc_en, activity.desc_ar))}</p>
        <div class="act-page-hero__meta">
          <span>${icon('Star', 14)} ${esc(activity.rating)}</span>
          <span>${icon('MapPin', 14)} ${esc(pick(activity.location, activity.location_en, activity.location_ar))}</span>
          <span>${icon('Clock', 14)} ${esc(pick(activity.duration, activity.duration_en, activity.duration_ar))}</span>
        </div>
      </div>
    </section>

    <div class="act-page-body">
      <div class="act-page-main" data-reveal="left">
        <div class="act-page-gallery">
          <div class="act-page-gallery__main">
            <img src="${esc(asset(current))}" alt="" data-main-img />
          </div>
          <div class="act-page-gallery__thumbs" data-thumbs>${thumbsHtml()}</div>
        </div>

        <div class="act-page-tabs" data-tabs>${tabsHtml()}</div>

        <div class="act-page-panel" data-panel>${panelHtml()}</div>

        ${
          others.length > 0
            ? `
        <div class="act-page-related">
          <h2 data-reveal>${esc(t('act_page_other'))}</h2>
          <div class="act-page-related__grid">
            ${others
              .map(
                (a, i) => `
              <button type="button" class="act-page-related__card" data-reveal data-delay="${i * 60}" data-href="${esc(
                  `/activity/${a.id}`
                )}">
                <img src="${esc(asset(a.image))}" alt="" />
                <span>${esc(pick(a.name, a.name_en, a.name_ar))}</span>
              </button>`
              )
              .join('')}
          </div>
        </div>`
            : ''
        }
      </div>

      <aside class="act-page-aside" data-reveal="right">
        <div class="act-page-book">
          <div class="act-page-book__price">
            <span>${esc(t('act_modal_from'))}</span>
            <strong>${esc(activity.price.toLocaleString())} <small>DA</small></strong>
            <em>${esc(t('act_modal_per_person'))}</em>
          </div>
          <form data-book-form>
            <label>
              ${esc(t('act_modal_choose_date'))}
              <input type="date" value="${esc(state.date)}" required data-date />
            </label>
            <label>
              ${esc(t('act_modal_people'))}
              <select data-people>
                ${[1, 2, 3, 4, 5, 6, 7, 8]
                  .map((n) => `<option value="${n}"${n === state.people ? ' selected' : ''}>${n}</option>`)
                  .join('')}
              </select>
            </label>
            <button type="submit" class="act-page-book__btn">${esc(t('btn_reserver'))}</button>
          </form>
          <a href="${href('/contact')}" class="act-page-book__link">
            ${esc(t('act_modal_contact'))} ${icon('ArrowRight', 14)}
          </a>
        </div>
      </aside>
    </div>

    ${footer()}
  </div>`;
};

const setActiveImage = (root, i) => {
  state.activeImage = i;
  const src = asset(gallery()[i]);
  root.querySelector('[data-hero-img]').src = src;
  root.querySelector('[data-main-img]').src = src;
  root.querySelector('[data-thumbs]').innerHTML = thumbsHtml();
};

const bind = (root) => {
  if (!activity) return;

  root.addEventListener('click', (e) => {
    const thumb = e.target.closest('[data-thumb]');
    if (thumb) {
      setActiveImage(root, Number(thumb.getAttribute('data-thumb')));
      return;
    }
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      state.tab = tabBtn.getAttribute('data-tab');
      root.querySelector('[data-tabs]').innerHTML = tabsHtml();
      root.querySelector('[data-panel]').innerHTML = panelHtml();
      return;
    }
    const link = e.target.closest('[data-href]');
    if (link) navigate(link.getAttribute('data-href'));
  });

  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-date]')) state.date = e.target.value;
  });

  root.addEventListener('change', (e) => {
    if (e.target.matches('[data-date]')) state.date = e.target.value;
    if (e.target.matches('[data-people]')) state.people = Number(e.target.value);
  });

  root.addEventListener('submit', (e) => {
    if (!e.target.matches('[data-book-form]')) return;
    e.preventDefault();
    if (!state.date) {
      alert(t('act_modal_date_required'));
      return;
    }
    alert(
      `${t('act_modal_booked')}\n${pick(activity.name, activity.name_en, activity.name_ar)}\n${state.date} — ${
        state.people
      } ${t('act_modal_people')}`
    );
  });
};

mountPage({ route: `/activity/${id ?? ''}`, render, bind });

if (!activity) navigate('/activities');
else window.scrollTo(0, 0);
