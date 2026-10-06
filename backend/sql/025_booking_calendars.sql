-- Calendrier de réservation par destination (et par formule : clé « taghit:brezina »).
--   mode 'open'  : toute date future, sauf les périodes bloquées
--   mode 'fixed' : uniquement les séjours listés dans periods (le client choisit un départ)
-- periods / blocked : [{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD", "label": "…" }]

create table if not exists public.booking_calendars (
  key text primary key,
  mode text not null default 'open' check (mode in ('open', 'fixed')),
  periods jsonb not null default '[]'::jsonb,
  blocked jsonb not null default '[]'::jsonb,
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table public.booking_calendars enable row level security;

insert into public.booking_calendars (key, mode, periods, updated_by)
values (
  'taghit:brezina',
  'fixed',
  '[{"start": "2026-11-16", "end": "2026-11-21", "label": "Séjour Taghit via Brezina"}]'::jsonb,
  'migration'
)
on conflict (key) do nothing;

alter table public.reservations add column if not exists item_pkg text;
