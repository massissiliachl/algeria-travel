-- Taghit par avion : tarif catalogue 130 000 DA (+10 ans), promo −20 %

update public.tours set
  subtitle = '5 jours / 4 nuits · vol inclus · promo −20 %',
  subtitle_en = '5 days / 4 nights · flight included · −20% promo',
  duration = '5 jours / 4 nuits',
  duration_en = '5 days / 4 nights',
  duration_ar = '5 أيام / 4 ليالٍ',
  price = 104000,
  old_price = 130000,
  badge = '−20 %',
  price_tiers = '[
    {"fr":"+ 10 ans","en":"Over 10","ar":"أكثر من 10 سنوات","price":104000},
    {"fr":"De 2 à 10 ans","en":"2 to 10 years","ar":"من 2 إلى 10 سنوات","price":60000},
    {"fr":"- 2 ans","en":"Under 2","ar":"أقل من سنتين","price":32000}
  ]'::jsonb,
  place_slug = 'taghit',
  pkg = 'avion',
  published = true,
  booking_open = true
where id = 12;

insert into public.booking_calendars (key, mode, periods, updated_by)
values (
  'taghit:avion',
  'fixed',
  '[
    {"start": "2026-11-16", "end": "2026-11-20", "label": "Taghit par avion — 16 au 20 novembre"},
    {"start": "2026-11-23", "end": "2026-11-27", "label": "Taghit par avion — 23 au 27 novembre"},
    {"start": "2026-12-01", "end": "2026-12-04", "label": "Taghit par avion — 1er au 4 décembre"},
    {"start": "2026-12-08", "end": "2026-12-11", "label": "Taghit par avion — 8 au 11 décembre"},
    {"start": "2026-12-15", "end": "2026-12-18", "label": "Taghit par avion — 15 au 18 décembre"},
    {"start": "2026-12-22", "end": "2026-12-25", "label": "Taghit par avion — 22 au 25 décembre"},
    {"start": "2026-12-29", "end": "2027-01-03", "label": "Taghit par avion — 29 décembre au 3 janvier 2027"}
  ]'::jsonb,
  'migration'
)
on conflict (key) do update set
  mode = excluded.mode,
  periods = excluded.periods,
  updated_by = excluded.updated_by,
  updated_at = now();
