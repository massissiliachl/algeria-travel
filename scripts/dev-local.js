/**
 * Démarre backend + site public + admin en local (3 processus).
 * Usage : npm run dev:local
 */
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const procs = [];

function start(label, cwd, command) {
  const proc = spawn(command, {
    cwd,
    shell: true,
    stdio: 'inherit',
    env: process.env,
  });

  proc.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[dev:local] ${label} arrêté (code ${code})`);
    }
  });

  procs.push(proc);
  console.log(`[dev:local] ${label} démarré`);
}

function shutdown() {
  procs.forEach((proc) => {
    try {
      proc.kill();
    } catch {
      /* ignore */
    }
  });
}

process.on('SIGINT', () => {
  console.log('\n[dev:local] Arrêt…');
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', shutdown);

console.log('\n=== Algeria Travel — mode local ===\n');

try {
  require('child_process').execSync('node scripts/setup-local-admin.js', {
    cwd: root,
    stdio: 'inherit',
  });
} catch {
  console.warn('[dev:local] setup-local-admin ignoré — créez admin/.env manuellement si besoin.');
}

start('backend', path.join(root, 'backend'), 'npm run dev');

setTimeout(() => {
  start('site', root, 'npm run dev');
}, 2500);

setTimeout(() => {
  start('admin', path.join(root, 'admin'), 'npm run dev');
  console.log('\n  Backend : http://localhost:5000/api/health');
  console.log('  Site    : http://localhost:3000');
  console.log('  Admin   : http://localhost:5173/admin/');
  console.log('\n  Réservations & commentaires → même base PostgreSQL locale.\n');
}, 5000);
