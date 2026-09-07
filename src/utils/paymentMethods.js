/** Désactiver temporairement le paiement par carte — remettre à true pour réactiver. */
export const CARD_PAYMENT_ENABLED = false;

const ALL_PAYMENT_MODES = [
  {
    id: 'pre_request',
    icon: 'Headphones',
    accent: 'sand',
  },
  {
    id: 'card',
    icon: 'CreditCard',
    accent: 'dark',
  },
];

export const PAYMENT_MODES = ALL_PAYMENT_MODES.filter(
  (mode) => mode.id !== 'card' || CARD_PAYMENT_ENABLED,
);
