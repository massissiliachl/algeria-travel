/**
 * Point d’entrée du chatbot : relie conversation stockée, dialogue et demandes à l’équipe.
 */
const store = require('./store');
const { handleMessage, freshContext } = require('./dialog');
const { welcome, sugg, MAIN_MENU } = require('./replies');
const ai = require('./ai');

const LANGS = ['fr', 'en', 'ar'];
const langOf = (v) => (LANGS.includes(v) ? v : 'fr');
const MAX_MESSAGE = Number(process.env.CHATBOT_MAX_MESSAGE_LENGTH) || 1000;

/** Nettoie un message client : caractères de contrôle, espaces, longueur. */
function cleanMessage(raw) {
  if (typeof raw !== 'string') return { error: 'Message requis.' };
  const text = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, '').replace(/\s+/g, ' ').trim();
  if (!text) return { error: 'Message requis.' };
  if (text.length > MAX_MESSAGE) return { error: `Message trop long (${MAX_MESSAGE} caractères max).` };
  return { text };
}

async function startConversation({ language, pageUrl, userAgent } = {}) {
  const lang = langOf(language);
  const conv = await store.createConversation({ language: lang, pageUrl: pageUrl ? String(pageUrl).slice(0, 300) : null, userAgent: userAgent ? String(userAgent).slice(0, 300) : null });
  return { conversationId: conv.id, reply: welcome(lang), suggestions: sugg(lang, ...MAIN_MENU) };
}

async function processMessage({ conversationId, message, language, pageUrl, userAgent }) {
  let conv = store.isUuid(conversationId) ? await store.getConversation(conversationId) : null;
  if (!conv) {
    const created = await store.createConversation({ language: langOf(language), pageUrl, userAgent });
    conv = { ...created, context: null };
  }
  const context = conv.context && Object.keys(conv.context).length ? conv.context : freshContext(langOf(language || conv.language));
  if (language && LANGS.includes(language) && !conv.message_count) context.lang = language;

  let requestCreated = false;
  const result = await handleMessage({
    context,
    message,
    language: langOf(language || conv.language),
    actions: {
      createBookingRequest: (data) => store.createRequest(conv.id, 'booking', data),
      createContactRequest: (data) => {
        requestCreated = true;
        return store.createRequest(conv.id, 'contact', data);
      },
      classify: ai.isAiEnabled() ? ai.classify : null,
    },
  });

  const botMsg = await store.saveTurn(conv.id, {
    userMessage: message,
    reply: result.reply,
    intent: result.intent,
    context: result.context,
    flags: result.flags,
    suggestions: result.suggestions,
    links: result.links,
  });
  if (result.flags?.human && !conv.human_requested && !requestCreated) {
    store.notifyHumanRequest(conv.id).catch((err) => console.warn('[Chatbot] email conseiller :', err.message));
  }

  return {
    conversationId: conv.id,
    reply: result.reply,
    intent: result.intent,
    suggestions: result.suggestions,
    links: result.links,
    language: result.context.lang,
    humanRequested: Boolean(result.context.humanRequested),
    messageId: botMsg?.id ?? null,
  };
}

module.exports = { cleanMessage, startConversation, processMessage, store, langOf };
