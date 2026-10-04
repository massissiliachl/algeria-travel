-- Comptes partenaires hôtel (email + mot de passe)

create table if not exists public.hotel_users (
  id            uuid primary key default gen_random_uuid(),
  hotel_id      text not null references public.stays(id) on delete cascade,
  email         text unique not null,
  password_hash text not null,
  active        boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create unique index if not exists idx_hotel_users_hotel_id on public.hotel_users(hotel_id);
create index if not exists idx_hotel_users_email on public.hotel_users(email);
