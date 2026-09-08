const STORAGE_KEY = 'algeria-travel-chat';
const MAX_MESSAGES = 80;

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({
      id: String(m.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      role: m.role,
      content: String(m.content || ''),
      links: Array.isArray(m.links)
        ? m.links.filter((l) => l && l.url).map((l) => ({ label: String(l.label || l.url), url: String(l.url) }))
        : [],
    }))
    .slice(-MAX_MESSAGES);
}

export function loadChatState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.messages)) return null;
    return {
      messages: sanitizeMessages(data.messages),
      session: data.session && typeof data.session === 'object' ? data.session : {},
      suggestions: Array.isArray(data.suggestions) ? data.suggestions.map(String) : [],
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
        messages: sanitizeMessages(messages),
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
