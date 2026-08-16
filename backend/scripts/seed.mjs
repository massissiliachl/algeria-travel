import { query, closePool } from '../config/db.mjs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const { tourRow, activityRow, stayRow, placeRow } = require('./seed-rows.js');
const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

const { FEATURED_TOURS } = require(join(root, 'backend/scripts/data/tours.cjs'));
const { ACTIVITIES } = require(join(root, 'backend/scripts/data/activities.cjs'));
const { STAYS } = require(join(root, 'backend/scripts/data/stays.cjs'));
const { BLOG_POSTS } = require(join(root, 'backend/scripts/data/blog.cjs'));
const { PLACES } = require(join(root, 'backend/scripts/data/places.cjs'));

function blogRow(p) {
  return [
    p.slug, p.title, p.title_en, p.title_ar,
    p.excerpt, p.excerpt_en, p.excerpt_ar,
    p.body, p.body_en, p.body_ar,
    p.category, p.categoryLabel, p.categoryLabel_en, p.categoryLabel_ar,
    p.date, p.date_en, p.date_ar,
    p.readTime, p.image, p.featured || false,
  ];
}

async function seed() {
  console.log('[seed] Import des données statiques…');

  await query('truncate public.tours, public.activities, public.stays, public.blog_posts, public.places restart identity cascade');

  for (const t of FEATURED_TOURS) {
    await query(
      `insert into public.tours (
        name, name_en, name_ar, subtitle, subtitle_en, subtitle_ar,
        description, description_en, full_description, full_description_en,
        location, location_en, location_ar, best_time, best_time_en, best_time_ar,
        duration, duration_en, duration_ar, price, old_price, rating, reviews,
        image, category, activities, itinerary, place_slug, pkg, badge
      ) values (${Array.from({ length: 30 }, (_, i) => `$${i + 1}`).join(', ')})`,
      tourRow(t)
    );
  }
  console.log(`[seed] ${FEATURED_TOURS.length} circuits`);

  for (const a of ACTIVITIES) {
    await query(
      `insert into public.activities (
        id, name, name_en, name_ar, "desc", desc_en, desc_ar,
        full_desc, full_desc_en, full_desc_ar, history, history_en, history_ar,
        visit, visit_en, visit_ar, icon, color, category, filters, places, tags,
        duration_short, duration_short_en, duration_short_ar, image, gallery, price,
        duration, duration_en, duration_ar, location, location_en, location_ar,
        dates, dates_en, dates_ar, "group", group_en, group_ar, rating,
        included, included_en, included_ar
      ) values (${Array.from({ length: 44 }, (_, i) => `$${i + 1}`).join(', ')})`,
      activityRow(a)
    );
  }
  console.log(`[seed] ${ACTIVITIES.length} activités`);

  for (const s of STAYS) {
    await query(
      `insert into public.stays (
        id, type, place_id, name, name_en, name_ar, location, location_en, location_ar,
        "desc", desc_en, desc_ar, image, gallery, price, price_per_person, rating, reviews, amenities
      ) values (${Array.from({ length: 19 }, (_, i) => `$${i + 1}`).join(', ')})`,
      stayRow(s)
    );
  }
  console.log(`[seed] ${STAYS.length} hébergements`);

  for (const p of BLOG_POSTS) {
    await query(
      `insert into public.blog_posts (
        slug, title, title_en, title_ar, excerpt, excerpt_en, excerpt_ar,
        body, body_en, body_ar, category, category_label, category_label_en, category_label_ar,
        published_at, published_at_en, published_at_ar, read_time, image, featured
      ) values (${Array.from({ length: 20 }, (_, i) => `$${i + 1}`).join(', ')})`,
      blogRow(p)
    );
  }
  console.log(`[seed] ${BLOG_POSTS.length} articles blog`);

  for (const p of PLACES) {
    await query(
      `insert into public.places (
        id, name, name_en, name_ar, tagline, tagline_en, tagline_ar,
        rating, reviews, temp, image, gallery, description, description_en, description_ar,
        best_time, best_time_en, best_time_ar, duration, duration_en, duration_ar,
        price, old_price, stay, stay_en, stay_ar, transport, transport_en, transport_ar,
        includes, highlights
      ) values (${Array.from({ length: 31 }, (_, i) => `$${i + 1}`).join(', ')})`,
      placeRow(p)
    );
  }
  console.log(`[seed] ${PLACES.length} destinations`);

  console.log('[seed] Terminé.');
}

seed()
  .catch((err) => {
    console.error('[seed] Erreur:', err.message);
    process.exit(1);
  })
  .finally(() => closePool());
