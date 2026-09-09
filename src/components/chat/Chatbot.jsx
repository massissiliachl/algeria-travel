import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../hooks/useLangHook';
import { api } from '../../services/api';
import { getOfflineReply, getOfflineWelcome } from '../../services/chatOffline';
import { clearChatState, loadChatState, saveChatState } from '../../utils/chatStorage';
import Icon from '../ui/Icon';
import ChatMessageContent from './ChatMessageContent';
import './Chatbot.css';

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const DEST_LABELS = {
  fr: {
    bejaia: 'Béjaïa', alger: 'Alger', oran: 'Oran', taghit: 'Taghit', djanet: 'Djanet',
    ghardaia: 'Ghardaïa', timimoun: 'Timimoun', constantine: 'Constantine', annaba: 'Annaba',
    jijel: 'Jijel', hoggar: 'Hoggar', sahara: 'Sahara', kabylie: 'Kabylie',
  },
  en: {
    bejaia: 'Bejaia', alger: 'Algiers', oran: 'Oran', taghit: 'Taghit', djanet: 'Djanet',
    ghardaia: 'Ghardaia', timimoun: 'Timimoun', constantine: 'Constantine', annaba: 'Annaba',
    jijel: 'Jijel', hoggar: 'Hoggar', sahara: 'Sahara', kabylie: 'Kabylia',
  },
  ar: {
    bejaia: 'بجاية', alger: 'الجزائر', oran: 'وهران', taghit: 'تاغيت', djanet: 'جانت',
    ghardaia: 'غرداية', timimoun: 'تيميمون', constantine: 'قسنطينة', annaba: 'عنابة',
    jijel: 'جijel', hoggar: 'الhoggar', sahara: 'الصحراء', kabylie: 'القبail',
  },
};

function formatSessionChip(session, lang = 'fr') {
  if (!session?.destination) return null;
  const labels = DEST_LABELS[lang] || DEST_LABELS.fr;
  const parts = [labels[session.destination] || session.destination];
  if (session.days) parts.push(lang === 'en' ? `${session.days} days` : lang === 'ar' ? `${session.days} أيام` : `${session.days} jours`);
  else if (session.nights) parts.push(lang === 'en' ? `${session.nights} nights` : lang === 'ar' ? `${session.nights} ليالي` : `${session.nights} nuits`);
  if (session.travelers) parts.push(lang === 'en' ? `${session.travelers} ppl` : lang === 'ar' ? `${session.travelers} أشخاص` : `${session.travelers} pers.`);
  if (session.accommodation) parts.push(session.accommodation);
  return parts.join(' · ');
}

function hasSessionContext(session) {
  return !!(session?.destination || session?.days || session?.nights || session?.travelers || session?.accommodation);
}

const savedState = loadChatState();

