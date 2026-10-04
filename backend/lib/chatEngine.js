const { buildContextForAI, generateLocalReply } = require('./chatKnowledge');
const { detectLanguage } = require('./chatNlp');
const { emptySession } = require('./chatSession');

const VALID_LANGS = new Set(['fr', 'en', 'ar']);

async function callOpenAI(message, lang, history = [], session = {}) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
  const system = buildContextForAI(lang, session);

  const messages = [
    { role: 'system', content: system },
    ...history
      .filter((m) => m?.role === 'user' || m?.role === 'assistant')
      .slice(-10)
      .map((m) => ({ role: m.role, content: String(m.content || '').slice(0, 2000) })),
    { role: 'user', content: String(message).slice(0, 2000) },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.45,
      max_tokens: 800,
    }),
    signal: AbortSignal.timeout(Number(process.env.OPENAI_TIMEOUT_MS) || 25000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    console.warn('[Chat] OpenAI error:', res.status, err.slice(0, 200));
    return null;
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) return null;

  return { reply, source: 'openai' };
}

async function chat(message, lang = 'fr', history = [], session = {}) {
  const detected = detectLanguage(message);
  const safeLang = VALID_LANGS.has(lang) ? lang : (VALID_LANGS.has(detected) ? detected : 'fr');
  const safeSession = { ...emptySession(), ...session, language: safeLang };

  const local = generateLocalReply(message, safeLang, safeSession);

  try {
    const ai = await callOpenAI(message, safeLang, history, safeSession);
    const aiReply = ai?.reply?.trim();
    if (aiReply) {
      return {
        reply: aiReply,
        suggestions: local.suggestions,
        links: local.links?.length ? local.links : [],
        session: local.session || safeSession,
        source: 'openai',
      };
    }
  } catch (err) {
    console.warn('[Chat] OpenAI fallback:', err.message);
  }

  return {
    reply: local.reply || (safeLang === 'en'
      ? 'How can I help with your trip to Algeria?'
      : safeLang === 'ar'
        ? 'كيف يمكنني مساعدتك في رحلتك؟'
        : 'Comment puis-je vous aider pour votre voyage en Algérie ?'),
    suggestions: local.suggestions,
    links: local.links || [],
    session: local.session || safeSession,
    source: 'local',
  };
}

module.exports = { chat };
