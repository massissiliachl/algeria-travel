-- Ouverture des réservations par circuit (ouvertes par défaut)

alter table public.tours
  add column if not exists booking_open boolean not null default true;
