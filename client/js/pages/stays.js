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

const emptyForm = () => ({
  roomId: '',
  checkIn: '',
  checkOut: '',
  rooms: '1',
  adults: '2',
  children: '0',
  name: '',
  email: '',
  phone: '',
  message: '',
  consent: false,
});

const state = {
  ...readFilters(),
  selectedId: null,
  remote: new Map(),
  details: new Map(),
  step: 'detail',
  form: emptyForm(),
  sending: false,
  error: '',
  sent: null,
};
let sheet = null;
let page = null;

const remoteToStay = (p) => {
  const type = String(p.propertyType || '').toLowerCase() === 'guesthouse' ? 'guesthouse' : 'hotel';
  const city = p.city || '';
  return {
    id: p.id,
    type,
    placeId: p.placeId || '',
    name: p.name,
    location: city,
    desc: p.shortDescription || p.description || '',
    image: p.image || '/images/home/acc-hotel.jpg',
    gallery: p.image ? [p.image] : [],
    price: Number(p.minPrice || p.basePrice) || 0,
    rating: p.rating || '—',
    reviews: 0,
    amenities: { fr: [], en: [], ar: [] },
  };
};

const withRemote = (stay) => {
  const p = state.remote.get(stay.id);
  if (!p) return stay;
  return { ...stay, name: p.name || stay.name, price: Number(p.minPrice || p.basePrice) || stay.price };
};

const filtered = () => {
  const local = filterStays({ type: state.type, place: state.place });
  const ids = new Set(local.map((s) => s.id));
  const extra = [...state.remote.values()]
    .filter((p) => !ids.has(p.id) && !filterStays().some((s) => s.id === p.id))
    .map(remoteToStay)
    .filter((s) => (state.type === 'all' || s.type === state.type) && (state.place === 'all' || s.placeId === state.place));
  return [...local.map(withRemote), ...extra];
};
const getSelected = () => filtered().find((s) => s.id === state.selectedId) || null;

const priceText = (stay) =>
  stay.pricePerPerson
    ? `${stay.price.toLocaleString()} DA ${t('per_person')}`
    : `${t('acts_from')} ${stay.price.toLocaleString()} DA`;

const typeLabel = (stay) => (stay.type === 'hotel' ? t('stays_type_hotel') : t('stays_type_guesthouse'));

const BOOK_LABEL = () => pick('Réserver', 'Book now', 'احجز الآن');
const todayIso = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const nightsBetween = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);
const option = (value, label, current) =>
  `<option value="${esc(value)}"${String(value) === String(current) ? ' selected' : ''}>${esc(label)}</option>`;

const loadRemote = async () => {
  if (!window.AT_API) return;
  try {
    const { ok, data } = await window.AT_API.request('/accommodations?limit=100');
    if (!ok || !Array.isArray(data?.data)) return;
    state.remote = new Map(data.data.map((p) => [p.id, p]));
    page.rerender();
  } catch {
    /* backend injoignable : catalogue statique seul */
  }
};

const loadDetail = async (id) => {
  if (!state.remote.has(id) || state.details.has(id)) return state.details.get(id) || null;
  try {
    const { ok, data } = await window.AT_API.request(`/accommodations/${encodeURIComponent(id)}`);
    if (ok && data?.data) state.details.set(id, data.data);
  } catch {
    /* demande générique si le détail est indisponible */
  }
  return state.details.get(id) || null;
};

const roomsOf = (stay) => state.details.get(stay.id)?.rooms || [];
const currentRoom = (stay) => roomsOf(stay).find((r) => r.id === state.form.roomId) || roomsOf(stay)[0] || null;

const estimate = (stay) => {
  const { checkIn, checkOut } = state.form;
  if (!checkIn || !checkOut || checkOut <= checkIn) return null;
  const nights = nightsBetween(checkIn, checkOut);
  const room = currentRoom(stay);
  const rooms = Number(state.form.rooms) || 1;
  if (room) return { nights, total: Number(room.basePrice) * nights * rooms };
  if (stay.pricePerPerson) return { nights, total: stay.price * ((Number(state.form.adults) || 1) + (Number(state.form.children) || 0)) };
  return { nights, total: stay.price * nights * rooms };
};

