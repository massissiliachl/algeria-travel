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
      links: [{ label: 'WhatsApp', url: 'https://wa.me/213557664089' }],
      session: req.body?.session || {},
      source: 'fallback',
    });
  }
});

module.exports = router;
