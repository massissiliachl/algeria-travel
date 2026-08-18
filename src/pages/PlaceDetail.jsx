import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import MobileBookingBar from '../components/ui/MobileBookingBar';
import BottomSheet from '../components/ui/BottomSheet';
import ImageLightbox from '../components/ui/ImageLightbox';
import { useLang } from '../hooks/useLangHook';
import { api } from '../services/api';
import { getPlaceById, PLACES } from '../data/places';
import { ACTIVITY_CATEGORIES, getActivitiesForPlace } from '../data/activities';
import SeoHead from '../components/SeoHead';
import './Activities.css';
import './PlaceDetail.css';

const TRUST_ITEMS = [
  { icon: 'CreditCard', key: 'place_trust_pay' },
  { icon: 'Zap', key: 'place_trust_confirm' },
  { icon: 'Headphones', key: 'place_trust_support' },
];

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, pick } = useLang();
  const pkgParam = searchParams.get('pkg');
  // Taghit destination page always resolves to hotel package
  const place = getPlaceById(id, id === 'taghit' ? 'hotel' : pkgParam);
  const placeActivities = place ? getActivitiesForPlace(place.id) : [];

  const [bookingOpen, setBookingOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [bookingRef, setBookingRef] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: searchParams.get('dates') || '',
    travelers: searchParams.get('travelers') || '2',
    stay: '',
    message: '',
    website: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!place) {
      navigate('/destinations', { replace: true });
      return undefined;
    }
    if (id === 'taghit' && searchParams.get('pkg') === 'guesthouse') {
      navigate('/guesthouses', { replace: true });
      return undefined;
    }
    // Taghit destination = toujours formule hôtel
    if (id === 'taghit' && searchParams.get('pkg') && searchParams.get('pkg') !== 'hotel') {
      navigate('/place/taghit?pkg=hotel', { replace: true });
      return undefined;
    }
    const raf = window.requestAnimationFrame(() => {
      document
        .querySelectorAll('.place-page [data-reveal]')
        .forEach((el) => el.classList.add('is-in', 'revealed'));
    });
    return () => window.cancelAnimationFrame(raf);
  }, [place, navigate, id, searchParams]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      date: searchParams.get('dates') || prev.date,
      travelers: searchParams.get('travelers') || prev.travelers,
      stay:
        id === 'taghit'
          ? searchParams.get('pkg') === 'guesthouse'
            ? 'guesthouse'
            : 'hotel'
          : prev.stay,
    }));
  }, [searchParams, id]);

  useEffect(() => {
    document.body.style.overflow = bookingOpen || lightboxIndex != null ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [bookingOpen, lightboxIndex]);

  if (!place) return null;

  const isPerPerson = place.id === 'taghit' || place.pricePerPerson;
  const priceLabel = isPerPerson ? t('home_v2_coup_per_person') : t('acts_from');
  const placeName = pick(place.name, place.name_en, place.name_ar);
  const whyItems = place.whyVisit?.length
    ? place.whyVisit
    : place.highlights || [];
  const gallery = place.gallery?.length ? place.gallery : [place.image];
  const region = pick(
    place.region || `${placeName}, Algérie`,
    place.region_en || `${placeName}, Algeria`,
    place.region_ar || `${placeName}، الجزائر`
  );
  const weather = pick(
    place.weather || 'Ensoleillé',
    place.weather_en || 'Sunny',
    place.weather_ar || 'مشمس'
  );
  const idealFor = pick(
    place.idealFor || 'Détente & Découverte',
    place.idealFor_en || 'Relaxation & Discovery',
    place.idealFor_ar || 'استرخاء واكتشاف'
  );
  const duration = pick(
    place.recommendedDuration || place.duration,
    place.recommendedDuration_en || place.duration_en,
    place.recommendedDuration_ar || place.duration_ar
  );
  const difficulty = pick(
    place.difficulty || 'Facile à modérée',
    place.difficulty_en || 'Easy to moderate',
    place.difficulty_ar || 'سهل إلى متوسط'
  );
  const audience = pick(
    place.audience || 'En couple, famille, amis',
    place.audience_en || 'Couples, families, friends',
    place.audience_ar || 'أزواج، عائلات، أصدقاء'
  );

  const quickFacts = [
    { icon: 'MapPin', label: t('place_fact_location'), value: region },
    { icon: 'Clock', label: t('place_fact_duration'), value: duration },
    { icon: 'Activity', label: t('place_fact_difficulty'), value: difficulty },
    { icon: 'Users', label: t('place_fact_travelers'), value: audience },
  ];

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.date) return;

    setSubmitting(true);
    setFormError('');

    try {
      const result = await api.createReservation({
        item_type: 'place',
        item_id: place.id,
        item_name: placeName,
        name: form.name,
        email: form.email,
        phone: form.phone,
        travel_date: form.date,
        travelers: Number(form.travelers),
        stay_type: form.stay || null,
        message: form.message,
        price_estimate: place.price,
        website: form.website,
      });
      setBookingRef({
        referenceCode: result.referenceCode,
        accessToken: result.accessToken,
      });
      setSent(true);
    } catch (err) {
      setFormError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSent(false);
    setFormError('');
    setBookingRef(null);
    setSubmitting(false);
    setForm({
      name: '',
      email: '',
      phone: '',
      date: '',
      travelers: '2',
      stay: '',
      message: '',
      website: '',
    });
  };

  const similar = PLACES.filter((p) => p.id !== place.id).slice(0, 3);

  return (
    <div className="acts-page place-page has-mobile-bar">
      <SeoHead
        title={placeName}
        description={pick(place.description, place.description_en, place.description_ar)}
        path={`/place/${place.id}`}
        image={place.image}
      />
      <Navbar />

      <section className="place-hero">
        <ResponsiveImage
          className="place-hero__bg"
          src={place.image}
          alt=""
          priority
          sizes="100vw"
        />
        <div className="place-hero__overlay" />
        <div className="place-hero__inner" data-reveal="fade">
          <nav className="acts-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <Link to="/destinations">{t('nav_destinations')}</Link>
            <span>/</span>
            <span>{placeName}</span>
          </nav>
          <p className="place-hero__tag">
            {pick(place.tagline, place.tagline_en, place.tagline_ar)}
          </p>
          <h1>{placeName}</h1>
          <div className="place-hero__meta">
            <span>
              <Icon name="Star" size={14} /> {place.rating} ({place.reviews}{' '}
              {t('place_reviews')})
            </span>
            <span>
              <Icon name="Sun" size={14} /> {place.temp} {weather}
            </span>
            <span>
              <Icon name="Users" size={14} /> {t('place_ideal')} {idealFor}
            </span>
          </div>
          <div className="place-hero__price" data-reveal>
            <Icon name="Tag" size={16} />
            <span>
              {priceLabel}{' '}
              <strong>{place.price.toLocaleString()} DA</strong>
              {isPerPerson ? ` ${t('per_person')}` : ''}
            </span>
          </div>
        </div>
      </section>

      <section className="place-bookbar acts-container" data-reveal>
        <div className="place-bookbar__inner">
          <div className="place-bookbar__left">
            {place.pkgTitle && (
              <p className="place-bookbar__pkg">
                <Icon name={place.pkgIcon || 'Hotel'} size={16} />
                {t('place_offer')}{' '}
                <strong>
                  {pick(place.pkgTitle, place.pkgTitle_en, place.pkgTitle_ar)}
                </strong>
              </p>
            )}
            <div className="place-bookbar__price">
              <strong>
                {place.price.toLocaleString()} DA
                <small>{isPerPerson ? ` ${t('per_person')}` : ''}</small>
              </strong>
              {place.oldPrice && (
                <s>{place.oldPrice.toLocaleString()} DA</s>
              )}
              <em className="place-bookbar__badge">
                <Icon name="BadgePercent" size={14} /> {t('place_best_price')}
              </em>
            </div>
            <ul className="place-bookbar__trust">
              {TRUST_ITEMS.map((item) => (
                <li key={item.key}>
                  <span className="place-bookbar__trust-icon" aria-hidden="true">
                    <Icon name={item.icon} size={16} />
                  </span>
                  {t(item.key)}
                </li>
              ))}
            </ul>
          </div>
          <div className="place-bookbar__right">
            <div className="place-bookbar__period">
              <Icon name="Calendar" size={18} />
              <div>
                <span>{t('place_dates')}</span>
                <strong>
                  {pick(place.bestTime, place.bestTime_en, place.bestTime_ar)}
                </strong>
              </div>
            </div>
            <button
              type="button"
              className="place-bookbar__cta"
              onClick={() => setBookingOpen(true)}
            >
              {t('place_book')} <Icon name="ArrowRight" size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="place-main acts-container">
        <div className="place-why" data-reveal>
          <div className="place-why__copy">
            <h2>
              {t('place_why')} <em>{placeName}</em> ?
            </h2>
            <p>
              {pick(place.description, place.description_en, place.description_ar)}
            </p>
            <ul className="place-why__list">
              {whyItems.map((item, i) => (
                <li key={item.fr || i} data-reveal data-delay={i * 60}>
                  <span className="place-why__icon" aria-hidden="true">
                    <Icon name={item.icon || 'Check'} size={18} strokeWidth={1.5} />
                  </span>
                  <span>{pick(item.fr, item.en, item.ar)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="place-why__gallery">
            <button
              type="button"
              className="place-why__shot place-why__shot--main"
              onClick={() => setLightboxIndex(0)}
              aria-label={t('place_gallery_see')}
            >
              <img src={gallery[0]} alt="" loading="lazy" />
              <span className="place-why__gallery-btn">
                {t('place_gallery_see')} ({gallery.length})
              </span>
            </button>
            {gallery[1] && (
              <button
                type="button"
                className="place-why__shot"
                onClick={() => setLightboxIndex(1)}
              >
                <img src={gallery[1]} alt="" loading="lazy" />
              </button>
            )}
            {gallery[2] && (
              <button
                type="button"
                className="place-why__shot"
                onClick={() => setLightboxIndex(2)}
              >
                <img src={gallery[2]} alt="" loading="lazy" />
              </button>
            )}
          </div>
        </div>

        <div className="place-quick" data-reveal>
          {quickFacts.map((fact) => (
            <article key={fact.label} className="place-quick__item">
              <Icon name={fact.icon} size={20} />
              <div>
                <strong>{fact.label}</strong>
                <span>{fact.value}</span>
              </div>
              <Icon name="ChevronRight" size={16} className="place-quick__chevron" />
            </article>
          ))}
        </div>

        {place.includes?.length > 0 && (
          <div className="place-includes-block" data-reveal>
            <div className="place-includes-block__head">
              {place.pkgTitle && (
                <span className="place-includes-block__badge">
                  <Icon name={place.pkgIcon || 'Hotel'} size={14} />
                  {pick(place.pkgTitle, place.pkgTitle_en, place.pkgTitle_ar)}
                </span>
              )}
              <h2>{t('place_includes')}</h2>
            </div>
            <ul className="place-includes">
              {place.includes.map((item) => (
                <li key={item.fr}>
                  <Icon name="Check" size={16} />
                  {pick(item.fr, item.en, item.ar)}
                </li>
              ))}
            </ul>
            {(place.stay || place.transport) && (
              <div className="place-includes-meta">
                {place.stay && (
                  <p>
                    <Icon name="Hotel" size={16} />
                    {pick(place.stay, place.stay_en, place.stay_ar)}
                  </p>
                )}
                {place.transport && (
                  <p>
                    <Icon name="Plane" size={16} />
                    {pick(place.transport, place.transport_en, place.transport_ar)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {placeActivities.length > 0 && (
          <div className="place-activities-block" data-reveal>
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
                      <img src={act.image} alt="" loading="lazy" />
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
          </div>
        )}

        <aside className="place-help" data-reveal>
          <span className="place-help__icon" aria-hidden="true">
            <Icon name="Headphones" size={22} />
          </span>
          <div className="place-help__text">
            <strong>{t('place_help_title')}</strong>
            <p>{t('place_help_text')}</p>
          </div>
          <Link to="/contact" className="place-help__cta">
            {t('place_help_cta')} <Icon name="ArrowRight" size={16} />
          </Link>
        </aside>

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

      <MobileBookingBar
        priceLabel={priceLabel}
        price={`${place.price.toLocaleString()} DA`}
        ctaLabel={t('place_book')}
        onCta={() => setBookingOpen(true)}
        className="place-mobile-bar"
        ariaLabel={t('place_book')}
      />

      {lightboxIndex != null && (
        <ImageLightbox
          images={gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <BottomSheet
        open={bookingOpen}
        onClose={closeBooking}
        titleId="place-book-title"
        panelClassName="place-modal__panel"
        className="place-modal bottom-sheet"
      >
        {sent ? (
          <div className="place-modal__success">
            <div className="place-modal__success-icon">
              <Icon name="Check" size={28} />
            </div>
            <h2>{t('place_form_success_title')}</h2>
            <p>{t('place_form_success_text')}</p>
            {bookingRef && (
              <div className="place-modal__ref">
                <p>
                  <strong>{t('place_form_ref_label')}</strong>{' '}
                  <code>{bookingRef.referenceCode}</code>
                </p>
                <p className="place-modal__ref-hint">{t('place_form_ref_hint')}</p>
                <details>
                  <summary>{t('place_form_token_toggle')}</summary>
                  <code className="place-modal__token">{bookingRef.accessToken}</code>
                </details>
                <Link
                  to={`/suivi?ref=${encodeURIComponent(bookingRef.referenceCode)}`}
                  className="place-modal__track-link"
                >
                  {t('place_form_track_link')}
                </Link>
              </div>
            )}
            <button type="button" onClick={closeBooking}>
              {t('place_form_close')}
            </button>
          </div>
        ) : (
          <>
            <p className="place-modal__eyebrow">{t('place_form_eyebrow')}</p>
            <h2 id="place-book-title">
              {t('place_form_title')} <em>{placeName}</em>
            </h2>
            <p className="place-modal__lead">{t('place_form_lead')}</p>

            <form className="place-form" onSubmit={onSubmit}>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={onChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="place-form__honeypot"
              />
              {formError && (
                <p className="place-form__error" role="alert">
                  {formError}
                </p>
              )}
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
                  <select name="stay" value={form.stay || (id === 'taghit' ? 'hotel' : '')} onChange={onChange}>
                    {id !== 'taghit' && (
                      <option value="">{t('place_form_stay_ph')}</option>
                    )}
                    <option value="hotel">{t('place_form_stay_hotel')}</option>
                    {id !== 'taghit' && (
                      <>
                        <option value="guesthouse">
                          {t('place_form_stay_guest')}
                        </option>
                        <option value="camp">{t('place_form_stay_camp')}</option>
                      </>
                    )}
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
              <button type="submit" className="place-form__submit" disabled={submitting}>
                {submitting ? t('place_form_sending') : t('place_form_submit')}{' '}
                {!submitting && <Icon name="Send" size={16} />}
              </button>
            </form>
          </>
        )}
      </BottomSheet>

      <Footer />
    </div>
  );
};

export default PlaceDetail;
