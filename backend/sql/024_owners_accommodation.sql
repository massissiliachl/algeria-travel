-- Propriétaires, biens (table stays étendue), photos, équipements, types de chambre,
-- tarifs, tarifs saisonniers, disponibilités par type de chambre, journal d'audit.

create extension if not exists "pgcrypto";

-- ─── Propriétaires ──────────────────────────────────────────────────────────
create table if not exists public.owners (
  id            uuid primary key default gen_random_uuid(),
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  phone         text not null,
  whatsapp      text,
  address       text,
  password_hash text not null,
  status        text not null default 'active' check (status in ('active', 'inactive')),
  last_login    timestamptz,
  deleted_at    timestamptz,
  created_by    text,
  updated_by    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists idx_owners_email on public.owners (lower(email));
create index if not exists idx_owners_status on public.owners (status) where deleted_at is null;

-- ─── Biens : extension de stays ─────────────────────────────────────────────
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.stays'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%type%' and pg_get_constraintdef(oid) ilike '%guesthouse%'
  loop
    execute format('alter table public.stays drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.stays
  add constraint stays_type_check
  check (type in ('hotel', 'guesthouse', 'apartment', 'villa', 'residence', 'other'));

alter table public.stays
  add column if not exists owner_id uuid references public.owners(id) on delete set null,
  add column if not exists slug text,
  add column if not exists short_desc text,
  add column if not exists city text,
  add column if not exists email text,
  add column if not exists status text not null default 'active',
  add column if not exists featured boolean not null default false,
  add column if not exists max_guests smallint,
  add column if not exists bedrooms smallint,
  add column if not exists beds smallint,
  add column if not exists deleted_at timestamptz,
  add column if not exists created_by text,
  add column if not exists updated_by text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stays_status_check') then
    alter table public.stays add constraint stays_status_check check (status in ('active', 'inactive', 'pending'));
  end if;
end $$;

update public.stays set status = case when published = false then 'inactive' else 'active' end
where status = 'active' and published = false;

create unique index if not exists idx_stays_slug on public.stays (slug) where slug is not null;
create index if not exists idx_stays_owner on public.stays (owner_id) where deleted_at is null;

-- ─── Photos ─────────────────────────────────────────────────────────────────
create table if not exists public.property_images (
  id          uuid primary key default gen_random_uuid(),
  property_id text not null references public.stays(id) on delete cascade,
  url         text not null,
  alt         text,
  is_primary  boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_property_images_property on public.property_images (property_id, sort_order);

-- ─── Équipements ────────────────────────────────────────────────────────────
create table if not exists public.amenities (
  id       serial primary key,
  code     text unique not null,
  label    text not null,
  label_en text,
  label_ar text,
  scope    text not null default 'property' check (scope in ('property', 'room', 'both'))
);

create table if not exists public.property_amenities (
  property_id text not null references public.stays(id) on delete cascade,
  amenity_id  integer not null references public.amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

insert into public.amenities (code, label, label_en, label_ar, scope) values
  ('wifi', 'Wi-Fi', 'Wi-Fi', 'واي فاي', 'both'),
  ('parking', 'Parking', 'Parking', 'موقف سيارات', 'property'),
  ('ac', 'Climatisation', 'Air conditioning', 'تكييف', 'both'),
  ('pool', 'Piscine', 'Swimming pool', 'مسبح', 'property'),
  ('restaurant', 'Restaurant', 'Restaurant', 'مطعم', 'property'),
  ('reception24', 'Réception 24h', '24h reception', 'استقبال 24 ساعة', 'property'),
  ('elevator', 'Ascenseur', 'Elevator', 'مصعد', 'property'),
  ('sea_view', 'Vue mer', 'Sea view', 'إطلالة على البحر', 'both'),
  ('terrace', 'Terrasse', 'Terrace', 'شرفة', 'both'),
  ('heating', 'Chauffage', 'Heating', 'تدفئة', 'both'),
  ('tv', 'TV', 'TV', 'تلفاز', 'room'),
  ('kitchen', 'Cuisine', 'Kitchen', 'مطبخ', 'both'),
  ('washer', 'Machine à laver', 'Washing machine', 'غسالة', 'both'),
  ('breakfast', 'Petit-déjeuner', 'Breakfast', 'فطور', 'property'),
  ('airport_shuttle', 'Navette aéroport', 'Airport shuttle', 'نقل المطار', 'property')
on conflict (code) do nothing;

-- ─── Types de chambre / unités ──────────────────────────────────────────────
create table if not exists public.room_types (
  id                uuid primary key default gen_random_uuid(),
  property_id       text not null references public.stays(id) on delete cascade,
  name              text not null,
  description       text,
  capacity_adults   smallint not null default 2 check (capacity_adults > 0),
  capacity_children smallint not null default 0 check (capacity_children >= 0),
  total_rooms       integer not null default 1 check (total_rooms >= 0),
  beds              smallint check (beds is null or beds >= 0),
  bed_type          text,
  size_m2           numeric(7, 2) check (size_m2 is null or size_m2 >= 0),
  view              text,
  amenities         jsonb not null default '[]'::jsonb,
  base_price        integer not null default 0 check (base_price >= 0),
  status            text not null default 'active' check (status in ('active', 'inactive')),
  sort_order        integer not null default 0,
  deleted_at        timestamptz,
  created_by        text,
  updated_by        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_room_types_property on public.room_types (property_id) where deleted_at is null;

-- ─── Tarifs ─────────────────────────────────────────────────────────────────
create table if not exists public.rate_plans (
  id                  uuid primary key default gen_random_uuid(),
  room_type_id        uuid not null references public.room_types(id) on delete cascade,
  name                text not null,
  description         text,
  price               integer not null check (price >= 0),
  currency            text not null default 'DZD',
  meal_plan           text not null default 'ROOM_ONLY'
                      check (meal_plan in ('ROOM_ONLY', 'BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE')),
  cancellation_policy text,
  status              text not null default 'active' check (status in ('active', 'inactive')),
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_rate_plans_room on public.rate_plans (room_type_id) where deleted_at is null;

create table if not exists public.seasonal_rates (
  id           uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  rate_plan_id uuid references public.rate_plans(id) on delete cascade,
  label        text,
  start_date   date not null,
  end_date     date not null,
  price        integer not null check (price >= 0),
  status       text not null default 'active' check (status in ('active', 'inactive')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (start_date <= end_date)
);

create index if not exists idx_seasonal_rates_room on public.seasonal_rates (room_type_id, start_date, end_date);

-- ─── Disponibilités par type de chambre et par date ────────────────────────
create table if not exists public.room_availability (
  id                 uuid primary key default gen_random_uuid(),
  room_type_id       uuid not null references public.room_types(id) on delete cascade,
  date               date not null,
  available_quantity integer not null check (available_quantity >= 0),
  booked_quantity    integer not null default 0 check (booked_quantity >= 0),
  status             text not null default 'AVAILABLE' check (status in ('AVAILABLE', 'UNAVAILABLE')),
  minimum_stay       smallint check (minimum_stay is null or minimum_stay > 0),
  maximum_stay       smallint check (maximum_stay is null or maximum_stay > 0),
  price_override     integer check (price_override is null or price_override >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (room_type_id, date)
);

create index if not exists idx_room_availability_room_date on public.room_availability (room_type_id, date);

-- ─── Réservations ───────────────────────────────────────────────────────────
alter table public.reservations
  add column if not exists property_id text references public.stays(id) on delete set null,
  add column if not exists room_type_id uuid references public.room_types(id) on delete set null,
  add column if not exists rate_plan_id uuid references public.rate_plans(id) on delete set null,
  add column if not exists owner_id uuid references public.owners(id) on delete set null,
  add column if not exists inventory_held boolean not null default false;

create index if not exists idx_reservations_owner on public.reservations (owner_id, created_at desc);
create index if not exists idx_reservations_property on public.reservations (property_id);

-- ─── Journal d'audit ────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id          bigint generated by default as identity primary key,
  actor_type  text not null check (actor_type in ('admin', 'owner', 'system')),
  actor_id    text,
  actor_label text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  details     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_logs_entity on public.audit_logs (entity, entity_id, created_at desc);
create index if not exists idx_audit_logs_created on public.audit_logs (created_at desc);

-- ─── Anciens comptes partenaires hôtel → propriétaires ─────────────────────
insert into public.owners (first_name, last_name, email, phone, password_hash, status, created_by)
select coalesce(nullif(split_part(s.name, ' ', 1), ''), 'Partenaire'),
       coalesce(nullif(substr(s.name, length(split_part(s.name, ' ', 1)) + 2), ''), s.name),
       hu.email, coalesce(s.phone, ''), hu.password_hash,
       case when hu.active then 'active' else 'inactive' end, 'migration'
from public.hotel_users hu
join public.stays s on s.id = hu.hotel_id
where not exists (select 1 from public.owners o where lower(o.email) = lower(hu.email));

update public.stays s set owner_id = o.id
from public.hotel_users hu
join public.owners o on lower(o.email) = lower(hu.email)
where hu.hotel_id = s.id and s.owner_id is null;
