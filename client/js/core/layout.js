import { t, getLang, setLang, onLangChange } from './i18n.js';
import { icon } from './icons.js';
import { href } from './router.js';
import { esc, asset } from './dom.js';
import { initReveal, lockScroll, unlockScroll } from './ui.js';

const NAV_LINKS = [
  { key: 'home', href: '/', tKey: 'nav_home' },
  { key: 'destinations', href: '/destinations', tKey: 'nav_destinations' },
  { key: 'activities', href: '/activities', tKey: 'nav_activities' },
  { key: 'gallery', href: '/gallery', tKey: 'nav_gallery' },
  { key: 'tours', href: '/tours', tKey: 'nav_tours' },
  { key: 'blog', href: '/blog', tKey: 'nav_blog' },
  { key: 'contact', href: '/contact', tKey: 'nav_about' },
];

const LANGS = [
  { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/w40/fr.png', flagAlt: 'France' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png', flagAlt: 'United Kingdom' },
  { code: 'ar', label: 'العربية', flag: 'https://flagcdn.com/w40/dz.png', flagAlt: 'Algérie' },
];

const FOOTER_LINKS = [
  { to: '/destinations', tKey: 'nav_destinations' },
  { to: '/activities', tKey: 'nav_activities' },
  { to: '/tours', tKey: 'nav_tours' },
  { to: '/gallery', tKey: 'nav_gallery' },
  { to: '/blog', tKey: 'nav_blog' },
  { to: '/contact', tKey: 'nav_contact' },
];

const EMAILS = ['Algeria.travel@gmail.com', 'visit.bougie@gmail.com', 'Algeriatravel@gmail.com'];

const WA_NUMBER = '213557664089';

/* ── État de la navigation ── */

const nav = { route: '/', scrolled: false, mobileOpen: false, langOpen: false };

const isHome = () => nav.route === '/';

const isActive = (link) => {
  const p = nav.route;
  if (link.key === 'home') return p === '/';
  if (link.key === 'activities') return p.startsWith('/activit');
  if (link.key === 'destinations') return p === '/destinations' || p.startsWith('/place/');
  if (link.key === 'gallery') return p.startsWith('/gallery');
  if (link.key === 'tours') return p.startsWith('/tours') || p.startsWith('/place/');
  if (link.key === 'blog') return p.startsWith('/blog');
  return p === link.href;
};

const currentLang = () => LANGS.find((l) => l.code === getLang()) || LANGS[0];

const headerClass = () =>
  [
    'premium-nav',
    nav.scrolled ? 'premium-nav--scrolled' : '',
    isHome() && !nav.scrolled && !nav.mobileOpen ? 'premium-nav--transparent' : '',
    nav.mobileOpen ? 'premium-nav--menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

const langDropdown = () => `
  <div class="premium-nav__dropdown" role="listbox">
    ${LANGS.map(
      (l) => `
      <button type="button" role="option" aria-selected="${getLang() === l.code}" data-lang="${l.code}" class="${
        getLang() === l.code ? 'active' : ''
      }">
        <img class="premium-nav__flag-img" src="${l.flag}" alt="${esc(l.flagAlt)}" width="22" height="16" />
        <span>${esc(l.label)}</span>
      </button>`
    ).join('')}
  </div>`;

/** Barre de navigation (équivalent de <Navbar />). */
export function navbar() {
  const lang = currentLang();
  return `
    <header class="${headerClass()}" data-nav>
      <div class="premium-nav__inner">
        <a href="${href('/')}" class="premium-nav__logo">
          <img class="premium-nav__emblem" src="${asset('/logo.png')}" alt="Algeria Travel" width="40" height="40" />
          <span class="premium-nav__logo-text">ALGERIA <span>TRAVEL</span></span>
        </a>

        <nav class="premium-nav__links" aria-label="Main">
          ${NAV_LINKS.map(
            (link) =>
              `<a href="${href(link.href)}" class="premium-nav__link ${isActive(link) ? 'active' : ''}">${esc(t(link.tKey))}</a>`
          ).join('')}
        </nav>

        <div class="premium-nav__actions">
          <button class="premium-nav__icon-btn premium-nav__heart" type="button" aria-label="Wishlist">
            ${icon('Heart', 18)}
          </button>

          <div class="premium-nav__lang" data-nav-lang>
            <button class="premium-nav__icon-btn premium-nav__lang-btn" aria-label="Language" type="button" aria-expanded="${nav.langOpen}" data-nav-lang-toggle>
              <img class="premium-nav__flag-img" src="${lang.flag}" alt="${esc(lang.flagAlt)}" width="22" height="16" />
              <span class="premium-nav__lang-code">${lang.code.toUpperCase()}</span>
            </button>
            ${nav.langOpen ? langDropdown() : ''}
          </div>

          <button class="premium-nav__burger ${nav.mobileOpen ? 'open' : ''}" aria-label="${
            nav.mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'
          }" aria-expanded="${nav.mobileOpen}" type="button" data-nav-burger>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>`;
}

