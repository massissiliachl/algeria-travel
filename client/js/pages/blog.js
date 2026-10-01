import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { BLOG_POSTS, BLOG_FILTERS } from '../data/blog.js';

const state = { filter: 'all' };

const filtered = () =>
  state.filter === 'all' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === state.filter);

const featured = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];

const filtersHtml = () =>
  BLOG_FILTERS.map(
    (f) => `
      <button type="button" role="tab" aria-selected="${state.filter === f.key}" class="acts-filters__btn ${
        state.filter === f.key ? 'is-active' : ''
      }" data-filter="${esc(f.key)}">
        ${icon(f.icon, 18, { strokeWidth: 1.75 })}
        <span>${esc(pick(f.fr, f.en, f.ar))}</span>
      </button>`
  ).join('');

const cardHtml = (post, i) => `
  <a href="${esc(href(`/blog/${post.slug}`))}" class="blog-card" data-reveal data-delay="${i * 60}">
    <img src="${esc(asset(post.image))}" alt="" loading="lazy" />
    <div class="blog-card__body">
      <span class="blog-chip blog-chip--dark">${esc(pick(post.categoryLabel, post.categoryLabel_en, post.categoryLabel_ar))}</span>
      <h3>${esc(pick(post.title, post.title_en, post.title_ar))}</h3>
      <p>${esc(pick(post.excerpt, post.excerpt_en, post.excerpt_ar))}</p>
      <div class="blog-meta blog-meta--muted">
        <span>${esc(pick(post.date, post.date_en, post.date_ar))}</span>
        <span>${esc(post.readTime)}</span>
      </div>
    </div>
  </a>`;

const gridHtml = () => {
  const items = filtered();
  return `
    <div class="blog-grid">${items.map(cardHtml).join('')}</div>
    ${items.length === 0 ? `<p class="acts-empty">${esc(t('blog_empty'))}</p>` : ''}`;
};

const render = () => {
  const featuredHref = esc(href(`/blog/${featured.slug}`));
  return `
  <div class="acts-page blog-page">
    ${navbar()}

    <section class="acts-hero blog-hero">
      <img class="acts-hero__bg" src="${asset('/images/hero.jpeg')}" alt="" />
      <div class="acts-hero__overlay"></div>
      <div class="acts-hero__inner" data-reveal="fade">
        <nav class="acts-breadcrumb" aria-label="Breadcrumb">
          <a href="${href('/')}">${esc(t('nav_home'))}</a>
          <span>/</span>
          <span>${esc(t('nav_blog'))}</span>
        </nav>
        <h1 class="acts-hero__title">
          ${esc(t('blog_hero_title_before'))}
          <em> ${esc(t('blog_hero_title_em'))} </em>
          ${esc(t('blog_hero_title_after'))}
        </h1>
        <p class="acts-hero__subtitle">${esc(t('blog_hero_subtitle'))}</p>
      </div>
    </section>

    <div class="acts-filters-wrap blog-filters-wrap" data-reveal>
      <div class="acts-filters" role="tablist" data-filters>${filtersHtml()}</div>
    </div>

    <section class="blog-featured acts-container" id="blog-featured">
      <article class="blog-featured__card" data-reveal="zoom">
        <a href="${featuredHref}" class="blog-featured__media">
          <img src="${esc(asset(featured.image))}" alt="" />
        </a>
        <div class="blog-featured__body">
          <span class="blog-chip">${esc(pick(featured.categoryLabel, featured.categoryLabel_en, featured.categoryLabel_ar))}</span>
          <h2>
            <a href="${featuredHref}">${esc(pick(featured.title, featured.title_en, featured.title_ar))}</a>
          </h2>
          <p>${esc(pick(featured.excerpt, featured.excerpt_en, featured.excerpt_ar))}</p>
          <div class="blog-meta">
            <span>${icon('Calendar', 14)}${esc(pick(featured.date, featured.date_en, featured.date_ar))}</span>
            <span>${icon('Clock', 14)}${esc(featured.readTime)}</span>
          </div>
          <a href="${featuredHref}" class="blog-featured__cta">
            ${esc(t('blog_read_more'))} ${icon('ArrowRight', 16)}
          </a>
        </div>
      </article>
    </section>

    <section class="acts-grid-section" id="blog-grid">
      <div class="acts-container" data-grid>${gridHtml()}</div>
    </section>

    <section class="acts-promo">
      <div class="acts-container acts-promo__inner">
        <div class="acts-promo__text" data-reveal="left">
          <span class="acts-promo__eyebrow">${esc(t('blog_promo_eyebrow'))}</span>
          <h2>${esc(t('blog_promo_title'))}</h2>
          <p>${esc(t('blog_promo_text'))}</p>
          <a href="${href('/contact')}" class="acts-promo__btn">
            ${esc(t('blog_promo_cta'))} ${icon('ArrowRight', 16)}
          </a>
        </div>
        <div class="acts-promo__visual" data-reveal="right">
          <img src="${asset('/images/sahara1.jpeg')}" alt="" />
          <div class="acts-promo__stats">
            <div><strong>${BLOG_POSTS.length}+</strong><span>${esc(t('blog_stat_articles'))}</span></div>
            <div><strong>4</strong><span>${esc(t('blog_stat_themes'))}</span></div>
            <div><strong>FR</strong><span>${esc(t('blog_stat_langs'))}</span></div>
            <div><strong>∞</strong><span>${esc(t('blog_stat_ideas'))}</span></div>
          </div>
        </div>
      </div>
    </section>

    ${footer()}
  </div>`;
};

const bind = (root) => {
  root.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('[data-filter]');
    if (!filterBtn) return;
    state.filter = filterBtn.getAttribute('data-filter');
    root.querySelector('[data-filters]').innerHTML = filtersHtml();
    root.querySelector('[data-grid]').innerHTML = gridHtml();
  });
};

mountPage({ route: '/blog', render, bind });
