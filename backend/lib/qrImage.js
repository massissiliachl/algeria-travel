/**
 * QR Code PNG avec le logo Algeria Travel au centre (correction d'erreur H : le logo couvre ~6 % de la surface).
 */
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { PNG } = require('pngjs');

const SIZE = 1200;
const DARK = '#1A2332';
const LOGO_FILE = path.join(__dirname, '..', 'assets', 'logo.png');
const LOGO_RATIO = 0.24;
const PAD = 16;

function insideRounded(x, y, size, radius) {
  const cx = Math.min(Math.max(x, radius), size - radius);
  const cy = Math.min(Math.max(y, radius), size - radius);
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}

/** Réduction par moyenne de zone (net et sans crénelage). */
function resize(src, size) {
  const out = Buffer.alloc(size * size * 4);
  const sx = src.width / size;
  const sy = src.height / size;
  for (let y = 0; y < size; y += 1) {
    const y0 = Math.floor(y * sy);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy));
    for (let x = 0; x < size; x += 1) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx));
      const acc = [0, 0, 0, 0];
      for (let yy = y0; yy < y1; yy += 1) {
        for (let xx = x0; xx < x1; xx += 1) {
          const i = (yy * src.width + xx) * 4;
          for (let c = 0; c < 4; c += 1) acc[c] += src.data[i + c];
        }
      }
      const n = (y1 - y0) * (x1 - x0);
      const o = (y * size + x) * 4;
      for (let c = 0; c < 4; c += 1) out[o + c] = Math.round(acc[c] / n);
    }
  }
  return out;
}

function drawLogo(qr) {
  if (!fs.existsSync(LOGO_FILE)) return;
  const box = Math.round(qr.width * LOGO_RATIO);
  const start = Math.round((qr.width - box) / 2);
  const logoSize = box - PAD * 2;
  const logo = resize(PNG.sync.read(fs.readFileSync(LOGO_FILE)), logoSize);

  for (let y = 0; y < box; y += 1) {
    for (let x = 0; x < box; x += 1) {
      if (!insideRounded(x + 0.5, y + 0.5, box, 30)) continue;
      const o = ((start + y) * qr.width + start + x) * 4;
      let rgb = [255, 255, 255];
      const lx = x - PAD;
      const ly = y - PAD;
      if (lx >= 0 && ly >= 0 && lx < logoSize && ly < logoSize && insideRounded(lx + 0.5, ly + 0.5, logoSize, 18)) {
        const i = (ly * logoSize + lx) * 4;
        const a = logo[i + 3] / 255;
        rgb = [0, 1, 2].map((c) => Math.round(logo[i + c] * a + 255 * (1 - a)));
      }
      qr.data[o] = rgb[0];
      qr.data[o + 1] = rgb[1];
      qr.data[o + 2] = rgb[2];
      qr.data[o + 3] = 255;
    }
  }
}

async function buildQrPng(target) {
  const base = await QRCode.toBuffer(target, {
    type: 'png',
    width: SIZE,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: { dark: DARK, light: '#FFFFFF' },
  });
  const qr = PNG.sync.read(base);
  drawLogo(qr);
  return PNG.sync.write(qr);
}

module.exports = { buildQrPng };
