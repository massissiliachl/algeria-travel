const { sendMail } = require('./mail');

const ADMIN = process.env.ADMIN_EMAIL || 'Algeria.travel@gmail.com';

const SUBJECT_LABELS = {
  reservation: 'Réservation',
  information: "Demande d'information",
  devis: 'Demande de devis',
  autres: 'Autres',
};

async function sendContactClientEmail({ email, name }) {
  const subject = '[Algeria Travel] Message bien reçu';
  const text = [
    `Bonjour ${name},`,
    '',
    'Merci pour votre message. Notre équipe vous répondra sous 24h.',
    '',
    'Algeria Travel',
  ].join('\n');

  await sendMail({ to: email, subject, text });
}

async function sendContactAdminEmail({ name, email, phone, subject, message }) {
  const label = SUBJECT_LABELS[subject] || subject;
  const mailSubject = `[Algeria Travel] Contact — ${label}`;
  const text = [
    'Nouveau message via le formulaire contact',
    '',
    `Nom : ${name}`,
    `Email : ${email}`,
    `Téléphone : ${phone}`,
    `Sujet : ${label}`,
    '',
    message,
  ].join('\n');

  await sendMail({ to: ADMIN, subject: mailSubject, text });
}

module.exports = { sendContactClientEmail, sendContactAdminEmail };
