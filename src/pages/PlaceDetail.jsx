import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { getPlaceById, PLACES } from '../data/places';
import { ACTIVITY_CATEGORIES, getActivitiesForPlace } from '../data/activities';
import './Activities.css';
import './PlaceDetail.css';

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, pick } = useLang();
  const place = getPlaceById(id);
  const placeActivities = place ? getActivitiesForPlace(place.id) : [];

  const [bookingOpen, setBookingOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: searchParams.get('dates') || '',
    travelers: searchParams.get('travelers') || '2',
    stay: '',
    message: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!place) {
      navigate('/destinations', { replace: true });
      return undefined;
    }
    // Garantit l’affichage même si le reveal global rate
    const id = window.requestAnimationFrame(() => {
      document
        .querySelectorAll('.place-page [data-reveal]')
        .forEach((el) => el.classList.add('is-in', 'revealed'));
    });
    return () => window.cancelAnimationFrame(id);
  }, [place, navigate, id]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      date: searchParams.get('dates') || prev.date,
      travelers: searchParams.get('travelers') || prev.travelers,
    }));
  }, [searchParams, id]);

  useEffect(() => {
    document.body.style.overflow = bookingOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [bookingOpen]);

  if (!place) return null;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.date) return;
    setSent(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSent(false);
    setForm({
      name: '',
      email: '',
      phone: '',
      date: '',
      travelers: '2',
      stay: '',
      message: '',
    });
  };

  const similar = PLACES.filter((p) => p.id !== place.id).slice(0, 3);

  return (
    <div className="acts-page place-page">
      <Navbar />

      <section className="place-hero">
        <img className="place-hero__bg" src={place.image} alt="" />
        <div className="place-hero__overlay" />
        <div className="place-hero__inner" data-reveal="fade">
          <nav className="acts-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <Link to="/destinations">{t('nav_destinations')}</Link>
            <span>/</span>
            <span>{pick(place.name, place.name_en, place.name_ar)}</span>
          </nav>
          <p className="place-hero__tag">
            {pick(place.tagline, place.tagline_en, place.tagline_ar)}
          </p>
          <h1>{pick(place.name, place.name_en, place.name_ar)}</h1>
          <div className="place-hero__meta">
            <span>
              <Icon name="Star" size={14} /> {place.rating} · {place.reviews}{' '}
              {t('place_reviews')}
            </span>
            <span>
              <Icon name="ThermometerSun" size={14} /> {place.temp}
            </span>
            <span>
              <Icon name="Tag" size={14} /> {t('acts_from')}{' '}
              {place.price.toLocaleString()} DA
            </span>
          </div>
        </div>
      </section>

      <section className="place-main acts-container">
        <div className="place-layout">
          <div className="place-content" data-reveal="left">
            <h2>{t('place_about')}</h2>
            <p>
              {pick(place.description, place.description_en, place.description_ar)}
            </p>

            <div className="place-highlights">
              {place.highlights.map((h, i) => (
                <div
                  key={h.fr}
                  className="place-highlight"
                  data-reveal
                  data-delay={i * 60}
                >
                  <Icon name={h.icon} size={20} strokeWidth={1.5} />
                  <span>{pick(h.fr, h.en, h.ar)}</span>
                </div>
              ))}
            </div>

            <h2>{t('place_practical')}</h2>
            <div className="place-facts">
              <article>
                <Icon name="Calendar" size={20} />
                <div>
                  <strong>{t('place_dates')}</strong>
                  <span>
                    {pick(place.bestTime, place.bestTime_en, place.bestTime_ar)}
                  </span>
                </div>
              </article>
              <article>
                <Icon name="Clock" size={20} />
                <div>
                  <strong>{t('place_duration')}</strong>
                  <span>
                    {pick(place.duration, place.duration_en, place.duration_ar)}
                  </span>
                </div>
              </article>
              <article>
                <Icon name="Hotel" size={20} />
                <div>
                  <strong>{t('place_stay')}</strong>
                  <span>{pick(place.stay, place.stay_en, place.stay_ar)}</span>
                </div>
              </article>
              <article>
                <Icon name="Car" size={20} />
                <div>
                  <strong>{t('place_transport')}</strong>
                  <span>
                    {pick(place.transport, place.transport_en, place.transport_ar)}
                  </span>
                </div>
              </article>
              <article>
                <Icon name="Wallet" size={20} />
                <div>
                  <strong>{t('place_price')}</strong>
                  <span>
                    {place.price.toLocaleString()} DA
                    {place.oldPrice && (
                      <em> {place.oldPrice.toLocaleString()} DA</em>
                    )}
                  </span>
                </div>
              </article>
            </div>

            <h2>{t('place_includes')}</h2>
            <ul className="place-includes">
              {place.includes.map((item) => (
                <li key={item.fr}>
                  <Icon name="Check" size={16} />
                  {pick(item.fr, item.en, item.ar)}
                </li>
              ))}
            </ul>

            {placeActivities.length > 0 && (
              <>
                <h2>{t('place_activities')}</h2>
                <p className="place-activities__lead">{t('place_activities_lead')}</p>
                <div className="place-activities">
                  {placeActivities.map((act, i) => {
                    const cat = ACTIVITY_CATEGORIES[act.category];
                    return (
                      <button
                        key={act.id}
                        type="button"
                        className="place-act-card"
                        data-reveal
                        data-delay={i * 60}
                        onClick={() => navigate(`/activity/${act.id}`)}
                      >
                        <div className="place-act-card__media">
                          <img
                            src={act.image}
                            alt=""
                            loading="lazy"
                          />
                          {cat && (
                            <span className="place-act-card__badge">
                              {pick(cat.fr, cat.en, cat.ar)}
                            </span>
                          )}
                        </div>
                        <div className="place-act-card__body">
                          <h3>{pick(act.name, act.name_en, act.name_ar)}</h3>
                          <p>{pick(act.desc, act.desc_en, act.desc_ar)}</p>
                          <div className="place-act-card__meta">
                            <span>
                              <Icon name="Clock" size={13} />{' '}
                              {pick(
                                act.durationShort,
                                act.durationShort_en,
                                act.durationShort_ar
                              )}
                            </span>
                            <span className="place-act-card__price">
                              {act.price.toLocaleString()} DA
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <h2>{t('place_gallery')}</h2>
            <div className="place-gallery">
              {place.gallery.map((src) => (
                <img key={src} src={src} alt="" loading="lazy" />
              ))}
            </div>
          </div>

          <aside className="place-card" data-reveal="right">
            <div className="place-card__price">
              <span>{t('acts_from')}</span>
              <strong>
                {place.price.toLocaleString()} <small>DA</small>
              </strong>
              {place.oldPrice && (
                <s>{place.oldPrice.toLocaleString()} DA</s>
              )}
            </div>
            <ul className="place-card__list">
              <li>
                <Icon name="Calendar" size={16} />
                {pick(place.bestTime, place.bestTime_en, place.bestTime_ar)}
              </li>
              <li>
                <Icon name="Clock" size={16} />
                {pick(place.duration, place.duration_en, place.duration_ar)}
              </li>
              <li>
                <Icon name="Hotel" size={16} />
                {pick(place.stay, place.stay_en, place.stay_ar)}
              </li>
              <li>
                <Icon name="Car" size={16} />
                {pick(place.transport, place.transport_en, place.transport_ar)}
              </li>
            </ul>
            <button
              type="button"
              className="place-card__btn"
              onClick={() => setBookingOpen(true)}
            >
              {t('place_book')} <Icon name="ArrowRight" size={16} />
            </button>
            <a
              className="place-card__wa"
              href={`https://wa.me/213557664089?text=${encodeURIComponent(
                `Bonjour, je souhaite réserver un séjour à ${place.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="MessageCircle" size={16} />
              {t('place_whatsapp')}
            </a>
          </aside>
        </div>

        <div className="place-similar">
          <h2 data-reveal>{t('place_similar')}</h2>
          <div className="place-similar__grid">
            {similar.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="place-similar__card"
                data-reveal
                data-delay={i * 60}
                onClick={() => navigate(`/place/${p.id}`)}
              >
                <img src={p.image} alt="" />
                <div>
                  <strong>{pick(p.name, p.name_en, p.name_ar)}</strong>
                  <span>{pick(p.tagline, p.tagline_en, p.tagline_ar)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {bookingOpen && (
        <div className="place-modal" onClick={closeBooking} role="presentation">
          <div
            className="place-modal__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="place-book-title"
          >
            <button
              type="button"
              className="place-modal__close"
              onClick={closeBooking}
              aria-label="Close"
            >
              <Icon name="X" size={18} />
            </button>

            {sent ? (
              <div className="place-modal__success">
                <div className="place-modal__success-icon">
                  <Icon name="Check" size={28} />
                </div>
                <h2>{t('place_form_success_title')}</h2>
                <p>{t('place_form_success_text')}</p>
                <button type="button" onClick={closeBooking}>
                  {t('place_form_close')}
                </button>
              </div>
            ) : (
              <>
                <p className="place-modal__eyebrow">{t('place_form_eyebrow')}</p>
                <h2 id="place-book-title">
                  {t('place_form_title')}{' '}
                  <em>{pick(place.name, place.name_en, place.name_ar)}</em>
                </h2>
                <p className="place-modal__lead">{t('place_form_lead')}</p>

                <form className="place-form" onSubmit={onSubmit}>
                  <div className="place-form__row">
                    <label>
                      {t('place_form_name')}
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        required
                        placeholder={t('place_form_name_ph')}
                      />
                    </label>
                    <label>
                      {t('place_form_email')}
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        required
                        placeholder={t('place_form_email_ph')}
                      />
                    </label>
                  </div>
                  <div className="place-form__row">
                    <label>
                      {t('place_form_phone')}
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        placeholder={t('place_form_phone_ph')}
                      />
                    </label>
                    <label>
                      {t('place_form_date')}
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={onChange}
                        required
                      />
                    </label>
                  </div>
                  <div className="place-form__row">
                    <label>
                      {t('place_form_travelers')}
                      <select
                        name="travelers"
                        value={form.travelers}
                        onChange={onChange}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {t('place_form_stay')}
                      <select name="stay" value={form.stay} onChange={onChange}>
                        <option value="">{t('place_form_stay_ph')}</option>
                        <option value="hotel">{t('place_form_stay_hotel')}</option>
                        <option value="guesthouse">
                          {t('place_form_stay_guest')}
                        </option>
                        <option value="camp">{t('place_form_stay_camp')}</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    {t('place_form_message')}
                    <textarea
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={onChange}
                      placeholder={t('place_form_message_ph')}
                    />
                  </label>
                  <button type="submit" className="place-form__submit">
                    {t('place_form_submit')} <Icon name="Send" size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PlaceDetail;
