import { ADMIN_MODE, session, login, api, setUnauthorizedHandler } from './api.js';
import { esc, icon, toast, showError, loader, go } from './ui.js';
import { renderDashboard } from './views/dashboard.js';
import { renderProperties, renderPropertyForm, renderPropertyDetail } from './views/properties.js';
import { renderRooms, renderAllRooms, renderRates } from './views/rooms.js';
import { renderCalendar } from './views/calendar.js';
import { renderReservations } from './views/reservations.js';
import { renderProfile } from './views/profile.js';
import { renderOwners } from './views/owners.js';

const $ = (id) => document.getElementById(id);
const view = $('view');

const NAV = [
  { href: '#/dashboard', label: 'Tableau de bord', icon: 'home', match: /^\/dashboard/ },
  ...(ADMIN_MODE ? [{ href: '#/owners', label: 'Partenaires', icon: 'users', match: /^\/owners/ }] : []),
  { href: '#/properties', label: ADMIN_MODE ? 'Tous les biens' : 'Mes hébergements', icon: 'building', match: /^\/properties(?!.*\/rooms)/ },
  { href: '#/rooms', label: 'Chambres', icon: 'bed', match: /^\/(rooms$|properties\/[^/]+\/rooms)/ },
  { href: '#/rates', label: 'Tarifs', icon: 'tag', match: /^\/(rates|rooms\/[^/]+\/rates)/ },
  { href: '#/availability', label: 'Disponibilités', icon: 'calendar', match: /^\/(availability|rooms\/[^/]+\/availability)/ },
  { href: '#/reservations', label: 'Réservations', icon: 'list', match: /^\/reservations/ },
  ...(ADMIN_MODE ? [] : [{ href: '#/profile', label: 'Mon profil', icon: 'user', match: /^\/profile/ }]),
];

/** Routes : motif → rendu. Les paramètres nommés sont passés au rendu. */
const ROUTES = [
  ['/dashboard', () => renderDashboard(view)],
  ['/properties', () => renderProperties(view)],
  ['/properties/new', () => renderPropertyForm(view, null)],
  ['/properties/:id', (p) => renderPropertyDetail(view, p.id)],
  ['/properties/:id/edit', (p) => renderPropertyForm(view, p.id)],
  ['/properties/:id/rooms', (p) => renderRooms(view, p.id)],
  ['/rooms', () => renderAllRooms(view, 'rooms')],
  ['/rates', () => renderAllRooms(view, 'rates')],
  ['/availability', () => renderAllRooms(view, 'availability')],
  ['/rooms/:id/rates', (p) => renderRates(view, p.id)],
  ['/rooms/:id/availability', (p) => renderCalendar(view, p.id)],
  ['/reservations', () => renderReservations(view)],
  ['/owners', () => (ADMIN_MODE ? renderOwners(view) : go('/dashboard'))],
  ['/profile', () => (ADMIN_MODE ? go('/dashboard') : renderProfile(view, refreshUser))],
];

function matchRoute(path) {
  for (const [pattern, render] of ROUTES) {
    const keys = [];
    const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)'))}$`);
    const m = path.match(re);
    if (m) return () => render(Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])));
  }
  return null;
}

