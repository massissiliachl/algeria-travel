/**
 * Génère le QR Code du site public : npm run qrcode
 * → backend/assets/algeria-travel-qrcode.png (pointe uniquement vers SITE_URL, par défaut https://algeriatravel.org)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { publicSiteUrl } = require('../routes/qrcode');
const { buildQrPng } = require('../lib/qrImage');

const out = path.join(__dirname, '..', 'assets', 'algeria-travel-qrcode.png');
const target = publicSiteUrl();

buildQrPng(target)
  .then((buffer) => {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buffer);
    console.log(`QR Code généré : ${out}\nLien : ${target}`);
  })
  .catch((err) => {
    console.error('Erreur :', err.message);
    process.exit(1);
  });
