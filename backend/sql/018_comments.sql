-- Commentaires visiteurs (modération admin)

create table if not exists public.comments (
  id               uuid primary key default gen_random_uuid(),
  item_type        text not null check (item_type in (
                     'hotel', 'tour', 'activity', 'place', 'stay', 'gallery'
                   )),
  item_id          text not null,
  parent_id        uuid references public.comments(id) on delete cascade,
  client_id        uuid not null,
  author_name      text not null default 'Visiteur',
  body             text not null check (char_length(body) between 1 and 2000),
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  moderated_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists comments_item_idx
  on public.comments (item_type, item_id, status, created_at desc);

create index if not exists comments_parent_idx
  on public.comments (parent_id)
  where parent_id is not null;

create index if not exists comments_pending_idx
  on public.comments (created_at desc)
  where status = 'pending';

create table if not exists public.comment_likes (
  id          serial primary key,
  comment_id  uuid not null references public.comments(id) on delete cascade,
  client_id   uuid not null,
  created_at  timestamptz not null default now(),
  unique (comment_id, client_id)
);

create index if not exists comment_likes_comment_idx
  on public.comment_likes (comment_id);
