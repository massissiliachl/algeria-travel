import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { PageHeader, StatusBadge } from '../components/ui';

const FILTERS = [
  { key: 'pending', label: 'En attente' },
  { key: 'approved', label: 'Approuvés' },
  { key: 'rejected', label: 'Refusés' },
  { key: 'all', label: 'Tous' },
];

const TYPE_LABELS = {
  hotel: 'Hôtel',
  gallery: 'Galerie',
  tour: 'Circuit',
  activity: 'Activité',
  place: 'Destination',
  stay: 'Hébergement',
};

export default function CommentsPage() {
  const [filter, setFilter] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getComments(filter);
      setItems(res.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    window.addEventListener('focus', load);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', load);
    };
  }, [load]);

  const moderate = async (id, status) => {
    try {
      await api.moderateComment(id, { status });
      setSelected(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce commentaire définitivement ?')) return;
    try {
      await api.deleteComment(id);
      setSelected(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR');
  };

  return (
    <>
      <PageHeader
        title="Commentaires"
        subtitle="Modérez les avis visiteurs — galerie, hôtels et autres contenus"
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
        ) : items.length === 0 ? (
          <p className="empty">Aucun commentaire dans cette catégorie.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Auteur</th>
                <th>Type</th>
                <th>Contenu</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.createdAt)}</td>
                  <td>{row.authorName}</td>
                  <td>
                    {TYPE_LABELS[row.itemType] || row.itemType}
                    <br />
                    <code>{row.itemId}</code>
                    {row.parentId ? <small> (réponse)</small> : null}
                  </td>
                  <td style={{ maxWidth: 320 }}>
                    {row.body.length > 120 ? `${row.body.slice(0, 120)}…` : row.body}
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelected(row)}>
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h3>Commentaire de {selected.authorName}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              {TYPE_LABELS[selected.itemType]} · <code>{selected.itemId}</code> · {formatDate(selected.createdAt)}
            </p>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{selected.body}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {selected.status !== 'approved' && (
                <button type="button" className="btn btn-primary" onClick={() => moderate(selected.id, 'approved')}>
                  Approuver
                </button>
              )}
              {selected.status !== 'rejected' && (
                <button type="button" className="btn btn-secondary" onClick={() => moderate(selected.id, 'rejected')}>
                  Refuser
                </button>
              )}
              <button type="button" className="btn btn-danger" onClick={() => remove(selected.id)}>
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
