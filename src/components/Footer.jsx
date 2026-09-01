import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../hooks/useLangHook';
import Icon from './ui/Icon';
import NotificationEnableButton from './NotificationEnableButton';
import './Footer.css';

const FOOTER_LINKS = [
  { to: '/destinations', tKey: 'nav_destinations' },
  { to: '/activities', tKey: 'nav_activities' },
  { to: '/hotels', tKey: 'hotels_nav' },
  { to: '/tours', tKey: 'nav_tours' },
  { to: '/gallery', tKey: 'nav_gallery' },
  { to: '/blog', tKey: 'nav_blog' },
  { to: '/contact', tKey: 'nav_contact' },
  { to: '/suivi', tKey: 'nav_track' },
];

const SOCIALS = [
  { type: 'instagram', href: 'https://www.instagram.com/', label: 'Instagram' },
  { type: 'facebook', href: 'https://www.facebook.com/', label: 'Facebook' },
  { type: 'tiktok', href: 'https://www.tiktok.com/', label: 'TikTok' },
];

const SocialIcon = ({ type }) => {
  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M14.5 3.5c.4 2.1 1.6 3.5 3.5 4.2v2.3c-1.3-.05-2.5-.45-3.6-1.15v5.55c0 3.4-2.7 5.9-6.2 5.9S2 17.8 2 14.4c0-3.3 2.5-5.8 5.8-5.9v2.4c-1.8.1-3.1 1.4-3.1 3.4 0 2.1 1.5 3.6 3.5 3.6s3.4-1.5 3.4-3.6V3.5h2.9z" />
    </svg>
  );
};

const Footer = () => {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link to="/" className="site-footer__logo">
              <img src="/logo.png" alt="" width={44} height={44} />
              <span>
                Algeria <em>Travel</em>
              </span>
            </Link>
            <p>{t('footer_tagline')}</p>
          </div>

          <nav className="site-footer__links" aria-label={t('footer_quick')}>
            {FOOTER_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {t(link.tKey)}
              </Link>
            ))}
          </nav>

          <div className="site-footer__aside">
            <a href="tel:+213557664089" className="site-footer__phone">
              <Icon name="Phone" size={16} />
              00213 557 664 089
            </a>
            <a href="mailto:Algeria.travel@gmail.com" className="site-footer__mail">
              Algeria.travel@gmail.com
            </a>
            <p className="site-footer__addr">Russel en face Stade · Béjaïa · Algérie</p>
            <div className="site-footer__actions">
              <a
                className="site-footer__wa"
                href={`https://wa.me/213557664089?text=${encodeURIComponent(
                  'Bonjour, je souhaite des infos sur Algeria Travel'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="MessageCircle" size={16} />
                WhatsApp
              </a>
              <NotificationEnableButton className="site-footer__notify" />
            </div>
            <div className="site-footer__social">
              {SOCIALS.map((s) => (
                <a
                  key={s.type}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  <SocialIcon type={s.type} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {year} Algeria Travel — {t('footer_rights')}</p>
          <div className="site-footer__legal">
            <Link to="/contact">{t('footer_legal')}</Link>
            <Link to="/privacy">{t('footer_privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
