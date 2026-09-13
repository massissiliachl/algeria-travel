import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { PageHeader } from '../components/ui';

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'unread', label: 'Non lus' },
  { key: 'read', label: 'Lus' },
];

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR');
}

export default function ContactPage() {
  const [filter, setFilter] = useState('unread');
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getContactMessages(filter);
      setData(res.messages || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (message) => {
    setSelected(message);
    setNotes(message.adminNotes || '');
    if (!message.readAt) {
      try {
        const updated = await api.updateContactMessage(message.id, { read: true });
        setSelected(updated);
        setData((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    try {
      const updated = await api.updateContactMessage(selected.id, { admin_notes: notes || null });
      setSelected(updated);
      setData((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleRead = async (read) => {
    if (!selected) return;
    try {
      const updated = await api.updateContactMessage(selected.id, { read });
      setSelected(updated);
      setData((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      if (filter === 'unread' && read) {
        setData((prev) => prev.filter((m) => m.id !== updated.id));
        setSelected(null);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const removeMessage = async () => {
    if (!selected || !window.confirm('Supprimer ce message définitivement ?')) return;
    try {
      await api.deleteContactMessage(selected.id);
      setSelected(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Messages contact"
        subtitle="Formulaires reçus depuis la page Contact du site public"
      />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={filter === f.key ? 'active' : ''}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="panel">
        {loading ? (
          <p className="empty">Chargement…</p>
        ) : data.length === 0 ? (
          <p className="empty">Aucun message.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Sujet</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id} className={!m.readAt ? 'row-unread' : ''}>
                  <td>{formatDate(m.createdAt)}</td>
                  <td>
                    <strong>{m.clientName}</strong>
                    <br />
                    <span className="muted">{m.clientEmail}</span>
                  </td>
                  <td>{m.subject}</td>
                  <td>{m.readAt ? 'Lu' : 'Non lu'}</td>
                  <td>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => openDetail(m)}>
                      Ouvrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)} role="presentation">
          <div className="modal panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }} role="dialog" aria-modal="true">
            <h3>{selected.subject}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              {selected.clientName} · {formatDate(selected.createdAt)}
            </p>
            <dl className="detail-grid">
              <div><dt>Email</dt><dd><a href={`mailto:${selected.clientEmail}`}>{selected.clientEmail}</a></dd></div>
              <div><dt>Téléphone</dt><dd><a href={`tel:${selected.clientPhone}`}>{selected.clientPhone}</a></dd></div>
            </dl>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{selected.message}</p>
            <div className="field">
              <label>Notes internes</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              <a className="btn btn-primary" href={`mailto:${selected.clientEmail}?subject=Re: ${encodeURIComponent(selected.subject)}`}>
                Répondre par email
              </a>
              <button type="button" className="btn btn-secondary" onClick={() => toggleRead(!selected.readAt)}>
                {selected.readAt ? 'Marquer non lu' : 'Marquer lu'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={saveNotes}>
                Enregistrer notes
              </button>
              <button type="button" className="btn btn-danger" onClick={removeMessage}>
                Supprimer
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
