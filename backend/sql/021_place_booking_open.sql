-- Ouverture des réservations par destination (Taghit seule ouverte par défaut)
-- Valeurs initiales appliquées une seule fois : relancer la migration ne doit pas écraser les choix de l’admin.

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'places' and column_name = 'booking_open'
  ) then
    alter table public.places add column booking_open boolean not null default false;
    update public.places set booking_open = (id = 'taghit');
  end if;
end $$;
