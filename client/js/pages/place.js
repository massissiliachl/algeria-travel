import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href, navigate, params } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { openLightbox, openBottomSheet, mobileBookingBar, responsiveImage } from '../core/ui.js';
import { getPlaceById, getPlaces } from '../data/places.js';
import { TAGHIT_PACKAGES, TAGHIT_PLACE_PKGS } from '../data/taghitPackages.js';
import { ACTIVITY_CATEGORIES, getActivitiesForPlace } from '../data/activities.js';

const TRUST_ITEMS = [
  { icon: 'CreditCard', key: 'place_trust_pay' },
  { icon: 'Zap', key: 'place_trust_confirm' },
  { icon: 'Headphones', key: 'place_trust_support' },
];

const searchParams = params();
const id = searchParams.get('id');
const pkgParam = searchParams.get('pkg');
const taghitPkg = pkgParam === 'brezina' ? 'brezina' : 'hotel';
const place = getPlaceById(id, id === 'taghit' ? taghitPkg : pkgParam);
const placeActivities = place ? getActivitiesForPlace(place.id) : [];

const emptyForm = () => ({
  name: '',
  email: '',
  phone: '',
  date: '',
  travelers: '2',
  stay: '',
  message: '',
});

const state = {
  sent: false,
  sheet: null,
  form: {
    ...emptyForm(),
    date: searchParams.get('dates') || '',
    travelers: searchParams.get('travelers') || '2',
    stay:
      id === 'taghit'
        ? pkgParam === 'brezina'
          ? 'brezina'
          : pkgParam === 'guesthouse'
            ? 'guesthouse'
            : 'hotel'
        : '',
  },
};

/* ── Valeurs dérivées (dépendent de la langue) ── */

const derive = () => {
  const isPerPerson = place.id === 'taghit' || place.pricePerPerson;
  const priceOnRequest = Boolean(place.priceOnRequest) || place.price == null;
  const priceLabel = priceOnRequest
    ? t('place_on_request')
    : isPerPerson
      ? t('home_v2_coup_per_person')
      : t('acts_from');
  const priceDisplay = priceOnRequest ? t('place_on_request') : `${Number(place.price).toLocaleString()} DA`;
  const placeName = pick(place.name, place.name_en, place.name_ar);
  const whyItems = place.whyVisit?.length ? place.whyVisit : place.highlights || [];
  const gallery = place.gallery?.length ? place.gallery : [place.image];
  const region = pick(
    place.region || `${placeName}, Algérie`,
    place.region_en || `${placeName}, Algeria`,
    place.region_ar || `${placeName}، الجزائر`
  );
  const weather = pick(place.weather || 'Ensoleillé', place.weather_en || 'Sunny', place.weather_ar || 'مشمس');
  const duration = pick(
    place.recommendedDuration || place.duration,
    place.recommendedDuration_en || place.duration_en,
    place.recommendedDuration_ar || place.duration_ar
  );
  const difficulty = pick(
    place.difficulty || 'Facile à modérée',
    place.difficulty_en || 'Easy to moderate',
    place.difficulty_ar || 'سهل إلى متوسط'
  );
  const audience = pick(
    place.audience || 'En couple, famille, amis',
    place.audience_en || 'Couples, families, friends',
    place.audience_ar || 'أزواج، عائلات، أصدقاء'
  );
  const offerDates = place.dates
    ? pick(place.dates, place.dates_en, place.dates_ar)
    : pick(place.bestTime, place.bestTime_en, place.bestTime_ar);
  const quickFacts = [
    { icon: 'MapPin', label: t('place_fact_location'), value: region },
    { icon: 'Clock', label: t('place_fact_duration'), value: duration },
    { icon: 'Activity', label: t('place_fact_difficulty'), value: difficulty },
    { icon: 'Users', label: t('place_fact_travelers'), value: audience },
  ];
  return {
    isPerPerson,
    priceOnRequest,
    priceLabel,
    priceDisplay,
    placeName,
    whyItems,
    gallery,
    weather,
    offerDates,
    quickFacts,
  };
};

const whatsappHref = place?.whatsapp
  ? `https://wa.me/${place.whatsapp}?text=${encodeURIComponent(
      `Bonjour, je souhaite réserver : ${place.pkgTitle || place.name} — ${place.name}${
        place.dates ? ` (${place.dates})` : ''
      }`
    )}`
  : null;

/* ── Sections ── */

