import React, { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { searchCatalog } from '../data/search';
import SeoHead from '../components/SeoHead';
import './Activities.css';
import './SearchResults.css';

const SearchResults = () => {
  const { t, pick } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const q = params.get('q') || '';
  const activity = params.get('activity') || '';
  const dates = params.get('dates') || '';
  const travelers = params.get('travelers') || '';

  const results = useMemo(
    () => searchCatalog({ destination: q, activity }),
    [q, activity]
  );

  const places = results.filter((r) => r.type === 'place');
  const activities = results.filter((r) => r.type === 'activity');
  const tours = results.filter((r) => r.type === 'tour');
  const hasQuery = Boolean(q || activity);
  const empty = hasQuery && results.length === 0;

  return (
    <div className="acts-page search-page">
      <SeoHead
        title={t('seo_search_title')}
        description={t('seo_search_desc')}
        path="/search"
        noindex
      />
      <Navbar />

      <section className="search-hero">
        <div className="acts-container" data-reveal="fade">
          <nav className="acts-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav_home')}</Link>
            <span>/</span>
            <span>{t('search_title')}</span>
          </nav>
          <h1>{t('search_title')}</h1>
          <p className="search-hero__lead">
            {hasQuery
              ? t('search_for')
                  .replace('{q}', [q, activity].filter(Boolean).join(' · '))
              : t('search_all_hint')}
          </p>
          {(dates || travelers) && (
            <div className="search-hero__meta">
              {dates && (
                <span>
                  <Icon name="Calendar" size={14} /> {dates}
                </span>
              )}
              {travelers && (
                <span>
                  <Icon name="Users" size={14} /> {travelers}{' '}
                  {Number(travelers) > 1 ? t('people') : t('person')}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="acts-container search-body">
        {empty ? (
          <div className="search-empty" data-reveal>
            <Icon name="Search" size={36} />
            <h2>{t('search_empty_title')}</h2>
            <p>{t('search_empty_text')}</p>
            <div className="search-empty__actions">
              <button type="button" onClick={() => navigate('/destinations')}>
                {t('nav_destinations')}
              </button>
              <button type="button" onClick={() => navigate('/activities')}>
                {t('nav_activities')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {places.length > 0 && (
              <div className="search-block">
                <h2 data-reveal>
                  {t('search_places')}{' '}
                  <em>({places.length})</em>
                </h2>
                <div className="search-grid">
                  {places.map(({ item, path }, i) => (
                    <button
                      key={item.id}
                      type="button"
                      className="search-card"
                      data-reveal
                      data-delay={i * 60}
                      onClick={() => {
                        const p = new URLSearchParams();
                        if (dates) p.set('dates', dates);
                        if (travelers) p.set('travelers', travelers);
                        const qs = p.toString();
                        navigate(qs ? `${path}?${qs}` : path);
                      }}
                    >
                      <img src={item.image} alt="" loading="lazy" />
                      <div>
                        <strong>{pick(item.name, item.name_en, item.name_ar)}</strong>
                        <span>
                          {pick(item.tagline, item.tagline_en, item.tagline_ar)}
                        </span>
                        <em>
                          {t('acts_from')} {item.price.toLocaleString()} DA
                        </em>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activities.length > 0 && (
              <div className="search-block">
                <h2 data-reveal>
                  {t('search_activities')} <em>({activities.length})</em>
                </h2>
                <div className="search-grid">
                  {activities.map(({ item, path }, i) => (
                    <button
                      key={item.id}
                      type="button"
                      className="search-card"
                      data-reveal
                      data-delay={i * 60}
                      onClick={() => navigate(path)}
                    >
                      <img src={item.image} alt="" loading="lazy" />
                      <div>
                        <strong>{pick(item.name, item.name_en, item.name_ar)}</strong>
                        <span>{pick(item.desc, item.desc_en, item.desc_ar)}</span>
                        <em>
                          {t('acts_from')} {item.price.toLocaleString()} DA
                        </em>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tours.length > 0 && (
              <div className="search-block">
                <h2 data-reveal>
                  {t('search_tours')} <em>({tours.length})</em>
                </h2>
                <div className="search-grid">
                  {tours.map(({ item, path }, i) => (
                    <button
                      key={item.id}
                      type="button"
                      className="search-card"
                      data-reveal
                      data-delay={i * 60}
                      onClick={() => navigate(path)}
                    >
                      <img src={item.image} alt="" loading="lazy" />
                      <div>
                        <strong>{pick(item.name, item.name_en, item.name_ar)}</strong>
                        <span>
                          {pick(
                            item.subtitle || item.location,
                            item.subtitle_en || item.location_en,
                            item.subtitle_ar || item.location_ar
                          )}
                        </span>
                        <em>
                          {t('acts_from')} {item.price.toLocaleString()} DA
                        </em>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!hasQuery && (
              <div className="search-empty search-empty--soft" data-reveal>
                <p>{t('search_all_hint')}</p>
                <div className="search-empty__actions">
                  <button type="button" onClick={() => navigate('/')}>
                    {t('home_search_btn')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default SearchResults;
