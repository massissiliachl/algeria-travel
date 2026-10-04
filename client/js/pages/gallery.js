import '../core/siteContent.js';
import { mountPage, navbar, footer } from '../core/layout.js';
import { t } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { lockScroll, unlockScroll } from '../core/ui.js';

const INIT_IMAGES = [
  { id: 1, src: '/images/sahara1.jpeg', likes: 412, dislikes: 8, comments: [] },
  { id: 2, src: '/images/sahara2.jpeg', likes: 287, dislikes: 5, comments: [] },
  { id: 3, src: '/images/sahara3.jpeg', likes: 534, dislikes: 11, comments: [] },
  { id: 4, src: '/images/sahara4.jpeg', likes: 198, dislikes: 4, comments: [] },
  { id: 5, src: '/images/sahara5.jpeg', likes: 356, dislikes: 7, comments: [] },
  { id: 6, src: '/images/sahara6.jpeg', likes: 241, dislikes: 6, comments: [] },
  { id: 7, src: '/images/sahara7.jpeg', likes: 319, dislikes: 9, comments: [] },
  { id: 8, src: '/images/sahara8.jpeg', likes: 176, dislikes: 3, comments: [] },
  { id: 9, src: '/images/galery.jpg', likes: 268, dislikes: 4, comments: [] },
  { id: 10, src: '/images/quad.jpg', likes: 392, dislikes: 6, comments: [] },
  { id: 11, src: '/images/quad1.jpeg', likes: 221, dislikes: 3, comments: [] },
  { id: 12, src: '/images/quatre-quatre.jpg', likes: 305, dislikes: 5, comments: [] },
  { id: 13, src: '/images/chameau.jpg', likes: 448, dislikes: 7, comments: [] },
  { id: 14, src: '/images/kayak.jpeg', likes: 274, dislikes: 4, comments: [] },
  { id: 15, src: '/images/visitekseurs.webp', likes: 331, dislikes: 5, comments: [] },
];

const NAME_KEY = 'gallery_comment_name';
const ADMIN_GALLERY_KEY = 'at_gallery';
const api = window.AT_API;

const toImage = (g) => ({
  id: g.id,
  src: g.src,
  likes: Number(g.likes) || 0,
  dislikes: Number(g.dislikes) || 0,
  userReaction: g.userReaction || null,
  comments: [],
  commentsLoaded: false,
});

/** Photos publiées (Supabase, copiées dans localStorage par siteContent.js), sinon photos d’origine */
const loadImages = () => {
  try {
    const list = JSON.parse(localStorage.getItem(ADMIN_GALLERY_KEY) || 'null');
    if (Array.isArray(list) && list.length) return list.map(toImage);
  } catch {
    /* stockage indisponible */
  }
  return INIT_IMAGES.map(toImage);
};

const state = {
  images: loadImages(),
  /** true quand les photos viennent du backend : likes et commentaires y sont enregistrés */
  online: false,
  selectedIndex: null,
  ready: false,
  commentText: '',
  commentName: (() => {
    try {
      return localStorage.getItem(NAME_KEY) || '';
    } catch {
      return '';
    }
  })(),
  sending: false,
  showComments: false,
  burst: [],
  pulse: { like: false, dislike: false },
  parallax: 0,
};

let burstId = 0;
let burstTimer = null;
const pulseTimers = {};
let galIo = null;

const patchImage = (id, patch) => {
  state.images = state.images.map((i) => (i.id === id ? { ...i, ...patch } : i));
};

const currentImage = () => (state.selectedIndex !== null ? state.images[state.selectedIndex] : null);

/* ── Rendu ── */

const cellHtml = (image, i) => `
  <button type="button" class="gal-cell gal-cell--${(i % 8) + 1}" data-gal-in style="transition-delay: ${
    (i % 6) * 60
  }ms" data-gal-open="${i}" aria-label="${esc(`${t('nav_gallery')} ${i + 1}`)}">
    <img src="${esc(asset(image.src))}" alt="" loading="lazy" />
    <span class="gal-cell__likes" aria-hidden="true">
      ${icon('Heart', 12)}
      <span data-gal-likes="${image.id}">${image.likes}</span>
    </span>
  </button>`;