const pkgSwitchHtml = () => {
  if (id !== 'taghit') return '';
  return `
    <div class="place-pkg-switch acts-container" data-reveal>
      <p class="place-pkg-switch__label">${esc(t('place_pkg_switch'))}</p>
      <div class="place-pkg-switch__list" role="tablist">
        ${TAGHIT_PLACE_PKGS.map((key) => {
          const pkg = TAGHIT_PACKAGES[key];
          const active = (place.activePkg || 'hotel') === key;
          return `
          <button type="button" role="tab" aria-selected="${active}" class="place-pkg-switch__btn${
            active ? ' is-active' : ''
          }" data-href="${esc(`/place/taghit?pkg=${key}`)}">
            ${icon(pkg.icon, 16)}
            <span>${esc(pick(pkg.title, pkg.title_en, pkg.title_ar))}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
};

const bookbarHtml = (d) => `
  <section class="place-bookbar acts-container" data-reveal>
    <div class="place-bookbar__inner">
      <div class="place-bookbar__left">
        ${
          place.pkgTitle
            ? `<p class="place-bookbar__pkg">${icon(place.pkgIcon || 'Hotel', 16)}${esc(t('place_offer'))} <strong>${esc(
                pick(place.pkgTitle, place.pkgTitle_en, place.pkgTitle_ar)
              )}</strong></p>`
            : ''
        }
        <div class="place-bookbar__price">
          <strong>${esc(d.priceDisplay)}${
            !d.priceOnRequest ? `<small>${d.isPerPerson ? esc(` ${t('per_person')}`) : ''}</small>` : ''
          }</strong>
          ${!d.priceOnRequest && place.oldPrice ? `<s>${esc(place.oldPrice.toLocaleString())} DA</s>` : ''}
          ${
            !d.priceOnRequest
              ? `<em class="place-bookbar__badge">${icon('BadgePercent', 14)} ${esc(t('place_best_price'))}</em>`
              : ''
          }
        </div>
        <ul class="place-bookbar__trust">
          ${TRUST_ITEMS.map(
            (item) => `
            <li>
              <span class="place-bookbar__trust-icon" aria-hidden="true">${icon(item.icon, 16)}</span>${esc(t(item.key))}
            </li>`
          ).join('')}
        </ul>
      </div>
      <div class="place-bookbar__right">
        <div class="place-bookbar__period">
          ${icon('Calendar', 18)}
          <div>
            <span>${esc(t('place_dates'))}</span>
            <strong>${esc(d.offerDates)}</strong>
          </div>
        </div>
        ${
          whatsappHref
            ? `<a class="place-bookbar__cta" href="${esc(whatsappHref)}" target="_blank" rel="noopener noreferrer">${esc(
                t('place_whatsapp_book')
              )} ${icon('ArrowRight', 16)}</a>`
            : `<button type="button" class="place-bookbar__cta" data-book>${esc(t('place_book'))} ${icon('ArrowRight', 16)}</button>`
        }
      </div>
    </div>
  </section>`;

const whyHtml = (d) => `
  <div class="place-why" data-reveal>
    <div class="place-why__copy">
      <h2>${esc(t('place_why'))} <em>${esc(d.placeName)}</em> ?</h2>
      <p>${esc(pick(place.description, place.description_en, place.description_ar))}</p>
      <ul class="place-why__list">
        ${d.whyItems
          .map(
            (item, i) => `
          <li data-reveal data-delay="${i * 60}">
            <span class="place-why__icon" aria-hidden="true">${icon(item.icon || 'Check', 18, { strokeWidth: 1.5 })}</span>
            <span>${esc(pick(item.fr, item.en, item.ar))}</span>
          </li>`
          )
          .join('')}
      </ul>
    </div>
    <div class="place-why__gallery">
      <button type="button" class="place-why__shot place-why__shot--main" data-shot="0" aria-label="${esc(t('place_gallery_see'))}">
        <img src="${esc(asset(d.gallery[0]))}" alt="" loading="lazy" />
        <span class="place-why__gallery-btn">${esc(t('place_gallery_see'))} (${d.gallery.length})</span>
      </button>
      ${
        d.gallery[1]
          ? `<button type="button" class="place-why__shot" data-shot="1"><img src="${esc(asset(d.gallery[1]))}" alt="" loading="lazy" /></button>`
          : ''
      }
      ${
        d.gallery[2]
          ? `<button type="button" class="place-why__shot" data-shot="2"><img src="${esc(asset(d.gallery[2]))}" alt="" loading="lazy" /></button>`
          : ''
      }
    </div>
  </div>`;

