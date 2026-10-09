/**
 * IA facultative (côté serveur uniquement) : sert seulement à classer un message que les règles
 * n’ont pas compris (intention + destination). Elle ne rédige jamais de réponse commerciale :
 * prix, disponibilités et offres viennent toujours du catalogue.
 *
 * Variables : AI_API_KEY (ou OPENAI_API_KEY), AI_MODEL (ou OPENAI_MODEL), AI_BASE_URL (API compatible OpenAI),
 * AI_TIMEOUT_MS. CHATBOT_AI=off pour désactiver.
 */
const INTENTS = [
  'GREETING', 'PRICE', 'AVAILABILITY', 'BOOKING', 'DESTINATION', 'HOTEL', 'APARTMENT', 'ACTIVITY', 'TOUR', 'PROGRAM',
  'DATE', 'DURATION', 'TRANSPORT', 'PAYMENT', 'CONTACT', 'LOCATION', 'CANCELLATION', 'GENERAL_INFORMATION', 'HUMAN_AGENT', 'UNKNOWN',
];

function config() {
  if (String(process.env.CHATBOT_AI || '').toLowerCase() === 'off') return null;
  const apiKey = (process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) return null;
  return {
    apiKey,
    model: (process.env.AI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini').trim(),
    baseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    timeout: Number(process.env.AI_TIMEOUT_MS || process.env.OPENAI_TIMEOUT_MS) || 8000,
  };
}

const isAiEnabled = () => Boolean(config());

/** @returns {Promise<{ intent: string, destination: string|null } | null>} */
async function classify(message, lang = 'fr') {
  const cfg = config();
  if (!cfg) return null;
  const system = [
    'You classify short customer messages for an Algerian travel agency website (French, English, Arabic, Algerian darija, arabizi, typos).',
    `Return ONLY JSON: {"intent": one of ${INTENTS.join('|')}, "destination": place name mentioned or null}.`,
    'Never answer the customer. Never invent anything.',
  ].join(' ');
  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0,
        max_tokens: 60,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `[lang=${lang}] ${String(message).slice(0, 500)}` },
        ],
      }),
      signal: AbortSignal.timeout(cfg.timeout),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}');
    const intent = INTENTS.includes(parsed.intent) && parsed.intent !== 'UNKNOWN' ? parsed.intent : null;
    if (!intent) return null;
    return { intent, destination: typeof parsed.destination === 'string' ? parsed.destination.slice(0, 60) : null };
  } catch (err) {
    console.warn('[Chatbot] IA indisponible :', err.message);
    return null;
  }
}

module.exports = { classify, isAiEnabled };