const burstHtml = () =>
  state.burst
    .map(
      (p) => `
    <span class="gal-burst__p gal-burst__p--${p.kind}" style="--bx: ${p.x}px; --by: ${p.y}px; --bz: ${p.z}px; --br: ${
        p.rot
      }deg; animation-delay: ${p.delay}s">${p.kind === 'like' ? '♥' : '−'}</span>`
    )
    .join('');

const reactHtml = (img) => `
  <button type="button" class="gal-react__btn gal-react__btn--like ${state.pulse.like ? 'is-pop' : ''} ${
    img.userReaction === 'like' ? 'is-on' : ''
  }" aria-pressed="${img.userReaction === 'like'}" data-gal-like>
    <span class="gal-react__3d">${icon('Heart', 20)}</span>
    <span class="gal-react__count ${state.pulse.like ? 'is-flip' : ''}">${img.likes}</span>
  </button>

  <button type="button" class="gal-react__btn gal-react__btn--dislike ${state.pulse.dislike ? 'is-pop' : ''} ${
    img.userReaction === 'dislike' ? 'is-on' : ''
  }" aria-pressed="${img.userReaction === 'dislike'}" data-gal-dislike>
    <span class="gal-react__3d">${icon('ThumbsDown', 18)}</span>
    <span class="gal-react__count ${state.pulse.dislike ? 'is-flip' : ''}">${img.dislikes}</span>
  </button>

  <button type="button" class="gal-react__btn gal-react__btn--comment ${state.showComments ? 'is-on' : ''}" data-gal-toggle-comments>
    <span class="gal-react__3d">${icon('MessageCircle', 18)}</span>
    <span class="gal-react__count">${img.comments?.length || 0}</span>
  </button>`;

const commentListHtml = (img) =>
  (img.comments?.length || 0) === 0
    ? `<p class="gal-comments__empty">${esc(t('gallery_no_comments'))}</p>`
    : img.comments
        .map(
          (c) => `
      <article class="gal-comments__item">
        <strong>${esc(c.user)}</strong>
        <time>${esc(c.date)}</time>
        <p>${esc(c.text)}</p>
      </article>`
        )
        .join('');

const lightboxHtml = () => {
  const img = currentImage();
  if (!img) return '';
  return `
    <div class="gal-lb" role="dialog" aria-modal="true" data-gal-lb>
      <button type="button" class="gal-lb__x" aria-label="Close" data-gal-close>${icon('X', 20)}</button>
      <button type="button" class="gal-lb__btn gal-lb__btn--prev" aria-label="Previous" data-gal-prev>${icon('ChevronLeft', 22)}</button>

      <div class="gal-lb__stage" data-gal-stage>
        <div class="gal-lb__visual">
          <img class="gal-lb__pic" src="${esc(asset(img.src))}" alt="" />
          <div class="gal-burst" aria-hidden="true" data-gal-burst>${burstHtml()}</div>
        </div>

        <div class="gal-react" data-gal-react>${reactHtml(img)}</div>

        <div class="gal-comments ${state.showComments ? 'is-open' : ''}" data-gal-comments>
          <h3>${esc(t('gallery_comments_title'))}</h3>
          <div class="gal-comments__form">
            <input type="text" maxlength="60" placeholder="${esc(t('gallery_name_placeholder'))}" value="${esc(state.commentName)}" data-gal-name />
            <textarea rows="2" maxlength="1000" placeholder="${esc(t('gallery_comment_placeholder'))}" data-gal-text>${esc(state.commentText)}</textarea>
            <button type="button"${state.commentText.trim() ? '' : ' disabled'} data-gal-send>${esc(t('gallery_send'))}</button>
          </div>
          <div data-gal-list style="display: contents">${commentListHtml(img)}</div>
        </div>
      </div>

      <button type="button" class="gal-lb__btn gal-lb__btn--next" aria-label="Next" data-gal-next>${icon('ChevronRight', 22)}</button>
      <p class="gal-lb__n">${state.selectedIndex + 1} / ${state.images.length}</p>
    </div>`;
};

