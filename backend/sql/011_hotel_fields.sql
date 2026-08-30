-- Champs hôtels (wilaya, disponibilité, localisation…)
alter table public.stays
  add column if not exists wilaya text,
  add column if not exists wilaya_key text,
  add column if not exists stars smallint,
  add column if not exists availability text default 'available',
  add column if not exists rooms_available integer,
  add column if not exists address text,
  add column if not exists address_en text,
  add column if not exists address_ar text,
  add column if not exists lat numeric(10, 6),
  add column if not exists lng numeric(10, 6),
  add column if not exists check_in text,
  add column if not exists check_out text,
  add column if not exists phone text,
  add column if not exists old_price integer;

create index if not exists idx_stays_wilaya_key on public.stays (wilaya_key);
create index if not exists idx_stays_type_wilaya on public.stays (type, wilaya_key);
