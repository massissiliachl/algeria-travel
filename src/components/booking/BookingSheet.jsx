import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomSheet from '../ui/BottomSheet';
import Icon from '../ui/Icon';
import { useLang } from '../../hooks/useLangHook';
import { api } from '../../services/api';
import { calcBookingTotal } from '../../utils/bookingPrice';
import { PAYMENT_MODES } from '../../utils/paymentMethods';
import { validateCardPayment, cardPaymentMeta } from '../../utils/cardPayment';
import CardPaymentForm from './CardPaymentForm';
import './BookingSheet.css';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  date: '',
  travelers: '2',
  stay: '',
  payment: 'pre_request',
  message: '',
  website: '',
};

const EMPTY_CARD = {
  holder: '',
  number: '',
  expiry: '',
  cvv: '',
};

function BookingField({ icon, label, children, delay = 0, className = '' }) {
  return (
    <div
      className={`booking-field ${className}`.trim()}
      style={{ '--bf-delay': `${delay}ms` }}
    >
      <span className="booking-field__label">
        <span className="booking-field__icon" aria-hidden="true">
          <Icon name={icon} size={15} strokeWidth={1.75} />
        </span>
        {label}
      </span>
      {children}
    </div>
  );
}

export default function BookingSheet({
  open,
  onClose,
  itemType,
  itemId,
  itemName,
  unitPrice,
  pricePerPerson = false,
  stayField = 'none',
  defaultStay = '',
  titleEm,
}) {
  const { t } = useLang();
  const [form, setForm] = useState({ ...EMPTY_FORM, stay: defaultStay });
  const [card, setCard] = useState(EMPTY_CARD);
  const [paidWithCard, setPaidWithCard] = useState(false);
  const [gdpr, setGdpr] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [bookingRef, setBookingRef] = useState(null);
  const [entered, setEntered] = useState(false);
  const [pricePulse, setPricePulse] = useState(false);

  const travelersCount = Number(form.travelers) || 1;
  const totalPrice = useMemo(
    () => calcBookingTotal(unitPrice, travelersCount, pricePerPerson),
    [unitPrice, travelersCount, pricePerPerson]
  );

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, stay: defaultStay });
      setCard(EMPTY_CARD);
      setPaidWithCard(false);
      setGdpr(false);
      setSent(false);
      setFormError('');
      setBookingRef(null);
      setSubmitting(false);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    return undefined;
  }, [open, defaultStay, itemId]);

  useEffect(() => {
    if (!open) return undefined;
    setPricePulse(true);
    const timer = window.setTimeout(() => setPricePulse(false), 420);
    return () => window.clearTimeout(timer);
  }, [totalPrice, open]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setTravelers = (next) => {
    const clamped = Math.min(8, Math.max(1, next));
    setForm((prev) => ({ ...prev, travelers: String(clamped) }));
  };

  const setPaymentMode = (mode) => {
    setForm((prev) => ({ ...prev, payment: mode }));
    if (mode !== 'card') setCard(EMPTY_CARD);
    setFormError('');
  };

  const isCardMode = form.payment === 'card';
  const submitLabel = isCardMode
    ? `${t('booking_submit_card')} · ${totalPrice.toLocaleString()} DA`
    : t('booking_submit_pre_request');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.payment) {
      setFormError(t('booking_payment_required'));
      return;
    }
    if (!gdpr) {
      setFormError(t('booking_gdpr_required'));
      return;
    }

    if (isCardMode) {
      const cardError = validateCardPayment(card, t);
      if (cardError) {
        setFormError(cardError);
        return;
      }
    }

    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        item_type: itemType,
        item_id: itemId,
        item_name: itemName,
        name: form.name,
        email: form.email,
        phone: form.phone,
        travel_date: form.date,
        travelers: travelersCount,
        stay_type: form.stay || null,
        message: form.message,
        unit_price: unitPrice,
        price_per_person: pricePerPerson,
        price_estimate: totalPrice,
        payment_method: form.payment,
        gdpr_consent: true,
        website: form.website,
      };

      if (isCardMode) {
        Object.assign(payload, cardPaymentMeta(card));
      }

      const result = await api.createReservation(payload);
      setPaidWithCard(isCardMode);
      setBookingRef({
        referenceCode: result.referenceCode,
        accessToken: result.accessToken,
      });
      setSent(true);
    } catch (err) {
      setFormError(err.message || t('booking_error_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = titleEm || itemName;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      titleId="booking-sheet-title"
      panelClassName="booking-sheet__panel"
      className={`booking-sheet-modal bottom-sheet ${entered ? 'is-visible' : ''}`}
    >
      <div className={`booking-sheet ${sent ? 'is-success' : 'is-form'}`}>
        {sent ? (
          <div className="booking-sheet__success">
            <div className="booking-sheet__success-ring" aria-hidden="true">
              <div className="booking-sheet__success-icon">
                <Icon name="Check" size={30} strokeWidth={2.5} />
              </div>
            </div>
            <h2>{paidWithCard ? t('booking_card_success_title') : t('place_form_success_title')}</h2>
            <p>{paidWithCard ? t('booking_card_success_text') : t('place_form_success_text')}</p>
            {bookingRef && (
              <div className="booking-sheet__ref">
                <p>
                  <strong>{t('place_form_ref_label')}</strong>
                  <code>{bookingRef.referenceCode}</code>
                </p>
                <p className="booking-sheet__ref-hint">{t('place_form_ref_hint')}</p>
                <details>
                  <summary>{t('place_form_token_toggle')}</summary>
                  <code className="booking-sheet__token">{bookingRef.accessToken}</code>
                </details>
                <Link
                  to={`/suivi?ref=${encodeURIComponent(bookingRef.referenceCode)}`}
                  className="booking-sheet__track-link"
                >
                  {t('place_form_track_link')}
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </div>
            )}
            <button type="button" className="booking-sheet__close-btn" onClick={onClose}>
              {t('place_form_close')}
            </button>
          </div>
        ) : (
          <>
            <header className="booking-sheet__hero">
              <div className="booking-sheet__hero-glow" aria-hidden="true" />
              <span className="booking-sheet__eyebrow">
                <Icon name="Sparkles" size={13} />
                {t('place_form_eyebrow')}
              </span>
              <h2 id="booking-sheet-title">
                {t('place_form_title')} <em>{displayName}</em>
              </h2>
              <p className="booking-sheet__lead">{t('place_form_lead')}</p>
            </header>

            <div
              className={`booking-sheet__price ${pricePulse ? 'is-pulse' : ''}`}
              aria-live="polite"
            >
              <div className="booking-sheet__price-left">
                <span>{t('booking_total_label')}</span>
                {pricePerPerson && (
                  <em>
                    {unitPrice.toLocaleString()} DA × {travelersCount}{' '}
                    {t('booking_travelers_short')}
                  </em>
                )}
              </div>
              <strong key={totalPrice} className="booking-sheet__price-value">
                {totalPrice.toLocaleString()}
                <small>DA</small>
              </strong>
            </div>

            <section
              className="booking-pay-mode"
              style={{ '--bf-delay': '180ms' }}
              aria-labelledby="booking-pay-mode-title"
            >
              <div className="booking-pay-mode__head">
                <h3 id="booking-pay-mode-title">{t('booking_pay_mode_title')}</h3>
                <p>{t('booking_pay_mode_lead')}</p>
              </div>

              <div className="booking-pay-mode__grid" role="radiogroup" aria-label={t('booking_pay_mode_title')}>
                {PAYMENT_MODES.map((mode) => {
                  const selected = form.payment === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`booking-pay-mode__card booking-pay-mode__card--${mode.accent} ${selected ? 'is-selected' : ''}`}
                      onClick={() => setPaymentMode(mode.id)}
                    >
                      <span className="booking-pay-mode__glow" aria-hidden="true" />
                      <span className="booking-pay-mode__icon-wrap" aria-hidden="true">
                        <Icon name={mode.icon} size={26} strokeWidth={1.6} />
                      </span>
                      <span className="booking-pay-mode__content">
                        <strong>{t(`booking_pay_${mode.id}`)}</strong>
                        <span>{t(`booking_pay_${mode.id}_desc`)}</span>
                        <em className="booking-pay-mode__badge">{t(`booking_pay_${mode.id}_badge`)}</em>
                      </span>
                      <span className="booking-pay-mode__tick" aria-hidden="true">
                        {selected && <Icon name="Check" size={14} strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <form className="booking-sheet__form" onSubmit={onSubmit}>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={onChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="booking-sheet__honeypot"
              />

              {formError && (
                <p className="booking-sheet__error" role="alert">
                  <Icon name="AlertCircle" size={16} />
                  {formError}
                </p>
              )}

              <div className="booking-sheet__grid booking-sheet__grid--2">
                <BookingField icon="User" label={`${t('place_form_name')} *`} delay={40}>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    placeholder={t('place_form_name_ph')}
                    className="booking-input"
                  />
                </BookingField>
                <BookingField icon="Mail" label={`${t('place_form_email')} *`} delay={80}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    required
                    placeholder={t('place_form_email_ph')}
                    className="booking-input"
                  />
                </BookingField>
              </div>

              <div className="booking-sheet__grid booking-sheet__grid--2">
                <BookingField icon="Phone" label={`${t('place_form_phone')} *`} delay={120}>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    required
                    placeholder={t('place_form_phone_ph')}
                    className="booking-input"
                  />
                </BookingField>
                <BookingField icon="Calendar" label={`${t('place_form_date')} *`} delay={160}>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={onChange}
                    required
                    className="booking-input"
                  />
                </BookingField>
              </div>

              <div className="booking-sheet__grid booking-sheet__grid--2">
                <BookingField icon="Users" label={t('place_form_travelers')} delay={200}>
                  <div className="booking-stepper">
                    <button
                      type="button"
                      className="booking-stepper__btn"
                      onClick={() => setTravelers(travelersCount - 1)}
                      disabled={travelersCount <= 1}
                      aria-label="-"
                    >
                      <Icon name="Minus" size={16} />
                    </button>
                    <span key={travelersCount} className="booking-stepper__value">
                      {travelersCount}
                    </span>
                    <button
                      type="button"
                      className="booking-stepper__btn"
                      onClick={() => setTravelers(travelersCount + 1)}
                      disabled={travelersCount >= 8}
                      aria-label="+"
                    >
                      <Icon name="Plus" size={16} />
                    </button>
                  </div>
                </BookingField>

                {stayField !== 'none' && (
                  <BookingField icon="Hotel" label={t('place_form_stay')} delay={240}>
                    <select
                      name="stay"
                      value={form.stay}
                      onChange={onChange}
                      className="booking-input"
                    >
                      {stayField === 'full' && (
                        <option value="">{t('place_form_stay_ph')}</option>
                      )}
                      <option value="hotel">{t('place_form_stay_hotel')}</option>
                      {stayField === 'full' && (
                        <>
                          <option value="guesthouse">{t('place_form_stay_guest')}</option>
                          <option value="camp">{t('place_form_stay_camp')}</option>
                        </>
                      )}
                    </select>
                  </BookingField>
                )}
              </div>

              <BookingField icon="MessageSquare" label={t('place_form_message')} delay={300}>
                <textarea
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={onChange}
                  placeholder={t('place_form_message_ph')}
                  className="booking-input booking-input--area"
                />
              </BookingField>

              {isCardMode && (
                <CardPaymentForm
                  card={card}
                  onChange={setCard}
                  t={t}
                  totalPrice={totalPrice}
                />
              )}

              <label className="booking-sheet__gdpr" style={{ '--bf-delay': '340ms' }}>
                <input
                  type="checkbox"
                  checked={gdpr}
                  onChange={(e) => setGdpr(e.target.checked)}
                  required
                />
                <span className="booking-sheet__gdpr-box" aria-hidden="true">
                  {gdpr && <Icon name="Check" size={12} strokeWidth={3} />}
                </span>
                <span>
                  {t('booking_gdpr_prefix')}{' '}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                    {t('footer_privacy')}
                  </Link>
                  . *
                </span>
              </label>

              <button
                type="submit"
                className={`booking-sheet__submit ${submitting ? 'is-loading' : ''} ${isCardMode ? 'is-card' : ''}`}
                disabled={submitting}
                style={{ '--bf-delay': '380ms' }}
              >
                <span className="booking-sheet__submit-shine" aria-hidden="true" />
                {submitting ? (
                  <>
                    <span className="booking-sheet__spinner" aria-hidden="true" />
                    {t('place_form_sending')}
                  </>
                ) : (
                  <>
                    {submitLabel}
                    <Icon name={isCardMode ? 'CreditCard' : 'Send'} size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
