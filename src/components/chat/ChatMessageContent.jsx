import React from 'react';

/** Rendu léger markdown : titres ###, puces •, texte normal */
function ChatMessageContent({ content, role }) {
  const text = String(content || '').trim();
  if (!text) {
    return <p className="chatbot-msg__empty">…</p>;
  }

  const lines = text.split('\n');

  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <p key={i} className="chatbot-msg__spacer" aria-hidden>&nbsp;</p>;

    if (/^#{1,3}\s+/.test(trimmed)) {
      const title = trimmed.replace(/^#{1,3}\s+/, '');
      return (
        <p key={i} className="chatbot-msg__title">
          {title}
        </p>
      );
    }

    if (/^[•\-*]\s+/.test(trimmed)) {
      return (
        <p key={i} className="chatbot-msg__bullet">
          <span aria-hidden>•</span>
          {trimmed.replace(/^[•\-*]\s+/, '')}
        </p>
      );
    }

    if (/^💡/.test(trimmed)) {
      return (
        <p key={i} className="chatbot-msg__tip">
          {trimmed}
        </p>
      );
    }

    return (
      <p key={i} className={role === 'user' ? 'chatbot-msg__line' : 'chatbot-msg__line'}>
        {trimmed}
      </p>
    );
  });
}

export default ChatMessageContent;
