-- Planning journalier des chambres par hôtel + dates de séjour sur réservations

create table if not exists public.hotel_daily_availability (
  hotel_id       text not null references public.stays(id) on delete cascade,
  stay_date      date not null,
  rooms_total    smallint not null default 0 check (rooms_total >= 0),
  rooms_booked   smallint not null default 0 check (rooms_booked >= 0),
  price_override integer check (price_override is null or price_override >= 0),
  closed         boolean not null default false,
  updated_at     timestamptz not null default now(),
  primary key (hotel_id, stay_date),
  check (rooms_booked <= rooms_total)
);

create index if not exists idx_hotel_daily_availability_date
  on public.hotel_daily_availability (hotel_id, stay_date);

alter table public.reservations
  add column if not exists check_in_date date,
  add column if not exists check_out_date date,
  add column if not exists rooms_requested smallint default 1 check (rooms_requested is null or (rooms_requested > 0 and rooms_requested <= 20));

create index if not exists idx_reservations_stay_dates
  on public.reservations (item_id, check_in_date, check_out_date)
  where item_type = 'stay';
