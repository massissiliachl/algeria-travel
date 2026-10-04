-- Algeria Travel — demandes de réservation (circuits / destinations)
-- Exécuter dans Supabase → SQL Editor, ou : npm run migrate

create extension if not exists "pgcrypto";

create table if not exists public.reservations (
  id              uuid primary key default gen_random_uuid(),

  -- Circuit / destination réservé
  item_type       text not null default 'place'
                  check (item_type in ('place', 'tour', 'activity', 'stay')),
  item_id         text not null,
  item_name       text not null,

  -- Coordonnées client
  client_name     text not null,
  client_email    text not null,
  client_phone    text,

  -- Détails du séjour
  travel_date     date not null,
  travelers       integer not null default 1 check (travelers > 0 and travelers <= 20),
  stay_type       text check (stay_type is null or stay_type in ('hotel', 'guesthouse', 'camp')),
  message         text,
  price_estimate  integer,

  -- Suivi admin
  status          text not null default 'pending'
                  check (status in ('pending', 'reviewed', 'confirmed', 'rejected', 'cancelled')),
  admin_notes     text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_reservations_status on public.reservations (status);
create index if not exists idx_reservations_created_at on public.reservations (created_at desc);
create index if not exists idx_reservations_item on public.reservations (item_type, item_id);

create or replace function public.set_reservations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reservations_updated_at on public.reservations;
create trigger trg_reservations_updated_at
  before update on public.reservations
  for each row execute function public.set_reservations_updated_at();
