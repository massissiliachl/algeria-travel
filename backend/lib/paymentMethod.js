/** Désactiver temporairement le paiement par carte — remettre à true pour réactiver. */
const CARD_PAYMENT_ENABLED = process.env.CARD_PAYMENT_ENABLED === 'true';

const VALID_PAYMENT_METHODS = new Set(
  ['pre_request', 'transfer', 'paypal', 'cash', ...(CARD_PAYMENT_ENABLED ? ['card'] : [])],
);

const PAYMENT_LABELS = {
  pre_request: 'Demande préalable',
  card: 'Paiement par carte',
  transfer: 'Virement bancaire',
  paypal: 'PayPal',
  cash: 'Espèces à l’arrivée',
};

function isValidPaymentMethod(value) {
  if (!value?.trim()) return false;
  return VALID_PAYMENT_METHODS.has(value.trim().toLowerCase());
}

function normalizePaymentMethod(value) {
  return value?.trim().toLowerCase() || null;
}

function paymentMethodLabel(value) {
  const key = normalizePaymentMethod(value);
  return key ? PAYMENT_LABELS[key] || key : '—';
}

module.exports = {
  CARD_PAYMENT_ENABLED,
  VALID_PAYMENT_METHODS,
  PAYMENT_LABELS,
  isValidPaymentMethod,
  normalizePaymentMethod,
  paymentMethodLabel,
};
