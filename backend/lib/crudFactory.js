const express = require('express');
const { query } = require('../config/db');
const { adminAuth } = require('../middleware/adminAuth');
const { asyncHandler } = require('./asyncHandler');

const RESERVED = new Set(['desc', 'group']);

function q(col) {
  return RESERVED.has(col) ? `"${col}"` : col;
}

function makeAdminCrud({
  table,
  idColumn,
  mapRow,
  buildInsert,
  buildUpdate,
  orderBy = 'created_at desc',
  notifyContentType = null,
}) {
  const router = express.Router();
  router.use(adminAuth);

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const result = await query(`select * from public.${table} order by ${orderBy}`);
      res.json({ total: result.rows.length, items: result.rows.map(mapRow) });
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const result = await query(`select * from public.${table} where ${idColumn} = $1`, [req.params.id]);
      if (!result.rows.length) return res.status(404).json({ error: 'Introuvable.' });
      res.json(mapRow(result.rows[0]));
    })
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const { columns, values } = buildInsert(req.body);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const result = await query(
        `insert into public.${table} (${columns.map(q).join(', ')}) values (${placeholders}) returning *`,
        values
      );
      const row = result.rows[0];
      if (notifyContentType && row.published !== false) {
        const { notifyContentPublished } = require('./contentNotify');
        notifyContentPublished(notifyContentType, row).catch((err) =>
          console.error('[notify]', err.message)
        );
      }
      res.status(201).json(mapRow(row));
    })
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const prev = await query(`select published from public.${table} where ${idColumn} = $1`, [
        req.params.id,
      ]);
      const { columns, values } = buildUpdate(req.body);
      if (!columns.length) return res.status(400).json({ error: 'Aucune donnée à mettre à jour.' });
      const sets = columns.map((col, i) => `${q(col)} = $${i + 1}`).join(', ');
      values.push(req.params.id);
      const result = await query(
        `update public.${table} set ${sets} where ${idColumn} = $${values.length} returning *`,
        values
      );
      if (!result.rows.length) return res.status(404).json({ error: 'Introuvable.' });
      const row = result.rows[0];
      const wasPublished = prev.rows[0]?.published === true;
      if (notifyContentType && row.published !== false && !wasPublished) {
        const { notifyContentPublished } = require('./contentNotify');
        notifyContentPublished(notifyContentType, row).catch((err) =>
          console.error('[notify]', err.message)
        );
      }
      res.json(mapRow(row));
    })
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const result = await query(`delete from public.${table} where ${idColumn} = $1 returning ${idColumn}`, [
        req.params.id,
      ]);
      if (!result.rows.length) return res.status(404).json({ error: 'Introuvable.' });
      res.json({ success: true, id: result.rows[0][idColumn] });
    })
  );

  return router;
}

function makePublicRead({ table, idColumn, mapRow, orderBy = 'created_at desc' }) {
  const router = express.Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      let sql = `select * from public.${table}`;
      const params = [];
      const conditions = [];

      if (req.query.category) {
        params.push(req.query.category);
        conditions.push(`category = $${params.length}`);
      }
      if (req.query.type) {
        params.push(req.query.type);
        conditions.push(`type = $${params.length}`);
      }
      if (req.query.place) {
        params.push(req.query.place);
        conditions.push(`place_id = $${params.length}`);
      }

      conditions.push('coalesce(published, true) = true');
      sql += ` where ${conditions.join(' and ')} order by ${orderBy}`;

      const result = await query(sql, params);
      res.json(result.rows.map(mapRow));
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const col = idColumn === 'slug' ? 'slug' : idColumn;
      const result = await query(
        `select * from public.${table} where ${col} = $1 and coalesce(published, true) = true`,
        [req.params.id]
      );
      if (!result.rows.length) return res.status(404).json({ error: 'Introuvable.' });
      res.json(mapRow(result.rows[0]));
    })
  );

  return router;
}

module.exports = { makeAdminCrud, makePublicRead };
