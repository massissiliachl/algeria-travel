import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import './Gallery.css';

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

const STORAGE_KEY = 'gallery_reactions_v3';

const Gallery = () => {
  const { t } = useLang();
  const [images, setImages] = useState(INIT_IMAGES);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [ready, setReady] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [burst, setBurst] = useState([]);
  const [pulse, setPulse] = useState({ like: false, dislike: false });
  const gridRef = useRef(null);
  const heroRef = useRef(null);
  const burstId = useRef(0);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => setReady(true));
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) setImages(parsed);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INIT_IMAGES));
      }
    } catch {
      setImages(INIT_IMAGES);
    }
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

  const save = useCallback((next) => {
    setImages(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
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

  const handleLike = (id) => {
    spawnBurst('like');
    triggerPulse('like');
    save(
      images.map((img) =>
        img.id === id ? { ...img, likes: (img.likes || 0) + 1 } : img
      )
    );
  };

  const handleDislike = (id) => {
    spawnBurst('dislike');
    triggerPulse('dislike');
    save(
      images.map((img) =>
        img.id === id ? { ...img, dislikes: (img.dislikes || 0) + 1 } : img
      )
    );
  };

  const handleAddComment = (id) => {
    if (!commentText.trim()) return;
    const comment = {
      id: Date.now(),
      user: 'Voyageur',
      text: commentText.trim(),
      date: new Date().toLocaleDateString(),
    };
    save(
      images.map((img) =>
        img.id === id
          ? { ...img, comments: [comment, ...(img.comments || [])] }
          : img
      )
    );
    setCommentText('');
  };

  const currentImage =
    selectedIndex !== null ? images[selectedIndex] : null;

  const goPrev = () => {
    if (selectedIndex === null) return;
    setShowComments(false);
    setSelectedIndex(
      selectedIndex > 0 ? selectedIndex - 1 : images.length - 1
    );
  };

  const goNext = () => {
    if (selectedIndex === null) return;
    setShowComments(false);
    setSelectedIndex(
      selectedIndex < images.length - 1 ? selectedIndex + 1 : 0
    );
  };

  useEffect(() => {
    if (selectedIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
        setShowComments(false);
      }
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

  return (
    <div className={`gal ${ready ? 'is-ready' : ''}`}>
      <Navbar />

      <header className="gal-hero" ref={heroRef}>
        <div
          className="gal-hero__media"
          style={{ transform: `translate3d(0, ${parallax}px, 0)` }}
        >
          <img src="/images/sahara4.jpeg" alt="" />
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
              onClick={() => {
                setSelectedIndex(i);
                setShowComments(false);
              }}
              aria-label={`${t('nav_gallery')} ${i + 1}`}
            >
              <img src={image.src} alt="" loading="lazy" />
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
          onClick={() => {
            setSelectedIndex(null);
            setShowComments(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="gal-lb__x"
            aria-label="Close"
            onClick={() => {
              setSelectedIndex(null);
              setShowComments(false);
            }}
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
                alt=""
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
                }`}
                onClick={() => handleLike(currentImage.id)}
              >
                <span className="gal-react__3d">
                  <Icon name="Heart" size={20} />
                </span>
                <span className={`gal-react__count ${pulse.like ? 'is-flip' : ''}`}>
                  {currentImage.likes}
                </span>
              </button>

              <button
                type="button"
                className={`gal-react__btn gal-react__btn--dislike ${
                  pulse.dislike ? 'is-pop' : ''
                }`}
                onClick={() => handleDislike(currentImage.id)}
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

              <button
                type="button"
                className={`gal-react__btn gal-react__btn--comment ${
                  showComments ? 'is-on' : ''
                }`}
                onClick={() => setShowComments((v) => !v)}
              >
                <span className="gal-react__3d">
                  <Icon name="MessageCircle" size={18} />
                </span>
                <span className="gal-react__count">
                  {currentImage.comments?.length || 0}
                </span>
              </button>
            </div>

            <div
              className={`gal-comments ${showComments ? 'is-open' : ''}`}
            >
              <h3>{t('gallery_comments_title')}</h3>
              <div className="gal-comments__form">
                <textarea
                  rows={2}
                  placeholder={t('gallery_comment_placeholder')}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="button"
                  disabled={!commentText.trim()}
                  onClick={() => handleAddComment(currentImage.id)}
                >
                  {t('gallery_send')}
                </button>
              </div>
              {(currentImage.comments?.length || 0) === 0 ? (
                <p className="gal-comments__empty">{t('gallery_no_comments')}</p>
              ) : (
                currentImage.comments.map((c) => (
                  <article key={c.id} className="gal-comments__item">
                    <strong>{c.user}</strong>
                    <time>{c.date}</time>
                    <p>{c.text}</p>
                  </article>
                ))
              )}
            </div>
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
