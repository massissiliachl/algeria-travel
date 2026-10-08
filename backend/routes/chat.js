const express = require('express');
const { createRateLimiter } = require('../middleware/rateLimit');
const { chat } = require('../lib/chatEngine');
const { getWelcome, getSuggestions } = require('../lib/chatKnowledge');

const router = express.Router();

const chatLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CHAT_RATE_LIMIT) || 40,
  message: 'Trop de messages au chatbot. Réessayez dans une heure.',
});

router.get('/welcome', (req, res) => {
  try {
    const lang = ['fr', 'en', 'ar'].includes(req.query.lang) ? req.query.lang : 'fr';
    res.json({
      reply: getWelcome(lang),
      suggestions: getSuggestions(lang),
      links: [{ label: lang === 'en' ? 'Taghit offer' : lang === 'ar' ? 'عرض تاغيت' : 'Offre Taghit', url: '/place/taghit?pkg=hotel' }],
    });
  } catch (err) {
    console.error('[Chat] welcome error:', err.message);
    res.status(500).json({ error: 'Chat indisponible temporairement.' });
  }
});

/* ── Chatbot client (widget du site) ── */

const bot = require('../lib/chatbot');

const botIpLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CHATBOT_RATE_LIMIT) || 600,
  message: 'Trop de messages. Réessayez un peu plus tard.',
});
const botCreateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CHATBOT_CONVERSATION_LIMIT) || 120,
  message: 'Trop de conversations ouvertes. Réessayez plus tard.',
});
const botRequestLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Trop de demandes envoyées. Réessayez plus tard.',
});

/** Anti-spam par conversation : cadence, volume, répétitions. */
const convActivity = new Map();
setInterval(() => {
  const cutoff = Date.now() - 6 * 60 * 60 * 1000;
  for (const [id, a] of convActivity) if (a.last < cutoff) convActivity.delete(id);
}, 30 * 60 * 1000).unref();

function conversationAbuse(conversationId, text) {
  if (!conversationId) return null;
  const now = Date.now();
  const a = convActivity.get(conversationId) || { last: 0, window: now, count: 0, lastText: '', repeats: 0 };
  if (now - a.window > 5 * 60 * 1000) {
    a.window = now;
    a.count = 0;
  }
  a.count += 1;
  a.repeats = text === a.lastText ? a.repeats + 1 : 0;
  const tooFast = now - a.last < 400;
  a.last = now;
  a.lastText = text;
  convActivity.set(conversationId, a);
  if (tooFast) return 'Doucement 🙂 Un message à la fois.';
  if (a.count > (Number(process.env.CHATBOT_CONVERSATION_RATE) || 40)) return 'Trop de messages en peu de temps. Patientez quelques minutes.';
  if (a.repeats >= 4) return 'Message répété. Reformulez votre demande ou contactez-nous sur WhatsApp.';
  return null;
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^\+?[\d\s.()-]{8,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.post('/conversations', botCreateLimiter, async (req, res) => {
  try {
    const out = await bot.startConversation({
      language: req.body?.language,
      pageUrl: str(req.body?.pageUrl, 300) || null,
      userAgent: str(req.get('user-agent'), 300) || null,
    });
    res.status(201).json({ success: true, ...out });
  } catch (err) {
    console.error('[Chatbot] conversation :', err.message);
    res.status(500).json({ success: false, error: 'Chat indisponible temporairement.' });
  }
});

router.get('/conversations/:id', botIpLimiter, async (req, res) => {
  try {
    const conv = await bot.store.getConversation(req.params.id);
    if (!conv) return res.status(404).json({ success: false, error: 'Conversation introuvable.' });
    const messages = await bot.store.getMessages(conv.id, { afterId: Number(req.query.after) || 0, limit: 200 });
    res.json({
      success: true,
      conversation: { id: conv.id, status: conv.status, language: conv.language, humanRequested: Boolean(conv.human_requested) },
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        body: m.body,
        intent: m.intent,
        suggestions: m.meta?.suggestions || [],
        links: m.meta?.links || [],
        createdAt: m.created_at,
      })),
    });
  } catch (err) {
    console.error('[Chatbot] historique :', err.message);
    res.status(500).json({ success: false, error: 'Historique indisponible.' });
  }
});

router.post('/message', botIpLimiter, async (req, res) => {
  const language = bot.langOf(req.body?.language);
  const { text, error } = bot.cleanMessage(req.body?.message);
  if (error) return res.status(400).json({ success: false, error });
  const conversationId = bot.store.isUuid(req.body?.conversationId) ? req.body.conversationId : null;
  const abuse = conversationAbuse(conversationId, text);
  if (abuse) return res.status(429).json({ success: false, error: abuse });
  try {
    const out = await bot.processMessage({
      conversationId,
      message: text,
      language,
      pageUrl: str(req.body?.pageUrl, 300) || null,
      userAgent: str(req.get('user-agent'), 300) || null,
    });
    res.json({ success: true, ...out });
  } catch (err) {
    console.error('[Chatbot] message :', err.message);
    const reply = language === 'en'
      ? 'The assistant is temporarily unavailable. Contact us on WhatsApp: +33 6 19 50 17 08.'
      : language === 'ar'
        ? 'المساعد غير متاح مؤقتاً. تواصل معنا عبر واتساب: ‎+33 6 19 50 17 08'
        : 'L’assistant est momentanément indisponible. Contactez-nous sur WhatsApp : +33 6 19 50 17 08.';
    res.status(200).json({ success: false, reply, intent: 'ERROR', conversationId, suggestions: [], links: [{ label: 'WhatsApp', url: 'https://wa.me/33619501708' }] });
  }
});

