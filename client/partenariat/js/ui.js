/** Petits utilitaires d'interface : échappement, formats, icônes, toasts, fenêtres modales. */

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const fmtPrice = (n, currency = 'DZD') =>
  n == null || n === '' ? '—' : `${Number(n).toLocaleString('fr-FR')} ${currency === 'DZD' ? 'DA' : currency}`;

const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function fmtDate(iso, { year = true } = {}) {
  if (!iso) return '—';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}${year ? ` ${y}` : ''}`;
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

export const pad = (n) => String(n).padStart(2, '0');
export const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayIso = () => isoOf(new Date());
export function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return isoOf(d);
}

export const PROPERTY_TYPES = {
  HOTEL: 'Hôtel',
  APARTMENT: 'Appartement',
  VILLA: 'Villa',
  GUESTHOUSE: 'Maison d’hôte',
  RESIDENCE: 'Résidence',
  OTHER: 'Autre',
};

export const MEAL_PLANS = {
  ROOM_ONLY: 'Chambre seule',
  BREAKFAST: 'Petit-déjeuner inclus',
  HALF_BOARD: 'Demi-pension',
  FULL_BOARD: 'Pension complète',
  ALL_INCLUSIVE: 'Tout inclus',
};

export const STATUS_LABELS = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente',
  reviewed: 'Vue',
  confirmed: 'Confirmée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
  AVAILABLE: 'Disponible',
  UNAVAILABLE: 'Bloquée',
};

export const badge = (status) => `<span class="badge badge--${esc(String(status).toLowerCase())}">${esc(STATUS_LABELS[status] || status)}</span>`;

const PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
  bed: '<path d="M3 18V6M3 13h18v5M21 18v-5a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10" r="1.6"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 15-5-5L5 21"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/>',
  power: '<path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
};

export const icon = (name, size = 18) =>
  `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ''}</svg>`;

let toastTimer;
export function toast(message, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = `toast toast--${type} is-visible`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), type === 'error' ? 6000 : 3500);
}

export function showError(err) {
  toast(err?.message || 'Une erreur est survenue.', 'error');
}

/** Fenêtre modale. Renvoie { el, close }. */
export function modal(title, bodyHtml, { wide = false } = {}) {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel${wide ? ' modal__panel--wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal__head"><h2>${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Fermer">${icon('x')}</button></div>
      <div class="modal__body">${bodyHtml}</div>
    </div>`;
  root.classList.add('is-open');
  document.body.classList.add('no-scroll');
  const close = () => {
    root.classList.remove('is-open');
    root.innerHTML = '';
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => e.key === 'Escape' && close();
  document.addEventListener('keydown', onKey);
  root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  root.querySelector('input, select, textarea')?.focus();
  return { el: root.querySelector('.modal__panel'), close };
}

export function confirmDialog(message, { confirmLabel = 'Confirmer', danger = false } = {}) {
  return new Promise((resolve) => {
    const { el, close } = modal('Confirmation', `
      <p class="confirm-text">${esc(message)}</p>
      <div class="form-actions">
        <button type="button" class="btn btn--ghost" data-no>Annuler</button>
        <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-yes>${esc(confirmLabel)}</button>
      </div>`);
    el.querySelector('[data-no]').onclick = () => {
      close();
      resolve(false);
    };
    el.querySelector('[data-yes]').onclick = () => {
      close();
      resolve(true);
    };
  });
}

export const loader = (label = 'Chargement…') => `<div class="loader"><span class="spinner"></span>${esc(label)}</div>`;

export const empty = (title, text = '', action = '') =>
  `<div class="empty"><div class="empty__icon">${icon('building', 28)}</div><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ''}${action}</div>`;

/** Lit un formulaire en objet ; les champs data-type="number" deviennent des nombres (ou null si vides). */
export function formValues(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name || el.disabled) continue;
    if (el.type === 'checkbox') {
      if (el.dataset.group) {
        out[el.dataset.group] ||= [];
        if (el.checked) out[el.dataset.group].push(el.value);
      } else out[el.name] = el.checked;
      continue;
    }
    if (el.type === 'radio') {
      if (el.checked) out[el.name] = el.value;
      continue;
    }
    const value = el.value.trim();
    out[el.name] = el.dataset.type === 'number' ? (value === '' ? null : Number(value)) : value;
  }
  return out;
}

/** Désactive le bouton d'envoi pendant une action asynchrone. */
export async function busy(button, fn, label = 'Enregistrement…') {
  const original = button?.innerHTML;
  if (button) {
    button.disabled = true;
    button.innerHTML = `<span class="spinner spinner--sm"></span>${esc(label)}`;
  }
  try {
    return await fn();
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = original;
    }
  }
}

export const imgSrc = (url) => (url ? esc(url) : '');

export const go = (path) => {
  location.hash = `#${path}`;
};

/** Petit tableau de pagination. onPage(page) est appelé au clic. */
export function pager(p, onPage) {
  const pages = Math.max(1, Math.ceil(p.total / p.limit));
  const html = `<div class="pager"><span>${p.total} résultat(s) — page ${p.page} / ${pages}</span>
    <div class="pager__btns">
      <button type="button" class="btn btn--ghost btn--sm" data-page="${p.page - 1}" ${p.page <= 1 ? 'disabled' : ''}>${icon('chevronLeft', 14)} Précédent</button>
      <button type="button" class="btn btn--ghost btn--sm" data-page="${p.page + 1}" ${p.page >= pages ? 'disabled' : ''}>Suivant ${icon('chevronRight', 14)}</button>
    </div></div>`;
  return {
    html,
    bind(root) {
      root.querySelectorAll('[data-page]').forEach((b) => b.addEventListener('click', () => onPage(Number(b.dataset.page))));
    },
  };
}
