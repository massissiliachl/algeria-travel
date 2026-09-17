const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const CMS_DIR = path.join(ROOT, 'public/images/cms');
const LEGACY_UPLOAD_DIR = path.join(ROOT, 'public/uploads');
const PUBLIC_IMAGES_DIR = path.join(ROOT, 'public/images');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(CMS_DIR);
ensureDir(LEGACY_UPLOAD_DIR);

function sanitizeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const base = path.basename(originalName, ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 48) || 'image';
  return `${base}-${Date.now()}${ext}`;
}

function publicCmsUrl(filename) {
  return `/images/cms/${filename.replace(/\\/g, '/')}`;
}

function normalizeImageUrl(url) {
  if (!url) return url;
  const trimmed = String(url).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/uploads/')) {
    return trimmed.replace(/^\/uploads\//, '/images/cms/');
  }
  if (trimmed.startsWith('/images/') || trimmed.startsWith('/')) return trimmed;
  return `/images/${trimmed.replace(/^\.\//, '')}`;
}

module.exports = {
  ROOT,
  CMS_DIR,
  LEGACY_UPLOAD_DIR,
  PUBLIC_IMAGES_DIR,
  ensureDir,
  sanitizeFilename,
  publicCmsUrl,
  normalizeImageUrl,
};
