import { mountPage, navbar, footer } from '../core/layout.js';
import { t, pick } from '../core/i18n.js';
import { icon } from '../core/icons.js';
import { href, navigate, params } from '../core/router.js';
import { esc, asset } from '../core/dom.js';
import { getBlogPostBySlug, getRelatedBlogPosts } from '../data/blog.js';

const slug = params().get('slug') || '';
const post = getBlogPostBySlug(slug);

const render = () => {
  if (!post) {
    return `
      ${navbar()}
      <div class="blog-detail-loading">${esc(t('loader_text') || '…')}</div>
      ${footer()}`;
  }

  const body = pick(post.body, post.body_en, post.body_ar) || '';
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  const gallery = post.gallery?.length ? post.gallery : [post.image];
  const related = getRelatedBlogPosts(post, 3);
  const category = esc(pick(post.categoryLabel, post.categoryLabel_en, post.categoryLabel_ar));

  return `
  <div class="blog-detail-page">
    ${navbar()}

    <section class="blog-detail-hero">
      <img class="blog-detail-hero__bg" src="${esc(asset(post.image))}" alt="" />
      <div class="blog-detail-hero__overlay"></div>
      <div class="blog-detail-hero__inner">
        <nav class="blog-detail-breadcrumb" aria-label="Breadcrumb">
          <a href="${href('/')}">${esc(t('nav_home'))}</a>
          <span>/</span>
          <a href="${href('/blog')}">${esc(t('nav_blog'))}</a>
          <span>/</span>
          <span>${category}</span>
        </nav>
        <span class="blog-chip">${category}</span>
        <h1>${esc(pick(post.title, post.title_en, post.title_ar))}</h1>
        <p class="blog-detail-hero__excerpt">${esc(pick(post.excerpt, post.excerpt_en, post.excerpt_ar))}</p>
        <div class="blog-meta">
          <span>${icon('Calendar', 14)}${esc(pick(post.date, post.date_en, post.date_ar))}</span>
          <span>${icon('Clock', 14)}${esc(post.readTime)}</span>
        </div>
      </div>
    </section>

    <article class="blog-detail-article">
      <div class="blog-detail-article__wrap">
        <a href="${href('/blog')}" class="blog-detail-back">
          ${icon('ChevronLeft', 18)} ${esc(t('blog_detail_back'))}
        </a>

        <div class="blog-detail-article__body">
          ${paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
        </div>

        ${
          gallery.length > 1
            ? `<div class="blog-detail-gallery" aria-label="Galerie">
                ${gallery.map((src) => `<img src="${esc(asset(src))}" alt="" loading="lazy" />`).join('')}
              </div>`
            : ''
        }

        ${
          post.ctaPath
            ? `<div class="blog-detail-cta">
                <p>${esc(t('blog_detail_cta_text'))}</p>
                <a href="${esc(href(post.ctaPath))}" class="blog-detail-cta__btn">
                  ${esc(pick(post.ctaLabel, post.ctaLabel_en, post.ctaLabel_ar))}
                  ${icon('ArrowRight', 16)}
                </a>
              </div>`
            : ''
        }
      </div>
    </article>

    ${
      related.length > 0
        ? `<section class="blog-detail-related">
            <div class="blog-detail-related__wrap">
              <h2>${esc(t('blog_detail_related'))}</h2>
              <div class="blog-detail-related__grid">
                ${related
                  .map(
                    (r) => `
                  <a href="${esc(href(`/blog/${r.slug}`))}" class="blog-detail-related__card">
                    <img src="${esc(asset(r.image))}" alt="" loading="lazy" />
                    <div>
                      <span class="blog-chip blog-chip--dark">${esc(pick(r.categoryLabel, r.categoryLabel_en, r.categoryLabel_ar))}</span>
                      <h3>${esc(pick(r.title, r.title_en, r.title_ar))}</h3>
                    </div>
                  </a>`
                  )
                  .join('')}
              </div>
            </div>
          </section>`
        : ''
    }

    ${footer()}
  </div>`;
};

if (!post) navigate('/blog', { replace: true });

mountPage({ route: `/blog/${slug}`, render });
