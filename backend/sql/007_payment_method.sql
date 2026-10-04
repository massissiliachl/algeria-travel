-- Moyen de paiement sur les réservations

alter table public.reservations
  add column if not exists payment_method text
  check (payment_method is null or payment_method in ('card', 'transfer', 'paypal', 'cash'));
