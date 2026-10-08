import { mountPage, navbar, footer } from '../core/layout.js';
import { t } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href } from '../core/router.js';
import { esc, asset } from '../core/dom.js';

const EMAILS = ['travelalgeriadz@gmail.com'];

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' };

const state = { form: { ...EMPTY_FORM }, sending: false, sent: false, openFaq: 0, visible: false };

const faqs = () => [
  { q: t('faq_q1'), a: t('faq_a1') },
  { q: t('faq_q2'), a: t('faq_a2') },
  { q: t('faq_q3'), a: t('faq_a3') },
];

const SUBJECTS = [
  ['', 'contact_subject_default'],
  ['reservation', 'contact_subject_reservation'],
  ['information', 'contact_subject_info'],
  ['devis', 'contact_subject_quote'],
  ['autres', 'contact_subject_other'],
];

const submitLabel = () => `${esc(state.sending ? t('contact_sending') : t('contact_send'))}
  ${icon('Send', 16)}`;

const formPanelHtml = () => {
  const f = state.form;
  return `
    <p class="ct-eyebrow">${esc(t('nav_contact'))}</p>
    <h2>${esc(t('contact_form_title'))} <em>${esc(t('contact_form_title_span'))}</em></h2>
    <p class="ct-lead">${esc(t('contact_form_desc'))}</p>
    ${
      state.sent
        ? `<div class="ct-success" role="status">
            <div class="ct-success__icon">${icon('Check', 28)}</div>
            <h3>${esc(t('contact_success'))}</h3>
            <button type="button" data-ct-reset>${esc(t('contact_send'))}</button>
          </div>`
        : `<form class="ct-form" data-ct-form>
            <div class="ct-form__row">
              <label>
                ${esc(t('contact_label_name'))}
                <input name="name" value="${esc(f.name)}" required placeholder="${esc(t('contact_placeholder_name'))}" />
              </label>
              <label>
                ${esc(t('contact_label_email'))}
                <input type="email" name="email" value="${esc(f.email)}" required placeholder="${esc(t('contact_placeholder_email'))}" />
              </label>
            </div>
            <div class="ct-form__row">
              <label>
                ${esc(t('contact_label_phone'))}
                <input type="tel" name="phone" value="${esc(f.phone)}" placeholder="${esc(t('contact_placeholder_phone'))}" />
              </label>
              <label>
                ${esc(t('contact_label_subject'))}
                <select name="subject" required>
                  ${SUBJECTS.map(
                    ([value, key]) =>
                      `<option value="${value}"${f.subject === value ? ' selected' : ''}>${esc(t(key))}</option>`
                  ).join('')}
                </select>
              </label>
            </div>
            <label>
              ${esc(t('contact_label_message'))}
              <textarea name="message" rows="5" required placeholder="${esc(t('contact_placeholder_message'))}">${esc(f.message)}</textarea>
            </label>
            <button type="submit" class="ct-submit"${state.sending ? ' disabled' : ''}>${submitLabel()}</button>
          </form>`
    }`;
};

const faqItemHtml = (item, i) => {
  const open = state.openFaq === i;
  return `
    <div class="ct-faq__item ${open ? 'is-open' : ''}" data-reveal data-delay="${i * 80}" data-faq-item="${i}">
      <button type="button" class="ct-faq__q" aria-expanded="${open}" data-faq="${i}">
        <span>${esc(item.q)}</span>
        ${icon(open ? 'X' : 'ArrowRight', 16)}
      </button>
      <div class="ct-faq__a"${open ? '' : ' hidden'}>
        <p>${esc(item.a)}</p>
      </div>
    </div>`;
};

