import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon';
import { useLang } from '../../hooks/useLangHook';
import { api } from '../../services/api';
import './InboxWidget.css';

const POLL_OPEN_MS = 8000;
const POLL_CLOSED_MS = 30000;

export default function InboxWidget() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [draft, setDraft] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const ref = useRef(null);
  const listRef = useRef(null);
  const pollPausedUntilRef = useRef(0);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  };

  const loadInbox = useCallback(async (markRead = false) => {
    try {
      const data = await api.getInbox();
      setConversation(data.conversation || null);
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
      if (data.conversation?.visitorName) setName(data.conversation.visitorName);
      if (data.conversation?.visitorEmail) setEmail(data.conversation.visitorEmail);
      if (markRead && (data.unreadCount || 0) > 0) {
        await api.markInboxRead();
        setUnreadCount(0);
      }
      return data;
    } catch (err) {
      if (err.status === 429) {
        pollPausedUntilRef.current = Date.now() + 60_000;
      }
      if (open) setError(err.message || t('inbox_error'));
      return null;
    }
  }, [open, t]);

  useEffect(() => {
    const refresh = () => {
      if (Date.now() < pollPausedUntilRef.current) return;
      loadInbox(open);
    };
    refresh();
    const pollMs = open ? POLL_OPEN_MS : POLL_CLOSED_MS;
    const id = setInterval(refresh, pollMs);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refresh);
    };
  }, [loadInbox, open]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      loadInbox(true).finally(() => setLoading(false));
      scrollToBottom();
    }
  }, [open, loadInbox]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const toggleOpen = () => {
    setOpen((value) => !value);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError('');
    try {
      const data = await api.sendInboxMessage({
        body,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });
      setConversation(data.conversation || null);
      setMessages(data.messages || []);
      setDraft('');
      scrollToBottom();
    } catch (err) {
      setError(err.message || t('inbox_error'));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="inbox-widget" ref={ref}>
      <button
        type="button"
        className="premium-nav__icon-btn inbox-widget__btn"
        aria-label={t('inbox_label')}
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <Icon name="MessageCircle" size={18} />
        {unreadCount > 0 && (
          <span className="inbox-widget__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="inbox-widget__panel">
          <div className="inbox-widget__head">
            <div>
              <strong>{t('inbox_title')}</strong>
              <p>{t('inbox_subtitle')}</p>
            </div>
            <button type="button" className="inbox-widget__close" onClick={() => setOpen(false)} aria-label={t('inbox_close')}>
              <Icon name="X" size={18} />
            </button>
          </div>

          {!conversation?.visitorName && (
            <div className="inbox-widget__profile">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('inbox_name_placeholder')}
                maxLength={80}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('inbox_email_placeholder')}
                maxLength={120}
              />
            </div>
          )}

          <div className="inbox-widget__messages" ref={listRef}>
            {loading && messages.length === 0 ? (
              <p className="inbox-widget__empty">{t('inbox_loading')}</p>
            ) : messages.length === 0 ? (
              <p className="inbox-widget__empty">{t('inbox_empty')}</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`inbox-widget__msg ${msg.senderType === 'admin' ? 'is-admin' : 'is-visitor'}`}
                >
                  <p>{msg.body}</p>
                  <time>{formatTime(msg.createdAt)}</time>
                </div>
              ))
            )}
          </div>

          {error && <p className="inbox-widget__error">{error}</p>}

          <form className="inbox-widget__form" onSubmit={onSubmit}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('inbox_placeholder')}
              rows={2}
              maxLength={2000}
            />
            <button type="submit" className="inbox-widget__send" disabled={sending || !draft.trim()}>
              {sending ? t('inbox_sending') : t('inbox_send')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