router.post('/contact', botRequestLimiter, async (req, res) => {
  try {
    const name = str(req.body?.name, 80);
    const phone = str(req.body?.phone, 30);
    const email = str(req.body?.email, 120).toLowerCase();
    const message = str(req.body?.message, 1000);
    if (!phone && !email) return res.status(400).json({ success: false, error: 'Téléphone ou email requis.' });
    if (phone && !PHONE_RE.test(phone)) return res.status(400).json({ success: false, error: 'Téléphone invalide.' });
    if (email && !EMAIL_RE.test(email)) return res.status(400).json({ success: false, error: 'Email invalide.' });
    const conversationId = bot.store.isUuid(req.body?.conversationId) ? req.body.conversationId : null;
    const { reference } = await bot.store.createRequest(conversationId, 'contact', { name, phone, email, note: message || null });
    res.status(201).json({ success: true, reference, status: 'pending' });
  } catch (err) {
    console.error('[Chatbot] contact :', err.message);
    res.status(500).json({ success: false, error: 'Demande non enregistrée. Contactez-nous sur WhatsApp.' });
  }
});

router.post('/booking-request', botRequestLimiter, async (req, res) => {
  try {
    const b = req.body || {};
    const name = str(b.name, 80);
    const phone = str(b.phone, 30);
    const email = str(b.email, 120).toLowerCase();
    const persons = Number(b.persons);
    const startDate = str(b.startDate, 10);
    const endDate = str(b.endDate, 10);
    if (!name || !phone) return res.status(400).json({ success: false, error: 'Nom et téléphone requis.' });
    if (!PHONE_RE.test(phone)) return res.status(400).json({ success: false, error: 'Téléphone invalide.' });
    if (email && !EMAIL_RE.test(email)) return res.status(400).json({ success: false, error: 'Email invalide.' });
    if (!Number.isInteger(persons) || persons < 1 || persons > 50) return res.status(400).json({ success: false, error: 'Nombre de personnes invalide.' });
    if ((startDate && !DATE_RE.test(startDate)) || (endDate && !DATE_RE.test(endDate))) return res.status(400).json({ success: false, error: 'Date invalide (AAAA-MM-JJ).' });
    if (!str(b.itemKey, 60) && !str(b.itemName, 160)) return res.status(400).json({ success: false, error: 'Offre requise.' });
    const conversationId = bot.store.isUuid(b.conversationId) ? b.conversationId : null;
    const { reference } = await bot.store.createRequest(conversationId, 'booking', {
      itemKey: str(b.itemKey, 60) || null,
      itemName: str(b.itemName, 160) || null,
      startDate: startDate || null,
      endDate: endDate || null,
      persons,
      rooms: Number.isInteger(Number(b.rooms)) && Number(b.rooms) > 0 ? Number(b.rooms) : null,
      name,
      phone,
      email: email || null,
      notes: str(b.notes, 500) || null,
    });
    res.status(201).json({ success: true, reference, status: 'pending', confirmed: false, message: 'Demande enregistrée — ce n’est pas encore une réservation confirmée.' });
  } catch (err) {
    console.error('[Chatbot] booking-request :', err.message);
    res.status(500).json({ success: false, error: 'Demande non enregistrée. Contactez-nous sur WhatsApp.' });
  }
});

/* ── Ancien assistant (POST /api/chat) ── */

router.post('/', chatLimiter, async (req, res, next) => {
  try {
    const { message, lang = 'fr', history = [], session = {} } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message requis.' });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ error: 'Message trop long (2000 caractères max).' });
    }

    const safeHistory = Array.isArray(history)
      ? history.slice(-10).map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 2000),
        }))
      : [];

    const result = await chat(message.trim(), lang, safeHistory, session);
    res.json(result);
  } catch (err) {
    console.error('[Chat] message error:', err.message);
    const lang = ['fr', 'en', 'ar'].includes(req.body?.lang) ? req.body.lang : 'fr';
    const fallback = lang === 'en'
      ? 'The assistant is temporarily unavailable. Please try again in a moment or contact us on WhatsApp.'
      : lang === 'ar'
        ? 'المساعد غير متاح مؤقتاً. أعد المحاولة أو تواصل معنا عبر WhatsApp.'
        : 'L\'assistant est momentanément indisponible. Réessayez dans un instant ou contactez-nous sur WhatsApp.';
    res.status(200).json({
      reply: fallback,
      suggestions: getSuggestions(lang),
      links: [{ label: 'WhatsApp', url: 'https://wa.me/33619501708' }],
      session: req.body?.session || {},
      source: 'fallback',
    });
  }
});

module.exports = router;
