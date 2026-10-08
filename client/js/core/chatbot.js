/**
 * Widget « Assistant Algeria Travel » : bouton flottant + fenêtre de discussion.
 * Les réponses viennent du backend (/api/chat/message) ; aucune clé ni logique commerciale côté navigateur.
 * Historique conservé dans le navigateur (conversationId + derniers messages) et réponses des conseillers récupérées périodiquement.
 */
import { getLang, onLangChange } from './i18n.js';
import { href } from './router.js';
import { esc } from './dom.js';

const STORE_ID = 'at_chat_conversation';
const STORE_MSGS = 'at_chat_messages';
const MAX_STORED = 80;
const MAX_LEN = 1000;
const POLL_OPEN_MS = 12000;
const POLL_CLOSED_MS = 45000;

const UI = {
  fr: {
    title: 'Assistant Algeria Travel',
    status: 'En ligne · réponse immédiate',
    placeholder: 'Écrivez votre message…',
    send: 'Envoyer',
    open: 'Ouvrir le chat',
    close: 'Fermer',
    human: 'Parler à un conseiller',
    humanMsg: 'Je veux parler à un conseiller',
    reset: 'Nouvelle conversation',
    agent: 'Conseiller',
    error: 'Connexion impossible pour le moment. Réessayez, ou écrivez-nous sur WhatsApp : +33 6 19 50 17 08.',
    teaser: 'Une question ? Je vous réponds tout de suite 👋',
    disclaimer: 'Assistant automatique — une demande n’est confirmée qu’après validation par notre équipe.',
  },
  en: {
    title: 'Algeria Travel Assistant',
    status: 'Online · instant reply',
    placeholder: 'Type your message…',
    send: 'Send',
    open: 'Open chat',
    close: 'Close',
    human: 'Talk to an advisor',
    humanMsg: 'I want to talk to an advisor',
    reset: 'New conversation',
    agent: 'Advisor',
    error: 'Unable to connect right now. Please retry, or message us on WhatsApp: +33 6 19 50 17 08.',
    teaser: 'Any question? I answer right away 👋',
    disclaimer: 'Automated assistant — a request is only confirmed once validated by our team.',
  },
  ar: {
    title: 'مساعد Algeria Travel',
    status: 'متصل · رد فوري',
    placeholder: 'اكتب رسالتك…',
    send: 'إرسال',
    open: 'فتح المحادثة',
    close: 'إغلاق',
    human: 'التحدث مع مستشار',
    humanMsg: 'نحب نهدر مع مستشار',
    reset: 'محادثة جديدة',
    agent: 'مستشار',
    error: 'تعذر الاتصال حالياً. أعد المحاولة أو راسلنا على واتساب: ‎+33 6 19 50 17 08',
    teaser: 'عندك سؤال؟ نجاوبك دركا 👋',
    disclaimer: 'مساعد آلي — الطلب يتأكد فقط بعد موافقة فريقنا.',
  },
};

const ui = (key) => (UI[getLang()] || UI.fr)[key] || UI.fr[key];

const state = {
  el: null,
  open: false,
  busy: false,
  conversationId: null,
  messages: [],
  lastId: 0,
  unread: 0,
  pollTimer: null,
  humanRequested: false,
};

/* ── Stockage local ── */

function load() {
  try {
    state.conversationId = localStorage.getItem(STORE_ID) || null;
    const saved = JSON.parse(localStorage.getItem(STORE_MSGS) || '[]');
    state.messages = Array.isArray(saved) ? saved.slice(-MAX_STORED) : [];
    state.lastId = state.messages.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0);
    state.humanRequested = state.messages.some((m) => m.intent === 'HUMAN_AGENT');
  } catch {
    state.messages = [];
  }
}

function save() {
  try {
    if (state.conversationId) localStorage.setItem(STORE_ID, state.conversationId);
    else localStorage.removeItem(STORE_ID);
    localStorage.setItem(STORE_MSGS, JSON.stringify(state.messages.slice(-MAX_STORED)));
  } catch {
    /* stockage indisponible */
  }
}

/* ── API ── */

async function api(path, options = {}) {
  if (!window.AT_API?.request) throw new Error('API indisponible');
  const res = await window.AT_API.request(path, { timeout: 65000, ...options });
  return res;
}

