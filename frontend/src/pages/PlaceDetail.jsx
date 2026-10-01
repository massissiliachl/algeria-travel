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
import { getPlaceById, getPlaces } from '../data/places';
import { TAGHIT_PACKAGES, TAGHIT_PLACE_PKGS } from '../data/taghitPackages';
import { ACTIVITY_CATEGORIES, getActivitiesForPlace } from '../data/activities';
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
  const taghitPkg = pkgParam === 'brezina' ? 'brezina' : 'hotel';
  const place = getPlaceById(id, id === 'taghit' ? taghitPkg : pkgParam);
  const placeActivities = place ? getActivitiesForPlace(place.id) : [];

  const [bookingOpen, setBookingOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
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
    if (id === 'taghit' && searchParams.get('pkg') === 'guesthouse') {
      navigate('/guesthouses', { replace: true });
      return undefined;
    }
    if (
      id === 'taghit' &&
      searchParams.get('pkg') &&
      searchParams.get('pkg') !== 'hotel' &&
      searchParams.get('pkg') !== 'brezina'
    ) {
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
          ? searchParams.get('pkg') === 'brezina'
            ? 'brezina'
            : searchParams.get('pkg') === 'guesthouse'
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
  const priceOnRequest = Boolean(place.priceOnRequest) || place.price == null;
  const priceLabel = priceOnRequest
    ? t('place_on_request')
    : isPerPerson
      ? t('home_v2_coup_per_person')
      : t('acts_from');
  const priceDisplay = priceOnRequest
    ? t('place_on_request')
    : `${Number(place.price).toLocaleString()} DA`;
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
  const offerDates = place.dates
    ? pick(place.dates, place.dates_en, place.dates_ar)
    : pick(place.bestTime, place.bestTime_en, place.bestTime_ar);

  const whatsappHref = place.whatsapp
    ? `https://wa.me/${place.whatsapp}?text=${encodeURIComponent(
        `Bonjour, je souhaite réserver : ${place.pkgTitle || place.name} — ${place.name}${
          place.dates ? ` (${place.dates})` : ''
        }`
      )}`
    : null;

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

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.date) return;
    if (typeof window.ATBooking?.create === 'function') {
      window.ATBooking.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        date: form.date,
        travelers: form.travelers,
        stay: form.stay,
        destination: pick(place.name, place.name_en, place.name_ar),
        message: form.message.trim(),
        source: 'place',
      });
    }
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

  const similar = getPlaces().filter((p) => p.id !== place.id).slice(0, 3);

  return (
    <div className="acts-page place-page has-mobile-bar">
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
          </div>
          <span className="place-hero__rule" aria-hidden />
        </div>
      </section>

      {id === 'taghit' && (
        <div className="place-pkg-switch acts-container" data-reveal>
          <p className="place-pkg-switch__label">{t('place_pkg_switch')}</p>
          <div className="place-pkg-switch__list" role="tablist">
            {TAGHIT_PLACE_PKGS.map((key) => {
              const pkg = TAGHIT_PACKAGES[key];
              const active = (place.activePkg || 'hotel') === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`place-pkg-switch__btn${active ? ' is-active' : ''}`}
                  onClick={() => navigate(`/place/taghit?pkg=${key}`)}
                >
                  <Icon name={pkg.icon} size={16} />
                  <span>{pick(pkg.title, pkg.title_en, pkg.title_ar)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
                {priceDisplay}
                {!priceOnRequest && (
                  <small>{isPerPerson ? ` ${t('per_person')}` : ''}</small>
                )}
              </strong>
              {!priceOnRequest && place.oldPrice && (
                <s>{place.oldPrice.toLocaleString()} DA</s>
              )}
              {!priceOnRequest && (
                <em className="place-bookbar__badge">
                  <Icon name="BadgePercent" size={14} /> {t('place_best_price')}
                </em>
              )}
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
                <strong>{offerDates}</strong>
              </div>
            </div>
            {whatsappHref ? (
              <a
                className="place-bookbar__cta"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('place_whatsapp_book')} <Icon name="ArrowRight" size={16} />
              </a>
            ) : (
              <button
                type="button"
                className="place-bookbar__cta"
                onClick={() => setBookingOpen(true)}
              >
                {t('place_book')} <Icon name="ArrowRight" size={16} />
              </button>
            )}
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

        {place.overview && (
          <div className="place-overview" data-reveal>
            <h2>{pick(place.overview.title, place.overview.title_en)}</h2>
            {pick(place.overview.text, place.overview.text_en).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        {place.stories?.length > 0 && (
          <div className="place-stories" data-reveal>
            {place.stories.map((story) => (
              <article key={story.title} className="place-story">
                <p className="place-story__eyebrow">
                  <Icon name={story.icon || 'MapPin'} size={14} />
                  {pick(story.eyebrow, story.eyebrow_en)}
                </p>
                <h3>{pick(story.title, story.title_en)}</h3>
                <p>{pick(story.text, story.text_en)}</p>
              </article>
            ))}
          </div>
        )}

        {place.facts?.length > 0 ? (
          <div className="place-facts-block" data-reveal>
            <h2>{t('place_facts_title')}</h2>
            <div className="place-facts">
              {place.facts.map((fact) => (
                <article key={fact.label} className="place-facts__item">
                  <Icon name={fact.icon} size={20} />
                  <div>
                    <strong>{pick(fact.label, fact.label_en)}</strong>
                    <span>{pick(fact.value, fact.value_en)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
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
        )}

        {place.itinerary?.length > 0 && (
          <div className="place-itinerary-block" data-reveal>
            <h2>{t('place_itinerary')}</h2>
            <ol className="place-itinerary">
              {place.itinerary.map((day) => (
                <li key={day.day} className="place-itinerary__day">
                  <span className="place-itinerary__num" aria-hidden="true">
                    {day.day}
                  </span>
                  <div>
                    <p className="place-itinerary__label">
                      {t('place_itinerary_day')} {day.day}
                    </p>
                    <h3>{pick(day.title, day.title_en)}</h3>
                    <ul>
                      {day.steps.map(([fr, en]) => (
                        <li key={fr}>{pick(fr, en)}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
            {place.itineraryNote && (
              <p className="place-note">
                <Icon name="Compass" size={16} />
                {pick(place.itineraryNote, place.itineraryNote_en)}
              </p>
            )}
          </div>
        )}

        {place.cuisine && (
          <div className="place-cuisine-block" data-reveal>
            <h2>{t('place_cuisine')}</h2>
            <div className="place-cuisine">
              <article className="place-cuisine__card">
                <h3>{t('place_cuisine_breakfast')}</h3>
                <p>{pick(place.cuisine.breakfast, place.cuisine.breakfast_en)}</p>
                <ul className="place-cuisine__tags">
                  {place.cuisine.breakfastItems.map(([fr, en]) => (
                    <li key={fr}>{pick(fr, en)}</li>
                  ))}
                </ul>
              </article>
              <article className="place-cuisine__card">
                <h3>{t('place_cuisine_meals')}</h3>
                <p>{pick(place.cuisine.meals, place.cuisine.meals_en)}</p>
              </article>
              <article className="place-cuisine__card place-cuisine__card--bonus">
                <h3>{t('place_cuisine_bonus')}</h3>
                <p>{pick(place.cuisine.bonus, place.cuisine.bonus_en)}</p>
              </article>
            </div>
          </div>
        )}

        {place.includes?.length > 0 && (
          <div className="place-includes-block" data-reveal>
            <div className="place-includes-block__head">
              {place.pkgTitle && (
                <span className="place-includes-block__badge">
                  <Icon name={place.pkgIcon || 'Hotel'} size={14} />
                  {pick(place.pkgTitle, place.pkgTitle_en, place.pkgTitle_ar)}
                </span>
              )}
              <h2>{t(place.includesTitleKey || 'place_includes')}</h2>
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

        {place.faq?.length > 0 && (
          <div className="place-faq-block" data-reveal>
            <h2>{t('place_faq')}</h2>
            <div className="place-faq">
              {place.faq.map((item) => (
                <details key={item.q} className="place-faq__item">
                  <summary>
                    {pick(item.q, item.q_en)}
                    <Icon name="ChevronRight" size={16} className="place-faq__chevron" />
                  </summary>
                  <p>{pick(item.a, item.a_en)}</p>
                </details>
              ))}
            </div>
            {place.faqNote && (
              <p className="place-note">
                <Icon name="Trees" size={16} />
                {pick(place.faqNote, place.faqNote_en)}
              </p>
            )}
          </div>
        )}

        {place.checklist?.length > 0 && (
          <div className="place-includes-block place-checklist-block" data-reveal>
            <div className="place-includes-block__head">
              <h2>{t('place_checklist')}</h2>
            </div>
            <ul className="place-includes place-checklist">
              {place.checklist.map(([fr, en]) => (
                <li key={fr}>
                  <Icon name="Check" size={16} />
                  {pick(fr, en)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {place.whyUs?.length > 0 && (
          <div className="place-whyus-block" data-reveal>
            <h2>{t('place_why_us')}</h2>
            <ul className="place-whyus">
              {place.whyUs.map((item) => (
                <li key={item.fr}>
                  <span className="place-why__icon" aria-hidden="true">
                    <Icon name={item.icon} size={18} strokeWidth={1.5} />
                  </span>
                  <span>{pick(item.fr, item.en, item.ar)}</span>
                </li>
              ))}
            </ul>
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
        price={priceDisplay}
        ctaLabel={whatsappHref ? t('place_whatsapp_book') : t('place_book')}
        onCta={() => {
          if (whatsappHref) {
            window.open(whatsappHref, '_blank', 'noopener,noreferrer');
            return;
          }
          setBookingOpen(true);
        }}
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
              <button type="submit" className="place-form__submit">
                {t('place_form_submit')} <Icon name="Send" size={16} />
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
