-- Tarifs par âge sur les circuits (ex. Taghit avion : +10 / 2–10 / -2 ans)
alter table public.tours
  add column if not exists price_tiers jsonb;

-- Formule avion : paliers d’origine
update public.tours
set price_tiers = '[
  {"fr":"+ 10 ans","en":"Over 10","ar":"أكثر من 10 سنوات","price":80000},
  {"fr":"De 2 à 10 ans","en":"2 to 10 years","ar":"من 2 إلى 10 سنوات","price":60000},
  {"fr":"- 2 ans","en":"Under 2","ar":"أقل من سنتين","price":32000}
]'::jsonb
where id = 12 and (price_tiers is null or price_tiers = '[]'::jsonb or price_tiers = 'null'::jsonb);
