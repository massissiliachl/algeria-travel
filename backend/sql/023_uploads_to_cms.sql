-- Chemins images admin : /uploads/ → /images/cms/
update public.places set image = replace(image, '/uploads/', '/images/cms/') where image like '/uploads/%';
update public.tours set image = replace(image, '/uploads/', '/images/cms/') where image like '/uploads/%';
update public.activities set image = replace(image, '/uploads/', '/images/cms/') where image like '/uploads/%';
update public.stays set image = replace(image, '/uploads/', '/images/cms/') where image like '/uploads/%';
update public.blog_posts set image = replace(image, '/uploads/', '/images/cms/') where image like '/uploads/%';
update public.gallery_items set src = replace(src, '/uploads/', '/images/cms/') where src like '/uploads/%';

update public.places set gallery = replace(gallery::text, '/uploads/', '/images/cms/')::jsonb where gallery::text like '%/uploads/%';
update public.activities set gallery = replace(gallery::text, '/uploads/', '/images/cms/')::jsonb where gallery::text like '%/uploads/%';
update public.stays set gallery = replace(gallery::text, '/uploads/', '/images/cms/')::jsonb where gallery::text like '%/uploads/%';
