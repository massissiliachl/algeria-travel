-- Archivage manuel (destinations, activités, circuits, chats, etc.).
-- Une ligne archivée quitte le site tout de suite et est supprimée 6 mois plus tard.

alter table public.places add column if not exists archived_at timestamptz;
alter table public.activities add column if not exists archived_at timestamptz;
alter table public.tours add column if not exists archived_at timestamptz;
alter table public.stays add column if not exists archived_at timestamptz;
alter table public.blog_posts add column if not exists archived_at timestamptz;
alter table public.gallery_items add column if not exists archived_at timestamptz;
alter table public.chat_conversations add column if not exists archived_at timestamptz;
alter table public.contact_messages add column if not exists archived_at timestamptz;
alter table public.inbox_conversations add column if not exists archived_at timestamptz;

create index if not exists places_archived_at_idx on public.places (archived_at);
create index if not exists activities_archived_at_idx on public.activities (archived_at);
create index if not exists tours_archived_at_idx on public.tours (archived_at);
create index if not exists stays_archived_at_idx on public.stays (archived_at);
create index if not exists blog_posts_archived_at_idx on public.blog_posts (archived_at);
create index if not exists gallery_items_archived_at_idx on public.gallery_items (archived_at);
create index if not exists chat_conversations_archived_at_idx on public.chat_conversations (archived_at);
create index if not exists contact_messages_archived_at_idx on public.contact_messages (archived_at);
create index if not exists inbox_conversations_archived_at_idx on public.inbox_conversations (archived_at);