const currentPath = () => (location.hash.replace(/^#/, '').split('?')[0] || '/dashboard');

async function route() {
  if (!session.loggedIn) return showLogin();
  const path = currentPath();
  const render = matchRoute(path);
  if (!render) return go('/dashboard');
  renderNav(path);
  closeSidebar();
  view.innerHTML = loader();
  window.scrollTo(0, 0);
  try {
    await render();
  } catch (err) {
    if (err.status === 401) return;
    view.innerHTML = `<div class="card"><div class="empty"><div class="empty__icon">${icon('help', 28)}</div><h3>Impossible d’afficher cette page</h3><p>${esc(err.message)}</p><a class="btn btn--primary" href="#/dashboard">Retour au tableau de bord</a></div></div>`;
  }
  view.focus({ preventScroll: true });
  refreshBell();
}

function renderNav(path) {
  $('nav').innerHTML = NAV.map(
    (n) => `<a href="${n.href}" class="${n.match.test(path) ? 'is-active' : ''}">${icon(n.icon, 19)}<span>${esc(n.label)}</span></a>`
  ).join('') + (ADMIN_MODE ? `<p class="nav__sep">Administration</p><a href="../admin/index.html">${icon('arrowLeft', 19)}<span>Retour à l’admin</span></a>` : '');
}

function renderUser() {
  const owner = session.owner;
  const name = ADMIN_MODE ? 'Administrateur' : owner ? `${owner.firstName} ${owner.lastName}` : '';
  const initials = ADMIN_MODE ? 'AD' : `${owner?.firstName?.[0] || ''}${owner?.lastName?.[0] || ''}`.toUpperCase();
  $('userChip').innerHTML = `<span class="avatar">${esc(initials)}</span><span><strong>${esc(name)}</strong><small>${ADMIN_MODE ? 'Algeria Travel' : 'Propriétaire'}</small></span>${icon('chevronRight', 14)}`;
  $('userMenu').innerHTML = ADMIN_MODE
    ? `<a href="../admin/index.html">${icon('arrowLeft')}Retour à l’admin</a>`
    : `<a href="#/profile">${icon('user')}Mon profil</a><button type="button" id="logoutBtn">${icon('logout')}Déconnexion</button>`;
  $('logoutBtn')?.addEventListener('click', logout);
}

async function refreshUser() {
  if (ADMIN_MODE) return;
  try {
    const res = await api.raw('/owner/me', {});
    session.setOwner(res.data);
    renderUser();
  } catch {}
}

async function refreshBell() {
  try {
    const res = await api.get('/reservations?status=pending&limit=1');
    $('bellDot').hidden = !res.pagination.total;
    $('bellBtn').title = res.pagination.total ? `${res.pagination.total} réservation(s) en attente` : 'Aucune réservation en attente';
  } catch {}
}

function showLogin() {
  if (ADMIN_MODE) {
    location.href = '../admin/index.html';
    return;
  }
  $('appView').hidden = true;
  $('loginView').hidden = false;
  document.title = 'Connexion — Espace partenaire Algeria Travel';
}

function showApp() {
  $('loginView').hidden = true;
  $('appView').hidden = false;
  document.title = ADMIN_MODE ? 'Hébergements — Admin Algeria Travel' : 'Espace partenaire — Algeria Travel';
  renderUser();
}

function logout() {
  session.clear();
  location.hash = '';
  showLogin();
}

function closeSidebar() {
  $('sidebar').classList.remove('is-open');
  $('sidebarBackdrop').classList.remove('is-open');
}

function init() {
  $('year').textContent = new Date().getFullYear();
  $('menuBtn').innerHTML = icon('menu', 22);
  $('bellBtn').innerHTML += icon('bell', 20);
  if (ADMIN_MODE) {
    $('adminBanner').hidden = false;
    $('adminBanner').innerHTML = `${icon('lock', 16)}<span>Mode administrateur — accès à tous les propriétaires</span>`;
  }

  $('menuBtn').addEventListener('click', () => {
    $('sidebar').classList.add('is-open');
    $('sidebarBackdrop').classList.add('is-open');
  });
  $('sidebarBackdrop').addEventListener('click', closeSidebar);
  $('userChip').addEventListener('click', (e) => {
    e.stopPropagation();
    $('userMenu').hidden = !$('userMenu').hidden;
  });
  document.addEventListener('click', () => {
    $('userMenu').hidden = true;
  });

  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector('button[type=submit]');
    const error = $('loginError');
    error.hidden = true;
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) {
      error.textContent = 'Saisissez votre email et votre mot de passe.';
      error.hidden = false;
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Connexion… (jusqu’à 1 min au réveil du serveur)';
    try {
      const owner = await login(email, password);
      form.reset();
      showApp();
      toast(`Bienvenue ${owner.firstName} !`);
      if (!location.hash || location.hash === '#') go('/dashboard');
      else route();
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Se connecter';
    }
  });

  setUnauthorizedHandler(() => {
    if (ADMIN_MODE) return showError({ message: 'Clé admin refusée. Reconnectez-vous dans l’admin.' });
    session.clear();
    toast('Votre session a expiré. Reconnectez-vous.', 'error');
    showLogin();
  });

  window.addEventListener('hashchange', route);
  if (session.loggedIn) {
    showApp();
    refreshUser();
  }
  route();
}

init();
