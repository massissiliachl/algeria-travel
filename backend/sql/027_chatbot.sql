-- Chatbot client : conversations, messages et demandes (réservation / rappel conseiller)

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  language text not null default 'fr',
  status text not null default 'NEW' check (status in ('NEW', 'IN_PROGRESS', 'RESOLVED')),
  human_requested boolean not null default false,
  customer_name text,
  customer_phone text,
  customer_email text,
  last_message text,
  last_intent text,
  context jsonb not null default '{}'::jsonb,
  message_count integer not null default 0,
  page_url text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id bigserial primary key,
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender text not null check (sender in ('user', 'bot', 'agent')),
  body text not null,
  intent text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_requests (
  id bigserial primary key,
  reference text not null unique,
  conversation_id uuid references public.chat_conversations(id) on delete set null,
  type text not null check (type in ('booking', 'contact')),
  status text not null default 'pending' check (status in ('pending', 'contacted', 'confirmed', 'cancelled', 'closed')),
  name text,
  phone text,
  email text,
  item_key text,
  item_name text,
  start_date date,
  end_date date,
  dates_label text,
  persons integer,
  rooms integer,
  notes text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_conversations_last on public.chat_conversations (last_message_at desc);
create index if not exists idx_chat_conversations_status on public.chat_conversations (status, last_message_at desc);
create index if not exists idx_chat_messages_conversation on public.chat_messages (conversation_id, id);
create index if not exists idx_chat_requests_conversation on public.chat_requests (conversation_id);
create index if not exists idx_chat_requests_created on public.chat_requests (created_at desc);
