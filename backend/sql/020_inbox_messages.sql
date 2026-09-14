-- Messagerie visiteur ↔ admin (fil par appareil via client_id)

create table if not exists public.inbox_conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,
  visitor_name text,
  visitor_email text,
  status text not null default 'open' check (status in ('open', 'closed')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.inbox_messages (
  id bigserial primary key,
  conversation_id uuid not null references public.inbox_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('visitor', 'admin')),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_inbox_conversations_last
  on public.inbox_conversations (last_message_at desc);

create index if not exists idx_inbox_messages_conversation
  on public.inbox_messages (conversation_id, created_at asc);

create index if not exists idx_inbox_messages_unread_admin
  on public.inbox_messages (conversation_id, created_at desc)
  where sender_type = 'visitor' and read_at is null;
