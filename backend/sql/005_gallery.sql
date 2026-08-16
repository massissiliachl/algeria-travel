create table if not exists public.gallery_items (
  id serial primary key,
  src text not null,
  alt text default '',
  caption_fr text default '',
  caption_en text,
  caption_ar text,
  sort_order int default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_gallery_items_sort
  on public.gallery_items (sort_order asc, id asc);
