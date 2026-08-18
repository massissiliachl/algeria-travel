const { sendMail } = require('./mail');
const { paymentMethodLabel } = require('./paymentMethod');

const SITE = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://algeriatravel.com';
const ADMIN = process.env.ADMIN_EMAIL || 'Algeria.travel@gmail.com';
const ADMIN_PANEL = process.env.ADMIN_URL || 'http://localhost:5173';

function fmtPrice(amount) {
  if (amount == null) return '—';
  return `${Number(amount).toLocaleString('fr-DZ')} DA`;
}

function fmtCardLine({ paymentMethod, cardLast4, cardBrand }) {
  if (paymentMethod !== 'card' || !cardLast4) return null;
  const brand = cardBrand ? cardBrand.toUpperCase() : 'CARTE';
  return `Carte : ${brand} ·••• ${cardLast4}`;
}

async function sendReservationClientEmail({
  email,
  name,
  referenceCode,
  itemName,
  travelDate,
  travelers,
  priceEstimate,
  paymentMethod,
  cardLast4,
  cardBrand,
  accessToken,
}) {
  const trackUrl = `${SITE}/suivi?ref=${encodeURIComponent(referenceCode)}`;
  const isCard = paymentMethod === 'card';
  const subject = isCard
    ? `[Algeria Travel] Paiement carte enregistré — ${referenceCode}`
    : `[Algeria Travel] Demande reçue — ${referenceCode}`;
  const text = [
    `Bonjour ${name},`,
    '',
    isCard
      ? 'Nous avons bien reçu votre demande avec paiement par carte.'
      : 'Nous avons bien reçu votre demande de réservation.',
    '',
    `Référence : ${referenceCode}`,
    `Offre : ${itemName}`,
    `Date souhaitée : ${travelDate}`,
    `Voyageurs : ${travelers}`,
    `Estimation : ${fmtPrice(priceEstimate)}`,
    `Paiement : ${paymentMethodLabel(paymentMethod)}`,
    fmtCardLine({ paymentMethod, cardLast4, cardBrand }),
    isCard
      ? 'Notre équipe finalise le débit sécurisé et vous confirme la réservation sous 24h.'
      : '',
    '',
    `Suivez votre demande : ${trackUrl}`,
    `Code de suivi secret (à conserver) : ${accessToken}`,
    '',
    isCard ? 'Merci pour votre confiance.' : 'Un conseiller vous contactera sous 24h.',
    '',
    'Algeria Travel',
    SITE,
  ]
    .filter(Boolean)
    .join('\n');

  await sendMail({ to: email, subject, text });
}

async function sendReservationAdminEmail({
  referenceCode,
  itemType,
  itemName,
  name,
  email,
  phone,
  travelDate,
  travelers,
  priceEstimate,
  paymentMethod,
  cardHolder,
  cardLast4,
  cardBrand,
  cardExpiry,
  message,
}) {
  const subject = `[Algeria Travel] Nouvelle réservation ${referenceCode}`;
  const text = [
    'Nouvelle demande de réservation',
    '',
    `Référence : ${referenceCode}`,
    `Type : ${itemType}`,
    `Offre : ${itemName}`,
    `Client : ${name}`,
    `Email : ${email}`,
    `Téléphone : ${phone}`,
    `Date : ${travelDate}`,
    `Voyageurs : ${travelers}`,
    `Estimation : ${fmtPrice(priceEstimate)}`,
    `Paiement : ${paymentMethodLabel(paymentMethod)}`,
    paymentMethod === 'card' && cardHolder ? `Titulaire : ${cardHolder}` : '',
    fmtCardLine({ paymentMethod, cardLast4, cardBrand }),
    paymentMethod === 'card' && cardExpiry ? `Expiration : ${cardExpiry}` : '',
    message ? `Message : ${message}` : '',
    '',
    `Admin : ${ADMIN_PANEL}/reservations`,
  ]
    .filter(Boolean)
    .join('\n');

  await sendMail({ to: ADMIN, subject, text });
}

module.exports = { sendReservationClientEmail, sendReservationAdminEmail };
