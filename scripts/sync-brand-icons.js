/**
 * Copie le logo Algeria Travel vers les emplacements favicon / PWA / SEO.
 * Source : public/logo1.png (badge circulaire, lisible en petit).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'public', 'logo1.png');

if (!fs.existsSync(src)) {
  console.error('Missing public/logo1.png');
  process.exit(1);
}

const targets = [
  'public/logo192.png',
  'public/logo512.png',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/favicon.ico',
];

for (const rel of targets) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('synced', rel);
}
