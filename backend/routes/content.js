const express = require('express');
const { makePublicRead } = require('../lib/crudFactory');
const { mapPlace, mapTour, mapActivity, mapStay, mapBlog } = require('../lib/mappers');
const hotelAvailabilityPublic = require('./hotelAvailabilityPublic');

const router = express.Router();

router.use('/places', makePublicRead({ table: 'places', idColumn: 'id', mapRow: mapPlace, orderBy: 'name asc' }));
router.use('/tours', makePublicRead({ table: 'tours', idColumn: 'id', mapRow: mapTour, orderBy: 'id asc' }));
router.use('/activities', makePublicRead({ table: 'activities', idColumn: 'id', mapRow: mapActivity, orderBy: 'name asc' }));
const STAY_VISIBLE = `deleted_at is null and coalesce(status, 'active') = 'active'
  and (owner_id is null or exists (select 1 from public.owners o where o.id = stays.owner_id and o.status = 'active' and o.deleted_at is null))`;

router.use('/stays', makePublicRead({ table: 'stays', idColumn: 'id', mapRow: mapStay, orderBy: 'name asc', fixedWhere: STAY_VISIBLE }));
router.use('/hotels', hotelAvailabilityPublic);
router.use('/hotels', makePublicRead({
  table: 'stays',
  idColumn: 'id',
  mapRow: mapStay,
  orderBy: 'name asc',
  fixedWhere: `type = 'hotel' and ${STAY_VISIBLE}`,
  queryMap: { wilaya: 'wilaya_key' },
}));
router.use('/blog', makePublicRead({ table: 'blog_posts', idColumn: 'slug', mapRow: mapBlog, orderBy: 'id desc' }));
router.use('/gallery', require('./gallery'));

module.exports = router;
