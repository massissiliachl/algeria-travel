const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');
const dir = path.join(__dirname, 'data');

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

const src = fs.readFileSync(path.join(root, 'src/data/places.js'), 'utf8');
const arrayLiteral = extractExportArray(src, 'PLACES');
const taghitMod = require('./data/taghitPackages.cjs');
const fn = new Function('resolveTaghitPlace', `return ${arrayLiteral}`);
const data = fn(taghitMod.resolveTaghitPlace);
fs.writeFileSync(path.join(dir, 'places.cjs'), `exports.PLACES = ${JSON.stringify(data, null, 2)};\n`);
console.log(`[sync-places] ${data.length} destinations → places.cjs`);
