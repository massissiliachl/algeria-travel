const express = require('express');
const { query } = require('../../config/db');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');

const router = express.Router();

function mapMessage(row) {
  return {
    id: row.id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    subject: row.subject,
    message: row.message,
    readAt: row.read_at,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
  };
}

router.use(adminAuth);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const result = await query(
      `select
         count(*)::int as total,
         count(*) filter (where read_at is null)::int as unread
       from public.contact_messages`
    );
    const row = result.rows[0] || { total: 0, unread: 0 };
    res.json({ total: row.total, unread: row.unread });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status = 'all' } = req.query;
    const params = [];
    let sql = 'select * from public.contact_messages';

    if (status === 'unread') {
      sql += ' where read_at is null';
    } else if (status === 'read') {
      sql += ' where read_at is not null';
    }

    sql += ' order by created_at desc';

    const result = await query(sql, params);
    res.json({ messages: result.rows.map(mapMessage) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await query('select * from public.contact_messages where id = $1', [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Message introuvable.' });
    }
    res.json(mapMessage(result.rows[0]));
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { read, admin_notes: adminNotes } = req.body || {};
    const sets = [];
    const params = [];

    if (read === true) {
      params.push(new Date().toISOString());
      sets.push(`read_at = coalesce(read_at, $${params.length})`);
    } else if (read === false) {
      sets.push('read_at = null');
    }

    if (adminNotes !== undefined) {
      params.push(adminNotes || null);
      sets.push(`admin_notes = $${params.length}`);
    }

    if (!sets.length) {
      return res.status(400).json({ error: 'Aucune modification demandée.' });
    }

    params.push(req.params.id);
    const result = await query(
      `update public.contact_messages set ${sets.join(', ')} where id = $${params.length} returning *`,
      params
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Message introuvable.' });
    }

    res.json(mapMessage(result.rows[0]));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await query('delete from public.contact_messages where id = $1 returning id', [
      req.params.id,
    ]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Message introuvable.' });
    }
    res.json({ ok: true });
  })
);

module.exports = router;
