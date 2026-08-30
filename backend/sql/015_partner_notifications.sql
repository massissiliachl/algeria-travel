-- Notifications partenaire hôtel (nouvelles demandes de réservation)

create table if not exists public.partner_notifications (
  id             serial primary key,
  hotel_id       text not null references public.stays(id) on delete cascade,
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  read_at        timestamptz,
  created_at     timestamptz not null default now(),
  unique (hotel_id, reservation_id)
);

create index if not exists idx_partner_notifications_hotel
  on public.partner_notifications (hotel_id, created_at desc);

create index if not exists idx_partner_notifications_unread
  on public.partner_notifications (hotel_id)
  where read_at is null;
