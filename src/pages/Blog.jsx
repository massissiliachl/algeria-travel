import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { BLOG_POSTS, BLOG_FILTERS } from '../data/blog';
import './Activities.css';
import './Blog.css';

const Blog = () => {
  const { t, pick } = useLang();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return BLOG_POSTS;
    return BLOG_POSTS.filter((p) => p.category === filter);
  }, [filter]);

  const featured = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];

  return (
    <div className="acts-page blog-page">
      <Navbar />

      <section className="acts-hero blog-hero">
        <img className="acts-hero__bg" src="/images/hero.jpeg" alt="" />
        <div className="acts-hero__overlay" />
        <div className="acts-hero__inner" data-reveal="fade">
          <nav className="acts-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <span>{t('nav_blog')}</span>
          </nav>
          <h1 className="acts-hero__title">
            {t('blog_hero_title_before')}
            <em> {t('blog_hero_title_em')} </em>
            {t('blog_hero_title_after')}
          </h1>
          <p className="acts-hero__subtitle">{t('blog_hero_subtitle')}</p>
        </div>
      </section>

      <div className="acts-filters-wrap blog-filters-wrap" data-reveal>
        <div className="acts-filters" role="tablist">
          {BLOG_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`acts-filters__btn ${filter === f.key ? 'is-active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              <Icon name={f.icon} size={18} strokeWidth={1.75} />
              <span>{pick(f.fr, f.en, f.ar)}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="blog-featured acts-container" id="blog-featured">
        <article className="blog-featured__card" data-reveal="zoom">
          <Link to={`/blog/${featured.slug}`} className="blog-featured__media">
            <img src={featured.image} alt="" />
          </Link>
          <div className="blog-featured__body">
            <span className="blog-chip">
              {pick(featured.categoryLabel, featured.categoryLabel_en, featured.categoryLabel_ar)}
            </span>
            <h2>
              <Link to={`/blog/${featured.slug}`}>
                {pick(featured.title, featured.title_en, featured.title_ar)}
              </Link>
            </h2>
            <p>{pick(featured.excerpt, featured.excerpt_en, featured.excerpt_ar)}</p>
            <div className="blog-meta">
              <span>
                <Icon name="Calendar" size={14} />
                {pick(featured.date, featured.date_en, featured.date_ar)}
              </span>
              <span>
                <Icon name="Clock" size={14} />
                {featured.readTime}
              </span>
            </div>
            <Link to={`/blog/${featured.slug}`} className="blog-featured__cta">
              {t('blog_read_more')} <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        </article>
      </section>

      <section className="acts-grid-section" id="blog-grid">
        <div className="acts-container">
          <div className="blog-grid">
            {filtered.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="blog-card"
                data-reveal
                data-delay={i * 60}
              >
                <img src={post.image} alt="" loading="lazy" />
                <div className="blog-card__body">
                  <span className="blog-chip blog-chip--dark">
                    {pick(post.categoryLabel, post.categoryLabel_en, post.categoryLabel_ar)}
                  </span>
                  <h3>{pick(post.title, post.title_en, post.title_ar)}</h3>
                  <p>{pick(post.excerpt, post.excerpt_en, post.excerpt_ar)}</p>
                  <div className="blog-meta blog-meta--muted">
                    <span>{pick(post.date, post.date_en, post.date_ar)}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="acts-empty">{t('blog_empty')}</p>
          )}
        </div>
      </section>

      <section className="acts-promo">
        <div className="acts-container acts-promo__inner">
          <div className="acts-promo__text" data-reveal="left">
            <span className="acts-promo__eyebrow">{t('blog_promo_eyebrow')}</span>
            <h2>{t('blog_promo_title')}</h2>
            <p>{t('blog_promo_text')}</p>
            <Link to="/contact" className="acts-promo__btn">
              {t('blog_promo_cta')} <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
          <div className="acts-promo__visual" data-reveal="right">
            <img src="/images/sahara1.jpeg" alt="" />
            <div className="acts-promo__stats">
              <div><strong>{BLOG_POSTS.length}+</strong><span>{t('blog_stat_articles')}</span></div>
              <div><strong>4</strong><span>{t('blog_stat_themes')}</span></div>
              <div><strong>FR</strong><span>{t('blog_stat_langs')}</span></div>
              <div><strong>∞</strong><span>{t('blog_stat_ideas')}</span></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