const render = () => `
  <div class="gal ${state.ready ? 'is-ready' : ''}">
    ${navbar()}

    <header class="gal-hero">
      <div class="gal-hero__media" style="transform: translate3d(0, ${state.parallax}px, 0)" data-gal-media>
        <img src="${asset('/images/sahara4.jpeg')}" alt="" />
      </div>
      <div class="gal-hero__veil"></div>
      <div class="gal-hero__fluid" aria-hidden="true">
        <span class="gal-hero__blob gal-hero__blob--1"></span>
        <span class="gal-hero__blob gal-hero__blob--2"></span>
        <span class="gal-hero__blob gal-hero__blob--3"></span>
      </div>

      <div class="gal-hero__inner">
        <p class="gal-a gal-a--1 gal-hero__brand">Algeria <em>Travel</em></p>
        <h1 class="gal-a gal-a--2">
          <span class="gal-hero__line">${esc(t('gallery_hero_title'))}</span>
          <em class="gal-hero__line gal-hero__line--em">${esc(t('gallery_hero_title_span'))}</em>
        </h1>
        <button type="button" class="gal-a gal-a--3 gal-hero__scroll" aria-label="${esc(t('gallery_scroll_hint'))}" data-gal-scroll>
          <span class="gal-hero__scroll-orb"><span></span></span>
          <span class="gal-hero__scroll-label">${esc(t('gallery_scroll_hint'))}</span>
        </button>
      </div>

      <svg class="gal-hero__wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path class="gal-hero__wave-fill" d="M0,64 C240,120 480,20 720,64 C960,108 1200,40 1440,72 L1440,120 L0,120 Z"></path>
      </svg>
    </header>

    <main class="gal-body" data-gal-grid>
      <div class="gal-bento">${state.images.map(cellHtml).join('')}</div>
    </main>

    <div data-gal-lb-slot style="display: contents">${lightboxHtml()}</div>

    <nav class="gal-navlinks">
      <a href="${href('/')}">${esc(t('nav_home'))}</a>
      <a href="${href('/destinations')}">${esc(t('nav_destinations'))}</a>
      <a href="${href('/contact')}">${esc(t('nav_contact'))}</a>
    </nav>

    ${footer()}
  </div>`;

/* ── Mises à jour partielles ── */

let root = null;
const $ = (sel) => root.querySelector(sel);

const paintLightbox = () => {
  $('[data-gal-lb-slot]').innerHTML = lightboxHtml();
};

const paintReact = () => {
  const img = currentImage();
  const el = $('[data-gal-react]');
  if (img && el) el.innerHTML = reactHtml(img);
};

const paintBurst = () => {
  const el = $('[data-gal-burst]');
  if (el) el.innerHTML = burstHtml();
};

const paintComments = () => {
  const img = currentImage();
  const box = $('[data-gal-comments]');
  if (!img || !box) return;
  box.classList.toggle('is-open', state.showComments);
  $('[data-gal-list]').innerHTML = commentListHtml(img);
  const text = $('[data-gal-text]');
  if (text.value !== state.commentText) text.value = state.commentText;
  $('[data-gal-send]').disabled = !state.commentText.trim() || state.sending;
};

const paintCellLikes = (id) => {
  const img = state.images.find((i) => i.id === id);
  const el = $(`[data-gal-likes="${id}"]`);
  if (img && el) el.textContent = String(img.likes);
};

/* ── Actions ── */

const setSelected = (index) => {
  const wasOpen = state.selectedIndex !== null;
  state.selectedIndex = index;
  state.showComments = false;
  if (index !== null && !wasOpen) lockScroll();
  if (index === null && wasOpen) unlockScroll();
  paintLightbox();
  if (index !== null) loadComments(currentImage());
};

