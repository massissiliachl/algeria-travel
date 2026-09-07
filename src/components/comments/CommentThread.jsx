import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../ui/Icon';
import { api } from '../../services/api';
import { getAutoCommentAuthorName } from '../../utils/commentAuthor';
import './CommentThread.css';

function authorInitial(name) {
  return String(name ?? 'V').charAt(0).toUpperCase();
}

function CommentForm({ t, placeholder, submitLabel, onSubmit, busy, compact = false }) {
  const [body, setBody] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedBody = body.trim();
    if (!trimmedBody || busy) return;

    const ok = await onSubmit({ body: trimmedBody });
    if (ok) setBody('');
  };

  return (
    <form className={`cmt-form${compact ? ' cmt-form--compact' : ''}`} onSubmit={handleSubmit}>
      <textarea
        rows={compact ? 2 : 3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder || t('comments_placeholder')}
        maxLength={2000}
        required
      />
      <button type="submit" disabled={busy || !body.trim()}>
        {submitLabel || t('comments_send')}
      </button>
    </form>
  );
}

function CommentItem({ comment, t, busyId, authorLabel, onLike, onReply }) {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <article className="cmt-item">
      <header className="cmt-item__head">
        <span className="cmt-item__avatar" aria-hidden="true">
          {authorInitial(comment.authorName)}
        </span>
        <div className="cmt-item__meta">
          <strong>{comment.authorName}</strong>
          <time dateTime={comment.createdAt}>
            {new Date(comment.createdAt).toLocaleDateString()}
          </time>
        </div>
      </header>
      <p className="cmt-item__body">{comment.body}</p>
      <div className="cmt-item__actions">
        <button
          type="button"
          className={`cmt-like${comment.userLiked ? ' is-on' : ''}`}
          onClick={() => onLike(comment.id)}
          disabled={busyId === comment.id}
          aria-pressed={comment.userLiked}
        >
          <Icon name="Heart" size={14} fill={comment.userLiked ? 'currentColor' : 'none'} />
          <span>{comment.likes}</span>
        </button>
        <button type="button" className="cmt-reply-btn" onClick={() => setReplyOpen((v) => !v)}>
          {t('comments_reply')}
        </button>
      </div>

      {replyOpen && (
        <div className="cmt-reply-form">
          <p className="cmt-reply-as">
            {t('comments_posting_as')} <strong>{authorLabel}</strong>
          </p>
          <CommentForm
            t={t}
            compact
            busy={busyId === comment.id}
            placeholder={t('comments_reply_placeholder')}
            submitLabel={t('comments_reply_send')}
            onSubmit={async (payload) => {
              const ok = await onReply(comment.id, payload);
              if (ok) setReplyOpen(false);
              return ok;
            }}
          />
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="cmt-replies">
          {comment.replies.map((reply) => (
            <article key={reply.id} className="cmt-item cmt-item--reply">
              <header className="cmt-item__head">
                <span className="cmt-item__avatar cmt-item__avatar--sm" aria-hidden="true">
                  {authorInitial(reply.authorName)}
                </span>
                <div className="cmt-item__meta">
                  <strong>{reply.authorName}</strong>
                  <time dateTime={reply.createdAt}>
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </header>
              <p className="cmt-item__body">{reply.body}</p>
              <div className="cmt-item__actions">
                <button
                  type="button"
                  className={`cmt-like${reply.userLiked ? ' is-on' : ''}`}
                  onClick={() => onLike(reply.id)}
                  disabled={busyId === reply.id}
                  aria-pressed={reply.userLiked}
                >
                  <Icon name="Heart" size={13} fill={reply.userLiked ? 'currentColor' : 'none'} />
                  <span>{reply.likes}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </article>
  );
}

export default function CommentThread({ itemType, itemId, t, variant = 'light', title }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const authorLabel = useMemo(() => getAutoCommentAuthorName(), []);

  const load = useCallback(async () => {
    if (!itemType || !itemId) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getComments(itemType, itemId);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || t('comments_error_load'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [itemType, itemId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const showPendingNotice = () => {
    setNotice(t('comments_pending_notice'));
    window.setTimeout(() => setNotice(''), 5000);
  };

  const postComment = async (payload, parentId = null) => {
    setBusyId(parentId || 'new');
    setError('');
    try {
      await api.postComment({
        itemType,
        itemId: String(itemId),
        parentId,
        authorName: authorLabel,
        body: payload.body,
      });
      showPendingNotice();
      return true;
    } catch (err) {
      setError(err.message || t('comments_error_post'));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleLike = async (commentId) => {
    setBusyId(commentId);
    try {
      const stats = await api.likeComment(commentId);
      setItems((prev) =>
        prev.map((root) => {
          if (root.id === commentId) {
            return { ...root, likes: stats.likes, userLiked: stats.userLiked };
          }
          if (root.replies?.length) {
            return {
              ...root,
              replies: root.replies.map((r) =>
                r.id === commentId
                  ? { ...r, likes: stats.likes, userLiked: stats.userLiked }
                  : r
              ),
            };
          }
          return root;
        })
      );
    } catch {
      /* ignore */
    } finally {
      setBusyId(null);
    }
  };

  if (!itemType || !itemId) return null;

  return (
    <section className={`cmt-thread cmt-thread--${variant}`} aria-label={title || t('comments_title')}>
      <h3 className="cmt-thread__title">{title || t('comments_title')}</h3>

      <p className="cmt-author-hint">
        {t('comments_posting_as')} <strong>{authorLabel}</strong>
      </p>

      <CommentForm
        t={t}
        busy={busyId === 'new'}
        onSubmit={(payload) => postComment(payload)}
      />

      {notice && <p className="cmt-notice">{notice}</p>}
      {error && <p className="cmt-error">{error}</p>}

      {loading ? (
        <p className="cmt-empty">{t('comments_loading')}</p>
      ) : items.length === 0 ? (
        <p className="cmt-empty">{t('comments_empty')}</p>
      ) : (
        <div className="cmt-list">
          {items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              t={t}
              authorLabel={authorLabel}
              busyId={busyId}
              onLike={handleLike}
              onReply={(parentId, payload) => postComment(payload, parentId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
