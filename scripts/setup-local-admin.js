/**
 * Synchronise la clé admin locale pour connexion auto.
 * Usage : node scripts/setup-local-admin.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const backendEnvPath = path.join(root, 'backend', '.env');
const adminEnvPath = path.join(root, 'admin', '.env');

function readAdminKey() {
  if (!fs.existsSync(backendEnvPath)) {
    throw new Error('Fichier backend/.env introuvable.');
  }
  const content = fs.readFileSync(backendEnvPath, 'utf8');
  const match = content.match(/^ADMIN_API_KEY=(.+)$/m);
  if (!match?.[1]?.trim()) {
    throw new Error('ADMIN_API_KEY manquant dans backend/.env');
  }
  return match[1].trim();
}

function writeAdminEnv(key) {
  const lines = [
    '# Généré par scripts/setup-local-admin.js',
    'VITE_DEV_ADMIN_KEY=' + key,
    '',
  ];
  fs.writeFileSync(adminEnvPath, lines.join('\n'), 'utf8');
}

try {
  const key = readAdminKey();
  writeAdminEnv(key);
  console.log('[setup-local-admin] OK — admin/.env créé avec VITE_DEV_ADMIN_KEY');
  console.log('[setup-local-admin] Redémarrez l\'admin : cd admin && npm run dev');
} catch (err) {
  console.error('[setup-local-admin] Erreur:', err.message);
  process.exit(1);
}
