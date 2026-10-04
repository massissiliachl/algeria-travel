-- Messages contact + consentement RGPD sur réservations

create table if not exists public.contact_messages (
  id              uuid primary key default gen_random_uuid(),
  client_name     text not null,
  client_email    text not null,
  client_phone    text not null,
  subject         text not null,
  message         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_contact_messages_created
  on public.contact_messages (created_at desc);

alter table public.reservations
  add column if not exists gdpr_consent_at timestamptz,
  add column if not exists unit_price integer,
  add column if not exists price_per_person boolean default false;
