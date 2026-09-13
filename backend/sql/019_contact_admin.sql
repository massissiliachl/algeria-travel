-- Suivi admin des messages contact

alter table public.contact_messages
  add column if not exists read_at timestamptz,
  add column if not exists admin_notes text;

create index if not exists idx_contact_messages_unread
  on public.contact_messages (created_at desc)
  where read_at is null;
