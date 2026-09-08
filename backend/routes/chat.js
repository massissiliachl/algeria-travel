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
  const lang = ['fr', 'en', 'ar'].includes(req.query.lang) ? req.query.lang : 'fr';
  res.json({
    reply: getWelcome(lang),
    suggestions: getSuggestions(lang),
    links: [{ label: lang === 'en' ? 'Taghit offer' : lang === 'ar' ? 'عرض تاغيت' : 'Offre Taghit', url: '/place/taghit?pkg=hotel' }],
  });
});

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
    next(err);
  }
});

module.exports = router;