const overviewHtml = () =>
  place.overview
    ? `
  <div class="place-overview" data-reveal>
    <h2>${esc(pick(place.overview.title, place.overview.title_en))}</h2>
    ${(pick(place.overview.text, place.overview.text_en) || []).map((line) => `<p>${esc(line)}</p>`).join('')}
  </div>`
    : '';

const storiesHtml = () =>
  place.stories?.length > 0
    ? `
  <div class="place-stories" data-reveal>
    ${place.stories
      .map(
        (story) => `
      <article class="place-story">
        <p class="place-story__eyebrow">${icon(story.icon || 'MapPin', 14)}${esc(pick(story.eyebrow, story.eyebrow_en))}</p>
        <h3>${esc(pick(story.title, story.title_en))}</h3>
        <p>${esc(pick(story.text, story.text_en))}</p>
      </article>`
      )
      .join('')}
  </div>`
    : '';

const factsHtml = (d) =>
  place.facts?.length > 0
    ? `
  <div class="place-facts-block" data-reveal>
    <h2>${esc(t('place_facts_title'))}</h2>
    <div class="place-facts">
      ${place.facts
        .map(
          (fact) => `
        <article class="place-facts__item">
          ${icon(fact.icon, 20)}
          <div>
            <strong>${esc(pick(fact.label, fact.label_en))}</strong>
            <span>${esc(pick(fact.value, fact.value_en))}</span>
          </div>
        </article>`
        )
        .join('')}
    </div>
  </div>`
    : `
  <div class="place-quick" data-reveal>
    ${d.quickFacts
      .map(
        (fact) => `
      <article class="place-quick__item">
        ${icon(fact.icon, 20)}
        <div>
          <strong>${esc(fact.label)}</strong>
          <span>${esc(fact.value)}</span>
        </div>
        ${icon('ChevronRight', 16, { className: 'place-quick__chevron' })}
      </article>`
      )
      .join('')}
  </div>`;

const itineraryHtml = () =>
  place.itinerary?.length > 0
    ? `
  <div class="place-itinerary-block" data-reveal>
    <h2>${esc(t('place_itinerary'))}</h2>
    <ol class="place-itinerary">
      ${place.itinerary
        .map(
          (day) => `
        <li class="place-itinerary__day">
          <span class="place-itinerary__num" aria-hidden="true">${esc(day.day)}</span>
          <div>
            <p class="place-itinerary__label">${esc(t('place_itinerary_day'))} ${esc(day.day)}</p>
            <h3>${esc(pick(day.title, day.title_en))}</h3>
            <ul>${day.steps.map(([fr, en]) => `<li>${esc(pick(fr, en))}</li>`).join('')}</ul>
          </div>
        </li>`
        )
        .join('')}
    </ol>
    ${
      place.itineraryNote
        ? `<p class="place-note">${icon('Compass', 16)}${esc(pick(place.itineraryNote, place.itineraryNote_en))}</p>`
        : ''
    }
  </div>`
    : '';

const cuisineHtml = () =>
  place.cuisine
    ? `
  <div class="place-cuisine-block" data-reveal>
    <h2>${esc(t('place_cuisine'))}</h2>
    <div class="place-cuisine">
      <article class="place-cuisine__card">
        <h3>${esc(t('place_cuisine_breakfast'))}</h3>
        <p>${esc(pick(place.cuisine.breakfast, place.cuisine.breakfast_en))}</p>
        <ul class="place-cuisine__tags">
          ${place.cuisine.breakfastItems.map(([fr, en]) => `<li>${esc(pick(fr, en))}</li>`).join('')}
        </ul>
      </article>
      <article class="place-cuisine__card">
        <h3>${esc(t('place_cuisine_meals'))}</h3>
        <p>${esc(pick(place.cuisine.meals, place.cuisine.meals_en))}</p>
      </article>
      <article class="place-cuisine__card place-cuisine__card--bonus">
        <h3>${esc(t('place_cuisine_bonus'))}</h3>
        <p>${esc(pick(place.cuisine.bonus, place.cuisine.bonus_en))}</p>
      </article>
    </div>
  </div>`
    : '';