/* ── Rendu ── */

const ICON_CHAT =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-4.6 3.6A.9.9 0 0 1 3 20.9V6a2 2 0 0 1 1-2z" fill="currentColor"/><circle cx="8.5" cy="11" r="1.3" fill="#1a2332"/><circle cx="12" cy="11" r="1.3" fill="#1a2332"/><circle cx="15.5" cy="11" r="1.3" fill="#1a2332"/></svg>';
const ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.53L15 12 3.39 13.87z" fill="currentColor"/></svg>';
const ICON_RESET = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_USER = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21a8 8 0 0 1 16 0" fill="currentColor"/></svg>';

/** Texte du bot → HTML sûr : échappement, **gras**, liens, retours à la ligne. */
function formatText(text) {
  return esc(String(text || ''))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br>');
}

function linkHref(url) {
  return /^https?:/.test(url) ? url : href(url);
}

function messageHtml(m, isLast) {
  const who = m.sender === 'user' ? 'user' : m.sender === 'agent' ? 'agent' : 'bot';
  const label = who === 'agent' ? `<span class="atc-msg__who">${ICON_USER}${esc(ui('agent'))}</span>` : '';
  const links = (m.links || []).length
    ? `<div class="atc-links">${m.links
        .map((l) => `<a class="atc-link" href="${esc(linkHref(l.url))}" ${/^https?:/.test(l.url) ? 'target="_blank" rel="noopener noreferrer"' : ''}>${esc(l.label)} ↗</a>`)
        .join('')}</div>`
    : '';
  const chips = isLast && who !== 'user' && (m.suggestions || []).length
    ? `<div class="atc-chips">${m.suggestions
        .map((s, i) => `<button type="button" class="atc-chip${s.human ? ' atc-chip--human' : ''}" data-atc-chip="${i}">${esc(s.label)}</button>`)
        .join('')}</div>`
    : '';
  return `
    <div class="atc-msg atc-msg--${who}">
      ${label}
      <div class="atc-bubble" dir="auto">${formatText(m.body)}</div>
      ${links}
      ${chips}
    </div>`;
}

function renderMessages() {
  const box = state.el?.querySelector('[data-atc-messages]');
  if (!box) return;
  const lastIdx = state.messages.length - 1;
  box.innerHTML = state.messages.map((m, i) => messageHtml(m, i === lastIdx)).join('') + (state.busy ? typingHtml() : '');
  box.scrollTop = box.scrollHeight;
}

const typingHtml = () => '<div class="atc-msg atc-msg--bot"><div class="atc-bubble atc-typing" aria-label="…"><span></span><span></span><span></span></div></div>';

function renderShell() {
  const lang = getLang();
  state.el.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  state.el.innerHTML = `
    <button type="button" class="atc-teaser" data-atc-teaser data-atc-toggle hidden>${esc(ui('teaser'))}</button>
    <button type="button" class="atc-fab" data-atc-toggle aria-label="${esc(ui('open'))}" aria-expanded="${state.open}">
      <span class="atc-fab__icon atc-fab__icon--chat">${ICON_CHAT}</span>
      <span class="atc-fab__icon atc-fab__icon--close">${ICON_CLOSE}</span>
      <span class="atc-fab__badge" data-atc-badge hidden></span>
    </button>
    <section class="atc-panel" role="dialog" aria-label="${esc(ui('title'))}" aria-hidden="${!state.open}">
      <header class="atc-head">
        <div class="atc-head__avatar" aria-hidden="true">${ICON_CHAT}</div>
        <div class="atc-head__text">
          <p class="atc-head__title">${esc(ui('title'))}</p>
          <p class="atc-head__status"><span class="atc-dot"></span>${esc(ui('status'))}</p>
        </div>
        <button type="button" class="atc-head__btn" data-atc-human title="${esc(ui('human'))}" aria-label="${esc(ui('human'))}">${ICON_USER}</button>
        <button type="button" class="atc-head__btn" data-atc-reset title="${esc(ui('reset'))}" aria-label="${esc(ui('reset'))}">${ICON_RESET}</button>
        <button type="button" class="atc-head__btn" data-atc-close title="${esc(ui('close'))}" aria-label="${esc(ui('close'))}">${ICON_CLOSE}</button>
      </header>
      <div class="atc-messages" data-atc-messages aria-live="polite"></div>
      <form class="atc-form" data-atc-form>
        <textarea class="atc-input" data-atc-input rows="1" maxlength="${MAX_LEN}" dir="auto" placeholder="${esc(ui('placeholder'))}" aria-label="${esc(ui('placeholder'))}"></textarea>
        <button type="submit" class="atc-send" aria-label="${esc(ui('send'))}">${ICON_SEND}</button>
      </form>
      <p class="atc-note">${esc(ui('disclaimer'))}</p>
    </section>`;
  state.el.classList.toggle('is-open', state.open);
  renderMessages();
  updateBadge();
}

