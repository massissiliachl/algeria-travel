import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../hooks/useLangHook';
import Icon from './ui/Icon';
import TrackReservationBar from './TrackReservationBar';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const NAV_LINKS = [
  { key: 'home', href: '/', tKey: 'nav_home' },
  { key: 'destinations', href: '/destinations', tKey: 'nav_destinations' },
  { key: 'activities', href: '/activities', tKey: 'nav_activities' },
  { key: 'gallery', href: '/gallery', tKey: 'nav_gallery' },
  { key: 'tours', href: '/tours', tKey: 'nav_tours' },
  { key: 'blog', href: '/blog', tKey: 'nav_blog' },
  { key: 'track', href: '/suivi', tKey: 'nav_track' },
  { key: 'contact', href: '/contact', tKey: 'nav_about' },
];

const LANGS = [
  { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/w40/fr.png', flagAlt: 'France' },
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png', flagAlt: 'United Kingdom' },
  { code: 'ar', label: 'العربية', flag: 'https://flagcdn.com/w40/dz.png', flagAlt: 'Algérie' },
];

const Navbar = ({ variant = 'default' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLang();
  const langRef = useRef(null);
  const trackRef = useRef(null);
  const isHome = variant === 'home' || location.pathname === '/';
  const transparent = isHome && !scrolled && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
    setTrackOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (trackRef.current && !trackRef.current.contains(e.target)) setTrackOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNav = (e, link) => {
    if (link.hash && location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(link.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (link.hash) {
      e.preventDefault();
      navigate('/' + link.hash);
    }
    setMobileOpen(false);
  };

  const isActive = (link) => {
    if (link.key === 'home') return location.pathname === '/';
    if (link.key === 'activities') return location.pathname.startsWith('/activit');
    if (link.key === 'destinations') {
      return (
        location.pathname === '/destinations' ||
        location.pathname.startsWith('/place/')
      );
    }
    if (link.key === 'gallery') return location.pathname.startsWith('/gallery');
    if (link.key === 'tours') {
      return location.pathname.startsWith('/tours') || location.pathname.startsWith('/place/');
    }
    if (link.key === 'blog') return location.pathname.startsWith('/blog');
    if (link.key === 'track') return location.pathname.startsWith('/suivi');
    return location.pathname === link.href && !link.hash;
  };

  const currentLang = LANGS.find((l) => l.code === language) || LANGS[0];

  const mobileMenu = createPortal(
    <>
      <div
        className={`nav-mobile-overlay ${mobileOpen ? 'is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={`nav-mobile-drawer ${mobileOpen ? 'is-open' : ''}`}
        aria-hidden={!mobileOpen}
        aria-label="Menu"
      >
        <div className="nav-mobile-drawer__head">
          <span className="nav-mobile-drawer__brand">
            <img src="/logo.png" alt="" width={36} height={36} />
            ALGERIA <em>TRAVEL</em>
          </span>
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Fermer">
            <Icon name="X" size={20} />
          </button>
        </div>
        <nav className="nav-mobile-drawer__links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              to={link.href}
              className={isActive(link) ? 'is-active' : ''}
              onClick={(e) => handleNav(e, link)}
            >
              {t(link.tKey)}
            </Link>
          ))}
        </nav>
        <div className="nav-mobile-drawer__track">
          <TrackReservationBar variant="drawer" onDone={() => setMobileOpen(false)} />
        </div>
        <div className="nav-mobile-drawer__langs">
          <p>{t('nav_language')}</p>
          <div>
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                className={language === l.code ? 'is-active' : ''}
                onClick={() => changeLanguage(l.code)}
              >
                <img src={l.flag} alt={l.flagAlt} width={24} height={18} />
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>,
    document.body
  );

  return (
    <>
      <header
        className={[
          'premium-nav',
          scrolled ? 'premium-nav--scrolled' : '',
          transparent ? 'premium-nav--transparent' : '',
          mobileOpen ? 'premium-nav--menu-open' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className="premium-nav__inner">
          <Link to="/" className="premium-nav__logo" onClick={() => setMobileOpen(false)}>
            <img
              className="premium-nav__emblem"
              src="/logo.png"
              alt="Algeria Travel"
              width={40}
              height={40}
            />
            <span className="premium-nav__logo-text">
              ALGERIA <span>TRAVEL</span>
            </span>
          </Link>

          <nav className="premium-nav__links" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                to={link.href}
                className={`premium-nav__link ${isActive(link) ? 'active' : ''}`}
                onClick={(e) => handleNav(e, link)}
              >
                {t(link.tKey)}
              </Link>
            ))}
          </nav>

          <div className="premium-nav__actions">
            <NotificationBell />

            <div className="premium-nav__track" ref={trackRef}>
              <button
                className="premium-nav__icon-btn premium-nav__track-btn"
                type="button"
                aria-label={t('nav_track')}
                aria-expanded={trackOpen}
                onClick={() => {
                  setLangOpen(false);
                  setTrackOpen((o) => !o);
                }}
              >
                <Icon name="Search" size={18} />
                <span className="premium-nav__track-label">{t('nav_track_short')}</span>
              </button>
              {trackOpen && (
                <div className="premium-nav__track-panel">
                  <TrackReservationBar variant="nav" onDone={() => setTrackOpen(false)} />
                </div>
              )}
            </div>

            <button className="premium-nav__icon-btn premium-nav__heart" type="button" aria-label="Wishlist">
              <Icon name="Heart" size={18} />
            </button>

            <div className="premium-nav__lang" ref={langRef}>
              <button
                className="premium-nav__icon-btn premium-nav__lang-btn"
                onClick={() => setLangOpen((o) => !o)}
                aria-label="Language"
                type="button"
                aria-expanded={langOpen}
              >
                <img
                  className="premium-nav__flag-img"
                  src={currentLang.flag}
                  alt={currentLang.flagAlt}
                  width={22}
                  height={16}
                />
                <span className="premium-nav__lang-code">{currentLang.code.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="premium-nav__dropdown" role="listbox">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      role="option"
                      aria-selected={language === l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangOpen(false);
                      }}
                      className={language === l.code ? 'active' : ''}
                    >
                      <img className="premium-nav__flag-img" src={l.flag} alt={l.flagAlt} width={22} height={16} />
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className={`premium-nav__burger ${mobileOpen ? 'open' : ''}`}
              onClick={() => {
                setLangOpen(false);
                setTrackOpen(false);
                setMobileOpen((o) => !o);
              }}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
              type="button"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
      {mobileMenu}
    </>
  );
};

export default Navbar;