const includesHtml = () =>
  place.includes?.length > 0
    ? `
  <div class="place-includes-block" data-reveal>
    <div class="place-includes-block__head">
      ${
        place.pkgTitle
          ? `<span class="place-includes-block__badge">${icon(place.pkgIcon || 'Hotel', 14)}${esc(
              pick(place.pkgTitle, place.pkgTitle_en, place.pkgTitle_ar)
            )}</span>`
          : ''
      }
      <h2>${esc(t(place.includesTitleKey || 'place_includes'))}</h2>
    </div>
    <ul class="place-includes">
      ${place.includes.map((item) => `<li>${icon('Check', 16)}${esc(pick(item.fr, item.en, item.ar))}</li>`).join('')}
    </ul>
    ${
      place.stay || place.transport
        ? `
    <div class="place-includes-meta">
      ${place.stay ? `<p>${icon('Hotel', 16)}${esc(pick(place.stay, place.stay_en, place.stay_ar))}</p>` : ''}
      ${
        place.transport
          ? `<p>${icon('Plane', 16)}${esc(pick(place.transport, place.transport_en, place.transport_ar))}</p>`
          : ''
      }
    </div>`
        : ''
    }
  </div>`
    : '';

const faqHtml = () =>
  place.faq?.length > 0
    ? `
  <div class="place-faq-block" data-reveal>
    <h2>${esc(t('place_faq'))}</h2>
    <div class="place-faq">
      ${place.faq
        .map(
          (item) => `
        <details class="place-faq__item">
          <summary>${esc(pick(item.q, item.q_en))}${icon('ChevronRight', 16, { className: 'place-faq__chevron' })}</summary>
          <p>${esc(pick(item.a, item.a_en))}</p>
        </details>`
        )
        .join('')}
    </div>
    ${place.faqNote ? `<p class="place-note">${icon('Trees', 16)}${esc(pick(place.faqNote, place.faqNote_en))}</p>` : ''}
  </div>`
    : '';

const checklistHtml = () =>
  place.checklist?.length > 0
    ? `
  <div class="place-includes-block place-checklist-block" data-reveal>
    <div class="place-includes-block__head">
      <h2>${esc(t('place_checklist'))}</h2>
    </div>
    <ul class="place-includes place-checklist">
      ${place.checklist.map(([fr, en]) => `<li>${icon('Check', 16)}${esc(pick(fr, en))}</li>`).join('')}
    </ul>
  </div>`
    : '';

const whyUsHtml = () =>
  place.whyUs?.length > 0
    ? `
  <div class="place-whyus-block" data-reveal>
    <h2>${esc(t('place_why_us'))}</h2>
    <ul class="place-whyus">
      ${place.whyUs
        .map(
          (item) => `
        <li>
          <span class="place-why__icon" aria-hidden="true">${icon(item.icon, 18, { strokeWidth: 1.5 })}</span>
          <span>${esc(pick(item.fr, item.en, item.ar))}</span>
        </li>`
        )
        .join('')}
    </ul>
  </div>`
    : '';

const activitiesHtml = () =>
  placeActivities.length > 0
    ? `
  <div class="place-activities-block" data-reveal>
    <h2>${esc(t('place_activities'))}</h2>
    <p class="place-activities__lead">${esc(t('place_activities_lead'))}</p>
    <div class="place-activities">
      ${placeActivities
        .map((act, i) => {
          const cat = ACTIVITY_CATEGORIES[act.category];
          return `
        <button type="button" class="place-act-card" data-reveal data-delay="${i * 60}" data-href="${esc(`/activity/${act.id}`)}">
          <div class="place-act-card__media">
            <img src="${esc(asset(act.image))}" alt="" loading="lazy" />
            ${cat ? `<span class="place-act-card__badge">${esc(pick(cat.fr, cat.en, cat.ar))}</span>` : ''}
          </div>
          <div class="place-act-card__body">
            <h3>${esc(pick(act.name, act.name_en, act.name_ar))}</h3>
            <p>${esc(pick(act.desc, act.desc_en, act.desc_ar))}</p>
            <div class="place-act-card__meta">
              <span>${icon('Clock', 13)} ${esc(pick(act.durationShort, act.durationShort_en, act.durationShort_ar))}</span>
              <span class="place-act-card__price">${esc(act.price.toLocaleString())} DA</span>
            </div>
          </div>
        </button>`;
        })
        .join('')}
    </div>
  </div>`
    : '';

const helpHtml = () => `
  <aside class="place-help" data-reveal>
    <span class="place-help__icon" aria-hidden="true">${icon('Headphones', 22)}</span>
    <div class="place-help__text">
      <strong>${esc(t('place_help_title'))}</strong>
      <p>${esc(t('place_help_text'))}</p>
    </div>
    <a href="${href('/contact')}" class="place-help__cta">${esc(t('place_help_cta'))} ${icon('ArrowRight', 16)}</a>
  </aside>`;

