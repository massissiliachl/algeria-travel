/**
 * Génère le QR Code du site public : npm run qrcode
 * → backend/assets/algeria-travel-qrcode.png (pointe uniquement vers SITE_URL, par défaut https://algeriatravel.org)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { publicSiteUrl } = require('../routes/qrcode');

const out = path.join(__dirname, '..', 'assets', 'algeria-travel-qrcode.png');
const target = publicSiteUrl();

fs.mkdirSync(path.dirname(out), { recursive: true });
QRCode.toFile(out, target, {
  type: 'png',
  width: 1200,
  margin: 4,
  errorCorrectionLevel: 'H',
  color: { dark: '#1A2332', light: '#FFFFFF' },
})
  .then(() => console.log(`QR Code généré : ${out}\nLien : ${target}`))
  .catch((err) => {
    console.error('Erreur :', err.message);
    process.exit(1);
  });
