-- Réactions galerie (1 vote like/dislike par visiteur et par photo)

create table if not exists public.gallery_reactions (
  id              serial primary key,
  gallery_item_id int not null references public.gallery_items(id) on delete cascade,
  client_id       uuid not null,
  reaction        text not null check (reaction in ('like', 'dislike')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (gallery_item_id, client_id)
);

create index if not exists gallery_reactions_item_idx
  on public.gallery_reactions (gallery_item_id);

create index if not exists gallery_reactions_client_idx
  on public.gallery_reactions (client_id);
