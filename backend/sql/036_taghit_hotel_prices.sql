-- Taghit hôtel : 5 j / 4 n = 130 000 DA · 4 j / 3 n = 99 990 DA

alter table public.tours
  add column if not exists price_tiers jsonb;

update public.tours set
  name = 'Taghit — Hôtel 4★',
  subtitle = '5 j / 4 n · 130 000 DA · ou 4 j / 3 n · 99 990 DA',
  subtitle_en = '5 d / 4 n · 130,000 DZD · or 4 d / 3 n · 99,990 DZD',
  duration = '4 j / 3 n ou 5 j / 4 n',
  duration_en = '4 d / 3 n or 5 d / 4 n',
  duration_ar = '4 أيام / 3 ليالٍ أو 5 أيام / 4 ليالٍ',
  price = 130000,
  old_price = null,
  price_tiers = '[
    {"fr":"5 jours / 4 nuits","en":"5 days / 4 nights","ar":"5 أيام / 4 ليالٍ","price":130000},
    {"fr":"4 jours / 3 nuits","en":"4 days / 3 nights","ar":"4 أيام / 3 ليالٍ","price":99990}
  ]'::jsonb,
  place_slug = 'taghit',
  pkg = 'hotel',
  published = true,
  booking_open = true
where id = 7 or (place_slug = 'taghit' and coalesce(pkg, '') = 'hotel');

update public.places set
  price = 130000,
  duration = '4 j / 3 n ou 5 j / 4 n',
  duration_en = '4 d / 3 n or 5 d / 4 n',
  duration_ar = '4 أيام / 3 ليالٍ أو 5 أيام / 4 ليالٍ'
where id = 'taghit';
