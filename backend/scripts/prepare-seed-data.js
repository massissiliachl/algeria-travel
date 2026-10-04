const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');
const dir = path.join(__dirname, 'data');
fs.mkdirSync(dir, { recursive: true });

const files = [
  ['tours', 'FEATURED_TOURS'],
  ['activities', 'ACTIVITIES'],
  ['stays', 'STAYS'],
  ['blog', 'BLOG_POSTS'],
];

function extractExportArray(src, exportName) {
  const normalized = src.replace(/\r\n/g, '\n');
  const marker = `export const ${exportName} =`;
  const start = normalized.indexOf(marker);
  if (start < 0) throw new Error(`Export ${exportName} introuvable`);

  let i = start + marker.length;
  while (normalized[i] === ' ') i += 1;
  if (normalized[i] !== '[') throw new Error(`Export ${exportName} n'est pas un tableau`);

  let depth = 0;
  let inString = false;
  let quote = '';

  for (; i < normalized.length; i += 1) {
    const ch = normalized[i];
    const prev = normalized[i - 1];

    if (inString) {
      if (ch === quote && prev !== '\\') inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        return normalized.slice(normalized.indexOf('[', start), i + 1);
      }
    }
  }

  throw new Error(`Fin de tableau introuvable pour ${exportName}`);
}

for (const [file, exportName] of files) {
  const src = fs.readFileSync(path.join(root, 'src/data', `${file}.js`), 'utf8');
  const arrayLiteral = extractExportArray(src, exportName);
  fs.writeFileSync(path.join(dir, `${file}.cjs`), `exports.${exportName} = ${arrayLiteral};\n`);
  console.log(`[prepare-seed] ${file}.cjs`);
}

// Taghit packages pour tours/stays étendus
let taghit = fs.readFileSync(path.join(root, 'src/data/taghitPackages.js'), 'utf8').replace(/\r\n/g, '\n');
taghit = taghit.replace(/^export const (\w+) =/gm, 'exports.$1 =');
taghit += `
exports.getTaghitPackage = (pkgId) => pkgId === 'guesthouse' ? exports.TAGHIT_PACKAGES.guesthouse : exports.TAGHIT_PACKAGES.hotel;
exports.resolveTaghitPlace = (pkgId = 'hotel') => {
  const pkg = exports.getTaghitPackage(pkgId);
  return {
    ...exports.TAGHIT_PLACE,
    price: pkg.price,
    pricePerPerson: true,
    pkgTitle: pkg.title,
    pkgTitle_en: pkg.title_en,
    pkgTitle_ar: pkg.title_ar,
    pkgIcon: pkg.icon,
    stay: pkg.stay,
    stay_en: pkg.stay_en,
    stay_ar: pkg.stay_ar,
    transport: pkg.transport,
    transport_en: pkg.transport_en,
    transport_ar: pkg.transport_ar,
    duration: pkg.duration,
    duration_en: pkg.duration_en,
    duration_ar: pkg.duration_ar,
    includes: pkg.extra ? [...pkg.includes, pkg.extra] : pkg.includes,
    badge: pkg.badge,
    badge_en: pkg.badge_en,
    badge_ar: pkg.badge_ar,
  };
};
`;
fs.writeFileSync(path.join(dir, 'taghitPackages.cjs'), taghit);

const prepend = `const { TAGHIT_PACKAGES } = require('./taghitPackages.cjs');
const taghitHotel = TAGHIT_PACKAGES.hotel;
const taghitGuest = TAGHIT_PACKAGES.guesthouse;
`;

for (const f of ['tours', 'stays']) {
  const p = path.join(dir, `${f}.cjs`);
  const exportName = f === 'tours' ? 'FEATURED_TOURS' : 'STAYS';
  const src = fs.readFileSync(path.join(root, 'src/data', `${f}.js`), 'utf8');
  const arrayLiteral = extractExportArray(src, exportName);
  const taghitMod = require('./data/taghitPackages.cjs');

  const fn = new Function(
    'TAGHIT_PACKAGES',
    'taghitHotel',
    'taghitGuest',
    `return ${arrayLiteral}`
  );
  const data = fn(taghitMod.TAGHIT_PACKAGES, taghitMod.TAGHIT_PACKAGES.hotel, taghitMod.TAGHIT_PACKAGES.guesthouse);
  fs.writeFileSync(p, `exports.${exportName} = ${JSON.stringify(data, null, 2)};\n`);
}

// Places avec resolveTaghitPlace
{
  const src = fs.readFileSync(path.join(root, 'src/data/places.js'), 'utf8');
  const arrayLiteral = extractExportArray(src, 'PLACES');
  const taghitMod = require('./data/taghitPackages.cjs');
  const fn = new Function('resolveTaghitPlace', `return ${arrayLiteral}`);
  const data = fn(taghitMod.resolveTaghitPlace);
  fs.writeFileSync(path.join(dir, 'places.cjs'), `exports.PLACES = ${JSON.stringify(data, null, 2)};\n`);
}

console.log('[prepare-seed] Terminé');
