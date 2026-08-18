const { sendMail } = require('./mail');

const SITE = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://algeriatravel.com';
const ADMIN = process.env.ADMIN_EMAIL || 'Algeria.travel@gmail.com';
const ADMIN_PANEL = process.env.ADMIN_URL || 'http://localhost:5173';

function fmtPrice(amount) {
  if (amount == null) return '—';
  return `${Number(amount).toLocaleString('fr-DZ')} DA`;
}

async function sendReservationClientEmail({
  email,
  name,
  referenceCode,
  itemName,
  travelDate,
  travelers,
  priceEstimate,
  accessToken,
}) {
  const trackUrl = `${SITE}/suivi?ref=${encodeURIComponent(referenceCode)}`;
  const subject = `[Algeria Travel] Demande reçue — ${referenceCode}`;
  const text = [
    `Bonjour ${name},`,
    '',
    'Nous avons bien reçu votre demande de réservation.',
    '',
    `Référence : ${referenceCode}`,
    `Offre : ${itemName}`,
    `Date souhaitée : ${travelDate}`,
    `Voyageurs : ${travelers}`,
    `Estimation : ${fmtPrice(priceEstimate)}`,
    '',
    `Suivez votre demande : ${trackUrl}`,
    `Code de suivi secret (à conserver) : ${accessToken}`,
    '',
    'Un conseiller vous contactera sous 24h.',
    '',
    'Algeria Travel',
    SITE,
  ].join('\n');

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
    message ? `Message : ${message}` : '',
    '',
    `Admin : ${ADMIN_PANEL}/reservations`,
  ]
    .filter(Boolean)
    .join('\n');

  await sendMail({ to: ADMIN, subject, text });
}

module.exports = { sendReservationClientEmail, sendReservationAdminEmail };
