const express = require('express');
const { query } = require('../../config/db');
const { adminAuth } = require('../../middleware/adminAuth');

const router = express.Router();

const VALID_STATUSES = new Set(['pending', 'reviewed', 'confirmed', 'rejected', 'cancelled']);

function mapReservation(row) {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    itemType: row.item_type,
    itemId: row.item_id,
    itemName: row.item_name,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    travelDate: row.travel_date,
    travelers: row.travelers,
    stayType: row.stay_type,
    message: row.message,
    priceEstimate: row.price_estimate,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.use(adminAuth);

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const params = [];
    let sql = 'select * from public.reservations';

    if (status && status !== 'all') {
      if (!VALID_STATUSES.has(status)) {
        return res.status(400).json({ error: 'Statut invalide.' });
      }
      params.push(status);
      sql += ` where status = $${params.length}`;
    }

    sql += ' order by created_at desc';

    const result = await query(sql, params);

    res.json({
      total: result.rows.length,
      reservations: result.rows.map(mapReservation),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('select * from public.reservations where id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }

    res.json(mapReservation(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { status, admin_notes: adminNotes } = req.body;

    if (!status && adminNotes === undefined) {
      return res.status(400).json({ error: 'Aucune modification fournie.' });
    }

    if (status && !VALID_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }

    const result = await query(
      `update public.reservations
       set status = coalesce($2, status),
           admin_notes = coalesce($3, admin_notes)
       where id = $1
       returning *`,
      [req.params.id, status || null, adminNotes ?? null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }

    const reservation = mapReservation(result.rows[0]);
    console.log(`[Reservation] Mise à jour admin — ${reservation.id} → ${reservation.status}`);

    res.json({ success: true, reservation });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
