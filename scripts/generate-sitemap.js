/**
 * Génère public/sitemap.xml depuis les données du site (sans bundler).
 * Usage: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://algeriatravel.com';
const root = path.join(__dirname, '..');

function extractIds(file, pattern) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  return [...src.matchAll(pattern)].map((m) => m[1]);
}

const placeIds = [
  ...extractIds('src/data/places.js', /^\s+id: '([^']+)',/gm),
  'taghit',
];

const activityIds = extractIds('src/data/activities.js', /^\s+id: '([^']+)',/gm);
const blogSlugs = extractIds('src/data/blog.js', /^\s+slug: '([^']+)',/gm);

const STATIC_PAGES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/tours', changefreq: 'weekly', priority: '0.9' },
  { loc: '/destinations', changefreq: 'weekly', priority: '0.9' },
  { loc: '/activities', changefreq: 'weekly', priority: '0.8' },
  { loc: '/stays', changefreq: 'weekly', priority: '0.8' },
  { loc: '/hotels', changefreq: 'weekly', priority: '0.7' },
  { loc: '/guesthouses', changefreq: 'weekly', priority: '0.7' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/gallery', changefreq: 'weekly', priority: '0.7' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
];

const urls = [
  ...STATIC_PAGES,
  ...[...new Set(placeIds)].map((id) => ({
    loc: `/place/${id}`,
    changefreq: 'monthly',
    priority: '0.8',
  })),
  ...activityIds.map((id) => ({
    loc: `/activity/${id}`,
    changefreq: 'monthly',
    priority: '0.7',
  })),
  ...blogSlugs.map((slug) => ({
    loc: `/blog/${slug}`,
    changefreq: 'monthly',
    priority: '0.7',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${SITE_URL}${entry.loc}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const out = path.join(root, 'public', 'sitemap.xml');
fs.writeFileSync(out, xml, 'utf8');
console.log(`Sitemap généré: ${urls.length} URLs → ${out}`);