const Chatbot = () => {
  const { language, t, isRTL } = useLang();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState(() => savedState?.messages ?? []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(() => savedState?.suggestions ?? []);
  const [session, setSession] = useState(() => savedState?.session ?? {});
  const [hasMobileBar, setHasMobileBar] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const booted = useRef((savedState?.messages?.length ?? 0) > 0);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }, []);

  const pushAssistant = useCallback((payload) => {
    const reply = String(payload?.reply ?? payload?.message ?? '').trim();
    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        role: 'assistant',
        content: reply || t('chat_error'),
        links: payload?.links || [],
      },
    ]);
    if (payload?.suggestions?.length) setSuggestions(payload.suggestions);
    scrollToBottom();
  }, [scrollToBottom, t]);

  useEffect(() => {
    saveChatState({ messages, session, suggestions });
  }, [messages, session, suggestions]);

  useEffect(() => {
    if (!open || booted.current) return;
    booted.current = true;
    setLoading(true);
    const loadWelcome = async () => {
      try {
        const data = await api.getChatWelcome(language);
        pushAssistant(data);
      } catch (firstErr) {
        try {
          await new Promise((r) => setTimeout(r, 1500));
          const data = await api.getChatWelcome(language);
          pushAssistant(data);
        } catch {
          pushAssistant(getOfflineWelcome(language));
        }
      } finally {
        setLoading(false);
      }
    };
    loadWelcome();
  }, [open, language, pushAssistant, t]);

  useEffect(() => {
    if (open && messages.length > 0) scrollToBottom();
  }, [open, messages.length, scrollToBottom]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const syncMobile = () => setIsMobile(mq.matches);
    syncMobile();
    mq.addEventListener('change', syncMobile);
    return () => mq.removeEventListener('change', syncMobile);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.classList.add('chat-open');
      const prevOverflow = document.body.style.overflow;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
      setTimeout(() => inputRef.current?.focus(), 200);
      return () => {
        document.body.classList.remove('chat-open');
        document.body.style.overflow = prevOverflow;
      };
    }
    document.body.classList.remove('chat-open');
    return undefined;
  }, [open, isMobile]);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mobile = window.matchMedia('(max-width: 960px)').matches;
        const hasBar = !!document.querySelector(
          '.mobile-booking-bar, .place-mobile-bar, .stays-mobile-bar'
        );
        setHasMobileBar(mobile && hasBar);
      });
    };

    check();
    window.addEventListener('resize', check);
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      window.removeEventListener('resize', check);
    };
  }, []);

  const resetConversation = () => {
    clearChatState();
    setMessages([]);
    setSuggestions([]);
    setSession({});
    booted.current = false;
  };

  const sendMessage = async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: makeId(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSuggestions([]);
    setLoading(true);
    scrollToBottom();

    const history = [...messages, userMsg]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    const payload = { message: trimmed, lang: language, history, session };

    try {
      let data;
      try {
        data = await api.sendChatMessage(payload);
      } catch (firstErr) {
        if (!/timeout|503|502|504|failed to fetch|network/i.test(String(firstErr?.message || ''))) {
          throw firstErr;
        }
        await new Promise((r) => setTimeout(r, 1500));
        data = await api.sendChatMessage(payload);
      }
      if (data.session) setSession(data.session);
      pushAssistant(data);
    } catch (err) {
      const offline = getOfflineReply(trimmed, language, session);
      if (offline.session) setSession(offline.session);
      pushAssistant(offline);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleNewChat = () => {
    resetConversation();
    setLoading(true);
    api
      .getChatWelcome(language)
      .then((data) => {
        booted.current = true;
        pushAssistant(data);
      })
      .catch(() => {
        booted.current = true;
        pushAssistant(getOfflineWelcome(language));
      })
      .finally(() => setLoading(false));
  };

  const sessionChip = formatSessionChip(session, language);
  const showSessionBadge = hasSessionContext(session) && !open;

  return (
    <>
      {open && isMobile && (
        <button
          type="button"
          className="chatbot-backdrop"
          aria-label={t('chat_close')}
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div
          className={`chatbot-panel${isMobile ? ' chatbot-panel--mobile' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={t('chat_title')}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <header className="chatbot-panel__head">
            <div className="chatbot-panel__brand">
              <span className="chatbot-panel__avatar" aria-hidden>
                <Icon name="Bot" size={20} />
              </span>
              <div>
                <strong>{t('chat_title')}</strong>
                <span>{t('chat_subtitle')}</span>
              </div>
            </div>
            <div className="chatbot-panel__actions">
              {messages.length > 0 && (
                <button
                  type="button"
                  className="chatbot-panel__new"
                  onClick={handleNewChat}
                  aria-label={t('chat_new')}
                  title={t('chat_new')}
                >
                  <Icon name="RefreshCw" size={16} />
                </button>
              )}
              <button
                type="button"
                className="chatbot-panel__close"
                onClick={() => setOpen(false)}
                aria-label={t('chat_close')}
              >
                <Icon name="X" size={18} />
              </button>
            </div>
          </header>

          {sessionChip && (
            <div className="chatbot-panel__recap" aria-live="polite">
              <Icon name="MapPin" size={14} />
              <span>{sessionChip}</span>
            </div>
          )}

          <div className="chatbot-panel__messages" ref={listRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-msg chatbot-msg--${msg.role}`}
              >
                <div className="chatbot-msg__bubble">
                  <ChatMessageContent content={msg.content} role={msg.role} />
                  {msg.links?.length > 0 && (
                    <div className="chatbot-msg__links">
                      {msg.links.filter((link) => link?.url).map((link) =>
                        link.url.startsWith('http') ? (
                          <a
                            key={`${link.url}-${link.label}`}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chatbot-link"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            key={`${link.url}-${link.label}`}
                            to={link.url}
                            className="chatbot-link"
                            onClick={() => setOpen(false)}
                          >
                            {link.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-msg__bubble chatbot-msg__typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {suggestions.length > 0 && !loading && (
            <div className="chatbot-panel__suggestions">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chatbot-chip"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="chatbot-panel__form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat_placeholder')}
              maxLength={2000}
              disabled={loading}
              aria-label={t('chat_placeholder')}
              enterKeyHint="send"
              autoComplete="off"
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label={t('chat_send')}>
              <Icon name="Send" size={18} />
            </button>
          </form>
        </div>
      )}

      {!(open && isMobile) && (
        <button
          type="button"
          className={`chatbot-fab${open ? ' is-open' : ''}${hasMobileBar ? ' chatbot-fab--above-bar' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t('chat_close') : t('chat_open')}
          aria-expanded={open}
        >
          <Icon name={open ? 'X' : 'MessageCircle'} size={24} />
          {showSessionBadge && <span className="chatbot-fab__badge" aria-hidden />}
        </button>
      )}
    </>
  );
};

class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('[Chatbot] erreur isolée :', error);
    clearChatState();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function ChatbotWithBoundary() {
  return (
    <ChatErrorBoundary>
      <Chatbot />
    </ChatErrorBoundary>
  );
}
