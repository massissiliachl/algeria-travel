-- Deux modes de réservation : demande préalable ou paiement carte

alter table public.reservations
  drop constraint if exists reservations_payment_method_check;

alter table public.reservations
  add constraint reservations_payment_method_check
  check (
    payment_method is null
    or payment_method in ('pre_request', 'card', 'transfer', 'paypal', 'cash')
  );
