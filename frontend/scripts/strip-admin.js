/**
 * Retire build/admin/ pour déployer uniquement le site public (ex. IONOS).
 */
const fs = require('fs');
const path = require('path');

const adminBuild = path.join(__dirname, '..', 'build', 'admin');

fs.rmSync(adminBuild, { recursive: true, force: true });
console.log('Admin retiré du build : build/admin/ supprimé.');
