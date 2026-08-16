import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { PageHeader, StatusBadge } from '../components/ui';

const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'rejected', label: 'Refusées' },
];

export default function ReservationsPage() {
  const [filter, setFilter] = useState('pending');
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getReservations(filter);
      setData(res.reservations || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = (r) => {
    setSelected(r);
    setNotes(r.adminNotes || '');
  };

  const updateStatus = async (status) => {
    if (!selected) return;
    try {
      await api.updateReservation(selected.id, { status, admin_notes: notes || null });
      setSelected(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
  };

  return (
    <>
      <PageHeader title="Réservations" subtitle="Demandes clients — accepter, refuser ou annoter" />

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
          <p className="empty">Aucune réservation.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Réf.</th>
                <th>Client</th>
                <th>Circuit / destination</th>
                <th>Voyage</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.createdAt)}</td>
                  <td><code>{r.referenceCode || '—'}</code></td>
                  <td>
                    <strong>{r.clientName}</strong>
                    <br />
                    <small>{r.clientEmail}</small>
                    {r.clientPhone && (
                      <>
                        <br />
                        <small>{r.clientPhone}</small>
                      </>
                    )}
                  </td>
                  <td>
                    {r.itemName}
                    <br />
                    <small>{r.itemType} · {r.itemId}</small>
                  </td>
                  <td>
                    {formatDate(r.travelDate)} · {r.travelers} pers.
                    {r.stayType && (
                      <>
                        <br />
                        <small>{r.stayType}</small>
                      </>
                    )}
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => openDetail(r)}>
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <h2>Détail — {selected.clientName}</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>
              Fermer
            </button>
          </div>
          <dl className="detail-grid">
            <div><dt>Référence</dt><dd>{selected.referenceCode || '—'}</dd></div>
            <div><dt>Email</dt><dd>{selected.clientEmail}</dd></div>
            <div><dt>Téléphone</dt><dd>{selected.clientPhone || '—'}</dd></div>
            <div><dt>Destination</dt><dd>{selected.itemName} ({selected.itemId})</dd></div>
            <div><dt>Date voyage</dt><dd>{formatDate(selected.travelDate)}</dd></div>
            <div><dt>Voyageurs</dt><dd>{selected.travelers}</dd></div>
            <div><dt>Hébergement</dt><dd>{selected.stayType || '—'}</dd></div>
            <div><dt>Prix estimé</dt><dd>{selected.priceEstimate ? `${selected.priceEstimate.toLocaleString()} DA` : '—'}</dd></div>
            <div><dt>Message client</dt><dd>{selected.message || '—'}</dd></div>
          </dl>
          <div style={{ padding: '0 20px 20px' }}>
            <div className="field">
              <label>Notes admin</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes internes…" />
            </div>
            <div className="btn-group">
              <button type="button" className="btn btn-success" onClick={() => updateStatus('confirmed')}>
                Accepter / Confirmer
              </button>
              <button type="button" className="btn btn-danger" onClick={() => updateStatus('rejected')}>
                Refuser
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => updateStatus('reviewed')}>
                Marquer examinée
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => updateStatus('cancelled')}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
