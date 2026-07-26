import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import './Contact.css';

const EMAILS = [
  'Algeria.travel@gmail.com',
  'visit.bougie@gmail.com',
  'Algeriatravel@gmail.com',
];

const Contact = () => {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
  ];

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 900);
  };

  return (
    <div className={`ct-page ${visible ? 'is-ready' : ''}`}>
      <Navbar />

      <section className="ct-hero">
        <img
          className="ct-hero__bg"
          src="/images/bejaia.jpeg"
          alt=""
          onError={(e) => {
            e.currentTarget.src = '/images/hero.jpeg';
          }}
        />
        <div className="ct-hero__overlay" />
        <div className="ct-hero__inner">
          <p className="ct-hero__brand">Algeria <em>Travel</em></p>
          <h1>
            {t('contact_hero_title')}
            <span>{t('contact_hero_title_span')}</span>
          </h1>
          <p className="ct-hero__lead">{t('contact_hero_desc')}</p>
        </div>
      </section>

      <section className="ct-main">
        <div className="ct-container">
          <div className="ct-layout">
            <div className="ct-form-panel ct-reveal">
              <p className="ct-eyebrow">{t('nav_contact')}</p>
              <h2>
                {t('contact_form_title')}{' '}
                <em>{t('contact_form_title_span')}</em>
              </h2>
              <p className="ct-lead">{t('contact_form_desc')}</p>

              {sent ? (
                <div className="ct-success" role="status">
                  <div className="ct-success__icon">
                    <Icon name="Check" size={28} />
                  </div>
                  <h3>{t('contact_success')}</h3>
                  <button type="button" onClick={() => setSent(false)}>
                    {t('contact_send')}
                  </button>
                </div>
              ) : (
                <form className="ct-form" onSubmit={onSubmit}>
                  <div className="ct-form__row">
                    <label>
                      {t('contact_label_name')}
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        required
                        placeholder={t('contact_placeholder_name')}
                      />
                    </label>
                    <label>
                      {t('contact_label_email')}
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        required
                        placeholder={t('contact_placeholder_email')}
                      />
                    </label>
                  </div>
                  <div className="ct-form__row">
                    <label>
                      {t('contact_label_phone')}
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder={t('contact_placeholder_phone')}
                      />
                    </label>
                    <label>
                      {t('contact_label_subject')}
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={onChange}
                        required
                      >
                        <option value="">{t('contact_subject_default')}</option>
                        <option value="reservation">
                          {t('contact_subject_reservation')}
                        </option>
                        <option value="information">
                          {t('contact_subject_info')}
                        </option>
                        <option value="devis">{t('contact_subject_quote')}</option>
                        <option value="autres">{t('contact_subject_other')}</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    {t('contact_label_message')}
                    <textarea
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={onChange}
                      required
                      placeholder={t('contact_placeholder_message')}
                    />
                  </label>
                  <button type="submit" className="ct-submit" disabled={sending}>
                    {sending ? t('contact_sending') : t('contact_send')}
                    <Icon name="Send" size={16} />
                  </button>
                </form>
              )}
            </div>

            <aside className="ct-side ct-reveal ct-reveal--delay">
              <p className="ct-eyebrow">{t('footer_contact_title')}</p>
              <h2>
                {t('contact_info_title')}{' '}
                <em>{t('contact_info_title_span')}</em>
              </h2>

              <ul className="ct-facts">
                <li>
                  <Icon name="MapPin" size={18} />
                  <div>
                    <strong>{t('contact_info_address')}</strong>
                    <span>
                      Russel en face Stade
                      <br />
                      Béjaïa, 06000 — Algérie
                    </span>
                  </div>
                </li>
                <li>
                  <Icon name="Users" size={18} />
                  <div>
                    <strong>{t('contact_info_phone')}</strong>
                    <a href="tel:+213557664089">00213 557 664 089</a>
                  </div>
                </li>
                <li>
                  <Icon name="Globe" size={18} />
                  <div>
                    <strong>{t('contact_info_email')}</strong>
                    {EMAILS.map((mail) => (
                      <a key={mail} href={`mailto:${mail}`}>
                        {mail}
                      </a>
                    ))}
                  </div>
                </li>
                <li>
                  <Icon name="Clock" size={18} />
                  <div>
                    <strong>{t('contact_info_hours')}</strong>
                    <span>{t('footer_hours')}</span>
                  </div>
                </li>
              </ul>

              <a
                className="ct-wa"
                href={`https://wa.me/213557664089?text=${encodeURIComponent(
                  'Bonjour, je souhaite des infos sur Algeria Travel'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="MessageCircle" size={18} />
                {t('footer_whatsapp')}
              </a>

              <div className="ct-map">
                <p>{t('contact_map_title')}</p>
                <iframe
                  title="Algeria Travel — Béjaïa"
                  src="https://www.google.com/maps?q=Russel%20Bejaia%20Algeria&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="ct-faq">
        <div className="ct-container">
          <div className="ct-faq__head ct-reveal">
            <p className="ct-eyebrow">{t('contact_faq_badge')}</p>
            <h2>
              {t('contact_faq_title')}{' '}
              <em>{t('contact_faq_title_span')}</em>
            </h2>
            <p>{t('contact_faq_desc')}</p>
          </div>

          <div className="ct-faq__list">
            {faqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={item.q}
                  className={`ct-faq__item ${open ? 'is-open' : ''}`}
                  data-reveal
                  data-delay={i * 80}
                >
                  <button
                    type="button"
                    className="ct-faq__q"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <Icon name={open ? 'X' : 'ArrowRight'} size={16} />
                  </button>
                  <div className="ct-faq__a" hidden={!open}>
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="ct-faq__more">
            <Link to="/">{t('nav_home')}</Link>
            {' · '}
            <Link to="/destinations">{t('nav_destinations')}</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
