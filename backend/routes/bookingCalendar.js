const express = require('express');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/adminAuth');
const { asyncHandler } = require('../lib/asyncHandler');
const { audit } = require('../lib/audit');
const { isValidKey, getCalendar, publicView, normalizePeriods, mapRow } = require('../lib/bookingCalendar');

const ADMIN = { type: 'admin', id: 'admin', label: 'Admin' };

/** GET /api/booking-calendar/:key — dates réservables d’une destination ou d’une formule */
const publicRouter = express.Router();
publicRouter.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const key = String(req.params.key).toLowerCase();
    if (!isValidKey(key)) return res.status(400).json({ success: false, message: 'Clé invalide.' });
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: publicView(await getCalendar(key)) });
  })
);

/** /api/admin/booking-calendar — lecture et réglage des calendriers */
const adminRouter = express.Router();
adminRouter.use(requireAdmin);

adminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await query('select * from public.booking_calendars order by key');
    res.json({ success: true, data: result.rows.map((r) => mapRow(r)) });
  })
);

adminRouter.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const key = String(req.params.key).toLowerCase();
    if (!isValidKey(key)) return res.status(400).json({ success: false, message: 'Clé invalide.' });
    const result = await query('select * from public.booking_calendars where key = $1', [key]);
    res.json({ success: true, data: mapRow(result.rows[0], key) });
  })
);

adminRouter.put(
  '/:key',
  asyncHandler(async (req, res) => {
    const key = String(req.params.key).toLowerCase();
    if (!isValidKey(key)) return res.status(400).json({ success: false, message: 'Clé invalide.' });
    const body = req.body || {};
    const mode = body.mode === 'fixed' ? 'fixed' : 'open';
    let periods;
    let blocked;
    try {
      periods = normalizePeriods(body.periods || [], 'Séjours');
      blocked = normalizePeriods(body.blocked || [], 'Dates bloquées');
    } catch (err) {
      return res.status(err.status || 400).json({ success: false, message: err.message });
    }
    if (mode === 'fixed' && !periods.length) {
      return res.status(400).json({ success: false, message: 'Ajoutez au moins un séjour, ou passez en « dates libres ».' });
    }
    const result = await query(
      `insert into public.booking_calendars (key, mode, periods, blocked, updated_by, updated_at)
       values ($1, $2, $3::jsonb, $4::jsonb, 'admin', now())
       on conflict (key) do update set mode = excluded.mode, periods = excluded.periods, blocked = excluded.blocked,
         updated_by = 'admin', updated_at = now()
       returning *`,
      [key, mode, JSON.stringify(periods), JSON.stringify(blocked)]
    );
    await audit(ADMIN, 'booking_calendar.update', 'booking_calendar', key, { mode, periods: periods.length, blocked: blocked.length });
    res.json({ success: true, data: mapRow(result.rows[0]) });
  })
);

/** Supprime le réglage propre (la formule reprend celui de la destination, ou dates libres) */
adminRouter.delete(
  '/:key',
  asyncHandler(async (req, res) => {
    const key = String(req.params.key).toLowerCase();
    if (!isValidKey(key)) return res.status(400).json({ success: false, message: 'Clé invalide.' });
    await query('delete from public.booking_calendars where key = $1', [key]);
    await audit(ADMIN, 'booking_calendar.reset', 'booking_calendar', key);
    res.json({ success: true, data: { key } });
  })
);

module.exports = { publicRouter, adminRouter };
