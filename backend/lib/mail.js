const nodemailer = require('nodemailer');

let transporter;

function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isMailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const adminCopy = process.env.ADMIN_EMAIL;

  if (!isMailConfigured()) {
    console.log('[Mail] SMTP non configuré — email simulé:');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${text}`);
    return { simulated: true };
  }

  const transport = getTransporter();
  const info = await transport.sendMail({
    from,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, '<br>'),
  });

  if (adminCopy && adminCopy !== to && subject.startsWith('[Algeria Travel]')) {
    await transport.sendMail({
      from,
      to: adminCopy,
      subject: `[Copie admin] ${subject}`,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    }).catch((err) => console.warn('[Mail] Copie admin échouée:', err.message));
  }

  return info;
}

module.exports = { sendMail, isMailConfigured };