const openForm = async (stay) => {
  state.step = 'form';
  state.error = '';
  if (!state.form.checkIn) {
    state.form.checkIn = addDays(todayIso(), 1);
    state.form.checkOut = addDays(todayIso(), 2);
  }
  if (!sheet) return;
  sheet.setContent(sheetHtml(stay));
  sheet.panel.querySelector('.stays-book')?.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
  if (state.remote.has(stay.id) && !state.details.has(stay.id)) {
    await loadDetail(stay.id);
    if (sheet && state.selectedId === stay.id && state.step === 'form') sheet.setContent(sheetHtml(stay));
  }
};

const validateForm = (stay) => {
  const f = state.form;
  if (!f.checkIn || !f.checkOut) return pick('Choisissez vos dates.', 'Choose your dates.', 'اختر التواريخ.');
  if (f.checkIn < todayIso()) return pick('La date d’arrivée est passée.', 'Check-in date is in the past.', 'تاريخ الوصول قد مضى.');
  if (f.checkOut <= f.checkIn)
    return pick('La date de départ doit être après l’arrivée.', 'Check-out must be after check-in.', 'يجب أن يكون المغادرة بعد الوصول.');
  const room = currentRoom(stay);
  if (room) {
    const rooms = Number(f.rooms) || 1;
    if (Number(f.adults) > room.capacityAdults * rooms)
      return pick(
        `Maximum ${room.capacityAdults} adulte(s) par chambre.`,
        `Maximum ${room.capacityAdults} adult(s) per room.`,
        `الحد الأقصى ${room.capacityAdults} بالغ لكل غرفة.`
      );
    if (Number(f.children) > room.capacityChildren * rooms)
      return pick('Trop d’enfants pour cette chambre.', 'Too many children for this room.', 'عدد الأطفال يتجاوز سعة الغرفة.');
  }
  if (!f.consent)
    return pick('Merci d’accepter le traitement de vos données.', 'Please accept data processing.', 'يرجى الموافقة على معالجة بياناتك.');
  return '';
};

const submitBooking = async (stay) => {
  const f = state.form;
  const msg = validateForm(stay);
  state.error = msg;
  if (msg) {
    sheet?.setContent(sheetHtml(stay));
    return;
  }
  state.sending = true;
  sheet?.setContent(sheetHtml(stay));
  const room = currentRoom(stay);
  const adults = Number(f.adults) || 1;
  const children = Number(f.children) || 0;
  const rooms = Number(f.rooms) || 1;
  const name = pick(stay.name, stay.name_en, stay.name_ar);
  let res;
  try {
    res = room
      ? await window.AT_API.request('/accommodations/reservations', {
          method: 'POST',
          body: {
            propertyId: stay.id,
            roomTypeId: room.id,
            checkIn: f.checkIn,
            checkOut: f.checkOut,
            rooms,
            adults,
            children,
            name: f.name.trim(),
            email: f.email.trim(),
            phone: f.phone.trim(),
            message: f.message.trim(),
            gdprConsent: true,
            website: '',
          },
        })
      : await window.AT_API.request('/reservations', {
          method: 'POST',
          body: {
            item_type: 'stay',
            item_id: stay.id,
            item_name: name,
            stay_type: stay.type,
            name: f.name.trim(),
            email: f.email.trim(),
            phone: f.phone.trim(),
            travel_date: f.checkIn,
            check_in_date: f.checkIn,
            check_out_date: f.checkOut,
            rooms_requested: rooms,
            travelers: Math.min(20, adults + children),
            message: [`Séjour : du ${f.checkIn} au ${f.checkOut}`, `Adultes : ${adults} · Enfants : ${children}`, f.message.trim()]
              .filter(Boolean)
              .join('\n'),
            unit_price: stay.price,
            price_per_person: Boolean(stay.pricePerPerson),
            gdpr_consent: true,
            payment_method: 'pre_request',
            website: '',
          },
        });
  } catch {
    res = { ok: false, data: { message: pick('Serveur injoignable. Réessayez dans un instant.', 'Server unreachable. Please retry.', 'تعذر الاتصال بالخادم.') } };
  }
  state.sending = false;
  if (res.ok) {
    const d = res.data?.data || res.data || {};
    state.sent = { ref: d.referenceCode || '', total: d.priceEstimate, email: f.email.trim() };
    state.step = 'sent';
  } else {
    state.error = res.data?.message || res.data?.error || pick('La demande n’a pas pu être envoyée.', 'Request could not be sent.', 'تعذر إرسال الطلب.');
  }
  sheet?.setContent(sheetHtml(stay));
};

