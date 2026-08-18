-- Métadonnées carte (jamais le numéro complet ni le CVV)

alter table public.reservations
  add column if not exists card_holder text,
  add column if not exists card_last4 text,
  add column if not exists card_brand text,
  add column if not exists card_expiry text;
