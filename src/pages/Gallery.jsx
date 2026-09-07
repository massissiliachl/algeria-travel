import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { api } from '../services/api';
import { resolveMediaUrl, MEDIA_PLACEHOLDER } from '../utils/mediaUrl';
import SeoHead from '../components/SeoHead';
import CommentThread from '../components/comments/CommentThread';
import './Gallery.css';

const FALLBACK_IMAGES = [
  { id: 1, src: '/images/sahara1.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 2, src: '/images/sahara2.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 3, src: '/images/sahara3.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 4, src: '/images/sahara4.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 5, src: '/images/sahara5.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 6, src: '/images/sahara6.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 7, src: '/images/sahara7.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 8, src: '/images/sahara8.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 9, src: '/images/galery.jpg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 10, src: '/images/quad.jpg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 11, src: '/images/quad1.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 12, src: '/images/quatre-quatre.jpg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 13, src: '/images/chameau.jpg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 14, src: '/images/kayak.jpeg', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
  { id: 15, src: '/images/visitekseurs.webp', likes: 0, dislikes: 0, userReaction: null, fromApi: false },
];

function mapGalleryItem(item) {
  const src = item.src?.startsWith('/images/') ? item.src : resolveMediaUrl(item.src);
  return {
    id: item.id,
    src,
    alt: item.alt || '',
    captionFr: item.captionFr,
    likes: item.likes ?? 0,
    dislikes: item.dislikes ?? 0,
    userReaction: item.userReaction ?? null,
    fromApi: true,
  };
}

function onImgError(e) {
  if (e.currentTarget.src.includes('logo.svg')) return;
  e.currentTarget.src = MEDIA_PLACEHOLDER;
}

const Gallery = () => {
  const { t } = useLang();
  const [images, setImages] = useState(FALLBACK_IMAGES);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [ready, setReady] = useState(false);
  const [burst, setBurst] = useState([]);
  const [pulse, setPulse] = useState({ like: false, dislike: false });
  const [reacting, setReacting] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const gridRef = useRef(null);
  const heroRef = useRef(null);
  const burstId = useRef(0);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => setReady(true));

    api
      .getGallery()
      .then((items) => {
        if (!Array.isArray(items) || !items.length) {
          setImages(FALLBACK_IMAGES);
          return;
        }
        setImages(items.map(mapGalleryItem));
        setApiOnline(true);
      })
      .catch(() => {
        setImages(FALLBACK_IMAGES);
        setApiOnline(false);
      });

    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setParallax(Math.min(y * 0.35, 120));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = gridRef.current;
    if (!root) return undefined;
    const nodes = root.querySelectorAll('[data-gal-in]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      nodes.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    );
    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [images]);

  const updateImageStats = useCallback((id, stats) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              likes: stats.likes,
              dislikes: stats.dislikes,
              userReaction: stats.userReaction,
            }
          : img
      )
    );
  }, []);

  const spawnBurst = (kind) => {
    const particles = Array.from({ length: kind === 'like' ? 10 : 6 }, (_, i) => ({
      id: burstId.current + i,
      kind,
      x: (Math.random() - 0.5) * 140,
      y: -40 - Math.random() * 100,
      z: (Math.random() - 0.5) * 80,
      rot: (Math.random() - 0.5) * 60,
      delay: Math.random() * 0.12,
    }));
    burstId.current += particles.length;
    setBurst(particles);
    window.setTimeout(() => setBurst([]), 900);
  };

  const triggerPulse = (key) => {
    setPulse((p) => ({ ...p, [key]: true }));
    window.setTimeout(() => setPulse((p) => ({ ...p, [key]: false })), 650);
  };

  const handleReaction = async (id, reaction) => {
    const img = images.find((i) => i.id === id);
    if (!img?.fromApi || reacting) return;

    spawnBurst(reaction);
    triggerPulse(reaction);
    setReacting(true);

    try {
      const stats = await api.setGalleryReaction(id, reaction);
      updateImageStats(id, stats);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setReacting(false);
    }
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      selectedIndex > 0 ? selectedIndex - 1 : images.length - 1
    );
  };

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      selectedIndex < images.length - 1 ? selectedIndex + 1 : 0
    );
  };

  useEffect(() => {
    if (selectedIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, images]);

  const currentImage =
    selectedIndex !== null ? images[selectedIndex] : null;

  const heroImage = images[3]?.src || images[0]?.src || '/images/sahara4.jpeg';

  return (
    <div className={`gal ${ready ? 'is-ready' : ''}`}>
      <SeoHead
        title={t('seo_gallery_title')}
        description={t('seo_gallery_desc')}
        path="/gallery"
        image={heroImage}
      />
      <Navbar />

      <header className="gal-hero" ref={heroRef}>
        <div
          className="gal-hero__media"
          style={{ transform: `translate3d(0, ${parallax}px, 0)` }}
        >
          <img src={heroImage} alt="" onError={onImgError} />
        </div>
        <div className="gal-hero__veil" />
        <div className="gal-hero__fluid" aria-hidden>
          <span className="gal-hero__blob gal-hero__blob--1" />
          <span className="gal-hero__blob gal-hero__blob--2" />
          <span className="gal-hero__blob gal-hero__blob--3" />
        </div>

        <div className="gal-hero__inner">
          <p className="gal-a gal-a--1 gal-hero__brand">
            Algeria <em>Travel</em>
          </p>
          <h1 className="gal-a gal-a--2">
            <span className="gal-hero__line">{t('gallery_hero_title')}</span>
            <em className="gal-hero__line gal-hero__line--em">
              {t('gallery_hero_title_span')}
            </em>
          </h1>
          <button
            type="button"
            className="gal-a gal-a--3 gal-hero__scroll"
            onClick={() =>
              gridRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
            aria-label={t('gallery_scroll_hint')}
          >
            <span className="gal-hero__scroll-orb">
              <span />
            </span>
            <span className="gal-hero__scroll-label">
              {t('gallery_scroll_hint')}
            </span>
          </button>
        </div>

        <svg
          className="gal-hero__wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            className="gal-hero__wave-fill"
            d="M0,64 C240,120 480,20 720,64 C960,108 1200,40 1440,72 L1440,120 L0,120 Z"
          />
        </svg>
      </header>

      <main className="gal-body" ref={gridRef}>
        <div className="gal-bento">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              className={`gal-cell gal-cell--${(i % 8) + 1}`}
              data-gal-in
              style={{ transitionDelay: `${(i % 6) * 60}ms` }}
              onClick={() => setSelectedIndex(i)}
              aria-label={`${t('nav_gallery')} ${i + 1}`}
            >
              <img src={image.src} alt={image.alt || ''} loading="lazy" onError={onImgError} />
              <span className="gal-cell__likes" aria-hidden>
                <Icon name="Heart" size={12} />
                <span>{image.likes}</span>
              </span>
            </button>
          ))}
        </div>
      </main>

      {currentImage && (
        <div
          className="gal-lb"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="gal-lb__x"
            aria-label="Close"
            onClick={() => setSelectedIndex(null)}
          >
            <Icon name="X" size={20} />
          </button>
          <button
            type="button"
            className="gal-lb__btn gal-lb__btn--prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <Icon name="ChevronLeft" size={22} />
          </button>

          <div
            className="gal-lb__stage"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gal-lb__visual">
              <img
                className="gal-lb__pic"
                key={currentImage.id}
                src={currentImage.src}
                alt={currentImage.alt || ''}
                onError={onImgError}
              />
              <div className="gal-burst" aria-hidden>
                {burst.map((p) => (
                  <span
                    key={p.id}
                    className={`gal-burst__p gal-burst__p--${p.kind}`}
                    style={{
                      '--bx': `${p.x}px`,
                      '--by': `${p.y}px`,
                      '--bz': `${p.z}px`,
                      '--br': `${p.rot}deg`,
                      animationDelay: `${p.delay}s`,
                    }}
                  >
                    {p.kind === 'like' ? '♥' : '−'}
                  </span>
                ))}
              </div>
            </div>

            <div className="gal-react">
              <button
                type="button"
                className={`gal-react__btn gal-react__btn--like ${
                  pulse.like ? 'is-pop' : ''
                } ${currentImage.userReaction === 'like' ? 'is-active' : ''}`}
                onClick={() => handleReaction(currentImage.id, 'like')}
                disabled={!currentImage.fromApi || reacting}
                aria-pressed={currentImage.userReaction === 'like'}
              >
                <span className="gal-react__3d">
                  <Icon
                    name="Heart"
                    size={20}
                    fill={currentImage.userReaction === 'like' ? 'currentColor' : 'none'}
                  />
                </span>
                <span className={`gal-react__count ${pulse.like ? 'is-flip' : ''}`}>
                  {currentImage.likes}
                </span>
              </button>

              <button
                type="button"
                className={`gal-react__btn gal-react__btn--dislike ${
                  pulse.dislike ? 'is-pop' : ''
                } ${currentImage.userReaction === 'dislike' ? 'is-active' : ''}`}
                onClick={() => handleReaction(currentImage.id, 'dislike')}
                disabled={!currentImage.fromApi || reacting}
                aria-pressed={currentImage.userReaction === 'dislike'}
              >
                <span className="gal-react__3d">
                  <Icon name="ThumbsDown" size={18} />
                </span>
                <span
                  className={`gal-react__count ${
                    pulse.dislike ? 'is-flip' : ''
                  }`}
                >
                  {currentImage.dislikes}
                </span>
              </button>
            </div>

            {(!apiOnline || !currentImage.fromApi) && (
              <p className="gal-api-hint" role="status">
                {t('gallery_api_offline')}
              </p>
            )}

            <p className="gal-lb__scroll-hint" aria-hidden="true">
              {t('gallery_scroll_comments')}
            </p>

            <CommentThread
              key={currentImage.id}
              itemType="gallery"
              itemId={currentImage.id}
              t={t}
              variant="dark"
              title={t('gallery_comments_title')}
            />
          </div>

          <button
            type="button"
            className="gal-lb__btn gal-lb__btn--next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <Icon name="ChevronRight" size={22} />
          </button>
          <p className="gal-lb__n">
            {selectedIndex + 1} / {images.length}
          </p>
        </div>
      )}

      <nav className="gal-navlinks">
        <Link to="/">{t('nav_home')}</Link>
        <Link to="/destinations">{t('nav_destinations')}</Link>
        <Link to="/contact">{t('nav_contact')}</Link>
      </nav>

      <Footer />
    </div>
  );
};

export default Gallery;
