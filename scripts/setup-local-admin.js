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

function readProductionEnvVars() {
  const prodPath = path.join(root, 'admin', '.env.production');
  if (!fs.existsSync(prodPath)) return {};
  const content = fs.readFileSync(prodPath, 'utf8');
  const vars = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^(VITE_API_URL|VITE_PUBLIC_SITE_URL)=(.+)$/);
    if (match) vars[match[1]] = match[2].trim();
  }
  return vars;
}

function writeAdminEnv(key) {
  const prodVars = readProductionEnvVars();
  const lines = [
    '# Généré par scripts/setup-local-admin.js',
    'VITE_DEV_ADMIN_KEY=' + key,
    '',
    '# Lire réservations + favoris du site en ligne (API Render)',
  ];
  if (prodVars.VITE_API_URL) lines.push('VITE_API_URL=' + prodVars.VITE_API_URL);
  if (prodVars.VITE_PUBLIC_SITE_URL) lines.push('VITE_PUBLIC_SITE_URL=' + prodVars.VITE_PUBLIC_SITE_URL);
  lines.push('');
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
