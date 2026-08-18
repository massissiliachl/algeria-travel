import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';
import { useLang } from '../hooks/useLangHook';
import './Contact.css';

export default function Privacy() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const sections = [
    { title: t('privacy_s1_title'), body: t('privacy_s1_body') },
    { title: t('privacy_s2_title'), body: t('privacy_s2_body') },
    { title: t('privacy_s3_title'), body: t('privacy_s3_body') },
    { title: t('privacy_s4_title'), body: t('privacy_s4_body') },
  ];

  return (
    <div className={`ct-page privacy-page ${visible ? 'is-ready' : ''}`}>
      <SeoHead
        title={t('privacy_page_title')}
        description={t('privacy_page_desc')}
        path="/privacy"
      />
      <Navbar />

      <section className="ct-hero ct-hero--compact">
        <div className="ct-hero__overlay" />
        <div className="ct-container ct-hero__inner">
          <nav className="ct-breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <span>{t('footer_privacy')}</span>
          </nav>
          <h1>{t('privacy_page_title')}</h1>
          <p className="ct-lead">{t('privacy_page_desc')}</p>
        </div>
      </section>

      <section className="privacy-body">
        <div className="ct-container">
          <p className="privacy-updated">{t('privacy_updated')}</p>
          {sections.map((section) => (
            <article key={section.title} className="privacy-section">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
          <p className="privacy-contact">
            {t('privacy_contact_prefix')}{' '}
            <a href="mailto:Algeria.travel@gmail.com">Algeria.travel@gmail.com</a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
