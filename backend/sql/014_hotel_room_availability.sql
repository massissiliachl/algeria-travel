-- Disponibilité par chambre (index 1..N) pour le portail partenaire

create table if not exists public.hotel_room_daily_availability (
  hotel_id    text not null references public.stays(id) on delete cascade,
  room_index  smallint not null check (room_index > 0 and room_index <= 200),
  stay_date   date not null,
  available   boolean not null default true,
  updated_at  timestamptz not null default now(),
  primary key (hotel_id, room_index, stay_date)
);

create index if not exists idx_hotel_room_daily_availability_hotel_date
  on public.hotel_room_daily_availability (hotel_id, stay_date);
