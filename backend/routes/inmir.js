const express = require('express');
const { query } = require('../config/db');
const { createRateLimiter } = require('../middleware/rateLimit');
const { isValidPhone } = require('../lib/phone');
const { sendMail, isMailConfigured } = require('../lib/mail');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const limiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CONTACT_RATE_LIMIT) || 5,
  message: 'Trop de demandes. Réessayez dans une heure.',
});

router.post('/requests', limiter, async (req, res, next) => {
  try {
    const body = req.body || {};
    if (String(body.website || '').trim()) {
      return res.status(201).json({ success: true, saved: true });
    }

    const TYPES = [
      'Billetterie aérienne & maritime',
      'Rendez-vous visa',
      'Dossier de visa',
      'Séjours organisés & circuits',
    ];
    const type = String(body.type || '').trim();
    const destination = String(body.destination || '').trim();
    const voyage = String(body.voyage || '').trim() || (type && destination ? `${type} — ${destination}` : type);
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const message = String(body.message || '').trim();
    const departure = String(body.departure_date || '').trim();
    const returnDate = String(body.return_date || '').trim();
    const adults = body.adults == null || body.adults === '' ? Number(body.persons) : Number(body.adults);
    const children = body.children == null || body.children === '' ? 0 : Number(body.children);
    const travelers = adults + children;

    if (type && !TYPES.includes(type)) return res.status(400).json({ error: 'Choisissez un type de voyage.' });
    if (!voyage) return res.status(400).json({ error: 'Choisissez un voyage.' });
    if (!destination) return res.status(400).json({ error: 'Indiquez la destination.' });
    if (name.length < 3) return res.status(400).json({ error: 'Indiquez votre nom et prénom.' });
    if (!isValidPhone(phone)) return res.status(400).json({ error: 'Numéro de téléphone invalide (8 chiffres minimum).' });
    if (!Number.isInteger(adults) || adults < 1 || adults > 20) {
      return res.status(400).json({ error: 'Indiquez le nombre d’adultes.' });
    }
    if (!Number.isInteger(children) || children < 0 || children > 20) {
      return res.status(400).json({ error: 'Indiquez le nombre d’enfants.' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(departure)) {
      return res.status(400).json({ error: 'Indiquez une date de départ.' });
    }
    if (returnDate && (!/^\d{4}-\d{2}-\d{2}$/.test(returnDate) || returnDate < departure)) {
      return res.status(400).json({ error: 'Le retour doit être après le départ.' });
    }
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Adresse e-mail invalide.' });

    const productId = voyage
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    const inserted = await query(
      `insert into public.inmir_requests (
         product_id, product_name, product_type, destination,
         client_name, client_phone, client_email,
         departure_date, return_date, adults, children, travelers, trip_type, message, status
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$3,$13,'pending')
       returning id`,
      [
        productId || 'voyage',
        voyage,
        type || 'organized',
        destination,
        name,
        phone,
        email ? email.toLowerCase() : null,
        departure,
        returnDate || null,
        adults,
        children,
        travelers,
        message || null,
      ]
    );

    res.status(201).json({
      success: true,
      saved: true,
      id: inserted.rows[0].id,
      message: 'Votre demande a bien été enregistrée. Inmir Voyage vous recontactera pour confirmer le voyage.',
    });

    if (isMailConfigured() && process.env.ADMIN_EMAIL) {
      const text = [
        'Nouvelle demande Inmir Voyage — en attente',
        `Voyage : ${voyage}`,
        `Destination : ${destination}`,
        `Client : ${name}`,
        `Téléphone : ${phone}`,
        `E-mail : ${email || '—'}`,
        `Voyageurs : ${adults} adulte(s), ${children} enfant(s)`,
        `Départ souhaité : ${departure}`,
        returnDate ? `Retour souhaité : ${returnDate}` : '',
        message ? `Message : ${message}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      sendMail({ to: 'inmirvoyages@gmail.com', subject: `[Inmir] Demande — ${voyage}`, text }).catch((err) => {
        console.warn('[Inmir] E-mail non envoyé :', err.message);
      });
    }
  } catch (err) {
    console.error('[Inmir]', err.message);
    if (String(err.message || '').includes('does not exist')) {
      err.status = 503;
      err.message = 'L’enregistrement est indisponible pour le moment.';
    }
    next(err);
  }
});

module.exports = router;