function updateBadge() {
  const badge = state.el?.querySelector('[data-atc-badge]');
  if (!badge) return;
  badge.hidden = !state.unread;
  badge.textContent = state.unread > 9 ? '9+' : String(state.unread);
}

/* ── Échanges ── */

function push(msg) {
  state.messages.push({ ...msg, at: Date.now() });
  if (msg.id) state.lastId = Math.max(state.lastId, Number(msg.id) || 0);
  save();
  renderMessages();
}

async function ensureConversation() {
  if (state.conversationId) return;
  const res = await api('/chat/conversations', { method: 'POST', body: { language: getLang(), pageUrl: location.pathname + location.search } });
  if (!res.ok || !res.data?.conversationId) throw new Error('conversation');
  state.conversationId = res.data.conversationId;
  if (!state.messages.length) push({ sender: 'bot', body: res.data.reply, suggestions: res.data.suggestions || [] });
  save();
}

async function send(text) {
  const message = String(text || '').trim().slice(0, MAX_LEN);
  if (!message || state.busy) return;
  push({ sender: 'user', body: message });
  state.busy = true;
  renderMessages();
  try {
    await ensureConversation();
    const res = await api('/chat/message', {
      method: 'POST',
      body: { conversationId: state.conversationId, message, language: getLang(), pageUrl: location.pathname + location.search },
    });
    const d = res.data || {};
    if (d.conversationId && d.conversationId !== state.conversationId) state.conversationId = d.conversationId;
    state.busy = false;
    if (!res.ok && !d.reply) {
      push({ sender: 'bot', body: d.error || ui('error'), suggestions: [] });
      return;
    }
    if (d.intent === 'HUMAN_AGENT') state.humanRequested = true;
    push({ id: d.messageId, sender: 'bot', body: d.reply, intent: d.intent, suggestions: d.suggestions || [], links: d.links || [] });
    schedulePoll();
  } catch {
    state.busy = false;
    push({ sender: 'bot', body: ui('error'), suggestions: [], links: [{ label: 'WhatsApp', url: 'https://wa.me/33619501708' }] });
  }
}

/** Récupère les réponses des conseillers (messages « agent ») depuis le dernier message connu. */
async function poll() {
  if (!state.conversationId || state.busy) return;
  try {
    const res = await api(`/chat/conversations/${state.conversationId}?after=${state.lastId}`, { timeout: 20000 });
    if (res.status === 404) {
      state.conversationId = null;
      save();
      return;
    }
    const list = res.data?.messages || [];
    for (const m of list) {
      state.lastId = Math.max(state.lastId, Number(m.id) || 0);
      if (m.sender !== 'agent') continue;
      state.messages.push({ id: m.id, sender: 'agent', body: m.body, at: Date.now() });
      if (!state.open) state.unread += 1;
    }
    if (res.data?.conversation?.humanRequested) state.humanRequested = true;
    if (list.length) {
      save();
      renderMessages();
      updateBadge();
    }
  } catch {
    /* réseau indisponible : nouvel essai au prochain cycle */
  }
}

function schedulePoll() {
  clearTimeout(state.pollTimer);
  if (!state.conversationId) return;
  if (!state.open && !state.humanRequested) return;
  state.pollTimer = setTimeout(async () => {
    if (!document.hidden) await poll();
    schedulePoll();
  }, state.open ? POLL_OPEN_MS : POLL_CLOSED_MS);
}

