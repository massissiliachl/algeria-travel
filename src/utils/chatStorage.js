const STORAGE_KEY = 'algeria-travel-chat';
const MAX_MESSAGES = 80;

export function loadChatState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.messages)) return null;
    return {
      messages: data.messages.slice(-MAX_MESSAGES),
      session: data.session || {},
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    };
  } catch {
    return null;
  }
}

export function saveChatState({ messages, session, suggestions }) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        messages: messages.slice(-MAX_MESSAGES),
        session: session || {},
        suggestions: suggestions || [],
        updatedAt: Date.now(),
      })
    );
  } catch {
    /* quota or private mode */
  }
}

export function clearChatState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
