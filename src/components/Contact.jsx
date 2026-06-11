// src/pages/Contact.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLangHook';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Contact = () => {
  const { t } = useLang();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  // Icônes SVG
  const Icons = {
    location: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    phone: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    email: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    clock: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    user: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    envelope: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    tag: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    comment: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    send: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
    check: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    map: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
    question: () => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    paperPlane: () => (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    )
  };

  const contactInfo = [
    {
      icon: <Icons.location />,
      title: t('contact_info_address'),
      details: ["Russel en face Stade", "Bejaia, 06000", "Algérie"]
    },
    {
      icon: <Icons.phone />,
      title: t('contact_info_phone'),
      details: ["00213 557 664 089"]
    },
    {
      icon: <Icons.email />,
      title: t('contact_info_email'),
      details: ["visit.bougie@gmail.com", "Algeriatravel@gmail.com"]
    },
    {
      icon: <Icons.clock />,
      title: t('contact_info_hours'),
      details: ["7/7"]
    }
  ];

  const faqs = [
    { question: t('faq_q1'), answer: t('faq_a1') },
    { question: t('faq_q2'), answer: t('faq_a2') },
    { question: t('faq_q3'), answer: t('faq_a3') },
  ];

  return (
    <>
     
      
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content" data-aos="fade-up">
          <h1>{t('contact_hero_title')}<span className="text-gold">{t('contact_hero_title_span')}</span></h1>
          <p>{t('contact_hero_desc')}</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-wrapper" data-aos="fade-right">
              <h2>{t('contact_form_title')} <span className="text-gold">{t('contact_form_title_span')}</span></h2>
              <p>{t('contact_form_desc')}</p>
              
              {submitSuccess && (
                <div className="success-message">
                  <Icons.check />
                  <p>{t('contact_success')}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label><Icons.user /> {t('contact_label_name')}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={t('contact_placeholder_name')}
                    />
                  </div>
                  <div className="form-group">
                    <label><Icons.envelope /> {t('contact_label_email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t('contact_placeholder_email')}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label><Icons.phone /> {t('contact_label_phone')}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('contact_placeholder_phone')}
                    />
                  </div>
                  <div className="form-group">
                    <label><Icons.tag /> {t('contact_label_subject')}</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">{t('contact_subject_default')}</option>
                      <option value="reservation">{t('contact_subject_reservation')}</option>
                      <option value="information">{t('contact_subject_info')}</option>
                      <option value="devis">{t('contact_subject_quote')}</option>
                      <option value="autres">{t('contact_subject_other')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label><Icons.comment /> {t('contact_label_message')}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder={t('contact_placeholder_message')}
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>⏳ {t('contact_sending')}</>
                  ) : (
                    <><Icons.send /> {t('contact_send')}</>
                  )}
                </button>
              </form>
            </div>
            
            <div className="contact-info-wrapper" data-aos="fade-left">
              <h2>{t('contact_info_title')} <span className="text-gold">{t('contact_info_title_span')}</span></h2>
              
              <div className="info-grid">
                {contactInfo.map((info, index) => (
                  <div className="info-card" key={index}>
                    <div className="info-icon">
                      {info.icon}
                    </div>
                    <div className="info-content">
                      <h3>{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i}>{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="map-card">
                <h3><Icons.map /> {t('contact_map_title')}</h3>
                <div className="map-placeholder">
                  <iframe
                    src="https://www.google.com/maps?q=Bejaia%2C%20Alg%C3%A9rie&output=embed"
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: "16px" }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Google Maps Bejaia"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-badge">{t('contact_faq_badge')}</span>
            <h2>{t('contact_faq_title')} <span className="text-gold">{t('contact_faq_title_span')}</span></h2>
            <p>{t('contact_faq_desc')}</p>
          </div>
          
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div className="faq-card" key={index} data-aos="fade-up" data-aos-delay={100 * index}>
                <div className="faq-icon">
                  <Icons.question />
                </div>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

    

      <style>{`
        body {
          overflow-x: hidden;
          max-width: 100%;
          overscroll-behavior-x: none;
        }

        .text-gold {
          color: #c6a43b;
        }

        .contact-hero {
          position: relative;
          height: 40vh;
          min-height: 300px;
          background: linear-gradient(135deg, #111, #1a1a1a);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .contact-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('/logo.png') center/cover;
          opacity: 0.15;
          animation: zoomBg 30s ease infinite;
        }

        @keyframes zoomBg {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .contact-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7));
        }

        .contact-hero-content {
          position: relative;
          z-index: 1;
          color: white;
          padding: 0 24px;
        }

        .contact-hero-content h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .contact-hero-content p {
          font-size: 1.125rem;
          opacity: 0.9;
        }

        .contact-section {
          padding: 80px 0;
          background: #f5f5f5;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
        }

        .contact-form-wrapper {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .contact-form-wrapper h2 {
          font-size: 1.8rem;
          margin-bottom: 12px;
        }

        .contact-form-wrapper > p {
          color: #666;
          margin-bottom: 30px;
        }

        .success-message {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 15px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .success-message svg {
          stroke: #2e7d32;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group label svg {
          stroke: #c6a43b;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #c6a43b;
          box-shadow: 0 0 0 3px rgba(198, 164, 59, 0.1);
        }

        .submit-btn {
          background: #c6a43b;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 40px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .submit-btn svg {
          stroke: white;
        }

        .submit-btn:hover:not(:disabled) {
          background: #a07d2c;
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .contact-info-wrapper {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .contact-info-wrapper h2 {
          font-size: 1.8rem;
          margin-bottom: 30px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 30px;
        }

        .info-card {
          display: flex;
          gap: 15px;
          padding: 20px;
          background: #f8f8f8;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .info-icon {
          width: 50px;
          height: 50px;
          background: rgba(198, 164, 59, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c6a43b;
        }

        .info-icon svg {
          stroke: #c6a43b;
        }

        .info-content h3 {
          font-size: 1rem;
          margin-bottom: 8px;
        }

        .info-content p {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
        }

        .map-card {
          margin-top: 20px;
        }

        .map-card h3 {
          font-size: 1rem;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .map-card h3 svg {
          stroke: #c6a43b;
        }

        .map-placeholder {
          border-radius: 16px;
          overflow: hidden;
        }

        .faq-section {
          padding: 80px 0;
          background: white;
        }

        .section-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .section-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #c6a43b;
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        .section-header h2 {
          font-size: 2.2rem;
          margin-bottom: 12px;
        }

        .section-header p {
          color: #666;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }

        .faq-card {
          background: #f8f8f8;
          padding: 30px;
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .faq-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        .faq-icon {
          width: 56px;
          height: 56px;
          background: rgba(198, 164, 59, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: #c6a43b;
        }

        .faq-icon svg {
          stroke: #c6a43b;
        }

        .faq-card h3 {
          font-size: 1.1rem;
          margin-bottom: 12px;
        }

        .faq-card p {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .newsletter-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #111, #1a1a1a);
        }

        .newsletter-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          padding: 50px;
          border-radius: 24px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .newsletter-icon {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }

        .newsletter-icon svg {
          stroke: #c6a43b;
        }

        .newsletter-card h3 {
          font-size: 1.8rem;
          color: white;
          margin-bottom: 12px;
        }

        .newsletter-card p {
          color: rgba(255,255,255,0.7);
          margin-bottom: 30px;
        }

        .newsletter-form {
          display: flex;
          justify-content: center;
          gap: 15px;
          max-width: 500px;
          margin: 0 auto;
        }

        .newsletter-form input {
          flex: 1;
          padding: 14px 20px;
          border: none;
          border-radius: 50px;
          font-size: 14px;
        }

        .newsletter-form button {
          padding: 14px 32px;
          background: #c6a43b;
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .newsletter-form button:hover {
          background: #a07d2c;
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .faq-grid {
            grid-template-columns: 1fr;
          }
          .contact-hero-content h1 {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
          .contact-form-wrapper, .contact-info-wrapper {
            padding: 25px;
          }
          .contact-form-wrapper h2, .contact-info-wrapper h2 {
            font-size: 1.5rem;
          }
          .newsletter-form {
            flex-direction: column;
          }
          .section-header h2 {
            font-size: 1.8rem;
          }
          .faq-card {
            padding: 20px;
          }
        }
          @media (max-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .contact-form-wrapper,
  .contact-info-wrapper {
    padding: 30px;
  }
  
  .info-grid {
    gap: 15px;
  }
  
  .faq-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .contact-hero-content h1 {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .contact-form-wrapper, 
  .contact-info-wrapper {
    padding: 20px;
  }
  
  .contact-form-wrapper h2, 
  .contact-info-wrapper h2 {
    font-size: 1.2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;  /* Les champs du formulaire passent en colonne */
    gap: 12px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;  /* Les cartes d'infos passent en colonne */
    gap: 12px;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .submit-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
  
  .info-card {
    padding: 15px;
  }
  
  .info-icon {
    width: 40px;
    height: 40px;
  }
  
  .info-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .info-content h3 {
    font-size: 0.9rem;
  }
  
  .info-content p {
    font-size: 12px;
  }
  
  .map-card h3 {
    font-size: 0.9rem;
  }
  
  .map-placeholder iframe {
    height: 200px;
  }
  
  .faq-grid {
    grid-template-columns: 1fr;  /* FAQ en 1 colonne sur mobile */
    gap: 15px;
  }
  
  .faq-card {
    padding: 20px;
  }
  
  .faq-icon {
    width: 45px;
    height: 45px;
  }
  
  .faq-icon svg {
    width: 22px;
    height: 22px;
  }
  
  .faq-card h3 {
    font-size: 1rem;
  }
  
  .faq-card p {
    font-size: 13px;
  }
  
  .newsletter-form {
    flex-direction: column;
    gap: 10px;
  }
  
  .newsletter-form input,
  .newsletter-form button {
    width: 100%;
  }
  
  .newsletter-card {
    padding: 30px 20px;
  }
  
  .newsletter-card h3 {
    font-size: 1.3rem;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
  }
  
  .section-header p {
    font-size: 0.9rem;
  }
  
  .contact-hero-content h1 {
    font-size: 2rem;
  }
  
  .contact-hero-content p {
    font-size: 0.9rem;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .contact-section {
    padding: 50px 0;
  }
  
  .faq-section {
    padding: 50px 0;
  }
  
  .newsletter-section {
    padding: 50px 0;
  }
}

@media (max-width: 480px) {
  .contact-grid {
    gap: 15px;  /* Réduit l'espace entre formulaire et infos */
  }
  
  .contact-form-wrapper,
  .contact-info-wrapper {
    padding: 15px;
  }
  
  .contact-form-wrapper h2,
  .contact-info-wrapper h2 {
    font-size: 1rem;
  }
  
  .contact-form-wrapper > p {
    font-size: 12px;
    margin-bottom: 20px;
  }
}
      `}</style>
    </>
  );
};

export default Contact;