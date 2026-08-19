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

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(UPLOAD_DIR);
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, '-')
      .replace(/-+/g, '-')
      .slice(0, 48) || 'image';
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Seules les images sont autorisées.'));
  },
});

function listFilesInDir(dir, urlPrefix) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(name))
    .map((name) => {
      const filePath = path.join(dir, name);
      const stat = fs.statSync(filePath);
      return {
        url: `${urlPrefix}/${name}`,
        name,
        source: urlPrefix === '/uploads' ? 'upload' : 'library',
        updatedAt: stat.mtime.toISOString(),
      };
    });
}

router.get(
  '/media',
  adminAuth,
  asyncHandler(async (_req, res) => {
    const uploads = listFilesInDir(UPLOAD_DIR, '/uploads');
    const library = listFilesInDir(PUBLIC_IMAGES_DIR, '/images');

    let galleryRows = [];
    try {
      const result = await query(
        `select distinct src as url from public.gallery_items where src is not null and src <> '' order by src`
      );
      galleryRows = result.rows.map((row) => ({
        url: row.url,
        name: path.basename(row.url),
        source: 'gallery',
        updatedAt: null,
      }));
    } catch {
      galleryRows = [];
    }

    const seen = new Set();
    const items = [...uploads, ...library, ...galleryRows]
      .filter((item) => {
        if (seen.has(item.url)) return false;
        seen.add(item.url);
        return true;
      })
      .sort((a, b) => {
        if (a.updatedAt && b.updatedAt) return b.updatedAt.localeCompare(a.updatedAt);
        return a.url.localeCompare(b.url);
      });

    res.json({ items });
  })
);

router.post(
  '/media/upload',
  adminAuth,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload impossible.' });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu.' });
    }

    res.status(201).json({
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
    });
  }
);

module.exports = router;
