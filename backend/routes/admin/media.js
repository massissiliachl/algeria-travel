const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { query } = require('../../config/db');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '../../../public/uploads');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '../../../public/images');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureDir(UPLOAD_DIR);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => { ensureDir(UPLOAD_DIR); cb(null, UPLOAD_DIR); },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 48) || 'image';
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Seules les images sont autorisées.'));
  },
});

function normalizeImageUrl(url) {
  if (!url) return url;
  const trimmed = String(url).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/images/')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return `/images/${trimmed.replace(/^\.\//, '')}`;
}

function listFilesInDir(dir, urlPrefix, subPath = '') {
  if (!fs.existsSync(dir)) return [];
  const source = urlPrefix === '/uploads' ? 'upload' : 'library';
  const items = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = subPath ? `${subPath}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      items.push(...listFilesInDir(fullPath, urlPrefix, rel));
    } else if (/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(entry.name)) {
      items.push({ url: `${urlPrefix}/${rel.replace(/\\/g, '/')}`, name: entry.name, source });
    }
  }
  return items;
}

router.get('/media', adminAuth, asyncHandler(async (_req, res) => {
  const uploads = listFilesInDir(UPLOAD_DIR, '/uploads');
  const library = listFilesInDir(PUBLIC_IMAGES_DIR, '/images');
  let galleryRows = [];
  try {
    const result = await query(`select distinct src as url from public.gallery_items where src is not null and src <> '' order by src`);
    galleryRows = result.rows.map((row) => {
      const url = normalizeImageUrl(row.url);
      return { url, name: path.basename(url), source: 'gallery' };
    });
  } catch { galleryRows = []; }
  const seen = new Set();
  res.json({ items: [...uploads, ...library, ...galleryRows].filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }) });
}));

router.post('/media/upload', adminAuth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload impossible.' });
    next();
  });
}, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });
  res.status(201).json({ url: `/uploads/${req.file.filename}`, name: req.file.originalname });
});

module.exports = router;
