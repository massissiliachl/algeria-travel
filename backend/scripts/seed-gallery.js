/**
 * Réinsère les photos galerie d'origine (/images/...) sans toucher au reste.
 * Usage: node backend/scripts/seed-gallery.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query, closePool } = require('../config/db');
const { GALLERY_ITEMS } = require('./data/gallery.cjs');

async function seedGallery() {
  await query('delete from public.gallery_items');
  for (const g of GALLERY_ITEMS) {
    await query(
      `insert into public.gallery_items (src, alt, caption_fr, sort_order, published)
       values ($1, $2, $3, $4, true)`,
      [g.src, g.alt || '', g.captionFr || '', g.sortOrder ?? 0]
    );
  }
  console.log(`[gallery] ${GALLERY_ITEMS.length} photos publiées.`);
}

seedGallery()
  .catch((err) => {
    console.error('[gallery]', err.message);
    process.exit(1);
  })
  .finally(() => closePool());
