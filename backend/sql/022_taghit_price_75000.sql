-- Tarif formule Taghit hôtel 4★ : 75 000 DA / personne
update public.places
set price = 75000,
    updated_at = now()
where id = 'taghit';

update public.tours
set price = 75000,
    updated_at = now()
where place_slug = 'taghit'
  and (pkg = 'hotel' or pkg is null)
  and name ilike '%Taghit%Hôtel%';

update public.tours
set price = 60000,
    updated_at = now()
where place_slug = 'taghit'
  and pkg = 'guesthouse';
