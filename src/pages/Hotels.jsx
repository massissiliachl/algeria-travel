import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import ResponsiveImage from '../components/ui/ResponsiveImage';
import SeoHead from '../components/SeoHead';
import { useLang } from '../hooks/useLangHook';
import { WILAYAS } from '../data/wilayas';
import { HOTELS, countHotelsByWilaya } from '../data/hotels';
import { AMENITY_FILTERS, PRICE_MAX, PRICE_MIN } from '../data/hotelFilters';
import { api } from '../services/api';
import { normalizeHotels } from '../utils/normalizeHotel';
import HotelsValueBar from '../components/hotels/HotelsValueBar';
import PopularDestinations from '../components/hotels/PopularDestinations';
import HotelPopularCard from '../components/hotels/HotelPopularCard';
import HotelFiltersPanel from '../components/hotels/HotelFiltersPanel';
import HotelsOffersBanner from '../components/hotels/HotelsOffersBanner';
import HotelFilterChips from '../components/hotels/HotelFilterChips';
import { countNights } from '../utils/hotelAvailability';
import './Hotels.css';

const SORT_OPTIONS = [
  { key: 'recommended', labelKey: 'hotels_sort_recommended' },
  { key: 'price_asc', labelKey: 'hotels_sort_price_asc' },
  { key: 'price_desc', labelKey: 'hotels_sort_price_desc' },
  { key: 'rating', labelKey: 'hotels_sort_rating' },
];

