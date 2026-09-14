import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { PageHeader } from '../components/ui';

const POLL_MS = 5000;

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR');
}

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await api.getInboxConversations('open');
      setConversations(res.conversations || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const loadDetail = useCallback(async (id, markRead = false) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      if (markRead) {
        await api.updateInboxConversation(id, { markRead: true });
      }
      const res = await api.getInboxConversation(id);
      setDetail(res);
      setSelectedId(id);
      await loadConversations();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, POLL_MS);
    window.addEventListener('focus', loadConversations);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', loadConversations);
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) return undefined;
    const id = setInterval(() => loadDetail(selectedId, false), POLL_MS);
    return () => clearInterval(id);
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [detail?.messages]);

  const onSelect = (conversation) => {
    loadDetail(conversation.id, true);
  };

  const onSend = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!selectedId || !body || sending) return;

    setSending(true);
    setError('');
    try {
      const res = await api.sendInboxReply(selectedId, body);
      setDetail(res);
      setDraft('');
      await loadConversations();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const onCloseConversation = async () => {
    if (!selectedId) return;
    if (!window.confirm('Archiver cette conversation ?')) return;
    try {
      await api.updateInboxConversation(selectedId, { status: 'closed' });
      setSelectedId(null);
      setDetail(null);
      await loadConversations();
    } catch (e) {
      setError(e.message);
    }
  };

  const selected = conversations.find((row) => row.id === selectedId);

  return (
    <>
      <PageHeader
        title="Messagerie"
        subtitle="Conversations visiteurs — répondez en direct, l'utilisateur retrouve le fil au prochain passage."
      />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="inbox-admin">
        <aside className="inbox-admin__list panel">
          <h3>Conversations ouvertes ({conversations.length})</h3>
          {conversations.length === 0 ? (
            <p className="empty">Aucun message pour le moment.</p>
          ) : (
            <ul className="inbox-admin__items">
              {conversations.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    className={`inbox-admin__item${selectedId === row.id ? ' is-active' : ''}`}
                    onClick={() => onSelect(row)}
                  >
                    <div className="inbox-admin__item-top">
                      <strong>{row.visitorName || 'Visiteur'}</strong>
                      {row.unreadCount > 0 && (
                        <span className="inbox-admin__unread">{row.unreadCount}</span>
                      )}
                    </div>
                    {row.visitorEmail && <small>{row.visitorEmail}</small>}
                    <p>{row.lastMessageBody || '—'}</p>
                    <time>{formatDate(row.lastMessageAt)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="inbox-admin__chat panel">
          {!selectedId || !detail ? (
            <p className="empty">Sélectionnez une conversation pour répondre.</p>
          ) : (
            <>
              <div className="inbox-admin__chat-head">
                <div>
                  <h3>{selected?.visitorName || 'Visiteur'}</h3>
                  {selected?.visitorEmail && <p>{selected.visitorEmail}</p>}
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onCloseConversation}>
                  Archiver
                </button>
              </div>

              <div className="inbox-admin__messages" ref={listRef}>
                {loading && !detail.messages?.length ? (
                  <p className="empty">Chargement…</p>
                ) : (
                  (detail.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`inbox-admin__msg ${msg.senderType === 'admin' ? 'is-admin' : 'is-visitor'}`}
                    >
                      <p>{msg.body}</p>
                      <time>{formatDate(msg.createdAt)}</time>
                    </div>
                  ))
                )}
              </div>

              <form className="inbox-admin__form" onSubmit={onSend}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Votre réponse…"
                  rows={3}
                  maxLength={2000}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()}>
                  {sending ? 'Envoi…' : 'Répondre'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
}
