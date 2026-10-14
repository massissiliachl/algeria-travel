/**
 * Notification WhatsApp de l'agence à chaque nouvelle demande de réservation, via CallMeBot (gratuit).
 * Activation : envoyer « I allow callmebot to send me messages » au +34 644 66 32 62 depuis le WhatsApp de l'agence,
 * puis renseigner WHATSAPP_NOTIFY_PHONE (ex. 33619501708) et WHATSAPP_NOTIFY_APIKEY (clé reçue) dans l'environnement.
 */
const { paymentMethodLabel } = require('./paymentMethod');

const ADMIN_PANEL = `${process.env.SITE_URL || 'https://algeriatravel.org'}/admin/`;

const fmtPrice = (amount) => (amount == null ? '—' : `${Number(amount).toLocaleString('fr-FR')} DA`);

const fmtDate = (value) => {
  if (!value) return '—';
  const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

function reservationWhatsAppText(r) {
  const firstName = String(r.name || '').trim().split(/\s+/)[0] || 'un client';
  const stay =
    r.checkInDate && r.checkOutDate
      ? `🗓️ *Séjour :* du ${fmtDate(r.checkInDate)} au ${fmtDate(r.checkOutDate)}`
      : `🗓️ *Date souhaitée :* ${fmtDate(r.travelDate)}`;
  return [
    `🌴 *Nouvelle demande de réservation* — Algeria Travel`,
    ``,
    `Bonne nouvelle ! *${firstName}* souhaite réserver *${r.itemName}*.`,
    ``,
    `🔖 *Référence :* ${r.referenceCode}`,
    stay,
    `👥 *Voyageurs :* ${r.travelers}`,
    r.roomsRequested ? `🛏️ *Chambres :* ${r.roomsRequested}` : null,
    `💰 *Total estimé :* ${fmtPrice(r.priceEstimate)}`,
    `💳 *Paiement :* ${paymentMethodLabel(r.paymentMethod)}`,
    ``,
    `👤 *Client :* ${r.name}`,
    `📞 *Téléphone :* ${r.phone}`,
    `✉️ *Email :* ${r.email}`,
    r.message ? `\n📝 *Message :*\n${r.message}` : null,
    ``,
    `👉 Rappeler le client sous 24h. Gérer la demande : ${ADMIN_PANEL}`,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

async function sendReservationWhatsApp(reservation) {
  const phone = String(process.env.WHATSAPP_NOTIFY_PHONE || '').replace(/[^\d]/g, '');
  const apikey = String(process.env.WHATSAPP_NOTIFY_APIKEY || '').trim();
  if (!phone || !apikey) return false;

  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', phone);
  url.searchParams.set('apikey', apikey);
  url.searchParams.set('text', reservationWhatsAppText(reservation));

  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`CallMeBot HTTP ${res.status}`);
  return true;
}

module.exports = { sendReservationWhatsApp, reservationWhatsAppText };
