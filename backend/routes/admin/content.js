const express = require('express');
const { query } = require('../../config/db');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const { getFavoriteStats } = require('../../lib/favoriteStats');
const { getPendingCount } = require('../../lib/comments');
const { makeAdminCrud } = require('../../lib/crudFactory');
const {
  mapPlace, mapTour, mapActivity, mapStay, mapBlog, mapGallery,
  makeBuilders, placeFields, tourFields, activityFields, stayFields, blogFields, galleryFields,
} = require('../../lib/mappers');

const router = express.Router();

async function safeQuery(sql, params = []) {
  try {
    return await query(sql, params);
  } catch (err) {
    console.error('[admin/stats]', err.message);
    return null;
  }
}

router.get(
  '/stats',
  adminAuth,
  asyncHandler(async (req, res) => {
    const [reservations, tours, activities, stays, hotels, blog, places, gallery, contactMessages] = await Promise.all([
      safeQuery(`select status, count(*)::int as count from public.reservations group by status`),
      safeQuery(`select count(*)::int as count from public.tours`),
      safeQuery(`select count(*)::int as count from public.activities`),
      safeQuery(`select count(*)::int as count from public.stays`),
      safeQuery(`select count(*)::int as count from public.stays where type = 'hotel'`),
      safeQuery(`select count(*)::int as count from public.blog_posts`),
      safeQuery(`select count(*)::int as count from public.places`),
      safeQuery(`select count(*)::int as count from public.gallery_items`),
      safeQuery(
        `select
           count(*)::int as total,
           count(*) filter (where read_at is null)::int as unread
         from public.contact_messages`
      ),
    ]);

    const byStatus = Object.fromEntries((reservations?.rows || []).map((r) => [r.status, r.count]));
    let favorites;
    let commentsPending = 0;
    try {
      favorites = await getFavoriteStats();
    } catch (err) {
      console.error('[admin/stats] favorites:', err.message);
      favorites = {
        ready: false,
        message: err.message || 'Statistiques favoris indisponibles.',
        totals: { favorites: 0, uniqueVisitors: 0 },
        byType: {},
        topActivities: [],
        topHotels: [],
        topTours: [],
      };
    }
    try {
      commentsPending = await getPendingCount();
    } catch (err) {
      console.error('[admin/stats] comments:', err.message);
    }
    res.json({
      reservations: {
        total: Object.values(byStatus).reduce((a, b) => a + b, 0),
        pending: byStatus.pending || 0,
        confirmed: byStatus.confirmed || 0,
        rejected: byStatus.rejected || 0,
        byStatus,
      },
      tours: tours?.rows?.[0]?.count ?? 0,
      activities: activities?.rows?.[0]?.count ?? 0,
      stays: stays?.rows?.[0]?.count ?? 0,
      hotels: hotels?.rows?.[0]?.count ?? 0,
      blogPosts: blog?.rows?.[0]?.count ?? 0,
      places: places?.rows?.[0]?.count ?? 0,
      gallery: gallery?.rows?.[0]?.count ?? 0,
      contactMessages: {
        total: contactMessages?.rows?.[0]?.total ?? 0,
        unread: contactMessages?.rows?.[0]?.unread ?? 0,
      },
      favorites,
      commentsPending,
    });
  })
);

router.post(
  '/auth/verify',
  asyncHandler(async (req, res) => {
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey) return res.status(503).json({ valid: false, error: 'Admin non configuré.' });

    const key = (req.body?.key || req.headers['x-admin-key'] || '').trim();
    if (!key || key !== adminKey.trim()) {
      return res.status(401).json({ valid: false, error: 'Clé admin incorrecte.' });
    }

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

const hotelCrud = makeAdminCrud({
  table: 'stays',
  idColumn: 'id',
  mapRow: mapStay,
  orderBy: 'name asc',
  notifyContentType: 'hotels',
  fixedWhere: "type = 'hotel'",
  insertDefaults: { type: 'hotel' },
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
router.use('/hotels', hotelCrud);
router.use('/blog', blogCrud);
router.use('/gallery', galleryCrud);
router.use('/notifications', require('./notifications'));

module.exports = router;