const formHtml = (stay) => {
  const f = state.form;
  const rooms = roomsOf(stay);
  const room = currentRoom(stay);
  const loading = state.remote.has(stay.id) && !state.details.has(stay.id);
  const est = estimate(stay);
  const maxRooms = Math.max(1, Math.min(10, room?.totalRooms || 10));
  if (Number(f.rooms) > maxRooms) f.rooms = String(maxRooms);
  const maxChildren = room ? room.capacityChildren * (Number(f.rooms) || 1) : 10;
  if (Number(f.children) > maxChildren) f.children = String(maxChildren);
  return `
    <form class="place-form stays-book" novalidate>
      <h3>${esc(pick('Demande de réservation', 'Booking request', 'طلب حجز'))}</h3>
      ${
        loading
          ? `<p class="place-form__note">${esc(pick('Chargement des chambres…', 'Loading rooms…', 'جارٍ تحميل الغرف…'))}</p>`
          : rooms.length
            ? `<label>${esc(pick('Chambre', 'Room', 'الغرفة'))}
          <select name="roomId">${rooms
            .map((r) =>
              option(
                r.id,
                `${r.name} — ${Number(r.basePrice).toLocaleString()} DA / ${pick('nuit', 'night', 'ليلة')} · ${r.capacityAdults} ${pick('pers.', 'guests', 'أشخاص')}`,
                room?.id
              )
            )
            .join('')}</select>
        </label>`
            : ''
      }
      <div class="place-form__row">
        <label>${esc(pick('Arrivée', 'Check-in', 'الوصول'))}
          <input type="date" name="checkIn" value="${esc(f.checkIn)}" min="${todayIso()}" required />
        </label>
        <label>${esc(pick('Départ', 'Check-out', 'المغادرة'))}
          <input type="date" name="checkOut" value="${esc(f.checkOut)}" min="${esc(f.checkIn ? addDays(f.checkIn, 1) : todayIso())}" required />
        </label>
      </div>
      <div class="place-form__row stays-book__counts">
        <label>${esc(pick('Chambres', 'Rooms', 'الغرف'))}
          <select name="rooms">${Array.from({ length: maxRooms }, (_, i) => option(i + 1, i + 1, f.rooms)).join('')}</select>
        </label>
        <label>${esc(pick('Adultes', 'Adults', 'البالغون'))}
          <select name="adults">${Array.from({ length: 12 }, (_, i) => option(i + 1, i + 1, f.adults)).join('')}</select>
        </label>
        <label>${esc(pick('Enfants', 'Children', 'الأطفال'))}
          <select name="children">${Array.from({ length: Math.max(0, maxChildren) + 1 }, (_, i) => option(i, i, f.children)).join('')}</select>
        </label>
      </div>
      <div class="place-form__row">
        <label>${esc(t('place_form_name'))}
          <input type="text" name="name" value="${esc(f.name)}" required autocomplete="name" />
        </label>
        <label>${esc(t('place_form_email'))}
          <input type="email" name="email" value="${esc(f.email)}" required autocomplete="email" />
        </label>
      </div>
      <label>${esc(t('place_form_phone'))}
        <input type="tel" name="phone" value="${esc(f.phone)}" required pattern="[0-9+ .\\(\\)\\-]{8,20}" autocomplete="tel" />
      </label>
      <label>${esc(t('place_form_message'))}
        <textarea name="message" rows="3">${esc(f.message)}</textarea>
      </label>
      <label class="stays-book__consent">
        <input type="checkbox" name="consent"${f.consent ? ' checked' : ''} />
        <span>${esc(
          pick(
            'J’accepte que mes données soient transmises à l’établissement et à Algeria Travel pour traiter ma demande.',
            'I agree that my data is shared with the property and Algeria Travel to process my request.',
            'أوافق على مشاركة بياناتي مع المؤسسة و Algeria Travel لمعالجة طلبي.'
          )
        )}</span>
      </label>
      ${
        est
          ? `<p class="stays-book__estimate">${esc(pick('Estimation', 'Estimate', 'تقدير'))} : <strong>${est.total.toLocaleString()} DA</strong> · ${est.nights} ${esc(
              pick('nuit(s)', 'night(s)', 'ليلة')
            )}</p>`
          : ''
      }
      <p class="place-form__error" role="alert"${state.error ? '' : ' hidden'}>${esc(state.error)}</p>
      <div class="stays-detail__actions">
        <button type="button" class="premium-btn premium-btn--ghost" data-book-back>${esc(pick('Retour', 'Back', 'رجوع'))}</button>
        <button type="submit" class="premium-btn premium-btn--primary"${state.sending || loading ? ' disabled' : ''}>
          ${icon('Send', 16)} ${esc(state.sending ? pick('Envoi…', 'Sending…', 'جارٍ الإرسال…') : pick('Envoyer la demande', 'Send request', 'إرسال الطلب'))}
        </button>
      </div>
    </form>`;
};

