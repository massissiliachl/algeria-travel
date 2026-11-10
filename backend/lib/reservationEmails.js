const { sendMail, isMailConfigured } = require('./mail');
const { sendClientPhone } = require('./clientChannel');
const { paymentMethodLabel } = require('./paymentMethod');

const SITE = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://algeriatravel.com';
const ADMIN = process.env.ADMIN_EMAIL || 'travelalgeriadz@gmail.com';
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

function fmtDate(value) {
  if (!value) return '';
  const iso = String(value).slice(0, 10);
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return '';
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function decisionText(reservation, status) {
  const name = String(reservation.clientName || '').trim() || 'Client';
  const offer = reservation.itemName || 'votre voyage';
  const facts = [
    `Voyage : ${offer}`,
    reservation.referenceCode ? `Référence : ${reservation.referenceCode}` : '',
    reservation.checkInDate && reservation.checkOutDate
      ? `Dates : du ${fmtDate(reservation.checkInDate)} au ${fmtDate(reservation.checkOutDate)}`
      : reservation.travelDate
        ? `Date : ${fmtDate(reservation.travelDate)}`
        : '',
    reservation.travelers ? `Voyageurs : ${reservation.travelers}` : '',
  ].filter(Boolean);
  const intro =
    status === 'confirmed'
      ? 'Nous avons le plaisir de vous confirmer votre demande de réservation.'
      : 'Nous sommes au regret de vous informer que votre demande de réservation ne peut pas être acceptée.';
  const closing =
    status === 'confirmed'
      ? 'Notre équipe reste à votre disposition pour la suite de votre voyage.'
      : 'Nous restons disponibles pour vous proposer une autre date ou une autre formule.';

  return [
    'Algeria Travel',
    '',
    `Monsieur, Madame ${name},`,
    '',
    intro,
    '',
    ...facts,
    '',
    closing,
    '',
    'Bien cordialement,',
    'Algeria Travel',
    SITE,
  ].join('\n');
}

async function notifyReservationDecision(reservation, status) {
  if (status !== 'confirmed' && status !== 'rejected') {
    return { email: 'skipped', phone: 'none', phoneStatus: 'skipped', whatsappUrl: null, smsUrl: null };
  }
  const text = decisionText(reservation, status);
  const subject =
    status === 'confirmed'
      ? `[Algeria Travel] Réservation confirmée${reservation.referenceCode ? ` — ${reservation.referenceCode}` : ''}`
      : `[Algeria Travel] Réservation non retenue${reservation.referenceCode ? ` — ${reservation.referenceCode}` : ''}`;

  let email = 'skipped';
  const to = String(reservation.clientEmail || '').trim();
  if (to.includes('@')) {
    if (!isMailConfigured()) email = 'unconfigured';
    else {
      try {
        const info = await sendMail({ to, subject, text });
        email = info?.simulated ? 'simulated' : 'sent';
      } catch (err) {
        email = 'failed';
        console.warn('[Reservation] E-mail client non envoyé :', err.message);
      }
    }
  }

  const phone = await sendClientPhone(reservation.clientPhone, text);
  return { email, phone: phone.channel, phoneStatus: phone.status, whatsappAbsent: phone.whatsappAbsent, whatsappUrl: phone.whatsappUrl, smsUrl: phone.smsUrl };
}

module.exports = {
  sendReservationClientEmail,
  sendReservationAdminEmail,
  notifyReservationDecision,
  decisionText,
};