function setOpen(open) {
  state.open = open;
  state.el.classList.toggle('is-open', open);
  state.el.querySelector('[data-atc-toggle]')?.setAttribute('aria-expanded', String(open));
  state.el.querySelector('.atc-panel')?.setAttribute('aria-hidden', String(!open));
  const teaser = state.el.querySelector('[data-atc-teaser]');
  if (teaser) teaser.hidden = true;
  try {
    sessionStorage.setItem('at_chat_seen', '1');
  } catch {
    /* stockage indisponible */
  }
  if (open) {
    state.unread = 0;
    updateBadge();
    renderMessages();
    if (!state.messages.length) {
      state.busy = true;
      renderMessages();
      ensureConversation()
        .catch(() => push({ sender: 'bot', body: ui('error'), suggestions: [], links: [{ label: 'WhatsApp', url: 'https://wa.me/33619501708' }] }))
        .finally(() => {
          state.busy = false;
          renderMessages();
        });
    } else {
      poll();
    }
    if (window.matchMedia('(min-width: 641px)').matches) {
      setTimeout(() => state.el.querySelector('[data-atc-input]')?.focus(), 150);
    }
  }
  schedulePoll();
}

function reset() {
  clearTimeout(state.pollTimer);
  state.conversationId = null;
  state.messages = [];
  state.lastId = 0;
  state.humanRequested = false;
  save();
  setOpen(true);
}

function bind() {
  state.el.addEventListener('click', (e) => {
    if (e.target.closest('[data-atc-toggle]')) return setOpen(!state.open);
    if (e.target.closest('[data-atc-close]')) return setOpen(false);
    if (e.target.closest('[data-atc-reset]')) return reset();
    if (e.target.closest('[data-atc-human]')) return send(ui('humanMsg'));
    const chip = e.target.closest('[data-atc-chip]');
    if (chip) {
      const last = state.messages[state.messages.length - 1];
      const s = last?.suggestions?.[Number(chip.getAttribute('data-atc-chip'))];
      if (s) send(s.value || s.label);
    }
    return undefined;
  });
  state.el.addEventListener('submit', (e) => {
    if (!e.target.closest('[data-atc-form]')) return;
    e.preventDefault();
    const input = state.el.querySelector('[data-atc-input]');
    const value = input.value;
    input.value = '';
    input.style.height = '';
    send(value);
  });
  state.el.addEventListener('keydown', (e) => {
    if (e.target.matches('[data-atc-input]') && e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      state.el.querySelector('[data-atc-form]')?.requestSubmit();
    }
    if (e.key === 'Escape' && state.open) setOpen(false);
  });
  state.el.addEventListener('input', (e) => {
    if (!e.target.matches('[data-atc-input]')) return;
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.open) poll();
  });
}

/** Ajuste la position quand une barre de réservation mobile est affichée. */
function watchBars() {
  const check = () => {
    const mobile = window.matchMedia('(max-width: 960px)').matches;
    const bar = document.querySelector('.mobile-booking-bar, .place-mobile-bar, .stays-mobile-bar');
    document.body.classList.toggle('atc-has-bar', Boolean(mobile && bar));
  };
  check();
  new MutationObserver(check).observe(document.body, { childList: true, subtree: false });
  window.addEventListener('resize', check);
}

function injectCss() {
  if (document.querySelector('link[data-atc-css]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../../css/components/Chatbot.css', import.meta.url).href;
  link.setAttribute('data-atc-css', '');
  document.head.appendChild(link);
}

/** Monte le widget une seule fois par page. */
export function mountChatbot() {
  if (state.el || document.querySelector('[data-atc-root]')) return;
  injectCss();
  load();
  state.el = document.createElement('div');
  state.el.className = 'atc-root';
  state.el.setAttribute('data-atc-root', '');
  document.body.appendChild(state.el);
  document.body.classList.add('has-chatbot');
  renderShell();
  bind();
  watchBars();
  onLangChange(renderShell);
  if (state.humanRequested) schedulePoll();

  let seen = false;
  try {
    seen = sessionStorage.getItem('at_chat_seen') === '1';
  } catch {
    seen = true;
  }
  if (!seen && !state.messages.length) {
    setTimeout(() => {
      const teaser = state.el.querySelector('[data-atc-teaser]');
      if (teaser && !state.open) teaser.hidden = false;
      setTimeout(() => {
        if (teaser) teaser.hidden = true;
      }, 9000);
    }, 6000);
  }
}