const sentHtml = () => `
  <div class="stays-book stays-book--sent" role="status">
    <h3>${icon('Check', 18)} ${esc(pick('Demande envoyée', 'Request sent', 'تم إرسال الطلب'))}</h3>
    ${state.sent.ref ? `<p>${esc(pick('Référence', 'Reference', 'المرجع'))} : <strong>${esc(state.sent.ref)}</strong></p>` : ''}
    <p>${esc(
      pick(
        `L’établissement et notre équipe ont reçu votre demande. Une confirmation a été envoyée à ${state.sent.email}.`,
        `The property and our team have received your request. A confirmation was sent to ${state.sent.email}.`,
        `استلمت المؤسسة وفريقنا طلبك. تم إرسال تأكيد إلى ${state.sent.email}.`
      )
    )}</p>
    <div class="stays-detail__actions">
      <button type="button" class="premium-btn premium-btn--ghost" data-book-close>${esc(pick('Fermer', 'Close', 'إغلاق'))}</button>
    </div>
  </div>`;

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
      ${
        state.step === 'form'
          ? formHtml(selected)
          : state.step === 'sent'
            ? sentHtml()
            : `
      <div class="stays-detail__actions">
        <button type="button" class="premium-btn premium-btn--primary" data-book>
          ${icon('Calendar', 16)} ${esc(BOOK_LABEL())}
        </button>
        <button type="button" class="premium-btn premium-btn--ghost" data-contact>
          ${esc(t('stays_contact'))}
        </button>
      </div>`
      }
    </div>`;
};

const barHtml = (selected) =>
  mobileBookingBar({
    priceLabel: selected.pricePerPerson ? t('home_v2_coup_per_person') : t('acts_from'),
    price: `${selected.price.toLocaleString()} DA`,
    ctaLabel: BOOK_LABEL(),
    ctaIcon: 'Calendar',
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

const resetBooking = () => {
  const { name, email, phone } = state.form;
  state.step = 'detail';
  state.error = '';
  state.sent = null;
  state.sending = false;
  state.form = { ...emptyForm(), name, email, phone };
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
        resetBooking();
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
      if (e.target.closest('[data-book]')) {
        openForm(current);
        return;
      }
      if (e.target.closest('[data-book-back]')) {
        state.step = 'detail';
        state.error = '';
        sheet.setContent(sheetHtml(current));
        return;
      }
      if (e.target.closest('[data-book-close]')) {
        sheet.close();
        return;
      }
      if (e.target.closest('[data-contact]')) navigate('/contact');
    });
    const onField = (e) => {
      const { name, type, value, checked } = e.target;
      if (!name || !(name in state.form)) return;
      state.form[name] = type === 'checkbox' ? checked : value;
      if (state.error) {
        state.error = '';
        const errorEl = sheet.panel.querySelector('.place-form__error');
        if (errorEl) errorEl.hidden = true;
      }
      if (e.type !== 'change' || !['roomId', 'rooms', 'checkIn', 'checkOut'].includes(name)) return;
      const f = state.form;
      if (name === 'checkIn' && f.checkIn && (!f.checkOut || f.checkOut <= f.checkIn)) f.checkOut = addDays(f.checkIn, 1);
      const current = getSelected();
      if (current) sheet.setContent(sheetHtml(current));
    };
    sheet.panel.addEventListener('input', onField);
    sheet.panel.addEventListener('change', onField);
    sheet.panel.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = getSelected();
      if (current && !state.sending) submitBooking(current);
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
  resetBooking();
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
      if (selected) openForm(selected);
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
loadRemote();
