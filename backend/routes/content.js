const express = require('express');
const { makePublicRead } = require('../lib/crudFactory');
const { mapPlace, mapTour, mapActivity, mapStay, mapBlog } = require('../lib/mappers');

const router = express.Router();

router.use('/places', makePublicRead({ table: 'places', idColumn: 'id', mapRow: mapPlace, orderBy: 'name asc' }));
router.use('/tours', makePublicRead({ table: 'tours', idColumn: 'id', mapRow: mapTour, orderBy: 'id asc' }));
router.use('/activities', makePublicRead({ table: 'activities', idColumn: 'id', mapRow: mapActivity, orderBy: 'name asc' }));
router.use('/stays', makePublicRead({ table: 'stays', idColumn: 'id', mapRow: mapStay, orderBy: 'name asc' }));
router.use('/blog', makePublicRead({ table: 'blog_posts', idColumn: 'slug', mapRow: mapBlog, orderBy: 'id desc' }));

module.exports = router;
