import React from 'react';
import Icon from '../ui/Icon';
import {
  cardBrandLabel,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  maskCardNumber,
} from '../../utils/cardPayment';

export default function CardPaymentForm({ card, onChange, t, totalPrice }) {
  const brand = detectCardBrand(card.number);
  const brandLabel = cardBrandLabel(brand);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'number') next = formatCardNumber(value);
    if (name === 'expiry') next = formatExpiry(value);
    if (name === 'cvv') next = value.replace(/\D/g, '').slice(0, 4);
    onChange({ ...card, [name]: next });
  };

  return (
    <section className="booking-card-checkout" aria-labelledby="booking-card-checkout-title">
      <div className="booking-card-checkout__head">
        <span className="booking-card-checkout__step">2</span>
        <div>
          <h4 id="booking-card-checkout-title">{t('booking_card_form_title')}</h4>
          <p>{t('booking_card_form_lead')}</p>
        </div>
      </div>

      <div className="booking-card-checkout__layout">
        <div className="booking-pay-card-visual booking-pay-card-visual--live" aria-hidden="true">
          <div className="booking-pay-card-visual__chip" />
          <div className="booking-pay-card-visual__holder">
            {(card.holder || t('booking_card_holder_ph')).toUpperCase()}
          </div>
          <div className="booking-pay-card-visual__number">{maskCardNumber(card.number)}</div>
          <div className="booking-pay-card-visual__row">
            <span>{card.expiry || 'MM/AA'}</span>
            <span className="booking-pay-card-visual__brand">{brandLabel}</span>
          </div>
          <div className="booking-pay-card-visual__shine" />
        </div>

        <div className="booking-card-form">
          <div className="booking-card-form__amount">
            <span>{t('booking_card_amount_label')}</span>
            <strong>{totalPrice.toLocaleString()} DA</strong>
          </div>

          <label className="booking-card-form__field">
            <span>{t('booking_card_holder')} *</span>
            <input
              name="holder"
              value={card.holder}
              onChange={handleChange}
              placeholder={t('booking_card_holder_ph')}
              autoComplete="cc-name"
              required
              className="booking-input"
            />
          </label>

          <label className="booking-card-form__field">
            <span>{t('booking_card_number')} *</span>
            <input
              name="number"
              value={card.number}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              autoComplete="cc-number"
              required
              className="booking-input booking-input--mono"
            />
          </label>

          <div className="booking-card-form__row">
            <label className="booking-card-form__field">
              <span>{t('booking_card_expiry')} *</span>
              <input
                name="expiry"
                value={card.expiry}
                onChange={handleChange}
                placeholder="MM/AA"
                inputMode="numeric"
                autoComplete="cc-exp"
                required
                className="booking-input booking-input--mono"
              />
            </label>
            <label className="booking-card-form__field">
              <span>{t('booking_card_cvv')} *</span>
              <input
                name="cvv"
                value={card.cvv}
                onChange={handleChange}
                placeholder="•••"
                inputMode="numeric"
                autoComplete="cc-csc"
                required
                className="booking-input booking-input--mono"
              />
            </label>
          </div>

          <div className="booking-card-form__brands" aria-hidden="true">
            <span>VISA</span>
            <span>MC</span>
            <span>CIB</span>
            <span>Edahabia</span>
          </div>

          <p className="booking-card-form__secure">
            <Icon name="ShieldCheck" size={16} />
            {t('booking_card_secure_note')}
          </p>
        </div>
      </div>
    </section>
  );
}
