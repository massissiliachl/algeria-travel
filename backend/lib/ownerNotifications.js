/**
 * Notifications propriétaires. Tous les événements passent par notifyOwner() : ajouter un canal
 * (push, SMS, WhatsApp…) se fait ici sans toucher aux routes.
 * Sans SMTP configuré, sendMail se contente de journaliser l'email.
 */
const { query } = require('../config/db');
const { sendMail } = require('./mail');

const PARTNER_URL = () =>
  process.env.PARTNER_URL || `${process.env.SITE_URL || 'https://algeriatravel.org'}/partenariat/`;

const fmtPrice = (n) => (n == null ? '—' : `${Number(n).toLocaleString('fr-DZ')} DA`);

const TEMPLATES = {
  reservation_created: (p) => ({
    subject: `[Algeria Travel] Nouvelle réservation ${p.referenceCode} — ${p.propertyName}`,
    text: [
      `Bonjour ${p.ownerName},`,
      '',
      'Une nouvelle demande de réservation concerne votre établissement.',
      '',
      `Référence : ${p.referenceCode}`,
      `Établissement : ${p.propertyName}`,
      `Chambre : ${p.roomName}`,
      `Séjour : du ${p.checkIn} au ${p.checkOut} (${p.nights} nuit(s), ${p.rooms} chambre(s))`,
      `Client : ${p.clientName}`,
      `Montant estimé : ${fmtPrice(p.total)}`,
      '',
      `Gérer la réservation : ${PARTNER_URL()}`,
    ].join('\n'),
  }),
  account_status_changed: (p) => ({
    subject: `[Algeria Travel] Votre compte propriétaire est ${p.status === 'active' ? 'activé' : 'désactivé'}`,
    text: [
      `Bonjour ${p.ownerName},`,
      '',
      p.status === 'active'
        ? `Votre compte propriétaire est actif. Connexion : ${PARTNER_URL()}`
        : 'Votre compte propriétaire a été désactivé. Vos établissements ne sont plus réservables. Contactez Algeria Travel pour plus d’informations.',
    ].join('\n'),
  }),
  account_created: (p) => ({
    subject: '[Algeria Travel] Votre espace propriétaire',
    text: [
      `Bonjour ${p.ownerName},`,
      '',
      'Votre compte propriétaire Algeria Travel a été créé.',
      `Connexion : ${PARTNER_URL()}`,
      `Identifiant : ${p.email}`,
      '',
      'Votre mot de passe vous est communiqué séparément par notre équipe.',
    ].join('\n'),
  }),
  property_status_changed: (p) => ({
    subject: `[Algeria Travel] ${p.propertyName} : ${p.status === 'active' ? 'activé' : 'désactivé'}`,
    text: [
      `Bonjour ${p.ownerName},`,
      '',
      `Le statut de « ${p.propertyName} » est maintenant : ${p.status}.`,
      p.by === 'admin' ? 'Cette modification a été faite par l’équipe Algeria Travel.' : '',
    ].join('\n'),
  }),
};

async function notifyOwner(ownerId, event, payload = {}) {
  if (!ownerId || !TEMPLATES[event]) return;
  try {
    const result = await query(
      'select email, first_name, last_name from public.owners where id = $1 and deleted_at is null',
      [ownerId]
    );
    const owner = result.rows[0];
    if (!owner) return;
    const { subject, text } = TEMPLATES[event]({
      ...payload,
      ownerName: `${owner.first_name} ${owner.last_name}`,
      email: owner.email,
    });
    await sendMail({ to: owner.email, subject, text });
  } catch (err) {
    console.warn('[OwnerNotify]', event, err.message);
  }
}

module.exports = { notifyOwner };
