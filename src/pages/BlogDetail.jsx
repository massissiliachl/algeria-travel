import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { getBlogPostBySlug, getRelatedBlogPosts } from '../data/blog';
import './Blog.css';
import './BlogDetail.css';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, pick } = useLang();

  const post = useMemo(() => getBlogPostBySlug(slug), [slug]);

  useEffect(() => {
    if (!post) {
      navigate('/blog', { replace: true });
      return;
    }
    window.scrollTo(0, 0);
  }, [post, navigate]);

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="blog-detail-loading">{t('loader_text') || '…'}</div>
        <Footer />
      </>
    );
  }

  const body = pick(post.body, post.body_en, post.body_ar) || '';
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  const gallery = post.gallery?.length ? post.gallery : [post.image];
  const related = getRelatedBlogPosts(post, 3);

  return (
    <div className="blog-detail-page">
      <Navbar />

      <section className="blog-detail-hero">
        <img className="blog-detail-hero__bg" src={post.image} alt="" />
        <div className="blog-detail-hero__overlay" />
        <div className="blog-detail-hero__inner">
          <nav className="blog-detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <Link to="/blog">{t('nav_blog')}</Link>
            <span>/</span>
            <span>{pick(post.categoryLabel, post.categoryLabel_en, post.categoryLabel_ar)}</span>
          </nav>
          <span className="blog-chip">
            {pick(post.categoryLabel, post.categoryLabel_en, post.categoryLabel_ar)}
          </span>
          <h1>{pick(post.title, post.title_en, post.title_ar)}</h1>
          <p className="blog-detail-hero__excerpt">
            {pick(post.excerpt, post.excerpt_en, post.excerpt_ar)}
          </p>
          <div className="blog-meta">
            <span>
              <Icon name="Calendar" size={14} />
              {pick(post.date, post.date_en, post.date_ar)}
            </span>
            <span>
              <Icon name="Clock" size={14} />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      <article className="blog-detail-article">
        <div className="blog-detail-article__wrap">
          <Link to="/blog" className="blog-detail-back">
            <Icon name="ChevronLeft" size={18} /> {t('blog_detail_back')}
          </Link>

          <div className="blog-detail-article__body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {gallery.length > 1 && (
            <div className="blog-detail-gallery" aria-label="Galerie">
              {gallery.map((src) => (
                <img key={src} src={src} alt="" loading="lazy" />
              ))}
            </div>
          )}

          {post.ctaPath && (
            <div className="blog-detail-cta">
              <p>{t('blog_detail_cta_text')}</p>
              <Link to={post.ctaPath} className="blog-detail-cta__btn">
                {pick(post.ctaLabel, post.ctaLabel_en, post.ctaLabel_ar)}
                <Icon name="ArrowRight" size={16} />
              </Link>
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="blog-detail-related">
          <div className="blog-detail-related__wrap">
            <h2>{t('blog_detail_related')}</h2>
            <div className="blog-detail-related__grid">
              {related.map((r) => (
                <Link key={r.id} to={`/blog/${r.slug}`} className="blog-detail-related__card">
                  <img src={r.image} alt="" loading="lazy" />
                  <div>
                    <span className="blog-chip blog-chip--dark">
                      {pick(r.categoryLabel, r.categoryLabel_en, r.categoryLabel_ar)}
                    </span>
                    <h3>{pick(r.title, r.title_en, r.title_ar)}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogDetail;