function hotelHasAmenity(hotel, filterKey, lang) {
  const filter = AMENITY_FILTERS.find((a) => a.key === filterKey);
  if (!filter) return true;
  const list = hotel.amenities?.[lang] || hotel.amenities?.fr || [];
  return list.some((item) => filter.match.some((m) => item.toLowerCase().includes(m)));
}

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem('hotel_favorites') || '[]'));
  } catch {
    return new Set();
  }
}

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, pick, language } = useLang();
  const [hotels, setHotels] = useState(HOTELS);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [sort, setSort] = useState('recommended');
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [starFilters, setStarFilters] = useState([]);
  const [amenityFilters, setAmenityFilters] = useState([]);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState({
    adults: Math.max(1, Number(searchParams.get('rooms')) || 2),
    children: 0,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const wilayaParam = searchParams.get('wilaya') || 'all';
  const wilaya =
    wilayaParam === 'all' || WILAYAS.some((w) => w.key === wilayaParam) ? wilayaParam : 'all';

  const amenityLang = language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'fr';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!mobileFiltersOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getHotels()
      .then((rows) => {
        if (cancelled) return;
        const normalized = normalizeHotels(rows);
        if (normalized.length) {
          const byId = new Map(HOTELS.map((h) => [h.id, h]));
          normalized.forEach((h) => {
            const base = byId.get(h.id) || {};
            byId.set(h.id, { ...base, ...h, image: h.image || base.image });
          });
          setHotels([...byId.values()]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => countHotelsByWilaya(hotels), [hotels]);

  const setWilaya = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key === 'all') next.delete('wilaya');
    else next.set('wilaya', key);
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    let list = [...hotels];

    if (wilaya !== 'all') {
      list = list.filter((h) => h.wilayaKey === wilaya || h.wilaya === wilaya);
    }

    list = list.filter(
      (h) => (h.price ?? 0) >= priceRange[0] && (h.price ?? 0) <= priceRange[1]
    );

    if (starFilters.length) {
      list = list.filter((h) => starFilters.includes(h.stars || 0));
    }

    if (amenityFilters.length) {
      list = list.filter((h) =>
        amenityFilters.every((key) => hotelHasAmenity(h, key, amenityLang))
      );
    }

    switch (sort) {
      case 'price_asc':
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0));
    }

    return list;
  }, [hotels, wilaya, priceRange, starFilters, amenityFilters, sort, amenityLang]);

  const starCounts = useMemo(() => {
    const base = wilaya === 'all' ? hotels : hotels.filter((h) => h.wilayaKey === wilaya);
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    base.forEach((h) => {
      const s = h.stars || 0;
      if (s >= 1 && s <= 5) c[s] += 1;
    });
    return c;
  }, [hotels, wilaya]);

  const resetFilters = () => {
    setWilaya('all');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setStarFilters([]);
    setAmenityFilters([]);
  };

  const toggleStar = (n) => {
    setStarFilters((prev) =>
      prev.includes(n) ? prev.filter((s) => s !== n) : [...prev, n]
    );
  };

  const toggleAmenity = (key) => {
    setAmenityFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('hotel_favorites', JSON.stringify([...next]));
      return next;
    });
  };

  const openHotel = (hotel) => {
    const qs = new URLSearchParams();
    if (checkIn) qs.set('checkIn', checkIn);
    if (checkOut) qs.set('checkOut', checkOut);
    if (guests.adults) qs.set('rooms', String(guests.adults));
    const q = qs.toString();
    navigate(`/hotels/${hotel.id}${q ? `?${q}` : ''}`);
  };

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (checkIn) params.set('checkIn', checkIn);
    else params.delete('checkIn');
    if (checkOut) params.set('checkOut', checkOut);
    else params.delete('checkOut');
    params.set('rooms', String(guests.adults));
    setSearchParams(params);
    document.getElementById('hotels-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const wilayaLabel =
    wilaya === 'all'
      ? null
      : pick(
          WILAYAS.find((w) => w.key === wilaya)?.fr,
          WILAYAS.find((w) => w.key === wilaya)?.en,
          WILAYAS.find((w) => w.key === wilaya)?.ar
        );

  const nights = useMemo(() => countNights(checkIn, checkOut), [checkIn, checkOut]);

  const clearDates = () => {
    setCheckIn('');
    setCheckOut('');
    const params = new URLSearchParams(searchParams);
    params.delete('checkIn');
    params.delete('checkOut');
    setSearchParams(params);
  };

  return (
    <div className="htl-page htl-page--v3">
      <SeoHead
        title={t('seo_hotels_title')}
        description={t('seo_hotels_desc')}
        path={wilaya !== 'all' ? `/hotels?wilaya=${wilaya}` : '/hotels'}
        image="/images/home/hero-coast.jpg"
      />
      <Navbar />

      <section className="htl-hero htl-hero--v3">
        <ResponsiveImage
          className="htl-hero__bg"
          src="/images/home/hero-coast.jpg"
          alt=""
          priority
          sizes="100vw"
        />
        <div className="htl-hero__overlay htl-hero__overlay--v3" />
        <div className="htl-container htl-hero__inner">
          <p className="htl-hero__eyebrow htl-hero__eyebrow--v3">{t('hotels_hero_eyebrow')}</p>
          <h1 className="htl-hero__title htl-hero__title--v3">
            {t('hotels_hero_v2_title_before')}
            <em>{t('hotels_hero_v2_title_em')}</em>
          </h1>
          <p className="htl-hero__subtitle htl-hero__subtitle--v3">{t('hotels_hero_v2_subtitle')}</p>
          <ul className="htl-hero__perks" aria-label={t('hotels_trust_title')}>
            <li>
              <Icon name="ShieldCheck" size={16} />
              {t('hotels_feat_selected')}
            </li>
            <li>
              <Icon name="Zap" size={16} />
              {t('hotels_feat_avail')}
            </li>
            <li>
              <Icon name="Tag" size={16} />
              {t('hotels_feat_price')}
            </li>
          </ul>
        </div>
      </section>

      <div className="htl-container htl-search-wrap">
        <form className="htl-search htl-search--v3" onSubmit={onSearch}>
          <div className="htl-search__inner">
            <div className="htl-search__field">
              <Icon name="MapPin" size={18} />
              <div>
                <span>{t('hotels_search_destination')}</span>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  aria-label={t('hotels_search_destination')}
                >
                  <option value="all">{t('hotels_search_destination_ph')}</option>
                  {WILAYAS.filter((w) => (counts[w.key] || 0) > 0 || w.key === wilaya).map((w) => (
                    <option key={w.key} value={w.key}>
                      {pick(w.fr, w.en, w.ar)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="htl-search__field">
              <Icon name="Calendar" size={18} />
              <div>
                <span>{t('hotels_checkin')}</span>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
            </div>
            <div className="htl-search__field">
              <Icon name="Calendar" size={18} />
              <div>
                <span>{t('hotels_checkout')}</span>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>
            <div className="htl-search__field">
              <Icon name="Users" size={18} />
              <div>
                <span>{t('hotels_search_guests')}</span>
                <select
                  value={`${guests.adults}-${guests.children}`}
                  onChange={(e) => {
                    const [a, c] = e.target.value.split('-').map(Number);
                    setGuests({ adults: a, children: c });
                  }}
                >
                  <option value="1-0">1 {t('hotels_guests_adults')}</option>
                  <option value="2-0">2 {t('hotels_guests_adults')}</option>
                  <option value="2-1">2 {t('hotels_guests_adults')} — 1 {t('hotels_guests_children')}</option>
                  <option value="2-2">2 {t('hotels_guests_adults')} — 2 {t('hotels_guests_children')}</option>
                  <option value="3-0">3 {t('hotels_guests_adults')}</option>
                  <option value="4-0">4 {t('hotels_guests_adults')}</option>
                </select>
              </div>
            </div>
          </div>
          <button type="submit" className="htl-btn htl-btn--search">
            <Icon name="Search" size={18} />
            {t('hotels_search_btn')}
          </button>
        </form>
      </div>

      <HotelsValueBar t={t} />

      <PopularDestinations
        activeWilaya={wilaya === 'all' ? null : wilaya}
        onSelect={setWilaya}
        t={t}
        pick={pick}
      />

      <section className="htl-results htl-results--v3" id="hotels-results">
        {mobileFiltersOpen && (
          <div className="htl-filters-drawer" role="dialog" aria-modal="true" aria-label={t('hotels_filters')}>
            <div className="htl-filters-drawer__backdrop" onClick={() => setMobileFiltersOpen(false)} />
            <div className="htl-filters-drawer__panel">
              <div className="htl-filters-drawer__head">
                <h3>{t('hotels_filters')}</h3>
                <button type="button" className="htl-filters-drawer__close" onClick={() => setMobileFiltersOpen(false)} aria-label="Fermer">
                  <Icon name="X" size={20} />
                </button>
              </div>
              <HotelFiltersPanel
                wilaya={wilaya}
                priceRange={priceRange}
                starFilters={starFilters}
                amenityFilters={amenityFilters}
                starCounts={starCounts}
                onWilayaChange={setWilaya}
                onPriceChange={setPriceRange}
                onStarToggle={toggleStar}
                onAmenityToggle={toggleAmenity}
                onReset={resetFilters}
                t={t}
                pick={pick}
              />
            </div>
          </div>
        )}

        <div className="htl-container">
          <div className="htl-results__layout htl-results__layout--v3">
            <aside className="htl-filters--desktop" aria-label={t('hotels_filters')}>
              <HotelFiltersPanel
                wilaya={wilaya}
                priceRange={priceRange}
                starFilters={starFilters}
                amenityFilters={amenityFilters}
                starCounts={starCounts}
                onWilayaChange={setWilaya}
                onPriceChange={setPriceRange}
                onStarToggle={toggleStar}
                onAmenityToggle={toggleAmenity}
                onReset={resetFilters}
                t={t}
                pick={pick}
              />
            </aside>

            <div className="htl-results__main">
              <header className="htl-section-head htl-section-head--results">
                <div>
                  <p className="htl-section-head__eyebrow">{t('hotels_results_eyebrow')}</p>
                  <h2>{t('hotels_results_title')}</h2>
                </div>
                <button type="button" className="htl-mobile-filters-btn htl-mobile-filters-btn--inline" onClick={() => setMobileFiltersOpen(true)}>
                  <Icon name="SlidersHorizontal" size={16} />
                  {t('hotels_filters')}
                </button>
              </header>

              {checkIn && checkOut && nights > 0 && (
                <div className="htl-search-context">
                  <Icon name="CalendarCheck" size={18} />
                  <span>
                    {nights} {nights > 1 ? t('hotels_nights') : t('hotels_night')} · {guests.adults}{' '}
                    {t('hotels_guests_adults')}
                    {wilaya !== 'all' && wilayaLabel ? ` · ${wilayaLabel}` : ''}
                  </span>
                </div>
              )}

              <HotelFilterChips
                wilaya={wilaya}
                wilayaLabel={wilayaLabel}
                priceRange={priceRange}
                starFilters={starFilters}
                amenityFilters={amenityFilters}
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                t={t}
                onClearWilaya={() => setWilaya('all')}
                onClearStars={(s) => setStarFilters((prev) => prev.filter((n) => n !== s))}
                onClearAmenity={(key) =>
                  setAmenityFilters((prev) => prev.filter((k) => k !== key))
                }
                onClearPrice={() => setPriceRange([PRICE_MIN, PRICE_MAX])}
                onClearDates={clearDates}
                onResetAll={resetFilters}
              />

              <div className="htl-results__toolbar">
                <p className="htl-results__count">
                  <strong>{filtered.length}</strong> {t('hotels_available_label')}
                  {wilaya !== 'all' && wilayaLabel ? ` · ${wilayaLabel}` : ''}
                </p>
                <label className="htl-results__sort">
                  <Icon name="ArrowUpDown" size={16} />
                  <span className="sr-only">{t('hotels_sort_label')}</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t('hotels_sort_label')}>
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {t(o.labelKey)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {loading ? (
                <div className="htl-pop-list htl-pop-list--loading" aria-busy="true" aria-live="polite">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="htl-pop-card htl-pop-card--skeleton">
                      <div className="htl-pop-card__media htl-skeleton" />
                      <div className="htl-pop-card__body">
                        <div className="htl-skeleton htl-skeleton--line htl-skeleton--lg" />
                        <div className="htl-skeleton htl-skeleton--line" />
                        <div className="htl-skeleton htl-skeleton--line htl-skeleton--sm" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="htl-empty-state">
                  <span className="htl-empty-state__icon" aria-hidden="true">
                    <Icon name="Building2" size={32} />
                  </span>
                  <h3>{t('hotels_empty')}</h3>
                  <p>{t('hotels_hero_v2_subtitle')}</p>
                  <button type="button" className="htl-btn htl-btn--primary" onClick={resetFilters}>
                    {t('hotels_filters_reset')}
                  </button>
                </div>
              ) : (
                <div className="htl-pop-list">
                  {filtered.map((hotel) => (
                    <HotelPopularCard
                      key={hotel.id}
                      hotel={hotel}
                      pick={pick}
                      t={t}
                      lang={amenityLang}
                      isFavorite={favorites.has(hotel.id)}
                      onToggleFavorite={toggleFavorite}
                      onOpen={() => openHotel(hotel)}
                      nights={nights}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <HotelsOffersBanner t={t} />
      <Footer />
    </div>
  );
};

export default Hotels;
