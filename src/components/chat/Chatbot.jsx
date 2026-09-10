import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../hooks/useLangHook';
import { api } from '../../services/api';
import { getOfflineReply, getOfflineWelcome } from '../../services/chatOffline';
import {
  isSpeechSupported,
  loadVoiceEnabled,
  saveVoiceEnabled,
  speakText,
  stopSpeech,
  warmUpVoices,
} from '../../services/chatSpeech';
import { resolveApiBase } from '../../utils/apiBase';
import { clearChatState, loadChatState, saveChatState } from '../../utils/chatStorage';
import Icon from '../ui/Icon';
import ChatAssistantAvatar from './ChatAssistantAvatar';
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
  const [apiAvailable, setApiAvailable] = useState(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => loadVoiceEnabled());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const booted = useRef((savedState?.messages?.length ?? 0) > 0);
  const speechSupported = isSpeechSupported();

  const speakReply = useCallback((reply) => {
    if (!voiceEnabled || !speechSupported) return;
    const text = String(reply || '').trim();
    if (!text) return;
    speakText(text, language, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }, [voiceEnabled, speechSupported, language]);

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      saveVoiceEnabled(next);
      if (!next) {
        stopSpeech();
        setIsSpeaking(false);
      }
      return next;
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (!value.trim()) {
      setIsUserTyping(false);
      return;
    }
    setIsUserTyping(true);
    typingTimerRef.current = setTimeout(() => setIsUserTyping(false), 700);
  };

  useEffect(() => () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    stopSpeech();
  }, []);

  useEffect(() => {
    if (!open) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    warmUpVoices();
  }, [open]);

  const checkApiAvailable = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${resolveApiBase()}/api/live`, { signal: controller.signal });
      clearTimeout(timer);
      const ok = res.ok;
      setApiAvailable(ok);
      return ok;
    } catch {
      setApiAvailable(false);
      return false;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }, []);

  const pushAssistant = useCallback((payload) => {
    const reply = String(payload?.reply ?? payload?.message ?? '').trim();
    const content = reply || t('chat_error');
    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        role: 'assistant',
        content,
        links: payload?.links || [],
      },
    ]);
    if (payload?.suggestions?.length) setSuggestions(payload.suggestions);
    scrollToBottom();
    speakReply(content);
  }, [scrollToBottom, t, speakReply]);

  useEffect(() => {
    saveChatState({ messages, session, suggestions });
  }, [messages, session, suggestions]);

  useEffect(() => {
    if (!open || booted.current) return;
    booted.current = true;
    setLoading(true);
    const loadWelcome = async () => {
      const online = await checkApiAvailable();
      if (!online) {
        pushAssistant(getOfflineWelcome(language));
        setLoading(false);
        return;
      }
      try {
        const data = await api.getChatWelcome(language);
        pushAssistant(data);
      } catch (firstErr) {
        try {
          await new Promise((r) => setTimeout(r, 1500));
          const data = await api.getChatWelcome(language);
          pushAssistant(data);
        } catch {
          setApiAvailable(false);
          pushAssistant(getOfflineWelcome(language));
        }
      } finally {
        setLoading(false);
      }
    };
    loadWelcome();
  }, [open, language, pushAssistant, checkApiAvailable, t]);

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
    stopSpeech();
    setIsSpeaking(false);
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
    setIsUserTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setSuggestions([]);
    setLoading(true);
    scrollToBottom();

    const history = [...messages, userMsg]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    const payload = { message: trimmed, lang: language, history, session };

    const replyOffline = () => {
      const offline = getOfflineReply(trimmed, language, session);
      if (offline.session) setSession(offline.session);
      pushAssistant(offline);
    };

    if (apiAvailable === false) {
      replyOffline();
      setLoading(false);
      return;
    }

    try {
      let data;
      try {
        data = await api.sendChatMessage(payload);
      } catch (firstErr) {
        if (!/timeout|503|502|504|404|failed to fetch|network|indisponible|invalide|statique/i.test(String(firstErr?.message || ''))) {
          throw firstErr;
        }
        await new Promise((r) => setTimeout(r, 1500));
        data = await api.sendChatMessage(payload);
      }
      if (!data?.reply?.trim()) {
        setApiAvailable(false);
        replyOffline();
        return;
      }
      if (data.session) setSession(data.session);
      pushAssistant(data);
    } catch (err) {
      setApiAvailable(false);
      replyOffline();
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
          <header className={`chatbot-panel__head${isSpeaking ? ' chatbot-panel__head--speaking' : ''}`}>
            <div className="chatbot-panel__hero">
              <div className="chatbot-panel__avatar">
                <ChatAssistantAvatar speaking={isSpeaking} size={72} variant="hero" />
              </div>
              <div className="chatbot-panel__identity">
                <strong>
                  {t('chat_assistant_name')}
                  <span className="chatbot-panel__online" aria-hidden />
                </strong>
                <span className="chatbot-panel__role">{t('chat_assistant_role')}</span>
                <span className={`chatbot-panel__status${isSpeaking ? ' is-speaking' : ''}`}>
                  {isSpeaking ? t('chat_assistant_speaking') : t('chat_subtitle')}
                </span>
              </div>
            </div>
            <div className="chatbot-panel__actions">
              {speechSupported && (
                <button
                  type="button"
                  className={`chatbot-panel__voice${voiceEnabled ? ' is-on' : ''}`}
                  onClick={toggleVoice}
                  aria-label={voiceEnabled ? t('chat_voice_off') : t('chat_voice_on')}
                  title={voiceEnabled ? t('chat_voice_off') : t('chat_voice_on')}
                >
                  <Icon name={voiceEnabled ? 'Volume2' : 'VolumeX'} size={16} />
                </button>
              )}
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
                {msg.role === 'assistant' && (
                  <div className="chatbot-msg__avatar" aria-hidden>
                    <ChatAssistantAvatar speaking={false} size={34} />
                  </div>
                )}
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
                <div className="chatbot-msg__avatar" aria-hidden>
                  <ChatAssistantAvatar speaking size={34} />
                </div>
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

          {isUserTyping && !loading && (
            <div className="chatbot-watcher" aria-hidden>
              <div className="chatbot-watcher__bubble">
                <div className="chatbot-watcher__eyes">
                  {[0, 1].map((i) => (
                    <span key={i} className="chatbot-watcher__eye" style={{ animationDelay: `${i * 0.08}s` }}>
                      <span className="chatbot-watcher__sclera">
                        <span className="chatbot-watcher__iris">
                          <span className="chatbot-watcher__pupil" />
                          <span className="chatbot-watcher__shine" />
                        </span>
                      </span>
                      <span className="chatbot-watcher__lid" />
                    </span>
                  ))}
                </div>
                <span className="chatbot-watcher__label">{t('chat_typing_watch')}</span>
              </div>
            </div>
          )}

          <form className="chatbot-panel__form" onSubmit={handleSubmit}>
            <div className="chatbot-panel__input-wrap">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={t('chat_placeholder')}
                maxLength={2000}
                disabled={loading}
                aria-label={t('chat_placeholder')}
                enterKeyHint="send"
                autoComplete="off"
              />
            </div>
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
          {open ? (
            <Icon name="X" size={24} />
          ) : (
            <ChatAssistantAvatar size={36} className="chatbot-fab__avatar" />
          )}
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
