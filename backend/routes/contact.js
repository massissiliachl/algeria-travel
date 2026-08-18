const express = require('express');
const { query } = require('../config/db');
const { createRateLimiter } = require('../middleware/rateLimit');
const { isValidPhone } = require('../lib/phone');
const { sendContactClientEmail, sendContactAdminEmail } = require('../lib/contactEmails');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SUBJECTS = new Set(['reservation', 'information', 'devis', 'autres']);

const contactLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CONTACT_RATE_LIMIT) || 5,
  message: 'Trop de messages. Réessayez dans une heure.',
});

router.post('/', contactLimiter, async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, gdpr_consent: gdprConsent, website } = req.body;

    if (website?.trim()) {
      return res.status(201).json({
        success: true,
        message: 'Message envoyé. Nous vous répondrons sous 24h.',
      });
    }

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    }

    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide (8 chiffres minimum).' });
    }

    const normalizedSubject = subject.trim().toLowerCase();
    if (!VALID_SUBJECTS.has(normalizedSubject)) {
      return res.status(400).json({ error: 'Sujet invalide.' });
    }

    if (!gdprConsent) {
      return res.status(400).json({ error: 'Vous devez accepter la politique de confidentialité.' });
    }

    await query(
      `insert into public.contact_messages (client_name, client_email, client_phone, subject, message)
       values ($1, $2, $3, $4, $5)`,
      [name.trim(), email.trim().toLowerCase(), phone.trim(), normalizedSubject, message.trim()]
    );

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: normalizedSubject,
      message: message.trim(),
    };

    await Promise.all([
      sendContactClientEmail(payload).catch((err) => console.warn('[Mail] Contact client:', err.message)),
      sendContactAdminEmail(payload).catch((err) => console.warn('[Mail] Contact admin:', err.message)),
    ]);

    res.status(201).json({
      success: true,
      message: 'Message envoyé. Nous vous répondrons sous 24h.',
    });
  } catch (err) {
    if (err.message?.includes('relation "public.contact_messages" does not exist')) {
      err.status = 503;
      err.message = 'Table contact_messages absente — lancez npm run migrate dans backend/';
    }
    next(err);
  }
});

module.exports = router;
