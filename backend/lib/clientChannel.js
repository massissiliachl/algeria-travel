/**
 * Message personnalisé au client : WhatsApp (API Meta), sinon SMS (Twilio)
 * si le numéro n’a pas WhatsApp ou si WhatsApp ne peut pas délivrer.
 * Sans clés, on renvoie les liens que l’admin peut envoyer depuis son téléphone.
 */

const WHATSAPP_ABSENT = new Set([131026]);

function phoneDigits(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `213${digits.slice(1)}`;
  return digits.length >= 8 ? digits : '';
}

function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
}

function smsConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
}

function links(digits, text) {
  if (!digits) return { whatsappUrl: null, smsUrl: null };
  return {
    whatsappUrl: `https://wa.me/${digits}?text=${encodeURIComponent(text)}`,
    smsUrl: `sms:+${digits}?body=${encodeURIComponent(text)}`,
  };
}

function absentFromWhatsApp(status, payload) {
  const code = Number(payload?.error?.code);
  const message = String(payload?.error?.message || '');
  return WHATSAPP_ABSENT.has(code) || /not a valid whatsapp|is not a whatsapp/i.test(message) || status === 404;
}

async function sendWhatsApp(digits, text) {
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v21.0';
  const url = `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: digits,
      type: 'text',
      text: { preview_url: false, body: text.slice(0, 4096) },
    }),
    signal: AbortSignal.timeout(15000),
  });
  const payload = await res.json().catch(() => null);
  if (res.ok) return { ok: true, absent: false };
  return { ok: false, absent: absentFromWhatsApp(res.status, payload), error: payload?.error?.message || `WhatsApp HTTP ${res.status}` };
}

async function sendSms(digits, text) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: `+${digits}`, From: from, Body: text.slice(0, 1000) }),
    signal: AbortSignal.timeout(15000),
  });
  if (res.ok) return { ok: true };
  const payload = await res.json().catch(() => null);
  return { ok: false, error: payload?.message || `SMS HTTP ${res.status}` };
}

/**
 * @returns {{ channel: 'whatsapp'|'sms'|'none', status: 'sent'|'failed'|'unconfigured'|'skipped', whatsappAbsent: boolean, whatsappUrl: string|null, smsUrl: string|null }}
 */
async function sendClientPhone(phone, text) {
  const digits = phoneDigits(phone);
  const ready = links(digits, text);
  if (!digits) return { channel: 'none', status: 'skipped', whatsappAbsent: false, ...ready };

  if (whatsappConfigured()) {
    try {
      const wa = await sendWhatsApp(digits, text);
      if (wa.ok) return { channel: 'whatsapp', status: 'sent', whatsappAbsent: false, ...ready };
      console.warn('[Client] WhatsApp non délivré :', wa.error);
      if (smsConfigured()) {
        const sms = await sendSms(digits, text);
        if (sms.ok) return { channel: 'sms', status: 'sent', whatsappAbsent: wa.absent, ...ready };
        console.warn('[Client] SMS non envoyé :', sms.error);
        return { channel: 'sms', status: 'failed', whatsappAbsent: wa.absent, ...ready };
      }
      return { channel: wa.absent ? 'sms' : 'whatsapp', status: 'unconfigured', whatsappAbsent: wa.absent, ...ready };
    } catch (err) {
      console.warn('[Client] WhatsApp injoignable :', err.message);
    }
  }

  return { channel: 'none', status: 'unconfigured', whatsappAbsent: false, ...ready };
}

module.exports = { phoneDigits, absentFromWhatsApp, sendClientPhone };
