const express = require('express');
const { adminAuth } = require('../../middleware/adminAuth');
const { asyncHandler } = require('../../lib/asyncHandler');
const store = require('../../lib/chatbot/store');

const router = express.Router();
router.use(adminAuth);

/** GET /api/admin/chat/conversations?status=NEW|IN_PROGRESS|RESOLVED&q=&limit=&offset= */
router.get(
  '/conversations',
  asyncHandler(async (req, res) => {
    const data = await store.listConversations({
      status: String(req.query.status || '').toUpperCase(),
      q: req.query.q,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    res.json({ success: true, ...data });
  })
);

router.get(
  '/conversations/:id',
  asyncHandler(async (req, res) => {
    const data = await store.getConversationDetail(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: 'Conversation introuvable.' });
    res.json({ success: true, ...data });
  })
);

/** PATCH { status?: 'NEW'|'IN_PROGRESS'|'RESOLVED', humanRequested?: boolean } */
router.patch(
  '/conversations/:id',
  asyncHandler(async (req, res) => {
    const status = req.body?.status ? String(req.body.status).toUpperCase() : undefined;
    const humanRequested = typeof req.body?.humanRequested === 'boolean' ? req.body.humanRequested : undefined;
    const conv = await store.updateConversation(req.params.id, { status, humanRequested });
    if (!conv) return res.status(404).json({ success: false, error: 'Conversation introuvable.' });
    res.json({ success: true, conversation: conv });
  })
);

/** Réponse d’un conseiller : visible par le client dans le widget. */
router.post(
  '/conversations/:id/messages',
  asyncHandler(async (req, res) => {
    const body = typeof req.body?.body === 'string' ? req.body.body.trim().slice(0, 2000) : '';
    if (!body) return res.status(400).json({ success: false, error: 'Message requis.' });
    const conv = await store.getConversation(req.params.id);
    if (!conv) return res.status(404).json({ success: false, error: 'Conversation introuvable.' });
    const message = await store.addAgentMessage(conv.id, body);
    res.status(201).json({ success: true, message });
  })
);

/** PATCH /requests/:id { status: pending|contacted|confirmed|cancelled|closed } */
router.patch(
  '/requests/:id',
  asyncHandler(async (req, res) => {
    const reqRow = await store.updateRequest(req.params.id, String(req.body?.status || '').toLowerCase());
    if (!reqRow) return res.status(400).json({ success: false, error: 'Demande ou statut invalide.' });
    res.json({ success: true, request: reqRow });
  })
);

module.exports = router;
