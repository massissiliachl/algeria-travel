const express = require('express');
const { query } = require('../../config/db');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const { makeAdminCrud } = require('../../lib/crudFactory');
const {
  mapPlace, mapTour, mapActivity, mapStay, mapBlog, mapGallery,
  makeBuilders, placeFields, tourFields, activityFields, stayFields, blogFields, galleryFields,
} = require('../../lib/mappers');

const router = express.Router();

router.get(
  '/stats',
  adminAuth,
  asyncHandler(async (req, res) => {
    const [reservations, tours, activities, stays, blog, places, gallery] = await Promise.all([
      query(`select status, count(*)::int as count from public.reservations group by status`),
      query(`select count(*)::int as count from public.tours`),
      query(`select count(*)::int as count from public.activities`),
      query(`select count(*)::int as count from public.stays`),
      query(`select count(*)::int as count from public.blog_posts`),
      query(`select count(*)::int as count from public.places`),
      query(`select count(*)::int as count from public.gallery_items`),
    ]);

    const byStatus = Object.fromEntries(reservations.rows.map((r) => [r.status, r.count]));
    res.json({
      reservations: {
        total: Object.values(byStatus).reduce((a, b) => a + b, 0),
        pending: byStatus.pending || 0,
        confirmed: byStatus.confirmed || 0,
        rejected: byStatus.rejected || 0,
        byStatus,
      },
      tours: tours.rows[0].count,
      activities: activities.rows[0].count,
      stays: stays.rows[0].count,
      blogPosts: blog.rows[0].count,
      places: places.rows[0].count,
      gallery: gallery.rows[0].count,
    });
  })
);

router.post(
  '/auth/verify',
  asyncHandler(async (req, res) => {
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey) return res.status(503).json({ valid: false, error: 'Admin non configuré.' });

    const key = req.body?.key || req.headers['x-admin-key'];
    if (!key || key !== adminKey) return res.status(401).json({ valid: false });

    res.json({ valid: true });
  })
);

const placeCrud = makeAdminCrud({
  table: 'places',
  idColumn: 'id',
  mapRow: mapPlace,
  orderBy: 'name asc',
  notifyContentType: 'places',
  ...makeBuilders(placeFields, { requireId: true }),
});

const tourCrud = makeAdminCrud({
  table: 'tours',
  idColumn: 'id',
  mapRow: mapTour,
  orderBy: 'id asc',
  notifyContentType: 'tours',
  ...makeBuilders(tourFields),
});

const activityCrud = makeAdminCrud({
  table: 'activities',
  idColumn: 'id',
  mapRow: mapActivity,
  orderBy: 'name asc',
  notifyContentType: 'activities',
  ...makeBuilders(activityFields, { requireId: true }),
});

const stayCrud = makeAdminCrud({
  table: 'stays',
  idColumn: 'id',
  mapRow: mapStay,
  orderBy: 'name asc',
  notifyContentType: 'stays',
  ...makeBuilders(stayFields, { requireId: true }),
});

const blogCrud = makeAdminCrud({
  table: 'blog_posts',
  idColumn: 'id',
  mapRow: mapBlog,
  orderBy: 'id desc',
  notifyContentType: 'blog_posts',
  ...makeBuilders(blogFields),
});

const galleryCrud = makeAdminCrud({
  table: 'gallery_items',
  idColumn: 'id',
  mapRow: mapGallery,
  orderBy: 'sort_order asc, id asc',
  notifyContentType: 'gallery',
  ...makeBuilders(galleryFields),
});

router.use('/places', placeCrud);
router.use('/tours', tourCrud);
router.use('/activities', activityCrud);
router.use('/stays', stayCrud);
router.use('/blog', blogCrud);
router.use('/gallery', galleryCrud);
router.use('/notifications', require('./notifications'));

module.exports = router;
