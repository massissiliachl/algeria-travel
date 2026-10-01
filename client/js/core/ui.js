import { icon } from './icons.js';
import { asset, esc } from './dom.js';

/* ── Apparition au scroll des éléments [data-reveal] (classe .is-in) ── */

let revealStarted = false;

export function initReveal() {
  if (revealStarted) return;
  revealStarted = true;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = new WeakSet();
  const mark = (el) => el.classList.add('is-in', 'revealed');
  const inViewport = (el) => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom > 40 && rect.top < vh * 0.95;
  };

  const io = reduce
    ? null
    : new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            window.setTimeout(() => mark(el), Number(el.getAttribute('data-delay') || 0));
            io.unobserve(el);
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -4% 0px' }
      );

  const attach = (el) => {
    if (seen.has(el)) return;
    seen.add(el);
    if (reduce || inViewport(el)) {
      const delay = Number(el.getAttribute('data-delay') || 0);
      if (reduce || delay === 0) mark(el);
      else window.setTimeout(() => mark(el), delay);
      return;
    }
    io.observe(el);
  };

  const scan = () => document.querySelectorAll('[data-reveal]').forEach(attach);

  window.requestAnimationFrame(() => {
    scan();
    window.requestAnimationFrame(scan);
  });
  window.setTimeout(scan, 120);
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
}

/* ── Blocage du scroll (plusieurs couches possibles) ── */

let scrollLocks = 0;
export const lockScroll = () => {
  scrollLocks += 1;
  document.body.style.overflow = 'hidden';
};
export const unlockScroll = () => {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (!scrollLocks) document.body.style.overflow = '';
};

/* ── Lightbox (équivalent de <ImageLightbox />) ── */

export function openLightbox(images, initialIndex = 0, alt = '') {
  if (!images?.length) return () => {};
  let index = initialIndex;
  let touchStart = null;
  const many = images.length > 1;

  const el = document.createElement('div');
  el.className = 'img-lightbox';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Galerie');
  el.innerHTML = `
    <button type="button" class="img-lightbox__close" aria-label="Fermer">${icon('X', 22)}</button>
    ${
      many
        ? `<button type="button" class="img-lightbox__nav img-lightbox__nav--prev" aria-label="Précédent">${icon('ChevronLeft', 28)}</button>
           <button type="button" class="img-lightbox__nav img-lightbox__nav--next" aria-label="Suivant">${icon('ChevronRight', 28)}</button>`
        : ''
    }
    <div class="img-lightbox__stage">
      <img src="" alt="${esc(alt)}" draggable="false" />
      ${many ? '<p class="img-lightbox__counter"></p>' : ''}
    </div>`;

  const img = el.querySelector('img');
  const counter = el.querySelector('.img-lightbox__counter');
  const paint = () => {
    img.src = asset(images[index]);
    if (counter) counter.textContent = `${index + 1} / ${images.length}`;
  };
  const go = (dir) => {
    index = (index + dir + images.length) % images.length;
    paint();
  };
  const close = () => {
    window.removeEventListener('keydown', onKey);
    el.remove();
    unlockScroll();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  };

  el.addEventListener('click', close);
  el.querySelector('.img-lightbox__close').addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });
  el.querySelector('.img-lightbox__nav--prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    go(-1);
  });
  el.querySelector('.img-lightbox__nav--next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    go(1);
  });
  const stage = el.querySelector('.img-lightbox__stage');
  stage.addEventListener('click', (e) => e.stopPropagation());
  stage.addEventListener('touchstart', (e) => {
    touchStart = e.touches[0].clientX;
  });
  stage.addEventListener('touchend', (e) => {
    if (touchStart == null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) go(diff > 0 ? -1 : 1);
    touchStart = null;
  });

  paint();
  document.body.appendChild(el);
  lockScroll();
  window.addEventListener('keydown', onKey);
  return close;
}

/* ── Bottom sheet (équivalent de <BottomSheet />) ── */

/**
 * Ouvre un panneau modal. `content` est du HTML inséré directement dans le panneau.
 * Retourne { el, panel, close, setContent }.
 * onClose est appelé à la fermeture (bouton, clic extérieur, Échap).
 */
export function openBottomSheet({ content = '', className = '', panelClassName = '', titleId, ariaLabel, onClose } = {}) {
  const el = document.createElement('div');
  el.className = `bottom-sheet ${className}`.trim();
  el.setAttribute('role', 'presentation');
  el.innerHTML = `
    <div class="${`bottom-sheet__panel ${panelClassName}`.trim()}" role="dialog" aria-modal="true"${
      titleId ? ` aria-labelledby="${esc(titleId)}"` : ''
    }${ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ''}>
      <button type="button" class="bottom-sheet__close" aria-label="Close">${icon('X', 18)}</button>
    </div>`;

  const panel = el.querySelector('.bottom-sheet__panel');
  const closeBtn = panel.querySelector('.bottom-sheet__close');
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    window.removeEventListener('keydown', onKey);
    el.remove();
    unlockScroll();
    onClose?.();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };
  const setContent = (html) => {
    [...panel.children].forEach((child) => {
      if (child !== closeBtn) child.remove();
    });
    closeBtn.insertAdjacentHTML('afterend', html);
  };

  el.addEventListener('click', close);
  panel.addEventListener('click', (e) => e.stopPropagation());
  closeBtn.addEventListener('click', close);

  setContent(content);
  document.body.appendChild(el);
  lockScroll();
  window.addEventListener('keydown', onKey);
  return { el, panel, close, setContent };
}

/* ── Barre de réservation mobile (équivalent de <MobileBookingBar />) ── */

export function mobileBookingBar({ priceLabel, price, ctaLabel, ctaIcon = 'ArrowRight', className = '', ariaLabel } = {}) {
  return `
    <div class="${`mobile-booking-bar ${className}`.trim()}" aria-label="${esc(ariaLabel || ctaLabel)}">
      <div class="mobile-booking-bar__price">
        ${priceLabel ? `<span>${esc(priceLabel)}</span>` : ''}
        <strong>${esc(price)}</strong>
      </div>
      <button type="button" class="mobile-booking-bar__btn">
        ${esc(ctaLabel)}
        ${ctaIcon ? icon(ctaIcon, 16) : ''}
      </button>
    </div>`;
}

/* ── Image (équivalent de <ResponsiveImage />) ── */

export function responsiveImage({ src, alt = '', className = '', priority = false, sizes, fallback, attrs = '' } = {}) {
  const parts = [
    `src="${esc(asset(src))}"`,
    `alt="${esc(alt)}"`,
    className ? `class="${esc(className)}"` : '',
    `loading="${priority ? 'eager' : 'lazy'}"`,
    priority ? 'fetchpriority="high"' : '',
    `decoding="${priority ? 'sync' : 'async'}"`,
    sizes ? `sizes="${esc(sizes)}"` : '',
    fallback ? `onerror="this.onerror=null;this.src='${esc(asset(fallback))}'"` : '',
    attrs,
  ];
  return `<img ${parts.filter(Boolean).join(' ')} />`;
}
