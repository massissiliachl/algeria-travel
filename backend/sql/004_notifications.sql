-- Abonnements push navigateur
create table if not exists public.push_subscriptions (
  id serial primary key,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  lang varchar(5) default 'fr',
  created_at timestamptz default now()
);

-- Fil d'actualités (circuits, galerie, blog, etc.)
create table if not exists public.site_notifications (
  id serial primary key,
  content_type varchar(32) not null,
  content_id varchar(64) not null default '',
  title_fr text not null,
  title_en text,
  title_ar text,
  body_fr text,
  body_en text,
  body_ar text,
  link text not null default '/',
  created_at timestamptz default now()
);

create index if not exists idx_site_notifications_created
  on public.site_notifications (created_at desc);
