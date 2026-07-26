// src/pages/InfoDestination.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLangHook';
import { FEATURED_TOURS } from '../data/tours';
import Icon from '../components/ui/Icon';
import AOS from 'aos';
import 'aos/dist/aos.css';

const InfoDestination = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, pick } = useLang();
  const tour = FEATURED_TOURS.find((t) => t.id === Number(id));
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!tour) {
      navigate('/', { replace: true });
      return undefined;
    }
    AOS.init({ duration: 800, once: true });
    return undefined;
  }, [tour, navigate, id]);

  useEffect(() => {
    setActiveTab('overview');
  }, [id]);

  if (!tour) return null;

  const isFrench = language === 'fr';
  const reviewData = [
    { stars: 5, percentage: 78 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 2 },
  ];

  const tabs = [
    { key: 'overview', fr: 'AperÃ§u', en: 'Overview' },
    { key: 'itinerary', fr: 'ItinÃ©raire', en: 'Itinerary' },
    { key: 'activities', fr: 'ActivitÃ©s', en: 'Activities' },
  ];

  return (
    <div className="info-destination-page">
      <Navbar />

      {/* ========== HERO â€” DOSSIER COVER ========== */}
      <section className="hero-dossier">
        <div className="hero-dossier-bg">
          <img src={tour.image} alt={tour.name} className="hero-dossier-image" />
          <div className="hero-dossier-overlay"></div>
          <div className="hero-dossier-grain"></div>
        </div>

        <div className="stamp" aria-hidden="true">
          <span className="stamp-rating">{tour.rating}</span>
          <span className="stamp-label">{isFrench ? 'note voyageurs' : 'traveler rated'}</span>
        </div>

        <div className="hero-dossier-content" data-reveal="fade">
          <div className="hero-dossier-container">
            <div className="dossier-breadcrumb">
              <span onClick={() => navigate('/')}>{isFrench ? 'Accueil' : 'Home'}</span>
              <span className="sep">/</span>
              <span onClick={() => navigate('/tours')}>{isFrench ? 'Circuits' : 'Tours'}</span>
              <span className="sep">/</span>
              <span className="current">{isFrench ? tour.name : tour.name_en}</span>
            </div>

            <span className="dossier-eyebrow">{tour.category} â€” {tour.location}</span>
            <h1 className="dossier-title">{isFrench ? tour.name : tour.name_en}</h1>
            <p className="dossier-subtitle">{isFrench ? tour.subtitle : tour.subtitle_en}</p>

            {/* BOARDING-PASS META STRIP */}
            <div className="pass-strip">
              <div className="pass-field">
                <span className="pass-label">{isFrench ? 'Destination' : 'Destination'}</span>
                <span className="pass-value">{tour.location}</span>
              </div>
              <div className="pass-divider" aria-hidden="true"></div>
              <div className="pass-field">
                <span className="pass-label">{isFrench ? 'DurÃ©e' : 'Duration'}</span>
                <span className="pass-value">{isFrench ? tour.duration : tour.duration_en}</span>
              </div>
              <div className="pass-divider" aria-hidden="true"></div>
              <div className="pass-field">
                <span className="pass-label">{isFrench ? 'PÃ©riode' : 'Best time'}</span>
                <span className="pass-value">{tour.bestTime}</span>
              </div>
              <div className="pass-divider" aria-hidden="true"></div>
              <div className="pass-field price-field">
                <span className="pass-label">{isFrench ? 'Ã€ partir de' : 'From'}</span>
                <span className="pass-value price">
                  {tour.price.toLocaleString()} DA
                  {tour.oldPrice && <span className="old">{tour.oldPrice.toLocaleString()} DA</span>}
                </span>
              </div>
            </div>

            <div className="dossier-actions">
              <button className="btn-primary" onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}>
                {isFrench ? 'RÃ©server ce circuit' : 'Book this tour'}
              </button>
              <button className="btn-secondary" onClick={() => navigate('/contact')}>
                {isFrench ? 'Parler Ã  un conseiller' : 'Talk to an advisor'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MAIN ========== */}
      <section className="main-dossier">
        <div className="container">
          <div className="main-grid">

            {/* LEFT */}
            <div className="main-left" data-reveal="left">

              <nav className="section-tabs" aria-label="tour sections">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    className={`section-tab ${activeTab === t.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {isFrench ? t.fr : t.en}
                  </button>
                ))}
              </nav>

              <div className="panel">

                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                  <div data-aos="fade-up" data-reveal>
                    <span className="panel-kicker">{isFrench ? '01 â€” Le voyage' : '01 â€” The journey'}</span>
                    <h2>{isFrench ? 'Ã€ propos de cette destination' : 'About this destination'}</h2>
                    <p className="desc">{isFrench ? tour.fullDescription : tour.fullDescription_en}</p>

                    <div className="highlights">
                      <div className="highlight" data-reveal data-delay={0}>
                        <span className="mark">ï¼‹</span>
                        <h4>{isFrench ? 'ExpÃ©rience rare' : 'A rare experience'}</h4>
                        <p>{isFrench ? 'Hors des sentiers battus' : 'Off the beaten path'}</p>
                      </div>
                      <div className="highlight" data-reveal data-delay={60}>
                        <span className="mark">ï¼‹</span>
                        <h4>{isFrench ? 'Guide local' : 'Local guide'}</h4>
                        <p>{isFrench ? 'Expert et passionnÃ©' : 'Expert & passionate'}</p>
                      </div>
                      <div className="highlight" data-reveal data-delay={120}>
                        <span className="mark">ï¼‹</span>
                        <h4>{isFrench ? 'Voyage responsable' : 'Responsible travel'}</h4>
                        <p>{isFrench ? 'Tourisme respectueux' : 'Respectful tourism'}</p>
                      </div>
                    </div>

                    <div className="info-grid">
                      <div className="info-card">
                        <span className="info-label">{isFrench ? 'DurÃ©e' : 'Duration'}</span>
                        <span className="info-value">{isFrench ? tour.duration : tour.duration_en}</span>
                      </div>
                      <div className="info-card">
                        <span className="info-label">{isFrench ? 'Meilleure pÃ©riode' : 'Best time'}</span>
                        <span className="info-value">{tour.bestTime}</span>
                      </div>
                      <div className="info-card">
                        <span className="info-label">{isFrench ? 'Groupe' : 'Group size'}</span>
                        <span className="info-value">{isFrench ? '2 Ã  12 pers.' : '2â€“12 people'}</span>
                      </div>
                      <div className="info-card">
                        <span className="info-label">{isFrench ? 'HÃ©bergement' : 'Accommodation'}</span>
                        <span className="info-value">{isFrench ? 'Inclus' : 'Included'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ITINERARY */}
                {activeTab === 'itinerary' && (
                  <div data-aos="fade-up" data-reveal>
                    <span className="panel-kicker">{isFrench ? '02 â€” Jour par jour' : '02 â€” Day by day'}</span>
                    <h2>{isFrench ? 'ItinÃ©raire dÃ©taillÃ©' : 'Detailed itinerary'}</h2>
                    <div className="route">
                      {tour.itinerary.map((item, index) => (
                        <div key={index} className="route-item" data-reveal data-delay={index * 60}>
                          <div className="route-marker">
                            <span className="route-day">{String(item.day).padStart(2, '0')}</span>
                            {index < tour.itinerary.length - 1 && <div className="route-line"></div>}
                          </div>
                          <div className="route-content">
                            <h4>{isFrench ? item.title : item.title_en}</h4>
                            <p>{isFrench ? item.desc : item.desc_en}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTIVITIES */}
                {activeTab === 'activities' && (
                  <div data-aos="fade-up" data-reveal>
                    <span className="panel-kicker">{isFrench ? '03 â€” Sur place' : '03 â€” On the ground'}</span>
                    <h2>{isFrench ? 'ActivitÃ©s incluses' : 'Included activities'}</h2>
                    <div className="activities-grid">
                      {tour.activities.map((activity, index) => (
                        <div key={index} className="activity-card" data-reveal data-delay={index * 60}>
                          <span className="activity-icon" aria-hidden="true">
                            <Icon name={activity.icon} size={22} strokeWidth={1.5} />
                          </span>
                          <span className="activity-name">
                            {pick(activity.label, activity.label_en, activity.label_ar)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="included">
                      <h3>{isFrench ? "Ce qui est inclus" : "What's included"}</h3>
                      <div className="included-grid">
                        <div className="included-item"><span>âœ“</span> {isFrench ? 'HÃ©bergement confortable' : 'Comfortable accommodation'}</div>
                        <div className="included-item"><span>âœ“</span> {isFrench ? 'Guide local expert' : 'Expert local guide'}</div>
                        <div className="included-item"><span>âœ“</span> {isFrench ? 'Transferts inclus' : 'Transfers included'}</div>
                        <div className="included-item"><span>âœ“</span> {isFrench ? 'Repas locaux' : 'Local meals'}</div>
                        <div className="included-item"><span>âœ“</span> {isFrench ? 'Assistance 24/7' : '24/7 assistance'}</div>
                        <div className="included-item"><span>âœ“</span> {isFrench ? 'Ã‰quipement inclus' : 'Equipment included'}</div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT â€” SIDEBAR */}
            <div className="main-right">
              <div className="ticket" id="booking" data-reveal="right">
                <div className="ticket-header">
                  <span className="ticket-eyebrow">{isFrench ? 'RÃ©servation' : 'Reservation'}</span>
                  <div className="ticket-price">
                    <span className="current">{tour.price.toLocaleString()} DA</span>
                    <span className="per">/ {isFrench ? 'pers.' : 'person'}</span>
                  </div>
                  {tour.oldPrice && (
                    <div className="ticket-old-price">{isFrench ? 'Ancien prix' : 'Was'} {tour.oldPrice.toLocaleString()} DA</div>
                  )}
                </div>

                <div className="ticket-punch" aria-hidden="true"></div>

                <div className="ticket-features">
                  <div className="ticket-feature"><span>âœ“</span> {isFrench ? 'Guide local expÃ©rimentÃ©' : 'Experienced local guide'}</div>
                  <div className="ticket-feature"><span>âœ“</span> {isFrench ? 'HÃ©bergement de qualitÃ©' : 'Quality accommodation'}</div>
                  <div className="ticket-feature"><span>âœ“</span> {isFrench ? 'Transport confortable' : 'Comfortable transport'}</div>
                  <div className="ticket-feature"><span>âœ“</span> {isFrench ? 'Assurance voyage' : 'Travel insurance'}</div>
                </div>

                <div className="ticket-punch" aria-hidden="true"></div>

                <div className="ticket-actions">
                  <button className="btn-book">
                    {isFrench ? 'RÃ©server maintenant' : 'Book now'}
                  </button>
                  <button className="btn-contact" onClick={() => navigate('/contact')}>
                    {isFrench ? 'Contacter un conseiller' : 'Contact an advisor'}
                  </button>
                </div>

                <div className="ticket-guarantee">
                  <span>{isFrench ? 'Paiement sÃ©curisÃ©' : 'Secure payment'}</span>
                  <span className="dot">â€¢</span>
                  <span>{isFrench ? 'Annulation gratuite' : 'Free cancellation'}</span>
                </div>
              </div>

              {/* REVIEWS */}
              <div className="reviews" data-reveal="right" data-delay={80}>
                <h3>{isFrench ? 'Avis voyageurs' : 'Traveler reviews'}</h3>
                <div className="reviews-summary">
                  <div className="score">
                    <span className="number">{tour.rating}</span>
                    <span className="max">/ 5</span>
                  </div>
                  <div className="reviews-count">
                    <span className="count">{tour.reviews} {isFrench ? 'avis' : 'reviews'}</span>
                    <span className="recommend">{isFrench ? '98% recommandent' : '98% recommend'}</span>
                  </div>
                </div>
                <div className="reviews-breakdown">
                  {reviewData.map((item, index) => (
                    <div key={index} className="row">
                      <span className="label">{item.stars}</span>
                      <div className="bar"><div className="fill" style={{ width: `${item.percentage}%` }}></div></div>
                      <span className="percent">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIMILAR */}
              <div className="similar" data-reveal="right" data-delay={120}>
                <h3>{isFrench ? 'Circuits similaires' : 'Similar tours'}</h3>
                {FEATURED_TOURS.filter(t => t.id !== tour.id).slice(0, 2).map((similar, i) => (
                  <div
                    key={similar.id}
                    className="similar-item"
                    data-reveal
                    data-delay={i * 60}
                    onClick={() => navigate(`/destination/${similar.id}`)}
                  >
                    <img src={similar.image} alt={similar.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <div>
                      <h4>{isFrench ? similar.name : similar.name_en}</h4>
                      <span className="price">{similar.price.toLocaleString()} DA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@400;500;600;700&display=swap');

        /* ===== TOKENS ===== */
        * { box-sizing: border-box; }
        .info-destination-page {
          --navy: #1A2332;
          --navy-deep: #1A2332;
          --terracotta: #B8935D;
          --ember: #B8935D;
          --sand: #F6F5F2;
          --cream: #FFFFFF;
          --ink: #1A1A1A;
          --gray: #6B6560;
          --hair: rgba(26, 35, 50, 0.1);
          --shadow: 0 12px 32px rgba(26, 35, 50, 0.08);
          --radius: 14px;
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'Montserrat', system-ui, sans-serif;
          --mono: 'Montserrat', system-ui, sans-serif;
          font-family: var(--sans);
          color: var(--ink);
          background: #fff;
        }

        body { font-family: var(--sans); color: var(--ink); }

        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
        }

        button:focus-visible, span[onClick]:focus-visible {
          outline: 2px solid var(--terracotta);
          outline-offset: 2px;
        }

        /* ===== LOADING ===== */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
          font-family: var(--mono);
          color: var(--gray);
          font-size: 0.85rem;
          letter-spacing: 0.02em;
        }
        .loader {
          width: 40px;
          height: 40px;
          border: 3px solid var(--hair);
          border-top-color: var(--terracotta);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ===== HERO DOSSIER ===== */
        .hero-dossier {
          position: relative;
          min-height: 620px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          background: var(--navy-deep);
        }
        .hero-dossier-bg { position: absolute; inset: 0; }
        .hero-dossier-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.82; }
        .hero-dossier-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(10,25,41,0.35) 0%, rgba(10,25,41,0.55) 55%, rgba(10,25,41,0.96) 100%);
        }
        .hero-dossier-grain {
          position: absolute; inset: 0;
          background-image: repeating-radial-gradient(circle at 20% 20%, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px);
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .stamp {
          position: absolute;
          top: 40px;
          right: 5%;
          z-index: 3;
          width: 108px;
          height: 108px;
          border-radius: 50%;
          border: 1.5px dashed rgba(251,247,239,0.55);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          transform: rotate(-9deg);
          color: var(--cream);
          background: rgba(193,96,46,0.16);
          backdrop-filter: blur(3px);
        }
        .stamp-rating {
          font-family: var(--serif);
          font-size: 2rem;
          font-weight: 600;
          line-height: 1;
        }
        .stamp-label {
          font-family: var(--mono);
          font-size: 0.55rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-align: center;
          padding: 0 8px;
          opacity: 0.85;
        }

        .hero-dossier-content {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 0 5% 56px;
        }
        .hero-dossier-container { max-width: 1160px; margin: 0 auto; color: var(--cream); }

        .dossier-breadcrumb {
          display: flex;
          gap: 8px;
          align-items: center;
          font-family: var(--mono);
          font-size: 0.7rem;
          letter-spacing: 0.03em;
          opacity: 0.65;
          margin-bottom: 22px;
          text-transform: uppercase;
        }
        .dossier-breadcrumb span { cursor: pointer; }
        .dossier-breadcrumb .sep { opacity: 0.4; cursor: default; }
        .dossier-breadcrumb .current { opacity: 1; color: var(--ember); cursor: default; }

        .dossier-eyebrow {
          display: inline-block;
          font-family: var(--mono);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ember);
          margin-bottom: 14px;
        }
        .dossier-title {
          font-family: var(--serif);
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 600;
          line-height: 1.02;
          letter-spacing: -0.01em;
          margin: 0 0 12px;
          max-width: 16ch;
        }
        .dossier-subtitle {
          font-size: 1.1rem;
          font-weight: 300;
          opacity: 0.85;
          max-width: 52ch;
          margin: 0 0 32px;
          line-height: 1.5;
        }

        /* BOARDING PASS STRIP */
        .pass-strip {
          display: flex;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
          padding: 18px 26px;
          background: rgba(251,247,239,0.06);
          border: 1px solid rgba(251,247,239,0.14);
          border-radius: var(--radius);
          backdrop-filter: blur(10px);
          margin-bottom: 28px;
        }
        .pass-field { display: flex; flex-direction: column; gap: 3px; }
        .pass-label {
          font-family: var(--mono);
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.55;
        }
        .pass-value { font-weight: 600; font-size: 0.95rem; }
        .pass-value.price { color: var(--ember); font-family: var(--serif); font-size: 1.2rem; font-weight: 600; }
        .pass-value.price .old {
          font-family: var(--sans);
          font-size: 0.72rem;
          font-weight: 400;
          text-decoration: line-through;
          opacity: 0.5;
          margin-left: 8px;
        }
        .pass-divider { width: 1px; align-self: stretch; background: repeating-linear-gradient(to bottom, rgba(251,247,239,0.28) 0 4px, transparent 4px 8px); }

        .dossier-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-primary {
          padding: 13px 30px;
          background: var(--terracotta);
          color: var(--cream);
          border: none;
          border-radius: var(--radius);
          font-weight: 600;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .btn-primary:hover { background: #A8501F; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(193,96,46,0.35); }
        .btn-secondary {
          padding: 13px 28px;
          background: transparent;
          color: var(--cream);
          border: 1px solid rgba(251,247,239,0.32);
          border-radius: var(--radius);
          font-weight: 500;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .btn-secondary:hover { background: rgba(251,247,239,0.1); border-color: rgba(251,247,239,0.5); }

        /* ===== MAIN ===== */
        .main-dossier { padding: 56px 0 80px; background: var(--sand); }
        .container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
        .main-grid { display: grid; grid-template-columns: 1.7fr 1fr; gap: 40px; align-items: start; }

        /* SECTION TABS â€” underline style, not pills */
        .section-tabs {
          display: flex;
          gap: 30px;
          border-bottom: 1px solid var(--hair);
          margin-bottom: 30px;
        }
        .section-tab {
          background: none;
          border: none;
          padding: 0 0 14px;
          font-family: var(--sans);
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--gray);
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
        }
        .section-tab::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -1px;
          height: 2px;
          background: var(--terracotta);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }
        .section-tab:hover { color: var(--ink); }
        .section-tab.active { color: var(--ink); }
        .section-tab.active::after { transform: scaleX(1); }

        .panel { background: var(--cream); border-radius: var(--radius); padding: 34px; box-shadow: var(--shadow); min-height: 380px; }
        .panel-kicker {
          display: block;
          font-family: var(--mono);
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--terracotta);
          margin-bottom: 8px;
        }
        .panel h2 { font-family: var(--serif); font-size: 1.6rem; font-weight: 600; margin: 0 0 16px; }
        .panel .desc { color: var(--gray); line-height: 1.8; font-size: 1rem; margin-bottom: 30px; }

        /* HIGHLIGHTS */
        .highlights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--hair); border: 1px solid var(--hair); border-radius: var(--radius); overflow: hidden; margin-bottom: 30px; }
        .highlight { padding: 22px 16px; background: var(--cream); text-align: left; }
        .highlight .mark { display: inline-block; font-family: var(--serif); font-size: 1.4rem; color: var(--terracotta); margin-bottom: 8px; }
        .highlight h4 { font-size: 0.92rem; margin: 0 0 3px; font-weight: 600; }
        .highlight p { font-size: 0.8rem; color: var(--gray); margin: 0; }

        /* INFO GRID */
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--hair); border: 1px solid var(--hair); border-radius: var(--radius); overflow: hidden; }
        .info-card { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: var(--cream); }
        .info-label { font-family: var(--mono); font-size: 0.6rem; text-transform: uppercase; color: var(--gray); letter-spacing: 0.06em; }
        .info-value { font-weight: 600; font-size: 0.92rem; font-family: var(--serif); }

        /* ROUTE / ITINERARY â€” topographic contour backdrop */
        .route {
          display: flex;
          flex-direction: column;
          background-image: repeating-radial-gradient(circle at 8% 0%, rgba(16,38,59,0.035) 0px, rgba(16,38,59,0.035) 1px, transparent 1px, transparent 34px);
          padding: 4px 0;
        }
        .route-item { display: flex; gap: 20px; padding: 14px 0; }
        .route-marker { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 44px; }
        .route-day {
          font-family: var(--mono);
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--cream);
          background: var(--navy);
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          z-index: 1;
        }
        .route-line { width: 1px; flex: 1; background: repeating-linear-gradient(to bottom, var(--hair) 0 4px, transparent 4px 8px); min-height: 24px; margin-top: 4px; }
        .route-content { flex: 1; padding-top: 6px; }
        .route-content h4 { font-family: var(--serif); font-size: 1.05rem; margin: 0 0 4px; font-weight: 600; }
        .route-content p { color: var(--gray); line-height: 1.65; margin: 0; font-size: 0.92rem; }

        /* ACTIVITIES */
        .activities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 30px; }
        .activity-card {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 20px 12px;
          background: var(--sand);
          border-radius: var(--radius);
          text-align: center;
          transition: transform 0.2s ease;
        }
        .activity-card:hover { transform: translateY(-3px); }
        .activity-icon {
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 14px;
          background: var(--white);
          color: var(--navy);
        }
        .activity-name { font-weight: 600; font-size: 0.88rem; }

        .included h3 { font-family: var(--serif); font-size: 1.15rem; margin-bottom: 14px; font-weight: 600; }
        .included-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .included-item { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--sand); border-radius: 4px; font-size: 0.88rem; }
        .included-item span { color: var(--terracotta); font-weight: 700; }

        /* ===== SIDEBAR ===== */
        .main-right { display: flex; flex-direction: column; gap: 20px; }

        .ticket { background: var(--cream); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); position: sticky; top: 20px; }
        .ticket-eyebrow { font-family: var(--mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray); }
        .ticket-price { display: flex; align-items: baseline; gap: 6px; margin-top: 8px; }
        .ticket-price .current { font-family: var(--serif); font-size: 2rem; font-weight: 600; color: var(--terracotta); }
        .ticket-price .per { color: var(--gray); font-size: 0.82rem; }
        .ticket-old-price { font-size: 0.82rem; color: var(--gray); margin-top: 3px; text-decoration: line-through; opacity: 0.7; }

        .ticket-punch { position: relative; height: 1px; background: repeating-linear-gradient(to right, var(--hair) 0 6px, transparent 6px 11px); margin: 20px -24px; }
        .ticket-punch::before, .ticket-punch::after {
          content: ''; position: absolute; top: -9px; width: 18px; height: 18px; border-radius: 50%; background: var(--sand);
        }
        .ticket-punch::before { left: -9px; }
        .ticket-punch::after { right: -9px; }

        .ticket-features { display: flex; flex-direction: column; gap: 8px; }
        .ticket-feature { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--ink); }
        .ticket-feature span { color: var(--terracotta); font-weight: 700; }

        .ticket-actions { display: flex; flex-direction: column; gap: 8px; }
        .btn-book {
          padding: 14px 20px; background: var(--terracotta); color: var(--cream); border: none;
          border-radius: var(--radius); font-weight: 700; font-size: 0.94rem; cursor: pointer; transition: all 0.22s ease;
        }
        .btn-book:hover { background: #A8501F; transform: translateY(-2px); box-shadow: 0 8px 18px rgba(193,96,46,0.3); }
        .btn-contact {
          padding: 12px 20px; background: transparent; color: var(--navy); border: 1px solid var(--hair);
          border-radius: var(--radius); font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all 0.22s ease;
        }
        .btn-contact:hover { background: var(--navy); color: var(--cream); border-color: var(--navy); }

        .ticket-guarantee {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--hair);
          font-family: var(--mono); font-size: 0.7rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.03em;
        }
        .ticket-guarantee .dot { color: var(--terracotta); }

        /* REVIEWS */
        .reviews { background: var(--cream); border-radius: var(--radius); padding: 22px 24px; box-shadow: var(--shadow); }
        .reviews h3 { font-family: var(--serif); font-size: 1.05rem; margin-bottom: 14px; font-weight: 600; }
        .reviews-summary { display: flex; align-items: center; gap: 18px; margin-bottom: 16px; }
        .reviews-summary .score .number { font-family: var(--serif); font-size: 2.1rem; font-weight: 600; color: var(--terracotta); }
        .reviews-summary .score .max { font-size: 0.85rem; color: var(--gray); }
        .reviews-count { display: flex; flex-direction: column; gap: 2px; }
        .reviews-count .count { font-size: 0.85rem; font-weight: 600; }
        .reviews-count .recommend { font-size: 0.76rem; color: var(--gray); }

        .reviews-breakdown { display: flex; flex-direction: column; gap: 6px; }
        .reviews-breakdown .row { display: flex; align-items: center; gap: 10px; font-family: var(--mono); font-size: 0.75rem; }
        .reviews-breakdown .row .label { min-width: 12px; color: var(--gray); }
        .reviews-breakdown .row .bar { flex: 1; height: 4px; background: var(--hair); border-radius: 4px; overflow: hidden; }
        .reviews-breakdown .row .bar .fill { height: 100%; background: var(--terracotta); border-radius: 4px; }
        .reviews-breakdown .row .percent { min-width: 30px; color: var(--gray); text-align: right; }

        /* SIMILAR */
        .similar { background: var(--cream); border-radius: var(--radius); padding: 22px 24px; box-shadow: var(--shadow); }
        .similar h3 { font-family: var(--serif); font-size: 1.05rem; margin-bottom: 14px; font-weight: 600; }
        .similar-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 4px; cursor: pointer; transition: background 0.2s ease; margin-bottom: 4px; }
        .similar-item:last-child { margin-bottom: 0; }
        .similar-item:hover { background: var(--sand); }
        .similar-item img { width: 52px; height: 52px; border-radius: 4px; object-fit: cover; }
        .similar-item h4 { font-size: 0.88rem; margin: 0 0 2px; font-weight: 600; }
        .similar-item .price { font-family: var(--mono); font-size: 0.78rem; font-weight: 500; color: var(--terracotta); }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .dossier-title { font-size: clamp(2.1rem, 5vw, 3rem); }
          .info-grid { grid-template-columns: repeat(2, 1fr); }
          .activities-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 992px) {
          .main-grid { grid-template-columns: 1fr; }
          .ticket { position: static; }
          .hero-dossier { min-height: 560px; }
          .included-grid { grid-template-columns: 1fr; }
          .stamp { top: 24px; right: 6%; width: 88px; height: 88px; }
        }

        @media (max-width: 768px) {
          .hero-dossier { min-height: 520px; }
          .hero-dossier-content { padding: 0 5% 40px; }
          .dossier-title { font-size: clamp(1.8rem, 7vw, 2.4rem); max-width: 100%; }
          .dossier-subtitle { font-size: 0.98rem; }
          .pass-strip { flex-direction: column; align-items: flex-start; gap: 14px; padding: 18px 20px; }
          .pass-divider { display: none; }
          .dossier-actions { flex-direction: column; }
          .dossier-actions button { width: 100%; }
          .panel { padding: 20px; }
          .highlights { grid-template-columns: 1fr; }
          .info-grid { grid-template-columns: 1fr; }
          .activities-grid { grid-template-columns: 1fr; }
          .section-tabs { gap: 20px; overflow-x: auto; }
          .container { padding: 0 16px; }
          .main-dossier { padding: 40px 0 56px; }
          .stamp { display: none; }
        }

        @media (max-width: 480px) {
          .hero-dossier { min-height: 480px; }
          .dossier-eyebrow { font-size: 0.65rem; }
          .panel h2 { font-size: 1.3rem; }
          .ticket, .reviews, .similar { padding: 18px; }
          .ticket-price .current { font-size: 1.6rem; }
          .btn-book, .btn-contact { font-size: 0.85rem; }
          .btn-primary, .btn-secondary { font-size: 0.85rem; padding: 12px 22px; }
          .route-marker { width: 36px; }
          .route-day { width: 32px; height: 32px; font-size: 0.62rem; }
        }
      `}</style>
    </div>
  );
};

export default InfoDestination;