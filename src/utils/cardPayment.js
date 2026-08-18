export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export function formatCardNumber(value) {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function detectCardBrand(number) {
  const digits = digitsOnly(number);
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^6/.test(digits)) return 'cib';
  return 'card';
}

export function cardBrandLabel(brand) {
  const labels = {
    visa: 'VISA',
    mastercard: 'MASTERCARD',
    cib: 'CIB',
    card: 'CARD',
  };
  return labels[brand] || 'CARD';
}

export function maskCardNumber(number) {
  const digits = digitsOnly(number);
  if (!digits.length) return '•••• •••• •••• ••••';
  const groups = [];
  for (let i = 0; i < 4; i += 1) {
    const chunk = digits.slice(i * 4, i * 4 + 4);
    if (!chunk) {
      groups.push('••••');
    } else if (chunk.length < 4) {
      groups.push(`${'•'.repeat(4 - chunk.length)}${chunk}`);
    } else {
      groups.push(chunk);
    }
  }
  return groups.join(' ');
}

export function validateCardPayment(card, t) {
  const holder = card.holder?.trim() || '';
  const digits = digitsOnly(card.number);
  const expiry = card.expiry?.trim() || '';
  const cvv = digitsOnly(card.cvv);

  if (holder.length < 3) {
    return t('booking_card_error_holder');
  }
  if (digits.length < 13 || digits.length > 19) {
    return t('booking_card_error_number');
  }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return t('booking_card_error_expiry');
  }
  const [mm, yy] = expiry.split('/').map(Number);
  if (mm < 1 || mm > 12) {
    return t('booking_card_error_expiry');
  }
  const now = new Date();
  const expDate = new Date(2000 + yy, mm, 0, 23, 59, 59);
  if (expDate < now) {
    return t('booking_card_error_expired');
  }
  if (cvv.length < 3 || cvv.length > 4) {
    return t('booking_card_error_cvv');
  }
  return null;
}

export function cardPaymentMeta(card) {
  const digits = digitsOnly(card.number);
  return {
    card_holder: card.holder.trim(),
    card_last4: digits.slice(-4),
    card_brand: detectCardBrand(digits),
    card_expiry: card.expiry.trim(),
  };
}