const render = () => `
  <div class="ct-page ${state.visible ? 'is-ready' : ''}">
    ${navbar()}

    <section class="ct-hero">
      <img class="ct-hero__bg" src="${asset('/images/bejaia.jpeg')}" alt="" onerror="this.onerror=null;this.src='${asset(
        '/images/hero.jpeg'
      )}'" />
      <div class="ct-hero__overlay"></div>
      <div class="ct-hero__inner">
        <p class="ct-hero__brand">Algeria <em>Travel</em></p>
        <h1>
          ${esc(t('contact_hero_title'))}
          <span>${esc(t('contact_hero_title_span'))}</span>
        </h1>
        <p class="ct-hero__lead">${esc(t('contact_hero_desc'))}</p>
      </div>
    </section>

    <section class="ct-main">
      <div class="ct-container">
        <div class="ct-layout">
          <div class="ct-form-panel ct-reveal" data-ct-panel>${formPanelHtml()}</div>

          <aside class="ct-side ct-reveal ct-reveal--delay">
            <p class="ct-eyebrow">${esc(t('footer_contact_title'))}</p>
            <h2>${esc(t('contact_info_title'))} <em>${esc(t('contact_info_title_span'))}</em></h2>

            <ul class="ct-facts">
              <li>
                ${icon('MapPin', 18)}
                <div>
                  <strong>${esc(t('contact_info_address'))}</strong>
                  <span>
                    Russel en face Stade
                    <br />
                    Béjaïa, 06000 — Algérie
                  </span>
                </div>
              </li>
              <li>
                ${icon('Users', 18)}
                <div>
                  <strong>${esc(t('contact_info_phone'))}</strong>
                  <a href="tel:+33619501708">+33 6 19 50 17 08</a>
                </div>
              </li>
              <li>
                ${icon('Globe', 18)}
                <div>
                  <strong>${esc(t('contact_info_email'))}</strong>
                  ${EMAILS.map((mail) => `<a href="mailto:${mail}">${mail}</a>`).join('')}
                </div>
              </li>
              <li>
                ${icon('Clock', 18)}
                <div>
                  <strong>${esc(t('contact_info_hours'))}</strong>
                  <span>${esc(t('footer_hours'))}</span>
                </div>
              </li>
            </ul>

            <a class="ct-wa" href="https://wa.me/33619501708?text=${encodeURIComponent(
              'Bonjour, je souhaite des infos sur Algeria Travel'
            )}" target="_blank" rel="noopener noreferrer">
              ${icon('MessageCircle', 18)}
              ${esc(t('footer_whatsapp'))}
            </a>

            <div class="ct-map">
              <p>${esc(t('contact_map_title'))}</p>
              <iframe title="Algeria Travel — Béjaïa" src="https://www.google.com/maps?q=Russel%20Bejaia%20Algeria&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="ct-faq">
      <div class="ct-container">
        <div class="ct-faq__head ct-reveal">
          <p class="ct-eyebrow">${esc(t('contact_faq_badge'))}</p>
          <h2>${esc(t('contact_faq_title'))} <em>${esc(t('contact_faq_title_span'))}</em></h2>
          <p>${esc(t('contact_faq_desc'))}</p>
        </div>

        <div class="ct-faq__list">${faqs().map(faqItemHtml).join('')}</div>

        <p class="ct-faq__more">
          <a href="${href('/')}">${esc(t('nav_home'))}</a> · <a href="${href('/destinations')}">${esc(t('nav_destinations'))}</a>
        </p>
      </div>
    </section>

    ${footer()}
  </div>`;

const paintPanel = (root) => {
  root.querySelector('[data-ct-panel]').innerHTML = formPanelHtml();
};

const paintFaqItem = (root, i) => {
  const el = root.querySelector(`[data-faq-item="${i}"]`);
  if (!el) return;
  const open = state.openFaq === i;
  el.classList.toggle('is-open', open);
  const btn = el.querySelector('.ct-faq__q');
  btn.setAttribute('aria-expanded', String(open));
  btn.querySelector('svg')?.remove();
  btn.insertAdjacentHTML('beforeend', icon(open ? 'X' : 'ArrowRight', 16));
  el.querySelector('.ct-faq__a').hidden = !open;
};

const onSubmit = (root) => {
  const f = state.form;
  if (!f.name.trim() || !f.email.trim() || !f.message.trim()) return;
  state.sending = true;
  const btn = root.querySelector('.ct-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = submitLabel();
  }
  if (typeof window.ATBooking?.create === 'function') {
    window.ATBooking.create({
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      destination: f.subject || 'Contact',
      message: f.message.trim(),
      source: 'contact',
    });
  }
  window.setTimeout(() => {
    state.sending = false;
    state.sent = true;
    state.form = { ...EMPTY_FORM };
    paintPanel(root);
  }, 900);
};

const bind = (root) => {
  window.requestAnimationFrame(() => {
    state.visible = true;
    root.querySelector('.ct-page')?.classList.add('is-ready');
  });

  const onField = (e) => {
    const { name, value } = e.target;
    if (e.target.closest('[data-ct-form]') && name in state.form) state.form[name] = value;
  };
  root.addEventListener('input', onField);
  root.addEventListener('change', onField);

  root.addEventListener('submit', (e) => {
    if (!e.target.closest('[data-ct-form]')) return;
    e.preventDefault();
    onSubmit(root);
  });

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-ct-reset]')) {
      state.sent = false;
      paintPanel(root);
      return;
    }
    const faqBtn = e.target.closest('[data-faq]');
    if (faqBtn) {
      const i = Number(faqBtn.getAttribute('data-faq'));
      const prev = state.openFaq;
      state.openFaq = prev === i ? -1 : i;
      paintFaqItem(root, prev);
      paintFaqItem(root, i);
    }
  });
};

mountPage({ route: '/contact', render, bind });
