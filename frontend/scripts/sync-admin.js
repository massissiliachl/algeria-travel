/**
 * Copie le dossier ../admin/ (source, à la racine du projet) vers
 * frontend/public/admin/ (servi par CRA, qui ne sert que public/).
 */
const fs = require('fs');
const path = require('path');

const frontendRoot = path.join(__dirname, '..');
const projectRoot = path.join(frontendRoot, '..');
const srcCandidates = ['admin', 'Admin'].map((name) => path.join(projectRoot, name));
const src = srcCandidates.find((p) => fs.existsSync(p));
const dest = path.join(frontendRoot, 'public', 'admin');

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) rmDir(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!src) {
  console.error('Dossier admin/ introuvable à la racine du projet.');
  process.exit(1);
}

rmDir(dest);
copyDir(src, dest);
console.log('Admin synchronisé : ' + path.basename(src) + '/ → frontend/public/admin/');
