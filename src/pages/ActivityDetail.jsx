import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLangHook';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../data/activities';
import Icon from '../components/ui/Icon';
import SeoHead from '../components/SeoHead';
import BookingSheet from '../components/booking/BookingSheet';
import './ActivityDetail.css';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, pick } = useLang();
  const [activity, setActivity] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState('overview');
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const found = ACTIVITIES.find((a) => a.id === id);
    if (!found) {
      navigate('/activities');
      return;
    }
    setActivity(found);
    setActiveImage(0);
    setTab('overview');
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (!activity) {
    return (
      <>
        <Navbar />
        <div className="act-page-loading">{t('loader_text') || '…'}</div>
        <Footer />
      </>
    );
  }

  const cat = ACTIVITY_CATEGORIES[activity.category];
  const gallery = activity.gallery?.length ? activity.gallery : [activity.image];
  const included = pick(activity.included, activity.included_en, activity.included_ar) || [];
  const seoTitle = pick(activity.name, activity.name_en, activity.name_ar);
  const seoDesc = pick(activity.fullDesc, activity.fullDesc_en, activity.fullDesc_ar)
    || pick(activity.desc, activity.desc_en, activity.desc_ar);

  const tabs = [
    { key: 'overview', label: t('act_page_tab_overview') },
    { key: 'history', label: t('act_page_tab_history') },
    { key: 'visit', label: t('act_page_tab_visit') },
  ];

  const handleReserve = (e) => {
    e.preventDefault();
    setBookingOpen(true);
  };

  const activityName = pick(activity.name, activity.name_en, activity.name_ar);

  const others = ACTIVITIES.filter((a) => a.id !== activity.id).slice(0, 3);

  return (
    <div className="act-page">
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        path={`/activity/${activity.id}`}
        image={activity.image}
      />
      <Navbar />

      <section className="act-page-hero">
        <img src={gallery[activeImage]} alt="" className="act-page-hero__bg" />
        <div className="act-page-hero__overlay" />
        <div className="act-page-hero__content" data-reveal="fade">
          <Link to="/activities" className="act-page-back">
            <Icon name="ChevronLeft" size={18} /> {t('act_page_back')}
          </Link>
          {cat && <span className="act-page-badge">{pick(cat.fr, cat.en, cat.ar)}</span>}
          <h1>{pick(activity.name, activity.name_en, activity.name_ar)}</h1>
          <p>{pick(activity.desc, activity.desc_en, activity.desc_ar)}</p>
          <div className="act-page-hero__meta">
            <span><Icon name="Star" size={14} /> {activity.rating}</span>
            <span><Icon name="MapPin" size={14} /> {pick(activity.location, activity.location_en, activity.location_ar)}</span>
            <span><Icon name="Clock" size={14} /> {pick(activity.duration, activity.duration_en, activity.duration_ar)}</span>
          </div>
        </div>
      </section>

      <div className="act-page-body">
        <div className="act-page-main" data-reveal="left">
          <div className="act-page-gallery">
            <div className="act-page-gallery__main">
              <img src={gallery[activeImage]} alt="" />
            </div>
            <div className="act-page-gallery__thumbs">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  className={i === activeImage ? 'is-active' : ''}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="act-page-tabs">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                className={tab === item.key ? 'is-active' : ''}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="act-page-panel">
            {tab === 'overview' && (
              <>
                <h2>{t('act_page_experience')}</h2>
                <p>{pick(activity.fullDesc, activity.fullDesc_en, activity.fullDesc_ar)}</p>
                <h3>{t('act_modal_included')}</h3>
                <ul className="act-page-included">
                  {included.map((item) => (
                    <li key={item}><Icon name="Check" size={16} /> {item}</li>
                  ))}
                </ul>
              </>
            )}
            {tab === 'history' && (
              <>
                <h2>{t('act_page_tab_history')}</h2>
                <p className="act-page-history">
                  {pick(activity.history, activity.history_en, activity.history_ar)}
                </p>
              </>
            )}
            {tab === 'visit' && (
              <>
                <h2>{t('act_page_tab_visit')}</h2>
                <p>{pick(activity.visit, activity.visit_en, activity.visit_ar)}</p>
                <div className="act-page-facts">
                  <div>
                    <Icon name="Calendar" size={18} />
                    <div>
                      <span>{t('act_modal_season')}</span>
                      <strong>{pick(activity.dates, activity.dates_en, activity.dates_ar)}</strong>
                    </div>
                  </div>
                  <div>
                    <Icon name="Users" size={18} />
                    <div>
                      <span>{t('act_modal_group')}</span>
                      <strong>{pick(activity.group, activity.group_en, activity.group_ar)}</strong>
                    </div>
                  </div>
                  <div>
                    <Icon name="MapPin" size={18} />
                    <div>
                      <span>{t('act_modal_location')}</span>
                      <strong>{pick(activity.location, activity.location_en, activity.location_ar)}</strong>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {others.length > 0 && (
            <div className="act-page-related">
              <h2 data-reveal>{t('act_page_other')}</h2>
              <div className="act-page-related__grid">
                {others.map((a, i) => (
                  <button
                    key={a.id}
                    type="button"
                    className="act-page-related__card"
                    data-reveal
                    data-delay={i * 60}
                    onClick={() => navigate(`/activity/${a.id}`)}
                  >
                    <img src={a.image} alt="" />
                    <span>{pick(a.name, a.name_en, a.name_ar)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="act-page-aside" data-reveal="right">
          <div className="act-page-book">
            <div className="act-page-book__price">
              <span>{t('act_modal_from')}</span>
              <strong>{activity.price.toLocaleString()} <small>DA</small></strong>
              <em>{t('act_modal_per_person')}</em>
            </div>
            <form onSubmit={handleReserve}>
              <button type="submit" className="act-page-book__btn">{t('btn_reserver')}</button>
            </form>
            <Link to="/contact" className="act-page-book__link">
              {t('act_modal_contact')} <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </aside>
      </div>

      <BookingSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        itemType="activity"
        itemId={activity.id}
        itemName={activityName}
        unitPrice={activity.price}
        pricePerPerson
        titleEm={activityName}
      />

      <Footer />
    </div>
  );
};

export default ActivityDetail;
