const express = require('express');
const { query } = require('../config/db');
const { createRateLimiter } = require('../middleware/rateLimit');
const { generateReferenceCode, generateAccessToken, hashAccessToken } = require('../lib/reservationTokens');
const { validateReservationItem } = require('../lib/validateReservationItem');
const { isValidPhone } = require('../lib/phone');
const { calcBookingTotal } = require('../lib/bookingPrice');
const { isValidPaymentMethod, normalizePaymentMethod } = require('../lib/paymentMethod');
const {
  sendReservationClientEmail,
  sendReservationAdminEmail,
} = require('../lib/reservationEmails');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ITEM_TYPES = new Set(['place', 'tour', 'activity', 'stay']);
const VALID_STAY_TYPES = new Set(['hotel', 'guesthouse', 'camp']);

const reservationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RESERVATION_RATE_LIMIT) || 5,
  message: 'Trop de demandes de réservation. Réessayez dans une heure.',
});

function mapPublicTrack(row) {
  return {
    referenceCode: row.reference_code,
    status: row.status,
    itemName: row.item_name,
    itemType: row.item_type,
    travelDate: row.travel_date,
    travelers: row.travelers,
    createdAt: row.created_at,
  };
}

async function createUniqueReference() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const referenceCode = generateReferenceCode();
    const exists = await query('select 1 from public.reservations where reference_code = $1', [referenceCode]);
    if (!exists.rows.length) return referenceCode;
  }
  throw Object.assign(new Error('Impossible de générer une référence unique.'), { status: 500 });
}

