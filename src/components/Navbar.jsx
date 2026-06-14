// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../hooks/useLangHook';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  });
  
  const location = useLocation();
  const { language, changeLanguage, t } = useLang();
  const dropdownRef = useRef(null);

  // Appliquer le thème au body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setLangDropdownOpen(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="logo" onClick={(e) => {
        if (location.pathname === '/') {
          e.preventDefault();
          handleSmoothScroll(e, 'hero');
        }
      }}>
        ALGERIA <span>TRAVEL</span>
      </Link>
      
      {/* Liens de navigation - à droite */}
      <div className="nav-links-desktop">
        <Link to="/" className={`nav-link-btn ${isActive('/') ? 'active' : ''}`}>
          {t('nav_home')}
        </Link>
        <Link to="/destinations" className={`nav-link-btn ${isActive('/destinations') ? 'active' : ''}`}>
          {t('nav_destinations')}
        </Link>
        <Link to="/contact" className={`nav-link-btn ${isActive('/contact') ? 'active' : ''}`}>
          {t('nav_contact')}
        </Link>
      </div>
      
      <div className="nav-right">
        {/* Bouton thème clair/sombre */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C10.6868 3 9.38642 3.25866 8.17317 3.7612C6.95991 4.26375 5.85752 5.00035 4.92893 5.92893C3.05357 7.8043 2 10.3478 2 13C2 15.6522 3.05357 18.1957 4.92893 20.0711C5.85752 20.9997 6.95991 21.7362 8.17317 22.2388C9.38642 22.7413 10.6868 23 12 23C14.6522 23 17.1957 21.9464 19.0711 20.0711C20.9464 18.1957 22 15.6522 22 13C22 11.6868 21.7413 10.3864 21.2388 9.17317C20.7362 7.95991 19.9997 6.85752 19.0711 5.92893C18.1425 5.00035 17.0401 4.26375 15.8268 3.7612C14.6136 3.25866 13.3132 3 12 3Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M12 7C11.2043 7 10.4154 7.14897 9.68257 7.43884C8.94973 7.72871 8.28577 8.15304 7.72434 8.68423C7.1629 9.21543 6.71404 9.84357 6.4029 10.5405C6.09175 11.2374 5.92415 11.9884 5.90996 12.7495C5.89576 13.5106 6.0355 14.2678 6.32073 14.9763C6.60596 15.6848 7.03096 16.3305 7.57317 16.8667C8.11538 17.4029 8.76216 17.8194 9.47852 18.1028C10.1949 18.3862 10.9653 18.5309 11.742 18.5288" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        {/* Sélecteur de langue */}
        <div className="language-dropdown" ref={dropdownRef}>
          <button 
            className="globe-btn"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            aria-label="Changer la langue"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          
          {langDropdownOpen && (
            <div className="dropdown-menu">
              <button 
                onClick={() => handleLanguageChange('fr')}
                className={`dropdown-item ${language === 'fr' ? 'active' : ''}`}
              >
                <span className="flag">🇫🇷</span>
                <span className="lang-name">Français</span>
                {language === 'fr' && <span className="check">✓</span>}
              </button>
              <button 
                onClick={() => handleLanguageChange('en')}
                className={`dropdown-item ${language === 'en' ? 'active' : ''}`}
              >
                <span className="flag">🇬🇧</span>
                <span className="lang-name">English</span>
                {language === 'en' && <span className="check">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Menu hamburger */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
      
      {/* Menu mobile */}
      <div className={`nav-links-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        <Link to="/" className={`nav-link-btn ${isActive('/') ? 'active' : ''}`}>
          {t('nav_home')}
        </Link>
        <Link to="/destinations" className={`nav-link-btn ${isActive('/destinations') ? 'active' : ''}`}>
          {t('nav_destinations')}
        </Link>
        <Link to="/contact" className={`nav-link-btn ${isActive('/contact') ? 'active' : ''}`}>
          {t('nav_contact')}
        </Link>
      </div>

      <style>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          transform: translateZ(0);
          transition: all 0.4s ease;
          background: transparent;
          backdrop-filter: none;
        }

        .navbar.scrolled {
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          padding: 1rem 2rem;
        }

        /* Mode clair - navbar scrolled */
        [data-theme="light"] .navbar.scrolled {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-dark);
          text-decoration: none;
          letter-spacing: 2px;
          transition: all 0.3s ease;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* Mode clair - logo */
        [data-theme="light"] .logo {
          color: #111;
          text-shadow: none;
        }

        .logo span {
          color: var(--accent, #c6a43b);
        }

        .nav-links-desktop {
          display: flex;
          gap: 32px;
          align-items: center;
          margin-left: auto;
          margin-right: 16px;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Bouton thème */
        .theme-toggle-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-dark);
        }

        [data-theme="light"] .theme-toggle-btn {
          border: 1px solid rgba(0, 0, 0, 0.2);
          color: #111;
        }

        .theme-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: var(--accent, #c6a43b);
          transform: scale(1.05);
          color: var(--accent, #c6a43b);
        }

        [data-theme="light"] .theme-toggle-btn:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .mobile-menu-btn {
          background: transparent;
          border: none;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .hamburger-icon {
          width: 24px;
          height: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hamburger-icon span {
          display: block;
          width: 100%;
          height: 2px;
          background-color: var(--text-dark);
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        [data-theme="light"] .hamburger-icon span {
          background-color: #111;
        }

        .mobile-menu-btn:hover .hamburger-icon span {
          background-color: var(--accent, #c6a43b);
        }

        .nav-links-mobile.active ~ .nav-right .mobile-menu-btn .hamburger-icon span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .nav-links-mobile.active ~ .nav-right .mobile-menu-btn .hamburger-icon span:nth-child(2) {
          opacity: 0;
        }
        .nav-links-mobile.active ~ .nav-right .mobile-menu-btn .hamburger-icon span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        .nav-link-btn {
          color: var(--text-dark);
          text-decoration: none;
          font-size: 1rem;
          transition: all 0.3s ease;
          padding: 8px 0;
          position: relative;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        [data-theme="light"] .nav-link-btn {
          color: #111;
          text-shadow: none;
        }

        .nav-link-btn:hover {
          color: var(--accent, #c6a43b);
        }
        .nav-link-btn.active {
          color: var(--accent, #c6a43b);
        }
        .nav-link-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent, #c6a43b);
        }

        .language-dropdown {
          position: relative;
        }

        .globe-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        [data-theme="light"] .globe-btn {
          border: 1px solid rgba(0, 0, 0, 0.2);
          color: #111;
        }

        .globe-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: var(--accent, #c6a43b);
          transform: scale(1.05);
          color: var(--accent, #c6a43b);
        }

        .dropdown-menu {
          position: absolute;
          top: 50px;
          right: 0;
          background: #111;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          min-width: 160px;
          overflow: hidden;
          z-index: 1000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: fadeInDown 0.2s ease;
        }

        [data-theme="light"] .dropdown-menu {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          width: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: #fff;
          text-align: left;
        }

        [data-theme="light"] .dropdown-item {
          color: #111;
        }

        .dropdown-item:hover {
          background: rgba(198, 164, 59, 0.2);
        }
        .dropdown-item.active {
          background: rgba(198, 164, 59, 0.3);
          color: #c6a43b;
        }

        .flag { font-size: 1.2rem; }
        .lang-name { flex: 1; }
        .check { color: #c6a43b; font-weight: bold; }

        .nav-links-mobile {
          position: fixed;
          top: 70px;
          left: -100%;
          width: 100%;
          height: calc(100vh - 70px);
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 40px;
          transition: left 0.3s ease;
          z-index: 9999;
          display: flex;
        }

        [data-theme="light"] .nav-links-mobile {
          background: rgba(255, 255, 255, 0.95);
        }

        .nav-links-mobile.active { left: 0; }
        .nav-links-mobile .nav-link-btn { font-size: 1.2rem; }

        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .nav-links-mobile { display: none; }
        }

        @media (max-width: 768px) {
          .navbar { padding: 1rem; }
          .navbar.scrolled { padding: 0.8rem 1rem; }
          .logo { font-size: 1.2rem; }
          .nav-links-desktop { display: none; }
          .mobile-menu-btn { display: flex !important; }
          .globe-btn, .theme-toggle-btn { width: 40px; height: 40px; }
        }

        @media (max-width: 480px) {
          .logo { font-size: 1rem; }
          .globe-btn, .theme-toggle-btn { width: 36px; height: 36px; }
          .globe-btn svg, .theme-toggle-btn svg { width: 16px; height: 16px; }
          .hamburger-icon { width: 20px; height: 15px; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;