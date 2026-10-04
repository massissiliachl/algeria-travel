-- Sécurité réservations : référence publique + token de suivi (hashé)

alter table public.reservations
  add column if not exists reference_code text unique,
  add column if not exists access_token_hash text;

create index if not exists idx_reservations_reference on public.reservations (reference_code);
