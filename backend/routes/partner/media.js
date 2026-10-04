const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { query } = require('../../config/db');
const { partnerAuth } = require('../../middleware/partnerAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const {
  CMS_DIR,
  LEGACY_UPLOAD_DIR,
  PUBLIC_IMAGES_DIR,
  ensureDir,
  sanitizeFilename,
  publicCmsUrl,
  normalizeImageUrl,
} = require('../../lib/mediaPaths');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir(CMS_DIR);
      cb(null, CMS_DIR);
    },
    filename: (_req, file, cb) => {
      cb(null, sanitizeFilename(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Seules les images sont autorisées.'));
  },
});

function listFilesInDir(dir, urlPrefix, source) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(name))
    .map((name) => ({
      url: `${urlPrefix}/${name}`,
      name,
      source,
    }));
}

router.get(
  '/',
  partnerAuth,
  asyncHandler(async (_req, res) => {
    const cms = listFilesInDir(CMS_DIR, '/images/cms', 'cms');
    const legacy = listFilesInDir(LEGACY_UPLOAD_DIR, '/uploads', 'upload');
    const library = listFilesInDir(PUBLIC_IMAGES_DIR, '/images', 'library');
    let galleryRows = [];
    try {
      const result = await query(
        `select distinct src as url from public.gallery_items where src is not null and src <> '' order by src`
      );
      galleryRows = result.rows.map((row) => ({
        url: normalizeImageUrl(row.url),
        name: path.basename(row.url),
        source: 'gallery',
      }));
    } catch {
      galleryRows = [];
    }
    const seen = new Set();
    res.json({
      items: [...cms, ...legacy, ...library, ...galleryRows].filter((item) => {
        if (seen.has(item.url)) return false;
        seen.add(item.url);
        return true;
      }),
    });
  })
);

router.post(
  '/upload',
  partnerAuth,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message || 'Upload impossible.' });
      next();
    });
  },
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });
    res.status(201).json({ url: publicCmsUrl(req.file.filename), name: req.file.originalname });
  }
);

module.exports = router;
