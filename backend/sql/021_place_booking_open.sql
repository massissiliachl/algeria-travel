-- Ouverture des réservations par destination (Taghit seule ouverte par défaut)

alter table public.places
  add column if not exists booking_open boolean not null default false;

update public.places
set booking_open = (id = 'taghit');
