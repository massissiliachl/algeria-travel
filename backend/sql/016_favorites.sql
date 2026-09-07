-- Favoris visiteur (identifié par client_id anonyme)

create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null,
  item_type   text not null check (item_type in ('hotel', 'tour', 'activity', 'place', 'stay')),
  item_id     text not null,
  created_at  timestamptz not null default now(),
  unique (client_id, item_type, item_id)
);

create index if not exists favorites_client_id_idx on public.favorites (client_id);
create index if not exists favorites_item_idx on public.favorites (item_type, item_id);