const goPrev = () => {
  if (state.selectedIndex === null) return;
  setSelected(state.selectedIndex > 0 ? state.selectedIndex - 1 : state.images.length - 1);
};

const goNext = () => {
  if (state.selectedIndex === null) return;
  setSelected(state.selectedIndex < state.images.length - 1 ? state.selectedIndex + 1 : 0);
};

const spawnBurst = (kind) => {
  state.burst = Array.from({ length: kind === 'like' ? 10 : 6 }, (_, i) => ({
    id: burstId + i,
    kind,
    x: (Math.random() - 0.5) * 140,
    y: -40 - Math.random() * 100,
    z: (Math.random() - 0.5) * 80,
    rot: (Math.random() - 0.5) * 60,
    delay: Math.random() * 0.12,
  }));
  burstId += state.burst.length;
  paintBurst();
  window.clearTimeout(burstTimer);
  burstTimer = window.setTimeout(() => {
    state.burst = [];
    paintBurst();
  }, 900);
};

const triggerPulse = (key) => {
  state.pulse = { ...state.pulse, [key]: true };
  window.clearTimeout(pulseTimers[key]);
  pulseTimers[key] = window.setTimeout(() => {
    state.pulse = { ...state.pulse, [key]: false };
    paintReact();
  }, 650);
};

/** Like / dislike enregistré dans Supabase (un vote par visiteur ; recliquer retire le vote) */
const react = async (key) => {
  const img = currentImage();
  if (!img) return;
  spawnBurst(key);
  triggerPulse(key);
  if (!state.online) return;

  const field = key === 'like' ? 'likes' : 'dislikes';
  const other = key === 'like' ? 'dislikes' : 'likes';
  const removing = img.userReaction === key;
  const before = { likes: img.likes, dislikes: img.dislikes, userReaction: img.userReaction };
  patchImage(img.id, {
    [field]: Math.max(0, img[field] + (removing ? -1 : 1)),
    [other]: img.userReaction && !removing ? Math.max(0, img[other] - 1) : img[other],
    userReaction: removing ? null : key,
  });
  paintReact();
  paintCellLikes(img.id);

  try {
    const { ok, data } = await api.request(`/gallery/${img.id}/reaction`, { method: 'POST', body: { reaction: key } });
    if (ok && data) patchImage(img.id, { likes: data.likes, dislikes: data.dislikes, userReaction: data.userReaction });
    else patchImage(img.id, before);
  } catch {
    patchImage(img.id, before);
  }
  paintReact();
  paintCellLikes(img.id);
};

/** Photos, compteurs et vote du visiteur depuis le backend */
const loadServerGallery = async () => {
  if (!api) return;
  try {
    const { ok, data } = await api.request('/gallery');
    if (!ok || !Array.isArray(data) || !data.length) return;
    const sameList = data.length === state.images.length && data.every((g, i) => g.id === state.images[i].id);
    const previous = new Map(state.images.map((i) => [i.id, i]));
    state.images = data.map((g) => {
      const known = previous.get(g.id);
      return { ...toImage(g), comments: known?.comments || [], commentsLoaded: Boolean(known?.commentsLoaded && sameList) };
    });
    state.online = true;
    localStorage.setItem(ADMIN_GALLERY_KEY, JSON.stringify(api.toLocal.gallery(data)));
    if (!sameList) {
      $('.gal-bento').innerHTML = state.images.map(cellHtml).join('');
      observeCells();
      if (state.selectedIndex !== null) setSelected(null);
    } else {
      state.images.forEach((img) => paintCellLikes(img.id));
      if (state.selectedIndex !== null) paintReact();
    }
    if (state.selectedIndex !== null && state.showComments) loadComments(currentImage());
  } catch {
    /* serveur indisponible : photos affichées sans likes partagés */
  }
};

/* ── Commentaires (Supabase), visibles après validation par l’admin ── */