const mobileMenu = () => `
  <div class="nav-mobile-overlay ${nav.mobileOpen ? 'is-open' : ''}" aria-hidden="${!nav.mobileOpen}" data-nav-close></div>
  <aside class="nav-mobile-drawer ${nav.mobileOpen ? 'is-open' : ''}" aria-hidden="${!nav.mobileOpen}" aria-label="Menu">
    <div class="nav-mobile-drawer__head">
      <span class="nav-mobile-drawer__brand">
        <img src="${asset('/logo.png')}" alt="" width="36" height="36" />
        ALGERIA <em>TRAVEL</em>
      </span>
      <button type="button" aria-label="Fermer" data-nav-close>${icon('X', 20)}</button>
    </div>
    <nav class="nav-mobile-drawer__links">
      ${NAV_LINKS.map(
        (link) => `<a href="${href(link.href)}" class="${isActive(link) ? 'is-active' : ''}">${esc(t(link.tKey))}</a>`
      ).join('')}
    </nav>
    <div class="nav-mobile-drawer__langs">
      <p>${esc(t('nav_language'))}</p>
      <div>
        ${LANGS.map(
          (l) => `
          <button type="button" class="${getLang() === l.code ? 'is-active' : ''}" data-lang="${l.code}">
            <img src="${l.flag}" alt="${esc(l.flagAlt)}" width="24" height="18" />
            ${esc(l.label)}
          </button>`
        ).join('')}
      </div>
    </div>
  </aside>`;

const socialIcon = (type) => {
  if (type === 'instagram') {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.75"></rect><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor"></circle></svg>';
  }
  if (type === 'facebook') {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9z"></path></svg>';
  }
  return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M14.5 3.5c.4 2.1 1.6 3.5 3.5 4.2v2.3c-1.3-.05-2.5-.45-3.6-1.15v5.55c0 3.4-2.7 5.9-6.2 5.9S2 17.8 2 14.4c0-3.3 2.5-5.8 5.8-5.9v2.4c-1.8.1-3.1 1.4-3.1 3.4 0 2.1 1.5 3.6 3.5 3.6s3.4-1.5 3.4-3.6V3.5h2.9z"></path></svg>';
};

/** Pied de page (équivalent de <Footer />). */
export function footer() {
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Bonjour, je souhaite des infos sur Algeria Travel')}`;
  return `
    <footer class="site-footer">
      <div class="site-footer__glow" aria-hidden="true"></div>
      <div class="site-footer__inner">
        <div class="site-footer__main">
          <div class="site-footer__brand">
            <a href="${href('/')}" class="site-footer__logo">
              <img src="${asset('/logo.png')}" alt="" width="48" height="48" />
              <span>Algeria <em>Travel</em></span>
            </a>
            <p>${esc(t('footer_tagline'))}</p>
            <a class="site-footer__wa" href="${waHref}" target="_blank" rel="noopener noreferrer">
              ${icon('MessageCircle', 18)}
              ${esc(t('footer_whatsapp'))}
            </a>
          </div>

          <nav class="site-footer__nav" aria-label="${esc(t('footer_quick'))}">
            <p class="site-footer__label">${esc(t('footer_quick'))}</p>
            <ul>
              ${FOOTER_LINKS.map((l) => `<li><a href="${href(l.to)}">${esc(t(l.tKey))}</a></li>`).join('')}
            </ul>
          </nav>

          <div class="site-footer__contact">
            <p class="site-footer__label">${esc(t('footer_contact_title'))}</p>
            <ul>
              <li>
                ${icon('MapPin', 16)}
                <span class="site-footer__address">
                  <strong>${esc(t('footer_address_label'))}</strong>
                  Russel en face Stade<br />Béjaïa, 06000<br />Algérie
                </span>
              </li>
              <li>
                ${icon('Users', 16)}
                <span>
                  <strong>${esc(t('footer_phone_label'))}</strong>
                  <a href="tel:+213557664089">00213 557 664 089</a>
                </span>
              </li>
              <li>
                ${icon('Globe', 16)}
                <span class="site-footer__emails">
                  <strong>${esc(t('footer_email_label'))}</strong>
                  ${EMAILS.map((mail) => `<a href="mailto:${mail}">${mail}</a>`).join('')}
                </span>
              </li>
              <li>
                ${icon('Clock', 16)}
                <span>
                  <strong>${esc(t('footer_hours_label'))}</strong>
                  ${esc(t('footer_hours'))}
                </span>
              </li>
            </ul>

            <div class="site-footer__social">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">${socialIcon('instagram')}</a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">${socialIcon('facebook')}</a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok">${socialIcon('tiktok')}</a>
            </div>
          </div>
        </div>

        <div class="site-footer__bottom">
          <p>© ${new Date().getFullYear()} Algeria Travel — ${esc(t('footer_rights'))}</p>
          <div class="site-footer__legal">
            <a href="${href('/contact')}">${esc(t('footer_legal'))}</a>
            <a href="${href('/contact')}">${esc(t('footer_privacy'))}</a>
          </div>
        </div>
      </div>
    </footer>`;
}

