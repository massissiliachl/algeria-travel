const express = require('express');
const { query } = require('../../config/db');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const {
  normalizeStatus,
  mapCommentRow,
  getPendingCount,
  handleCommentsDbError,
} = require('../../lib/comments');

const router = express.Router();

router.get(
  '/stats',
  adminAuth,
  asyncHandler(async (req, res) => {
    try {
      const pending = await getPendingCount();
      const totals = await query(
        `select status, count(*)::int as count
         from public.comments
         group by status`
      );
      const byStatus = Object.fromEntries(totals.rows.map((r) => [r.status, r.count]));
      res.json({
        pending,
        approved: byStatus.approved || 0,
        rejected: byStatus.rejected || 0,
        total: Object.values(byStatus).reduce((a, b) => a + b, 0),
      });
    } catch (err) {
      throw handleCommentsDbError(err);
    }
  })
);

router.get(
  '/',
  adminAuth,
  asyncHandler(async (req, res) => {
    try {
      const status = normalizeStatus(req.query.status) || 'pending';
      const params = [];
      let where = '';

      if (status !== 'all') {
        params.push(status);
        where = `where c.status = $${params.length}`;
      }

      const result = await query(
        `select
           c.*,
           coalesce(count(cl.id), 0)::int as likes,
           false as user_liked,
           (
             select count(*)::int from public.comments r
             where r.parent_id = c.id
           ) as reply_count
         from public.comments c
         left join public.comment_likes cl on cl.comment_id = c.id
         ${where}
         group by c.id
         order by c.created_at desc
         limit 200`,
        params
      );

      res.json({
        items: result.rows.map((row) => ({
          ...mapCommentRow(row),
          replyCount: Number(row.reply_count) || 0,
        })),
      });
    } catch (err) {
      throw handleCommentsDbError(err);
    }
  })
);

router.patch(
  '/:id',
  adminAuth,
  asyncHandler(async (req, res) => {
    try {
      const status = normalizeStatus(req.body?.status);
      if (!status || status === 'pending') {
        return res.status(400).json({ error: 'Statut approved ou rejected requis.' });
      }

      const rejectionReason =
        status === 'rejected'
          ? String(req.body?.rejection_reason ?? req.body?.rejectionReason ?? '').trim().slice(0, 500)
          : null;

      const result = await query(
        `update public.comments
         set status = $2,
             rejection_reason = $3,
             moderated_at = now(),
             updated_at = now()
         where id = $1
         returning *`,
        [req.params.id, status, rejectionReason || null]
      );

      if (!result.rows.length) {
        return res.status(404).json({ error: 'Commentaire introuvable.' });
      }

      res.json(mapCommentRow(result.rows[0]));
    } catch (err) {
      throw handleCommentsDbError(err);
    }
  })
);

router.delete(
  '/:id',
  adminAuth,
  asyncHandler(async (req, res) => {
    try {
      const result = await query(
        `delete from public.comments where id = $1 returning id`,
        [req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Commentaire introuvable.' });
      }
      res.json({ ok: true });
    } catch (err) {
      throw handleCommentsDbError(err);
    }
  })
);

module.exports = router;
