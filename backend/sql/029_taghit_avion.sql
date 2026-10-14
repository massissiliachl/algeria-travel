-- Séjour Taghit 4 jours / 3 nuits, départs par avion (formule « avion », circuit 12) : circuit + 7 départs à dates fixes

insert into public.tours (
  id, name, name_en, name_ar, subtitle, subtitle_en, subtitle_ar,
  description, location, location_en, location_ar,
  duration, duration_en, duration_ar, price, rating, reviews, image, category,
  activities, itinerary, place_slug, pkg, published, booking_open
) values (
  12,
  'Séjour Taghit — Départs par avion', 'Taghit stay — Departures by plane', 'إقامة تاغيت — رحلات بالطائرة',
  '4 jours / 3 nuits · vol inclus', '4 days / 3 nights · flight included', '4 أيام / 3 ليالٍ · الطيران مشمول',
  '',
  'Taghit, Béchar', 'Taghit, Béchar', 'تاغيت، بشار',
  '4 jours / 3 nuits', '4 days / 3 nights', '4 أيام / 3 ليالٍ',
  75000, 4.9, 0, '/images/taghit.jpeg', 'desert',
  '[]'::jsonb, '[]'::jsonb, 'taghit', 'avion', true, true
)
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('public.tours', 'id'), (select max(id) from public.tours))
where pg_get_serial_sequence('public.tours', 'id') is not null;

insert into public.booking_calendars (key, mode, periods, updated_by)
values (
  'taghit:avion',
  'fixed',
  '[
    {"start": "2026-11-17", "end": "2026-11-20", "label": "Taghit par avion — 17 au 20 novembre"},
    {"start": "2026-11-24", "end": "2026-11-27", "label": "Taghit par avion — 24 au 27 novembre"},
    {"start": "2026-12-01", "end": "2026-12-04", "label": "Taghit par avion — 1er au 4 décembre"},
    {"start": "2026-12-08", "end": "2026-12-11", "label": "Taghit par avion — 8 au 11 décembre"},
    {"start": "2026-12-15", "end": "2026-12-18", "label": "Taghit par avion — 15 au 18 décembre"},
    {"start": "2026-12-22", "end": "2026-12-25", "label": "Taghit par avion — 22 au 25 décembre"},
    {"start": "2026-12-29", "end": "2027-01-01", "label": "Taghit par avion — 29 décembre au 1er janvier"}
  ]'::jsonb,
  'migration'
)
on conflict (key) do nothing;