/* ── Mise à jour de la navigation sans re-rendre la page ── */

let portal = null;

const paintPortal = () => {
  if (!portal) {
    portal = document.createElement('div');
    portal.setAttribute('data-nav-portal', '');
    document.body.appendChild(portal);
  }
  portal.innerHTML = mobileMenu();
};

const syncNav = () => {
  const header = document.querySelector('[data-nav]');
  if (header) {
    header.className = headerClass();
    const burger = header.querySelector('[data-nav-burger]');
    burger?.classList.toggle('open', nav.mobileOpen);
    burger?.setAttribute('aria-expanded', String(nav.mobileOpen));
    burger?.setAttribute('aria-label', nav.mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    const langBox = header.querySelector('[data-nav-lang]');
    const dropdown = langBox?.querySelector('.premium-nav__dropdown');
    if (nav.langOpen && !dropdown) langBox.insertAdjacentHTML('beforeend', langDropdown());
    if (!nav.langOpen && dropdown) dropdown.remove();
    langBox?.querySelector('[data-nav-lang-toggle]')?.setAttribute('aria-expanded', String(nav.langOpen));
  }
  portal?.querySelectorAll('.nav-mobile-overlay, .nav-mobile-drawer').forEach((el) => {
    el.classList.toggle('is-open', nav.mobileOpen);
    el.setAttribute('aria-hidden', String(!nav.mobileOpen));
  });
};

const setMobileOpen = (open) => {
  if (open === nav.mobileOpen) return;
  nav.mobileOpen = open;
  if (open) lockScroll();
  else unlockScroll();
  syncNav();
};

let layoutBound = false;

const bindLayout = () => {
  if (layoutBound) return;
  layoutBound = true;

  window.addEventListener(
    'scroll',
    () => {
      const scrolled = window.scrollY > 40;
      if (scrolled !== nav.scrolled) {
        nav.scrolled = scrolled;
        syncNav();
      }
    },
    { passive: true }
  );

  document.addEventListener('click', (e) => {
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) {
      nav.langOpen = false;
      setLang(langBtn.getAttribute('data-lang'));
      return;
    }
    if (e.target.closest('[data-nav-lang-toggle]')) {
      nav.langOpen = !nav.langOpen;
      syncNav();
      return;
    }
    if (e.target.closest('[data-nav-burger]')) {
      nav.langOpen = false;
      setMobileOpen(!nav.mobileOpen);
      return;
    }
    if (e.target.closest('[data-nav-close]')) {
      setMobileOpen(false);
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (nav.langOpen && !e.target.closest('[data-nav-lang]')) {
      nav.langOpen = false;
      syncNav();
    }
  });
};

/* ── Bouton WhatsApp flottant ── */

let waEl = null;

const mountWhatsApp = () => {
  if (waEl) return;
  const message = 'Bonjour, je souhaite réserver une activité sur Algeria Travel';
  waEl = document.createElement('a');
  waEl.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  waEl.target = '_blank';
  waEl.rel = 'noopener noreferrer';
  waEl.className = 'wa-fab is-pulse';
  waEl.setAttribute('aria-label', 'WhatsApp');
  waEl.title = 'WhatsApp';
  waEl.innerHTML =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.514 0-10 4.486-10 10 0 1.767.461 3.488 1.334 5.002L2 22l5.115-1.314c1.486.804 3.157 1.229 4.891 1.229 5.514 0 10-4.486 10-10 0-2.677-1.041-5.185-2.929-7.073zm-7.071 15.299c-1.519 0-3.005-.413-4.274-1.188l-.306-.181-3.036.779.81-2.959-.199-.317c-.859-1.363-1.313-2.926-1.313-4.535 0-4.597 3.741-8.338 8.338-8.338 2.226 0 4.319.867 5.891 2.439 1.572 1.572 2.439 3.665 2.439 5.891.001 4.597-3.74 8.338-8.35 8.338zm4.573-6.247c-.251-.125-1.485-.734-1.715-.817-.23-.084-.397-.125-.565.125-.167.25-.645.817-.791.985-.146.168-.293.188-.543.063-.25-.125-1.056-.39-2.012-1.242-.744-.66-1.246-1.476-1.392-1.726-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438s.167-.25.25-.417c.084-.167.042-.312-.021-.438-.062-.125-.564-1.361-.773-1.864-.203-.488-.411-.422-.565-.43-.146-.008-.312-.01-.479-.01s-.438.063-.668.313c-.229.25-.875.854-.875 2.083 0 1.229.896 2.416 1.021 2.583.125.167 1.761 2.688 4.266 3.77.596.256 1.062.41 1.426.525.599.191 1.145.163 1.576.099.481-.073 1.485-.607 1.694-1.193.209-.586.209-1.089.146-1.193-.062-.104-.229-.167-.479-.292z"></path></svg>';
  document.body.appendChild(waEl);
  window.setTimeout(() => waEl.classList.remove('is-pulse'), 5000);

  const check = () => {
    const mobile = window.matchMedia('(max-width: 960px)').matches;
    const hasBar = document.querySelector('.mobile-booking-bar, .place-mobile-bar, .stays-mobile-bar');
    const modalOpen = document.querySelector('.bottom-sheet, .stays-detail.is-open');
    waEl.style.display = mobile && (hasBar || modalOpen) ? 'none' : '';
  };
  check();
  new MutationObserver(check).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', check);
};

/* ── Bannière cookies ── */

const COOKIE_KEY = 'at_cookie_consent';
let cookieEl = null;

const cookieHtml = () => `
  <div class="cookie-banner__inner">
    <div class="cookie-banner__text">
      <p id="cookie-banner-title" class="cookie-banner__title">${esc(t('cookie_title'))}</p>
      <p class="cookie-banner__desc">${esc(t('cookie_text'))}</p>
    </div>
    <div class="cookie-banner__actions">
      <button type="button" class="cookie-banner__btn cookie-banner__btn--ghost" data-cookie="essential">${esc(t('cookie_essential'))}</button>
      <button type="button" class="cookie-banner__btn cookie-banner__btn--primary" data-cookie="all">${esc(t('cookie_accept'))}</button>
    </div>
  </div>`;

const mountCookieBanner = () => {
  let saved = null;
  try {
    saved = localStorage.getItem(COOKIE_KEY);
  } catch {
    saved = null;
  }
  if (saved || cookieEl) return;
  cookieEl = document.createElement('div');
  cookieEl.className = 'cookie-banner';
  cookieEl.setAttribute('role', 'dialog');
  cookieEl.setAttribute('aria-labelledby', 'cookie-banner-title');
  cookieEl.setAttribute('aria-live', 'polite');
  cookieEl.innerHTML = cookieHtml();
  cookieEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cookie]');
    if (!btn) return;
    try {
      localStorage.setItem(COOKIE_KEY, btn.getAttribute('data-cookie'));
    } catch {
      /* stockage indisponible */
    }
    cookieEl.remove();
    cookieEl = null;
  });
  document.body.appendChild(cookieEl);
};

