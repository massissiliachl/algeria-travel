import React from 'react';
import Icon from '../ui/Icon';

const AVAIL_KEYS = {
  available: 'hotels_avail_available',
  limited: 'hotels_avail_limited',
  unavailable: 'hotels_avail_unavailable',
};

const HotelBookingWidget = ({
  hotel,
  t,
  checkIn,
  checkOut,
  rooms,
  onCheckInChange,
  onCheckOutChange,
  onRoomsChange,
  nights,
  stayTotal,
  rangeOk,
  onBook,
  onWhatsapp,
}) => {
  const availKey = AVAIL_KEYS[hotel.availability] || AVAIL_KEYS.available;
  const hasDates = checkIn && checkOut && nights > 0;
  const canBook =
    hotel.availability !== 'unavailable' && (!hasDates || rangeOk);

  return (
    <div className="htl-book-widget">
      <div className="htl-book-widget__price">
        {hotel.oldPrice && (
          <s className="htl-book-widget__old">{hotel.oldPrice.toLocaleString()} DA</s>
        )}
        {hasDates && rangeOk && stayTotal ? (
          <>
            <strong>{stayTotal.toLocaleString()} DA</strong>
            <span>
              {nights} {nights > 1 ? t('hotels_nights') : t('hotels_night')} · {rooms}{' '}
              {rooms > 1 ? t('hotels_rooms_plural') : t('hotels_rooms_single')}
            </span>
          </>
        ) : (
          <>
            <strong>{hotel.price.toLocaleString()} DA</strong>
            <span>{t('hotels_per_night')}</span>
          </>
        )}
      </div>

      <div className={`htl-book-widget__status hotels-avail hotels-avail--${hotel.availability}`}>
        {t(availKey)}
        {hotel.roomsAvailable > 0 && hotel.availability !== 'unavailable' && (
          <small>
            · {hotel.roomsAvailable} {t('hotels_rooms_left')}
          </small>
        )}
      </div>

      <div className="htl-book-widget__form">
        <div className="htl-book-widget__dates">
          <label>
            <span>{t('hotels_checkin')}</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => onCheckInChange(e.target.value)}
            />
          </label>
          <label>
            <span>{t('hotels_checkout')}</span>
            <input
              type="date"
              value={checkOut}
              min={checkIn || undefined}
              onChange={(e) => onCheckOutChange(e.target.value)}
            />
          </label>
        </div>
        <label className="htl-book-widget__rooms">
          <span>{t('hotels_rooms_label')}</span>
          <select value={rooms} onChange={(e) => onRoomsChange(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n > 1 ? t('hotels_rooms_plural') : t('hotels_rooms_single')}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasDates && !rangeOk && (
        <p className="htl-book-widget__warn">{t('hotels_planning_unavailable')}</p>
      )}

      <ul className="htl-book-widget__perks">
        <li>
          <Icon name="ShieldCheck" size={15} /> {t('hotels_perk_secure')}
        </li>
        <li>
          <Icon name="BadgeCheck" size={15} /> {t('hotels_perk_verified')}
        </li>
      </ul>

      <button
        type="button"
        className="htl-btn htl-btn--gold htl-book-widget__cta"
        onClick={onBook}
        disabled={!canBook}
      >
        {t('stays_book_online')}
      </button>
      <button type="button" className="htl-btn htl-book-widget__wa" onClick={onWhatsapp}>
        <Icon name="MessageCircle" size={16} /> {t('stays_book_wa')}
      </button>

      <dl className="htl-book-widget__times">
        <div>
          <dt>{t('hotels_checkin')}</dt>
          <dd>{hotel.checkIn}</dd>
        </div>
        <div>
          <dt>{t('hotels_checkout')}</dt>
          <dd>{hotel.checkOut}</dd>
        </div>
      </dl>
    </div>
  );
};

export default HotelBookingWidget;
