-- Archivage des réservations traitées (confirmées, refusées, annulées) ; suppression automatique après 6 mois d'archive

alter table public.reservations
  add column if not exists archived_at timestamptz;

update public.reservations
  set archived_at = coalesce(updated_at, created_at, now())
  where archived_at is null and status in ('confirmed', 'rejected', 'cancelled');

create index if not exists reservations_archived_at_idx on public.reservations (archived_at);
