-- Tokens Firebase Cloud Messaging (navigateur / mobile web)

create table if not exists public.fcm_tokens (
  id          serial primary key,
  token       text unique not null,
  lang        varchar(5) default 'fr',
  user_agent  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_fcm_tokens_created
  on public.fcm_tokens (created_at desc);
