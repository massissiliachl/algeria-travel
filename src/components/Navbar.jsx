// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../hooks/useLangHook';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const location = useLocation();
  const { language, changeLanguage, t } = useLang();
  const dropdownRef = useRef(null);

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
        <Link to="/gallery" className={`nav-link-btn ${isActive('/gallery') ? 'active' : ''}`}>
          {t('nav_gallery')}
        </Link>
        <Link to="/contact" className={`nav-link-btn ${isActive('/contact') ? 'active' : ''}`}>
          {t('nav_contact')}
        </Link>
      </div>
      
      <div className="nav-right">
        {/* Sélecteur de langue en forme de globe */}
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

        {/* Menu hamburger - LES 3 TRAITS EN BLANC SANS BORDURE */}
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
        <Link to="/gallery" className={`nav-link-btn ${isActive('/gallery') ? 'active' : ''}`}>
          {t('nav_gallery')}
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

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
          letter-spacing: 2px;
          transition: all 0.3s ease;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .logo span {
          color: var(--accent, #c6a43b);
        }

        /* Liens desktop - À DROITE */
        .nav-links-desktop {
          display: flex;
          gap: 32px;
          align-items: center;
          margin-left: auto;
          margin-right: 16px;
        }

        /* Zone droite (globe + menu burger) */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Menu hamburger - 3 TRAITS BLANC SANS BORDURE */
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
          transition: all 0.3s ease;
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
          background-color: white;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .mobile-menu-btn:hover .hamburger-icon span {
          background-color: var(--accent, #c6a43b);
        }

        /* Animation pour l'ouverture du menu */
        .nav-links-mobile.active ~ .nav-right .mobile-menu-btn .hamburger-icon span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .nav-links-mobile.active ~ .nav-right .mobile-menu-btn .hamburger-icon span:nth-child(2) {
          opacity: 0;
        }

        .nav-links-mobile.active ~ .nav-right .mobile-menu-btn .hamburger-icon span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        /* Correction pour l'animation du burger */
        .nav-links-mobile.active ~ .nav-right .mobile-menu-btn .hamburger-icon span {
          background-color: white;
        }

        /* Liens desktop */
        .nav-link-btn {
          color: white;
          text-decoration: none;
          font-size: 1rem;
          transition: all 0.3s ease;
          padding: 8px 0;
          position: relative;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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

        /* Language Dropdown */
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

        .navbar.scrolled .globe-btn {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
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

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .dropdown-item:hover {
          background: rgba(198, 164, 59, 0.2);
        }

        .dropdown-item.active {
          background: rgba(198, 164, 59, 0.3);
          color: #c6a43b;
        }

        .flag {
          font-size: 1.2rem;
        }

        .lang-name {
          flex: 1;
        }

        .check {
          color: #c6a43b;
          font-weight: bold;
        }

        /* Menu mobile */
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

        .nav-links-mobile.active {
          left: 0;
        }

        .nav-links-mobile .nav-link-btn {
          font-size: 1.2rem;
        }

        /* Desktop */
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
          
          .nav-links-mobile {
            display: none;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
            background: transparent;
            backdrop-filter: none;
          }
          
          .navbar.scrolled {
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(8px);
            padding: 0.8rem 1rem;
          }

          .logo {
            font-size: 1.2rem;
          }

          .nav-links-desktop {
            display: none;
          }

          .mobile-menu-btn {
            display: flex !important;
          }

          .globe-btn {
            width: 40px;
            height: 40px;
          }
        }

        /* Petit mobile */
        @media (max-width: 480px) {
          .logo {
            font-size: 1rem;
          }
          
          .globe-btn {
            width: 36px;
            height: 36px;
          }
          
          .globe-btn svg {
            width: 16px;
            height: 16px;
          }

          .hamburger-icon {
            width: 20px;
            height: 15px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;