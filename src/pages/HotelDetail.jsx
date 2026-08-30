import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import MobileBookingBar from '../components/ui/MobileBookingBar';
import ImageLightbox from '../components/ui/ImageLightbox';
import SeoHead from '../components/SeoHead';
import BookingSheet from '../components/booking/BookingSheet';
import { useLang } from '../hooks/useLangHook';
import { getHotelById, HOTELS } from '../data/hotels';
import { getWilayaByKey } from '../data/wilayas';
import { api } from '../services/api';
import { normalizeHotel } from '../utils/normalizeHotel';
import HotelAvailabilityCalendar from '../components/hotels/HotelAvailabilityCalendar';
import HotelGalleryGrid from '../components/hotels/HotelGalleryGrid';
import HotelBookingWidget from '../components/hotels/HotelBookingWidget';
import HotelScoreBadge from '../components/hotels/HotelScoreBadge';
import {
  buildFallbackAvailability,
  calcStayTotal,
  countNights,
  isRangeAvailable,
} from '../utils/hotelAvailability';
import { getReviewDistribution } from '../utils/hotelRating';
import '../components/hotels/HotelAvailabilityCalendar.css';
import './Hotels.css';

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem('hotel_favorites') || '[]'));
  } catch {
    return new Set();
  }
}

const Stars = ({ count }) => (
  <span className="htl-detail__stars" aria-label={`${count} stars`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={15}
        strokeWidth={1.5}
        className={i < count ? 'htl-star-on' : 'htl-detail__star-off'}
      />
    ))}
  </span>
);

const HotelDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, pick } = useLang();
  const [hotel, setHotel] = useState(null);
  const [allHotels, setAllHotels] = useState(HOTELS);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [rooms, setRooms] = useState(Math.max(1, Number(searchParams.get('rooms')) || 1));
  const [isFavorite, setIsFavorite] = useState(() => loadFavorites().has(id));

  useEffect(() => {
    setIsFavorite(loadFavorites().has(id));
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const row = await api.getHotel(id);
        if (!cancelled) {
          setHotel(normalizeHotel(row));
          return;
        }
      } catch {
        /* fallback statique */
      }

      const found = getHotelById(id);
      if (!found) {
        navigate('/hotels');
        return;
      }
      if (!cancelled) setHotel(found);
    };

    load();
    window.scrollTo(0, 0);

    api
      .getHotels()
      .then((rows) => {
        if (!cancelled) {
          const normalized = rows.map(normalizeHotel).filter(Boolean);
          if (normalized.length) setAllHotels(normalized);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  useEffect(() => {
    if (!hotel) return undefined;
    let cancelled = false;
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    const to = end.toISOString().slice(0, 10);

    api
      .getHotelAvailability(hotel.id, { from: today, to })
      .then((data) => {
        if (!cancelled && data?.days?.length) setAvailabilityDays(data.days);
      })
      .catch(() => {
        if (!cancelled) {
          setAvailabilityDays(buildFallbackAvailability(hotel, today, to).days);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hotel]);

  const nights = useMemo(() => countNights(checkIn, checkOut), [checkIn, checkOut]);
  const stayTotal = useMemo(
    () => calcStayTotal(availabilityDays, checkIn, checkOut, rooms),
    [availabilityDays, checkIn, checkOut, rooms]
  );
  const rangeOk = useMemo(
    () => isRangeAvailable(availabilityDays, checkIn, checkOut, rooms),
    [availabilityDays, checkIn, checkOut, rooms]
  );
  const reviewBars = useMemo(
    () => (hotel ? getReviewDistribution(hotel.rating) : []),
    [hotel]
  );

  const onSelectRange = ({ checkIn: inDate, checkOut: outDate }) => {
    setCheckIn(inDate || '');
    setCheckOut(outDate || '');
  };

  const toggleFavorite = () => {
    const favs = loadFavorites();
    if (favs.has(hotel?.id)) favs.delete(hotel.id);
    else favs.add(hotel.id);
    localStorage.setItem('hotel_favorites', JSON.stringify([...favs]));
    setIsFavorite(favs.has(hotel?.id));
  };

  const openBooking = () => {
    if (hotel?.availability === 'unavailable') return;
    if (checkIn && checkOut && !rangeOk) return;
    setBookingOpen(true);
  };

  if (!hotel) {
    return (
      <div className="htl-page">
        <Navbar />
        <div className="hotels-loading">{t('loader_text') || '…'}</div>
        <Footer />
      </div>
    );
  }

  const gallery = hotel.gallery?.length ? hotel.gallery : [hotel.image];
  const wilaya = getWilayaByKey(hotel.wilayaKey);
  const hotelName = pick(hotel.name, hotel.name_en, hotel.name_ar);
  const mapQuery = encodeURIComponent(
    `${pick(hotel.address, hotel.address_en, hotel.address_ar)}, Algeria`
  );
  const related = allHotels.filter((h) => h.wilayaKey === hotel.wilayaKey && h.id !== hotel.id).slice(0, 3);
  const amenityList = pick(hotel.amenities.fr, hotel.amenities.en, hotel.amenities.ar) || [];
  const hasDates = checkIn && checkOut && nights > 0 && rangeOk && stayTotal;

  const whatsapp = () => {
    const msg = encodeURIComponent(
      `Bonjour, je souhaite réserver : ${hotelName} (${pick(hotel.location, hotel.location_en, hotel.location_ar)})`
    );
    window.open(`https://wa.me/213557664089?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const shareHotel = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: hotelName, url });
      } catch {
        /* cancelled */
      }
      return;
    }
    await navigator.clipboard?.writeText(url);
  };

  return (
    <div className="htl-page hotel-detail-page">
      <SeoHead
        title={hotelName}
        description={pick(hotel.desc, hotel.desc_en, hotel.desc_ar)}
        path={`/hotels/${hotel.id}`}
        image={hotel.image}
      />
      <Navbar />

      <div className="htl-container htl-detail">
        <nav className="htl-detail__crumb" aria-label="Breadcrumb">
          <Link to="/">{t('nav_home')}</Link>
          <Icon name="ChevronRight" size={14} />
          <Link to="/hotels">{t('hotels_nav')}</Link>
          {wilaya && (
            <>
              <Icon name="ChevronRight" size={14} />
              <Link to={`/hotels?wilaya=${wilaya.key}`}>{pick(wilaya.fr, wilaya.en, wilaya.ar)}</Link>
            </>
          )}
        </nav>

        <header className="htl-detail__header">
          <div className="htl-detail__header-main">
            <div className="htl-detail__title-row">
              <h1>{hotelName}</h1>
              <div className="htl-detail__actions">
                <button type="button" className="htl-detail__action" onClick={toggleFavorite} aria-label="Favori">
                  <Icon name="Heart" size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button type="button" className="htl-detail__action" onClick={shareHotel} aria-label="Partager">
                  <Icon name="Share2" size={20} />
                </button>
              </div>
            </div>
            <Stars count={hotel.stars} />
            <p className="htl-detail__loc">
              <Icon name="MapPin" size={16} />
              {pick(hotel.address, hotel.address_en, hotel.address_ar)}
              <button type="button" className="htl-link" onClick={() => document.getElementById('htl-map')?.scrollIntoView({ behavior: 'smooth' })}>
                {t('hotels_show_on_map')}
              </button>
            </p>
          </div>
          <HotelScoreBadge rating={hotel.rating} reviews={hotel.reviews} t={t} size="lg" />
        </header>

        <HotelGalleryGrid
          images={gallery}
          hotelName={hotelName}
          onOpen={(i) => setLightboxIndex(i)}
          t={t}
        />

        <div className="htl-detail__body">
          <main className="htl-detail__main">
            {amenityList.length > 0 && (
              <section className="htl-detail__highlights">
                {amenityList.slice(0, 6).map((a) => (
                  <span key={a}>
                    <Icon name="Check" size={14} /> {a}
                  </span>
                ))}
              </section>
            )}

            <section className="htl-detail__section">
              <h2>{t('hotels_about')}</h2>
              <p>{pick(hotel.desc, hotel.desc_en, hotel.desc_ar)}</p>
            </section>

            <section className="htl-detail__section">
              <h2>{t('hotels_reviews_title')}</h2>
              <div className="htl-detail__reviews">
                <HotelScoreBadge rating={hotel.rating} reviews={hotel.reviews} t={t} size="lg" />
                <div className="htl-detail__reviews-bars">
                  {reviewBars.map(({ star, pct }) => (
                    <div key={star} className="htl-detail__review-bar">
                      <span>{star}</span>
                      <div className="htl-detail__review-track">
                        <div className="htl-detail__review-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="htl-detail__section">
              <h2>{t('stays_amenities')}</h2>
              <ul className="htl-detail__amenities">
                {amenityList.map((a) => (
                  <li key={a}>
                    <Icon name="Check" size={14} /> {a}
                  </li>
                ))}
              </ul>
            </section>

            <section className="htl-detail__section">
              <h2>{t('hotels_planning_title')}</h2>
              <p className="htl-detail__lead">{t('hotels_planning_lead')}</p>
              <HotelAvailabilityCalendar
                days={availabilityDays}
                checkIn={checkIn}
                checkOut={checkOut}
                rooms={rooms}
                onSelectRange={onSelectRange}
                t={t}
              />
            </section>

            <section className="htl-detail__section" id="htl-map">
              <h2>{t('hotels_location')}</h2>
              <p className="htl-detail__address">
                <Icon name="MapPin" size={16} />
                {pick(hotel.address, hotel.address_en, hotel.address_ar)}
              </p>
              {hotel.phone && (
                <p className="htl-detail__phone">
                  <Icon name="Phone" size={16} />
                  <a href={`tel:${hotel.phone.replace(/\s/g, '')}`}>{hotel.phone}</a>
                </p>
              )}
              <div className="htl-detail__map">
                <iframe
                  title={hotelName}
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </section>

            {related.length > 0 && (
              <section className="htl-detail__section htl-detail__related">
                <h2>{t('hotels_related')}</h2>
                <div className="htl-detail__related-grid">
                  {related.map((h) => (
                    <Link key={h.id} to={`/hotels/${h.id}`} className="htl-detail__related-card">
                      <img src={h.image} alt="" loading="lazy" />
                      <div>
                        <h3>{pick(h.name, h.name_en, h.name_ar)}</h3>
                        <HotelScoreBadge rating={h.rating} reviews={null} t={t} size="sm" showLabel={false} />
                        <span>
                          {t('acts_from')} {h.price.toLocaleString()} DA
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="htl-detail__sidebar">
            <HotelBookingWidget
              hotel={hotel}
              t={t}
              checkIn={checkIn}
              checkOut={checkOut}
              rooms={rooms}
              onCheckInChange={(v) => {
                setCheckIn(v);
                setCheckOut('');
              }}
              onCheckOutChange={setCheckOut}
              onRoomsChange={setRooms}
              nights={nights}
              stayTotal={stayTotal}
              rangeOk={rangeOk}
              onBook={openBooking}
              onWhatsapp={whatsapp}
            />
          </aside>
        </div>
      </div>

      <MobileBookingBar
        priceLabel={hasDates ? t('hotels_total_stay') : t('acts_from')}
        price={hasDates ? `${stayTotal.toLocaleString()} DA` : `${hotel.price.toLocaleString()} DA`}
        ctaLabel={t('stays_book_online')}
        ctaIcon="Send"
        onCta={openBooking}
        className="hotel-detail-mobile-bar"
      />

      <BookingSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        itemType="stay"
        itemId={hotel.id}
        itemName={hotelName}
        unitPrice={hotel.price}
        pricePerPerson={false}
        defaultStay="hotel"
        titleEm={hotelName}
        bookingMode="hotel"
        defaultCheckIn={checkIn}
        defaultCheckOut={checkOut}
        defaultRooms={rooms}
        stayTotalPrice={stayTotal}
      />

      {lightboxIndex != null && (
        <ImageLightbox
          images={gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default HotelDetail;
