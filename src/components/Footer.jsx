import React from 'react';
import { useLang } from '../hooks/useLangHook';

const Footer = () => {
  const { t } = useLang();

  const handleNewsletter = () => {
    const email = document.getElementById('newsletterEmail').value;
    if (email && email.includes('@')) {
      alert(`✅ ${t('footer_newsletter_success')}`);
    } else {
      alert(t('footer_newsletter_invalid'));
    }
  };

  return (
    <footer className="footer" id="contact">
      <div style={{ maxWidth: '1300px', margin: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
          <div>
            <h3 style={{ color: 'white', fontSize: '1.8rem' }}>
              ALGERIA <span style={{ color: 'var(--ocre)' }}>TRAVEL</span>
            </h3>
            <p>Algeriatravel@gmail.com<br />00213 557 664 089</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
          <div>
            <strong>{t('footer_quick_links')}</strong><br />
            <a href="#">{t('footer_link_sahara')}</a><br />
            <a href="#">{t('footer_link_coast')}</a><br />
            <a href="#">{t('footer_link_visa')}</a>
          </div>
          <div>
            <strong>{t('footer_mobile_apps')}</strong><br />
            <i className="fab fa-apple"></i> App Store<br />
            <i className="fab fa-android"></i> Google Play
          </div>
          <div className="newsletter">
            <strong><i className="fas fa-envelope-open-text"></i> {t('footer_newsletter')}</strong>
            <div className="newsletter-input">
              <input type="email" placeholder={t('footer_email_placeholder')} id="newsletterEmail" />
              <button onClick={handleNewsletter}>{t('footer_subscribe')}</button>
            </div>
          </div>
        </div>
        <hr style={{ margin: '40px 0 20px', borderColor: '#2a5a6e' }} />
        <p style={{ textAlign: 'center' }}>
          © 2026 Algeria Travel — {t('footer_rights')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
