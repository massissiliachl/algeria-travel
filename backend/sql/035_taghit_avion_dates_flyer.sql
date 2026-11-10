-- Départs Taghit par avion — alignés sur l’affiche (pas de 17 nov.)
-- Nov : 16–20, 23–27 · Déc : 1–4, 8–11, 15–18, 22–25, 29 déc.–3 janv. 2027

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