router.get('/track', async (req, res, next) => {
  try {
    const ref = req.query.ref?.trim().toUpperCase();
    const token = req.query.token?.trim();

    if (!ref || !token) {
      return res.status(400).json({ error: 'Référence et token requis.' });
    }

    const result = await query(
      `select reference_code, status, item_name, item_type, travel_date, travelers, created_at, access_token_hash
       from public.reservations
       where reference_code = $1`,
      [ref]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }

    const row = result.rows[0];
    const tokenHash = hashAccessToken(token);

    if (!row.access_token_hash || row.access_token_hash !== tokenHash) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    res.json(mapPublicTrack(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', reservationLimiter, async (req, res, next) => {
  try {
    const {
      item_type: itemType = 'place',
      item_id: itemId,
      item_name: itemName,
      name,
      email,
      phone,
      travel_date: travelDate,
      travelers = 1,
      stay_type: stayType,
      message,
      unit_price: unitPrice,
      price_per_person: pricePerPerson,
      price_estimate: priceEstimate,
      gdpr_consent: gdprConsent,
      payment_method: paymentMethod,
      card_holder: cardHolder,
      card_last4: cardLast4,
      card_brand: cardBrand,
      card_expiry: cardExpiry,
      website,
    } = req.body;

    if (website?.trim()) {
      return res.status(201).json({
        success: true,
        message: 'Demande de réservation envoyée. Notre équipe vous recontacte sous 24h.',
      });
    }

    if (!itemId?.trim() || !itemName?.trim()) {
      return res.status(400).json({ error: 'Destination ou circuit requis.' });
    }

    if (!name?.trim() || !email?.trim() || !travelDate) {
      return res.status(400).json({ error: 'Nom, email et date de voyage sont requis.' });
    }

    if (!phone?.trim()) {
      return res.status(400).json({ error: 'Le numéro de téléphone est requis.' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide (8 chiffres minimum).' });
    }

    if (!gdprConsent) {
      return res.status(400).json({ error: 'Vous devez accepter la politique de confidentialité.' });
    }

    if (!isValidPaymentMethod(paymentMethod)) {
      return res.status(400).json({ error: 'Veuillez choisir un moyen de paiement.' });
    }

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

    if (req.body.card_number || req.body.cvv || req.body.card_cvv) {
      return res.status(400).json({ error: 'Ne transmettez jamais le numéro complet ni le CVV via ce formulaire.' });
    }

    let cardMeta = {
      holder: null,
      last4: null,
      brand: null,
      expiry: null,
    };

    if (normalizedPaymentMethod === 'card') {
      const holder = cardHolder?.trim();
      const last4 = cardLast4?.trim();
      const brand = cardBrand?.trim().toLowerCase() || null;
      const expiry = cardExpiry?.trim();

      if (!holder || holder.length < 3) {
        return res.status(400).json({ error: 'Nom du titulaire de la carte requis.' });
      }
      if (!/^\d{4}$/.test(last4 || '')) {
        return res.status(400).json({ error: 'Informations de carte invalides.' });
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry || '')) {
        return res.status(400).json({ error: 'Date d’expiration de carte invalide.' });
      }

      cardMeta = { holder, last4, brand, expiry };
    }

    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }

    const normalizedItemType = itemType.trim().toLowerCase();
    if (!VALID_ITEM_TYPES.has(normalizedItemType)) {
      return res.status(400).json({ error: 'Type de réservation invalide.' });
    }

    const itemValid = await validateReservationItem(normalizedItemType, itemId.trim());
    if (!itemValid) {
      return res.status(400).json({ error: 'Destination ou circuit invalide.' });
    }

    const travelersCount = Number(travelers);
    if (!Number.isInteger(travelersCount) || travelersCount < 1 || travelersCount > 20) {
      return res.status(400).json({ error: 'Nombre de voyageurs invalide (1 à 20).' });
    }

    const normalizedStayType = stayType?.trim().toLowerCase() || null;
    if (normalizedStayType && !VALID_STAY_TYPES.has(normalizedStayType)) {
      return res.status(400).json({ error: 'Type d’hébergement invalide.' });
    }

    const parsedDate = new Date(travelDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Date de voyage invalide.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return res.status(400).json({ error: 'La date de voyage doit être dans le futur.' });
    }

    const perPerson = Boolean(pricePerPerson);
    const unit = unitPrice != null ? Number(unitPrice) : Number(priceEstimate);
    const computedTotal = calcBookingTotal(unit, travelersCount, perPerson);
    if (computedTotal == null) {
      return res.status(400).json({ error: 'Prix estimé invalide.' });
    }

    const referenceCode = await createUniqueReference();
    const accessToken = generateAccessToken();
    const accessTokenHash = hashAccessToken(accessToken);

    await query(
      `insert into public.reservations (
        item_type, item_id, item_name,
        client_name, client_email, client_phone,
        travel_date, travelers, stay_type, message,
        price_estimate, unit_price, price_per_person, payment_method,
        card_holder, card_last4, card_brand, card_expiry, gdpr_consent_at,
        reference_code, access_token_hash
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, now(), $19, $20)`,
      [
        normalizedItemType,
        itemId.trim(),
        itemName.trim(),
        name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        travelDate,
        travelersCount,
        normalizedStayType,
        message?.trim() || null,
        computedTotal,
        Number.isFinite(unit) ? Math.round(unit) : null,
        perPerson,
        normalizedPaymentMethod,
        cardMeta.holder,
        cardMeta.last4,
        cardMeta.brand,
        cardMeta.expiry,
        referenceCode,
        accessTokenHash,
      ]
    );

    console.log(`[Reservation] ${referenceCode} — ${itemName.trim()} (${email.trim()})`);

    const emailPayload = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      referenceCode,
      itemName: itemName.trim(),
      travelDate,
      travelers: travelersCount,
      priceEstimate: computedTotal,
      paymentMethod: normalizedPaymentMethod,
      cardLast4: cardMeta.last4,
      cardBrand: cardMeta.brand,
      accessToken,
    };

    const adminPayload = {
      referenceCode,
      itemType: normalizedItemType,
      itemName: itemName.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      travelDate,
      travelers: travelersCount,
      priceEstimate: computedTotal,
      paymentMethod: normalizedPaymentMethod,
      cardHolder: cardMeta.holder,
      cardLast4: cardMeta.last4,
      cardBrand: cardMeta.brand,
      cardExpiry: cardMeta.expiry,
      message: message?.trim() || null,
    };

    await Promise.all([
      sendReservationClientEmail(emailPayload).catch((err) =>
        console.warn('[Mail] Réservation client:', err.message)
      ),
      sendReservationAdminEmail(adminPayload).catch((err) =>
        console.warn('[Mail] Réservation admin:', err.message)
      ),
    ]);

    res.status(201).json({
      success: true,
      message: 'Demande de réservation envoyée. Notre équipe vous recontacte sous 24h.',
      referenceCode,
      accessToken,
      priceEstimate: computedTotal,
    });
  } catch (err) {
    if (err.message?.includes('relation "public.reservations" does not exist')) {
      err.status = 503;
      err.message = 'Table reservations absente — lancez npm run migrate dans backend/';
    }
    next(err);
  }
});

module.exports = router;