const similarHtml = () => {
  const similar = getPlaces()
    .filter((p) => p.id !== place.id)
    .slice(0, 3);
  return `
  <div class="place-similar">
    <h2 data-reveal>${esc(t('place_similar'))}</h2>
    <div class="place-similar__grid">
      ${similar
        .map(
          (p, i) => `
        <button type="button" class="place-similar__card" data-reveal data-delay="${i * 60}" data-href="${esc(`/place/${p.id}`)}">
          <img src="${esc(asset(p.image))}" alt="" />
          <div>
            <strong>${esc(pick(p.name, p.name_en, p.name_ar))}</strong>
            <span>${esc(pick(p.tagline, p.tagline_en, p.tagline_ar))}</span>
          </div>
        </button>`
        )
        .join('')}
    </div>
  </div>`;
};

/* ── Formulaire de réservation (bottom sheet) ── */

const successHtml = () => `
  <div class="place-modal__success">
    <div class="place-modal__success-icon">${icon('Check', 28)}</div>
    <h2>${esc(t('place_form_success_title'))}</h2>
    <p>${esc(t('place_form_success_text'))}</p>
    <button type="button" data-close-booking>${esc(t('place_form_close'))}</button>
  </div>`;

const option = (value, label, current) =>
  `<option value="${esc(value)}"${String(current) === String(value) ? ' selected' : ''}>${esc(label)}</option>`;

const formHtml = () => {
  const { form } = state;
  const placeName = pick(place.name, place.name_en, place.name_ar);
  const stayValue = form.stay || (id === 'taghit' ? 'hotel' : '');
  return `
  <p class="place-modal__eyebrow">${esc(t('place_form_eyebrow'))}</p>
  <h2 id="place-book-title">${esc(t('place_form_title'))} <em>${esc(placeName)}</em></h2>
  <p class="place-modal__lead">${esc(t('place_form_lead'))}</p>

  <form class="place-form">
    <div class="place-form__row">
      <label>
        ${esc(t('place_form_name'))}
        <input name="name" value="${esc(form.name)}" required placeholder="${esc(t('place_form_name_ph'))}" />
      </label>
      <label>
        ${esc(t('place_form_email'))}
        <input type="email" name="email" value="${esc(form.email)}" required placeholder="${esc(t('place_form_email_ph'))}" />
      </label>
    </div>
    <div class="place-form__row">
      <label>
        ${esc(t('place_form_phone'))}
        <input name="phone" value="${esc(form.phone)}" placeholder="${esc(t('place_form_phone_ph'))}" />
      </label>
      <label>
        ${esc(t('place_form_date'))}
        <input type="date" name="date" value="${esc(form.date)}" required />
      </label>
    </div>
    <div class="place-form__row">
      <label>
        ${esc(t('place_form_travelers'))}
        <select name="travelers">
          ${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => option(n, n, form.travelers)).join('')}
        </select>
      </label>
      <label>
        ${esc(t('place_form_stay'))}
        <select name="stay">
          ${id !== 'taghit' ? option('', t('place_form_stay_ph'), stayValue) : ''}
          ${option('hotel', t('place_form_stay_hotel'), stayValue)}
          ${
            id !== 'taghit'
              ? `${option('guesthouse', t('place_form_stay_guest'), stayValue)}${option(
                  'camp',
                  t('place_form_stay_camp'),
                  stayValue
                )}`
              : ''
          }
        </select>
      </label>
    </div>
    <label>
      ${esc(t('place_form_message'))}
      <textarea name="message" rows="4" placeholder="${esc(t('place_form_message_ph'))}">${esc(form.message)}</textarea>
    </label>
    <button type="submit" class="place-form__submit">${esc(t('place_form_submit'))} ${icon('Send', 16)}</button>
  </form>`;
};

const sheetHtml = () => (state.sent ? successHtml() : formHtml());

const closeBooking = () => {
  state.sheet?.close();
};

const onSheetClosed = () => {
  state.sheet = null;
  state.sent = false;
  state.form = emptyForm();
};

