const express = require('express');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const { publishNotification } = require('../../lib/notificationService');

const router = express.Router();
router.use(adminAuth);

router.post(
  '/gallery',
  asyncHandler(async (req, res) => {
    const { titleFr, titleEn, titleAr, bodyFr, link } = req.body || {};
    const result = await publishNotification({
      contentType: 'gallery',
      contentId: 'gallery',
      titleFr: titleFr || 'Nouvelle galerie photo',
      titleEn: titleEn || 'New photo gallery',
      titleAr: titleAr || 'معرض صور جديد',
      bodyFr: bodyFr || 'De nouvelles photos viennent d\'être ajoutées.',
      bodyEn: bodyFr || 'New photos have been added.',
      bodyAr: bodyFr || 'تمت إضافة صور جديدة.',
      link: link || '/gallery',
    });
    res.status(201).json(result);
  })
);

module.exports = router;