/* ── Montage d'une page ── */

/**
 * Monte une page.
 * - route : chemin équivalent du site React ("/", "/place/taghit"…), pour le lien actif du menu.
 * - render() : retourne tout le HTML de la page (navbar() + contenu + footer()).
 * - bind(root) : appelé une seule fois (délégation d'événements sur #app).
 * - afterRender(root) : appelé après chaque rendu (ex. mise à jour d'éléments dynamiques).
 * Retourne { rerender } : re-rend toute la page (utilisé aussi au changement de langue).
 */
export function mountPage({ route = '/', render, bind, afterRender }) {
  nav.route = route;
  nav.scrolled = window.scrollY > 40;
  document.documentElement.classList.add('js');
  document.body.setAttribute('data-theme', 'light');
  try {
    localStorage.setItem('theme', 'light');
  } catch {
    /* stockage indisponible */
  }

  const root = document.getElementById('app');
  const rerender = () => {
    root.innerHTML = render();
    paintPortal();
    syncNav();
    afterRender?.(root);
  };

  rerender();
  bindLayout();
  mountWhatsApp();
  mountCookieBanner();
  initReveal();
  bind?.(root);

  onLangChange(() => {
    rerender();
    if (cookieEl) cookieEl.innerHTML = cookieHtml();
  });

  return { rerender };
}
