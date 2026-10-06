/**
 * QR Code public : ouvre uniquement la page d'accueil du site officiel (jamais l'admin ni le backend).
 */
const express = require('express');
const { asyncHandler } = require('../lib/asyncHandler');
const { buildQrPng } = require('../lib/qrImage');

const router = express.Router();
const DEFAULT_SITE_URL = 'https://algeriatravel.org';
const FILENAME = 'algeria-travel-qrcode.png';

function publicSiteUrl() {
  try {
    const url = new URL(process.env.SITE_URL || DEFAULT_SITE_URL);
    if (url.protocol !== 'https:' || /(^|\.)(onrender\.com|localhost)$/i.test(url.hostname)) return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

let cache = null;

async function qrPng() {
  const target = publicSiteUrl();
  if (cache?.target !== target) {
    cache = { target, buffer: await buildQrPng(target) };
  }
  return cache.buffer;
}

function sendPng(res, buffer, disposition) {
  res.set({
    'Content-Type': 'image/png',
    'Content-Length': buffer.length,
    'Content-Disposition': disposition,
    'Cache-Control': 'public, max-age=86400',
  });
  res.send(buffer);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    sendPng(res, await qrPng(), `inline; filename="${FILENAME}"`);
  })
);

router.get(
  '/download',
  asyncHandler(async (req, res) => {
    sendPng(res, await qrPng(), `attachment; filename="${FILENAME}"`);
  })
);

module.exports = router;
module.exports.publicSiteUrl = publicSiteUrl;