const openBooking = () => {
  if (state.sheet) return;
  const sheet = openBottomSheet({
    content: sheetHtml(),
    titleId: 'place-book-title',
    panelClassName: 'place-modal__panel',
    className: 'place-modal bottom-sheet',
    onClose: onSheetClosed,
  });
  state.sheet = sheet;

  const onField = (e) => {
    const { name, value } = e.target;
    if (name && name in state.form) state.form[name] = value;
  };
  sheet.el.addEventListener('input', onField);
  sheet.el.addEventListener('change', onField);

  sheet.el.addEventListener('submit', (e) => {
    e.preventDefault();
    const { form } = state;
    if (!form.name.trim() || !form.email.trim() || !form.date) return;
    if (typeof window.ATBooking?.create === 'function') {
      window.ATBooking.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        date: form.date,
        travelers: form.travelers,
        stay: form.stay,
        destination: pick(place.name, place.name_en, place.name_ar),
        message: form.message.trim(),
        source: 'place',
        itemType: 'place',
        itemId: place.id,
        unitPrice: place.price,
      });
    }
    state.sent = true;
    sheet.setContent(sheetHtml());
  });

  sheet.el.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-booking]')) closeBooking();
  });
};

/* ── Page ── */

const render = () => {
  const d = derive();
  return `
  <div class="acts-page place-page has-mobile-bar">
    ${navbar()}

    <section class="place-hero">
      ${responsiveImage({ className: 'place-hero__bg', src: place.image, alt: '', priority: true, sizes: '100vw' })}
      <div class="place-hero__overlay"></div>
      <div class="place-hero__inner" data-reveal="fade">
        <nav class="acts-breadcrumb" aria-label="Breadcrumb">
          <a href="${href('/')}">${esc(t('nav_home'))}</a>
          <span>/</span>
          <a href="${href('/destinations')}">${esc(t('nav_destinations'))}</a>
          <span>/</span>
          <span>${esc(d.placeName)}</span>
        </nav>
        <p class="place-hero__tag">${esc(pick(place.tagline, place.tagline_en, place.tagline_ar))}</p>
        <h1>${esc(d.placeName)}</h1>
        <div class="place-hero__meta">
          <span>${icon('Star', 14)} ${esc(place.rating)} (${esc(place.reviews)} ${esc(t('place_reviews'))})</span>
          <span>${icon('Sun', 14)} ${esc(place.temp)} ${esc(d.weather)}</span>
        </div>
        <span class="place-hero__rule" aria-hidden="true"></span>
      </div>
    </section>

    ${pkgSwitchHtml()}

    ${bookbarHtml(d)}

    <section class="place-main acts-container">
      ${whyHtml(d)}
      ${overviewHtml()}
      ${storiesHtml()}
      ${factsHtml(d)}
      ${itineraryHtml()}
      ${cuisineHtml()}
      ${includesHtml()}
      ${faqHtml()}
      ${checklistHtml()}
      ${whyUsHtml()}
      ${activitiesHtml()}
      ${helpHtml()}
      ${similarHtml()}
    </section>

    ${mobileBookingBar({
      priceLabel: d.priceLabel,
      price: d.priceDisplay,
      ctaLabel: whatsappHref ? t('place_whatsapp_book') : t('place_book'),
      className: 'place-mobile-bar',
      ariaLabel: t('place_book'),
    })}

    ${footer()}
  </div>`;
};

const revealAll = () => {
  window.requestAnimationFrame(() => {
    document.querySelectorAll('.place-page [data-reveal]').forEach((el) => el.classList.add('is-in', 'revealed'));
  });
};

const afterRender = () => {
  revealAll();
  state.sheet?.setContent(sheetHtml());
};

const bind = (root) => {
  root.addEventListener('click', (e) => {
    const shot = e.target.closest('[data-shot]');
    if (shot) {
      openLightbox(derive().gallery, Number(shot.getAttribute('data-shot')));
      return;
    }
    if (e.target.closest('[data-book]')) {
      openBooking();
      return;
    }
    if (e.target.closest('.mobile-booking-bar__btn')) {
      if (whatsappHref) {
        window.open(whatsappHref, '_blank', 'noopener,noreferrer');
        return;
      }
      openBooking();
      return;
    }
    const link = e.target.closest('[data-href]');
    if (link) navigate(link.getAttribute('data-href'));
  });
};

const redirect = () => {
  if (!place) return '/destinations';
  if (id === 'taghit' && pkgParam === 'guesthouse') return '/guesthouses';
  if (id === 'taghit' && pkgParam && pkgParam !== 'hotel' && pkgParam !== 'brezina') return '/place/taghit?pkg=hotel';
  return null;
};

const target = redirect();
if (target) {
  navigate(target, { replace: true });
} else {
  window.scrollTo(0, 0);
  mountPage({ route: `/place/${place.id}`, render, bind, afterRender });
}