const toViewComment = (c) => ({
  id: c.id,
  user: c.authorName || 'Voyageur',
  text: c.body,
  date: new Date(c.createdAt).toLocaleDateString(),
});

const flattenComments = (items) =>
  items.flatMap((c) => [toViewComment(c), ...flattenComments(Array.isArray(c.replies) ? c.replies : [])]);

const loadComments = async (img) => {
  if (!img || !state.online || img.commentsLoaded) return;
  try {
    const { ok, data } = await api.request(`/comments?item_type=gallery&item_id=${encodeURIComponent(img.id)}`);
    if (!ok || !Array.isArray(data?.items)) return;
    patchImage(img.id, { comments: flattenComments(data.items), commentsLoaded: true });
    if (currentImage()?.id === img.id) {
      paintReact();
      paintComments();
    }
  } catch {
    /* serveur indisponible */
  }
};

const addComment = async () => {
  const img = currentImage();
  const text = state.commentText.trim();
  if (!img || !text || state.sending) return;
  const name = state.commentName.trim();
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
  if (!state.online) {
    alert(t('gallery_comment_error'));
    return;
  }

  state.sending = true;
  paintComments();
  try {
    const { ok, status, data } = await api.request('/comments', {
      method: 'POST',
      body: { item_type: 'gallery', item_id: String(img.id), body: text, author_name: name.length >= 2 ? name : 'Voyageur' },
    });
    if (status === 429) throw new Error(t('gallery_comment_too_many'));
    if (!ok) throw new Error(data?.error || t('gallery_comment_error'));
    state.commentText = '';
    alert(t('gallery_comment_pending'));
  } catch (err) {
    alert(err.name === 'AbortError' || err instanceof TypeError ? t('gallery_comment_error') : err.message);
  }
  state.sending = false;
  paintComments();
};

/* ── Apparition des cellules ── */

const observeCells = () => {
  galIo?.disconnect();
  const nodes = root.querySelectorAll('[data-gal-in]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach((el) => el.classList.add('is-in'));
    return;
  }
  galIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        galIo.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
  );
  nodes.forEach((el) => galIo.observe(el));
};

const bind = (el) => {
  root = el;

  window.requestAnimationFrame(() => {
    state.ready = true;
    $('.gal')?.classList.add('is-ready');
  });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          state.parallax = Math.min(window.scrollY * 0.35, 120);
          const media = $('[data-gal-media]');
          if (media) media.style.transform = `translate3d(0, ${state.parallax}px, 0)`;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  window.addEventListener('keydown', (e) => {
    if (state.selectedIndex === null) return;
    if (e.key === 'Escape') setSelected(null);
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  });

  loadServerGallery();

  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-gal-name]')) {
      state.commentName = e.target.value;
      return;
    }
    if (!e.target.matches('[data-gal-text]')) return;
    state.commentText = e.target.value;
    $('[data-gal-send]').disabled = !state.commentText.trim();
  });

  root.addEventListener('click', (e) => {
    const open = e.target.closest('[data-gal-open]');
    if (open) {
      setSelected(Number(open.getAttribute('data-gal-open')));
      return;
    }
    if (e.target.closest('[data-gal-scroll]')) {
      $('[data-gal-grid]')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!e.target.closest('[data-gal-lb]')) return;

    if (e.target.closest('[data-gal-prev]')) return goPrev();
    if (e.target.closest('[data-gal-next]')) return goNext();
    if (e.target.closest('[data-gal-like]')) return react('like');
    if (e.target.closest('[data-gal-dislike]')) return react('dislike');
    if (e.target.closest('[data-gal-toggle-comments]')) {
      state.showComments = !state.showComments;
      paintReact();
      paintComments();
      if (state.showComments) loadComments(currentImage());
      return;
    }
    if (e.target.closest('[data-gal-send]')) return addComment();
    if (e.target.closest('[data-gal-stage]')) return;
    setSelected(null);
  });
};

const afterRender = (el) => {
  root = el;
  observeCells();
};

mountPage({ route: '/gallery', render, bind, afterRender });
